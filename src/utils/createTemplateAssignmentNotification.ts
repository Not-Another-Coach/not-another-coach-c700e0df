import { supabase } from '@/integrations/supabase/client';

export interface TemplateAssignmentNotificationData {
  clientId: string;
  trainerId: string;
  templateName: string;
  packageName?: string;
}

export async function createTemplateAssignmentNotification({
  clientId,
  trainerId,
  templateName,
  packageName
}: TemplateAssignmentNotificationData) {
  try {
    // Get client and trainer names
    const [clientResult, trainerResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', clientId)
        .single(),
      supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', trainerId)
        .single()
    ]);

    if (clientResult.error || trainerResult.error) {
      console.error('Error fetching profile data:', { 
        clientError: clientResult.error, 
        trainerError: trainerResult.error 
      });
      return;
    }

    const clientName = `${clientResult.data.first_name} ${clientResult.data.last_name}`;
    const trainerName = `${trainerResult.data.first_name} ${trainerResult.data.last_name}`;

    // Create alert for client
    const { error: alertError } = await supabase
      .from('alerts')
      .insert({
        alert_type: 'template_assigned',
        title: 'New Training Template Assigned',
        content: `${trainerName} has assigned you the "${templateName}" onboarding template${packageName ? ` for your ${packageName} package` : ''}. Check your onboarding section to get started!`,
        priority: 3,
        target_audience: ['clients'],
        created_by: trainerId,
        metadata: {
          client_id: clientId,
          trainer_id: trainerId,
          template_name: templateName,
          package_name: packageName,
          action: 'view_onboarding'
        }
      });

    if (alertError) {
      console.error('Error creating template assignment alert:', alertError);
      return;
    }

    console.log('Template assignment notification created successfully');
  } catch (error) {
    console.error('Error in createTemplateAssignmentNotification:', error);
  }
}