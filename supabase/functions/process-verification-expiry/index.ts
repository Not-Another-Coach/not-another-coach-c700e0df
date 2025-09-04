import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Database {
  public: {
    Tables: {
      trainer_verification_checks: {
        Row: {
          id: string;
          trainer_id: string;
          check_type: string;
          status: string;
          expiry_date: string | null;
        };
      };
    };
  };
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting verification expiry check...");

    // Check for documents expiring in the next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data: expiringChecks, error: expiringError } = await supabase
      .from("trainer_verification_checks")
      .select("id, trainer_id, check_type, expiry_date")
      .eq("status", "verified")
      .lte("expiry_date", thirtyDaysFromNow.toISOString().split('T')[0])
      .gt("expiry_date", new Date().toISOString().split('T')[0]);

    if (expiringError) {
      throw expiringError;
    }

    // Mark expired documents
    const today = new Date().toISOString().split('T')[0];
    const { data: expiredChecks, error: expiredError } = await supabase
      .rpc("check_verification_expiry");

    if (expiredError) {
      console.error("Error checking expiry:", expiredError);
    }

    // Create notifications for trainers with expiring documents
    const notifications = [];
    for (const check of expiringChecks || []) {
      const daysUntilExpiry = Math.ceil(
        (new Date(check.expiry_date!) - new Date()) / (1000 * 60 * 60 * 24)
      );

      notifications.push({
        alert_type: "verification_expiring",
        title: "Verification Document Expiring Soon",
        content: `Your ${check.check_type.replace('_', ' ')} expires in ${daysUntilExpiry} days. Please renew it to maintain your verified status.`,
        target_audience: { trainers: [check.trainer_id] },
        metadata: {
          trainer_id: check.trainer_id,
          check_type: check.check_type,
          expiry_date: check.expiry_date,
          days_until_expiry: daysUntilExpiry,
        },
        is_active: true,
      });
    }

    if (notifications.length > 0) {
      const { error: notificationError } = await supabase
        .from("alerts")
        .insert(notifications);

      if (notificationError) {
        console.error("Error creating notifications:", notificationError);
      } else {
        console.log(`Created ${notifications.length} expiry notifications`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        expiring_checks: expiringChecks?.length || 0,
        notifications_created: notifications.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in verification expiry check:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});