-- Create function to copy template tasks to client progress when template is assigned
CREATE OR REPLACE FUNCTION public.copy_template_tasks_to_client_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    template_record RECORD;
    getting_started_task RECORD;
    first_week_task RECORD;
    task_order INTEGER := 0;
BEGIN
    -- Only process when a new template assignment is created with active status
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        -- Get the template information
        SELECT * INTO template_record 
        FROM trainer_onboarding_templates 
        WHERE id = NEW.template_base_id;
        
        IF NOT FOUND THEN
            RAISE NOTICE 'Template not found: %', NEW.template_base_id;
            RETURN NEW;
        END IF;
        
        -- Copy Getting Started tasks
        FOR getting_started_task IN 
            SELECT * FROM onboarding_getting_started 
            WHERE template_id = NEW.template_base_id
            ORDER BY display_order
        LOOP
            task_order := task_order + 1;
            
            INSERT INTO client_onboarding_progress (
                client_id,
                trainer_id,
                template_step_id,
                step_name,
                step_type,
                description,
                instructions,
                requires_file_upload,
                completion_method,
                display_order,
                status,
                activity_id,
                due_in_days,
                sla_days,
                assignment_id
            ) VALUES (
                NEW.client_id,
                NEW.trainer_id,
                getting_started_task.id,
                getting_started_task.task_name,
                CASE WHEN getting_started_task.is_mandatory THEN 'mandatory' ELSE 'optional' END,
                getting_started_task.description,
                getting_started_task.rich_guidance,
                getting_started_task.requires_attachment,
                'client',
                task_order,
                'pending',
                getting_started_task.activity_id,
                getting_started_task.due_days,
                CASE WHEN getting_started_task.sla_hours IS NOT NULL THEN CEIL(getting_started_task.sla_hours::numeric / 24) ELSE NULL END,
                NEW.id
            );
        END LOOP;
        
        -- Copy First Week tasks
        FOR first_week_task IN 
            SELECT * FROM onboarding_first_week 
            WHERE template_id = NEW.template_base_id
            ORDER BY display_order
        LOOP
            task_order := task_order + 1;
            
            INSERT INTO client_onboarding_progress (
                client_id,
                trainer_id,
                template_step_id,
                step_name,
                step_type,
                description,
                instructions,
                requires_file_upload,
                completion_method,
                display_order,
                status,
                activity_id,
                due_in_days,
                sla_days,
                assignment_id
            ) VALUES (
                NEW.client_id,
                NEW.trainer_id,
                first_week_task.id,
                first_week_task.task_name,
                CASE WHEN first_week_task.is_mandatory THEN 'mandatory' ELSE 'optional' END,
                first_week_task.description,
                first_week_task.rich_guidance,
                first_week_task.requires_attachment,
                'client',
                task_order,
                'pending',
                first_week_task.activity_id,
                first_week_task.due_in_days,
                CASE WHEN first_week_task.sla_hours IS NOT NULL THEN CEIL(first_week_task.sla_hours::numeric / 24) ELSE NULL END,
                NEW.id
            );
        END LOOP;
        
        RAISE NOTICE 'Copied % tasks for client % from template %', task_order, NEW.client_id, NEW.template_base_id;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create trigger to automatically copy template tasks when assignment is created
DROP TRIGGER IF EXISTS copy_template_tasks_trigger ON client_template_assignments;
CREATE TRIGGER copy_template_tasks_trigger
    AFTER INSERT ON client_template_assignments
    FOR EACH ROW
    EXECUTE FUNCTION copy_template_tasks_to_client_progress();