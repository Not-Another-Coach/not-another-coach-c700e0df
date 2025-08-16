-- Manually copy tasks for the existing active template assignment
DO $$
DECLARE
    assignment_record RECORD;
    template_record RECORD;
    getting_started_task RECORD;
    first_week_task RECORD;
    task_order INTEGER := 0;
BEGIN
    -- Get the active assignment
    SELECT * INTO assignment_record 
    FROM client_template_assignments 
    WHERE status = 'active' 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'No active assignment found';
        RETURN;
    END IF;
    
    -- Delete any existing progress records for this assignment to avoid duplicates
    DELETE FROM client_onboarding_progress 
    WHERE assignment_id = assignment_record.id;
    
    -- Get the template information
    SELECT * INTO template_record 
    FROM trainer_onboarding_templates 
    WHERE id = assignment_record.template_base_id;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'Template not found: %', assignment_record.template_base_id;
        RETURN;
    END IF;
    
    -- Copy Getting Started tasks
    FOR getting_started_task IN 
        SELECT * FROM onboarding_getting_started 
        WHERE template_id = assignment_record.template_base_id
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
            assignment_record.client_id,
            assignment_record.trainer_id,
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
            assignment_record.id
        );
    END LOOP;
    
    -- Copy First Week tasks
    FOR first_week_task IN 
        SELECT * FROM onboarding_first_week 
        WHERE template_id = assignment_record.template_base_id
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
            assignment_record.client_id,
            assignment_record.trainer_id,
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
            assignment_record.id
        );
    END LOOP;
    
    RAISE NOTICE 'Manually copied % tasks for existing assignment %', task_order, assignment_record.id;
END $$;