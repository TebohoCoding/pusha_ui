import { supabase, supabaseConfigError } from "./supabase.js";

function getClient() {
  if (!supabase) {
    throw new Error(supabaseConfigError || "Supabase is not configured.");
  }

  return supabase;
}

const organizationSelection =
  "id, name, logo_url, industry, website, email, phone, address, brand_color, created_by, created_at, updated_at";

export async function getOrganizationById(organizationId) {
  const client = getClient();
  const { data, error } = await client
    .from("organizations")
    .select(organizationSelection)
    .eq("id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error(
      `No visible organization row was returned for ID ${organizationId}. If the row exists in SQL, check that profiles.organization_id matches this ID and that your organizations SELECT policy allows the signed-in user to read it.`,
    );
  }

  return data;
}

export async function updateOrganization(organizationId, payload) {
  const client = getClient();
  const { data, error } = await client
    .from("organizations")
    .update(payload)
    .eq("id", organizationId)
    .select(organizationSelection)
    .single();

  if (error) throw error;
  return data;
}
