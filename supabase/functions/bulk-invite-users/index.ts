import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteUser {
  email: string;
  full_name: string;
  company_name: string | null;
  sme_id: string | null;
  role: string;
}

serve(async (req) => {
  // Handle CORS pre-flight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify the caller is authenticated as a super_admin via the JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a client using the service role key (admin capabilities)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Create a caller client to verify role
    const supabaseCaller = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Check caller is super_admin
    const { data: { user: caller }, error: authError } = await supabaseCaller.auth.getUser();
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .single();

    if (callerRole?.role !== "super_admin") {
      return new Response(JSON.stringify({ error: "Forbidden: super_admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { users }: { users: InviteUser[] } = await req.json();

    if (!Array.isArray(users) || users.length === 0) {
      return new Response(JSON.stringify({ error: "No users provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (users.length > 500) {
      return new Response(JSON.stringify({ error: "Maximum 500 users per request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process each user
    const results = await Promise.all(
      users.map(async (u): Promise<{ email: string; success: boolean; message: string }> => {
        try {
          // Create auth user with a random temporary password; they'll reset via email
          const tempPassword = crypto.randomUUID();
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: u.email,
            password: tempPassword,
            email_confirm: false,
            user_metadata: {
              full_name: u.full_name,
              user_type: "company",
              company_name: u.company_name ?? "",
              sme_id: u.sme_id ?? "",
            },
          });

          if (createError) {
            return { email: u.email, success: false, message: createError.message };
          }

          const userId = newUser.user.id;

          // Upsert profile (may already be created by DB trigger)
          await supabaseAdmin.from("profiles").upsert({
            user_id: userId,
            email: u.email,
            full_name: u.full_name,
            company_name: u.company_name,
            sme_id: u.sme_id,
            user_type: "company",
          }, { onConflict: "user_id" });

          // Upsert role
          await supabaseAdmin.from("user_roles").upsert({
            user_id: userId,
            role: u.role,
            is_approved: false,
          }, { onConflict: "user_id" });

          // Send invite / magic link email so they can set a real password
          await supabaseAdmin.auth.admin.inviteUserByEmail(u.email);

          return { email: u.email, success: true, message: "User created and invite sent" };
        } catch (err: any) {
          return { email: u.email, success: false, message: err.message ?? "Unknown error" };
        }
      })
    );

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
