import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[APPROVE-PAYOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { packageId, periodIndex } = await req.json();
    logStep("Request parsed", { packageId, periodIndex });

    // Load package to verify permissions
    const { data: pkg, error: pkgError } = await supabaseClient
      .from('payment_packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (pkgError) throw new Error(`Package not found: ${pkgError.message}`);

    // Check if user is the customer or an admin
    const { data: userRoles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some(r => r.role === 'admin');
    const isCustomer = pkg.customer_id === user.id;

    if (!isCustomer && !isAdmin) {
      throw new Error("Unauthorized: Only the customer or admin can approve payouts");
    }

    logStep("Permission verified", { isCustomer, isAdmin });

    // Load the payout period
    const { data: period, error: periodError } = await supabaseClient
      .from('payout_periods')
      .select('*')
      .eq('package_id', packageId)
      .eq('period_index', periodIndex)
      .single();

    if (periodError) throw new Error(`Payout period not found: ${periodError.message}`);

    // Check if already approved or rejected
    if (period.approval_status === 'approved' || period.approval_status === 'auto_approved') {
      logStep("Period already approved", { status: period.approval_status });
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Period already approved",
        period 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (period.approval_status === 'rejected') {
      throw new Error("Cannot approve a rejected payout period");
    }

    // Check if approval window has opened
    const now = new Date();
    const approvalOpenedAt = new Date(period.approval_opened_at);
    
    if (now < approvalOpenedAt) {
      throw new Error("Approval window has not opened yet");
    }

    // Update the payout period to approved
    const { data: updatedPeriod, error: updateError } = await supabaseClient
      .from('payout_periods')
      .update({
        approval_status: 'approved',
        approved_at: now.toISOString(),
        approved_by: user.id
      })
      .eq('id', period.id)
      .select('*')
      .single();

    if (updateError) throw new Error(`Failed to approve payout period: ${updateError.message}`);

    logStep("Payout period approved", { 
      periodId: period.id, 
      periodIndex, 
      netAmount: period.net_payable_amount 
    });

    // TODO: Trigger payout disbursement job
    // This would typically enqueue a job to actually transfer funds to the trainer
    logStep("Payout disbursement should be triggered", { 
      periodId: period.id,
      amount: period.net_payable_amount,
      currency: period.net_payable_currency
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: "Payout period approved successfully",
      period: updatedPeriod 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in approve-payout-period", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});