import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const nowISO = new Date().toISOString();

    // Overdue task alerts
    const { data: overdue, error: overdueErr } = await supabase
      .from('client_onboarding_progress')
      .select('id, client_id, trainer_id, step_name, status, completion_method, due_at, overdue_alert_sent_at')
      .not('status', 'eq', 'completed')
      .lte('due_at', nowISO)
      .is('overdue_alert_sent_at', null)
      .limit(500);

    if (overdueErr) throw overdueErr;

    let overdueCount = 0;
    for (const row of overdue || []) {
      const isClientTask = (row.completion_method || 'client') === 'client';
      const target_audience = isClientTask
        ? { clients: [row.client_id] }
        : { coaches: [row.trainer_id] };

      const { error: alertErr } = await supabase.from('alerts').insert({
        alert_type: 'task_overdue',
        title: 'Task overdue',
        content: `${row.step_name || 'An onboarding task'} is overdue. Please take action.`,
        target_audience,
        metadata: {
          client_id: row.client_id,
          trainer_id: row.trainer_id,
          progress_id: row.id,
          due_at: row.due_at,
        },
        is_active: true,
      });
      if (!alertErr) {
        overdueCount++;
        await supabase
          .from('client_onboarding_progress')
          .update({ overdue_alert_sent_at: new Date().toISOString() })
          .eq('id', row.id);
      }
    }

    // SLA breached alerts
    const { data: slaRows, error: slaErr } = await supabase
      .from('client_onboarding_progress')
      .select('id, client_id, trainer_id, step_name, status, completion_method, sla_due_at, sla_alert_sent_at')
      .not('status', 'eq', 'completed')
      .lte('sla_due_at', nowISO)
      .is('sla_alert_sent_at', null)
      .limit(500);

    if (slaErr) throw slaErr;

    let slaCount = 0;
    for (const row of slaRows || []) {
      const isClientTask = (row.completion_method || 'client') === 'client';
      const target_audience = isClientTask
        ? { clients: [row.client_id] }
        : { coaches: [row.trainer_id] };

      const { error: alertErr } = await supabase.from('alerts').insert({
        alert_type: 'sla_breached',
        title: 'SLA breached',
        content: `${row.step_name || 'An onboarding task'} SLA deadline has been breached.`,
        target_audience,
        metadata: {
          client_id: row.client_id,
          trainer_id: row.trainer_id,
          progress_id: row.id,
          sla_due_at: row.sla_due_at,
        },
        is_active: true,
      });
      if (!alertErr) {
        slaCount++;
        await supabase
          .from('client_onboarding_progress')
          .update({ sla_alert_sent_at: new Date().toISOString() })
          .eq('id', row.id);
      }
    }

    return new Response(
      JSON.stringify({ overdue_alerts_created: overdueCount, sla_alerts_created: slaCount }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e) {
    console.error('process-onboarding-sla error', e);
    return new Response(
      JSON.stringify({ error: 'Unexpected error', details: (e as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});