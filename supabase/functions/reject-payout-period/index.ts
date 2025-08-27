import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REJECT-PAYOUT] ${step}${detailsStr}`);
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

    const { packageId, periodIndex, reason, attachments = [] } = await req.json();
    logStep("Request parsed", { packageId, periodIndex, hasReason: !!reason });

    if (!reason || reason.trim() === '') {
      throw new Error("Rejection reason is required");
    }

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
      throw new Error("Unauthorized: Only the customer or admin can reject payouts");
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

    // Check if already approved, rejected, or paid out
    if (period.approval_status === 'approved' || period.approval_status === 'auto_approved') {
      throw new Error("Cannot reject an already approved payout period");
    }

    if (period.approval_status === 'rejected') {
      logStep("Period already rejected", { status: period.approval_status });
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Period already rejected",
        period 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if within approval window (can only reject within 2-day window)
    const now = new Date();
    const approvalDeadline = new Date(period.approval_deadline_at);
    
    if (now > approvalDeadline) {
      throw new Error("Cannot reject payout after approval deadline has passed");
    }

    // Validate attachments format
    const validAttachments = Array.isArray(attachments) ? attachments.filter(att => 
      att && typeof att.url === 'string' && att.url.trim() !== ''
    ) : [];

    // Update the payout period to rejected
    const { data: updatedPeriod, error: updateError } = await supabaseClient
      .from('payout_periods')
      .update({
        approval_status: 'rejected',
        rejected_at: now.toISOString(),
        rejected_by: user.id,
        rejection_reason: reason.trim(),
        rejection_attachments: validAttachments
      })
      .eq('id', period.id)
      .select('*')
      .single();

    if (updateError) throw new Error(`Failed to reject payout period: ${updateError.message}`);

    logStep("Payout period rejected", { 
      periodId: period.id, 
      periodIndex, 
      reason: reason.trim(),
      attachmentCount: validAttachments.length
    });

    // TODO: Create dispute workflow entry
    // This would typically create a dispute case for resolution
    logStep("Dispute workflow should be created", { 
      periodId: period.id,
      reason: reason.trim()
    });

    // TODO: Send notifications to trainer and admin
    logStep("Notifications should be sent", {
      trainerId: pkg.trainer_id,
      customerId: pkg.customer_id
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: "Payout period rejected successfully",
      period: updatedPeriod 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in reject-payout-period", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});