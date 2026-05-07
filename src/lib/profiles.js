import { supabase, supabaseConfigError } from "./supabase.js";

function getClient() {
  if (!supabase) {
    throw new Error(supabaseConfigError || "Supabase is not configured.");
  }

  return supabase;
}

export async function getCurrentUserProfile(userId) {
  const client = getClient();
  const { data, error } = await client
    .from("profiles")
    .select("id, organization_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error("We could not find a workspace profile for this user.");
  }
  if (!data.organization_id) {
    throw new Error("Your profile is not linked to an organization yet.");
  }

  return data;
}

export async function getOrganizationIdForUser(userId) {
  const profile = await getCurrentUserProfile(userId);
  return profile.organization_id;
}
