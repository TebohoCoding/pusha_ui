import { supabase, supabaseConfigError } from "./supabase.js";

function getClient() {
  if (!supabase) {
    throw new Error(supabaseConfigError || "Supabase is not configured.");
  }

  return supabase;
}

export async function listLeadsByOrganization(organizationId) {
  const client = getClient();
  const { data, error } = await client
    .from("leads")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createLead(payload) {
  const client = getClient();
  const { data, error } = await client.from("leads").insert(payload).select("*").single();

  if (error) throw error;
  return data;
}

export async function updateLead(leadId, payload) {
  const client = getClient();
  const { data, error } = await client
    .from("leads")
    .update(payload)
    .eq("id", leadId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLead(leadId) {
  const client = getClient();
  const { error } = await client.from("leads").delete().eq("id", leadId);

  if (error) throw error;
}
