import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowRequest {
  workflowType: string;
  correlationId?: string;
  totalSteps?: number;
  initialState?: any;
  action: 'start' | 'update' | 'complete' | 'fail' | 'status';
  currentStep?: string;
  stateData?: any;
  failureReason?: string;
}

interface WorkflowStep {
  name: string;
  action: () => Promise<any>;
  retryable?: boolean;
  timeout?: number;
}

class WorkflowOrchestrator {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async executeWorkflow(
    workflowType: string,
    steps: WorkflowStep[],
    initialState: any = {},
    correlationId?: string
  ): Promise<{ success: boolean; correlationId: string; result?: any; error?: string }> {
    
    const finalCorrelationId = correlationId || crypto.randomUUID();
    
    try {
      console.log(`Starting workflow: ${workflowType} (${finalCorrelationId})`);

      // Start workflow tracking
      const workflowId = await this.startWorkflow(
        workflowType,
        steps.length,
        initialState,
        finalCorrelationId
      );

      if (!workflowId) {
        return {
          success: false,
          correlationId: finalCorrelationId,
          error: 'Failed to start workflow tracking'
        };
      }

      let currentState = initialState;
      let stepIndex = 0;

      for (const step of steps) {
        stepIndex++;
        console.log(`Executing step ${stepIndex}/${steps.length}: ${step.name}`);

        try {
          // Execute step with timeout if specified
          const stepResult = step.timeout
            ? await this.executeWithTimeout(step.action, step.timeout)
            : await step.action();

          // Update state with step result
          currentState = {
            ...currentState,
            [`step_${stepIndex}_result`]: stepResult,
            last_completed_step: step.name,
            completed_at_step: stepIndex
          };

          // Update workflow progress
          const updated = await this.updateWorkflowProgress(
            finalCorrelationId,
            step.name,
            currentState
          );

          if (!updated) {
            throw new Error(`Failed to update workflow progress for step: ${step.name}`);
          }

        } catch (stepError) {
          console.error(`Step ${step.name} failed:`, stepError);

          if (step.retryable) {
            console.log(`Retrying step: ${step.name}`);
            // Implement retry logic here if needed
            // For now, we'll just log and continue to fail
          }

          // Mark workflow as failed
          await this.failWorkflow(finalCorrelationId, stepError.message);
          
          return {
            success: false,
            correlationId: finalCorrelationId,
            error: `Workflow failed at step '${step.name}': ${stepError.message}`
          };
        }
      }

      console.log(`Workflow completed successfully: ${workflowType}`);
      
      return {
        success: true,
        correlationId: finalCorrelationId,
        result: currentState
      };

    } catch (error) {
      console.error('Workflow execution error:', error);
      await this.failWorkflow(finalCorrelationId, error.message);
      
      return {
        success: false,
        correlationId: finalCorrelationId,
        error: error.message
      };
    }
  }

  private async executeWithTimeout<T>(
    action: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      action()
        .then(result => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  async startWorkflow(
    workflowType: string,
    totalSteps: number,
    initialState: any,
    correlationId: string
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.rpc('start_workflow', {
        p_workflow_type: workflowType,
        p_total_steps: totalSteps,
        p_initial_state: initialState,
        p_correlation_id: correlationId
      });

      if (error) {
        console.error('Error starting workflow:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error starting workflow:', error);
      return null;
    }
  }

  async updateWorkflowProgress(
    correlationId: string,
    currentStep: string,
    stateData: any
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('update_workflow_progress', {
        p_correlation_id: correlationId,
        p_current_step: currentStep,
        p_state_data: stateData
      });

      if (error) {
        console.error('Error updating workflow progress:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error updating workflow progress:', error);
      return false;
    }
  }

  async getWorkflowStatus(correlationId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('event_processing_state')
        .select('*')
        .eq('correlation_id', correlationId)
        .single();

      if (error) {
        console.error('Error getting workflow status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error getting workflow status:', error);
      return null;
    }
  }

  async failWorkflow(correlationId: string, failureReason: string): Promise<void> {
    try {
      await this.supabase
        .from('event_processing_state')
        .update({
          failed_at: new Date().toISOString(),
          failure_reason: failureReason,
          updated_at: new Date().toISOString()
        })
        .eq('correlation_id', correlationId);
    } catch (error) {
      console.error('Error marking workflow as failed:', error);
    }
  }

  async completeWorkflow(correlationId: string): Promise<void> {
    try {
      await this.supabase
        .from('event_processing_state')
        .update({
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('correlation_id', correlationId);
    } catch (error) {
      console.error('Error marking workflow as completed:', error);
    }
  }
}

// Example workflow definitions
const WORKFLOW_DEFINITIONS = {
  'onboarding_client': [
    {
      name: 'create_onboarding_steps',
      action: async () => {
        console.log('Creating onboarding steps for client');
        // Implementation would go here
        return { steps_created: true };
      },
      retryable: true,
      timeout: 30000
    },
    {
      name: 'send_welcome_email',
      action: async () => {
        console.log('Sending welcome email to client');
        // Implementation would go here
        return { email_sent: true };
      },
      retryable: true,
      timeout: 15000
    },
    {
      name: 'setup_notifications',
      action: async () => {
        console.log('Setting up notifications for client');
        // Implementation would go here
        return { notifications_setup: true };
      },
      retryable: true,
      timeout: 10000
    }
  ],
  'discovery_call_flow': [
    {
      name: 'send_confirmation',
      action: async () => {
        console.log('Sending discovery call confirmation');
        return { confirmation_sent: true };
      },
      retryable: true,
      timeout: 15000
    },
    {
      name: 'schedule_reminders',
      action: async () => {
        console.log('Scheduling discovery call reminders');
        return { reminders_scheduled: true };
      },
      retryable: true,
      timeout: 10000
    },
    {
      name: 'update_engagement',
      action: async () => {
        console.log('Updating client-trainer engagement status');
        return { engagement_updated: true };
      },
      retryable: true,
      timeout: 5000
    }
  ],
  'payment_processing': [
    {
      name: 'validate_payment',
      action: async () => {
        console.log('Validating payment details');
        return { payment_valid: true };
      },
      retryable: false,
      timeout: 30000
    },
    {
      name: 'update_subscription',
      action: async () => {
        console.log('Updating subscription status');
        return { subscription_updated: true };
      },
      retryable: true,
      timeout: 15000
    },
    {
      name: 'send_receipt',
      action: async () => {
        console.log('Sending payment receipt');
        return { receipt_sent: true };
      },
      retryable: true,
      timeout: 10000
    }
  ]
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const orchestrator = new WorkflowOrchestrator(supabaseUrl, supabaseServiceKey);
    
    const workflowRequest: WorkflowRequest = await req.json();
    
    switch (workflowRequest.action) {
      case 'start': {
        const workflowSteps = WORKFLOW_DEFINITIONS[workflowRequest.workflowType];
        if (!workflowSteps) {
          return new Response(JSON.stringify({ 
            error: `Unknown workflow type: ${workflowRequest.workflowType}` 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const result = await orchestrator.executeWorkflow(
          workflowRequest.workflowType,
          workflowSteps,
          workflowRequest.initialState || {},
          workflowRequest.correlationId
        );

        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      case 'status': {
        if (!workflowRequest.correlationId) {
          return new Response(JSON.stringify({ 
            error: 'Correlation ID required for status check' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const status = await orchestrator.getWorkflowStatus(workflowRequest.correlationId);
        
        return new Response(JSON.stringify({ status }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      case 'update': {
        if (!workflowRequest.correlationId || !workflowRequest.currentStep) {
          return new Response(JSON.stringify({ 
            error: 'Correlation ID and current step required for update' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const updated = await orchestrator.updateWorkflowProgress(
          workflowRequest.correlationId,
          workflowRequest.currentStep,
          workflowRequest.stateData
        );

        return new Response(JSON.stringify({ updated }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      case 'complete': {
        if (!workflowRequest.correlationId) {
          return new Response(JSON.stringify({ 
            error: 'Correlation ID required for completion' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        await orchestrator.completeWorkflow(workflowRequest.correlationId);
        
        return new Response(JSON.stringify({ completed: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      case 'fail': {
        if (!workflowRequest.correlationId || !workflowRequest.failureReason) {
          return new Response(JSON.stringify({ 
            error: 'Correlation ID and failure reason required' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        await orchestrator.failWorkflow(
          workflowRequest.correlationId,
          workflowRequest.failureReason
        );
        
        return new Response(JSON.stringify({ failed: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      default:
        return new Response(JSON.stringify({ 
          error: `Unknown action: ${workflowRequest.action}` 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }

  } catch (error) {
    console.error('Workflow handler error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);