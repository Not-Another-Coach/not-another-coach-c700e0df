import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { action, emails } = await req.json();

    if (!action || !emails || !Array.isArray(emails)) {
      throw new Error("Invalid request body. Expected: { action: 'delete' | 'update', emails: string[] }");
    }

    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    if (action === "delete") {
      console.log(`Deleting users with emails: ${emails.join(", ")}`);

      // Get user IDs for the emails (case insensitive)
      const { data: users, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (fetchError) {
        throw new Error(`Failed to fetch users: ${fetchError.message}`);
      }

      const usersToDelete = users.users.filter(user => 
        emails.some(email => user.email?.toLowerCase() === email.toLowerCase())
      );

      console.log(`Found ${usersToDelete.length} users to delete`);

      let deletedCount = 0;
      let errors: string[] = [];

      for (const user of usersToDelete) {
        try {
          console.log(`Deleting user: ${user.email} (${user.id})`);
          
          // Delete from auth (this will cascade to profiles via the trigger)
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
          
          if (deleteError) {
            throw new Error(`Failed to delete user ${user.email}: ${deleteError.message}`);
          }

          deletedCount++;
          console.log(`✅ Successfully deleted user: ${user.email}`);
        } catch (error) {
          const errorMsg = `Failed to delete ${user.email}: ${error.message}`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        action: "delete",
        summary: {
          total: usersToDelete.length,
          deleted: deletedCount,
          errors: errors.length
        },
        errors
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (action === "update") {
      return new Response(JSON.stringify({
        error: "Update action not yet implemented. Please use delete action for now.",
        success: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    } else {
      throw new Error("Invalid action. Must be 'delete' or 'update'");
    }

  } catch (error) {
    console.error("Cleanup test users error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});