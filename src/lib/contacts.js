import { supabase, supabaseConfigError } from "./supabase.js";

function getClient() {
  if (!supabase) {
    throw new Error(supabaseConfigError || "Supabase is not configured.");
  }

  return supabase;
}

export async function listContactsByOrganization(organizationId) {
  const client = getClient();
  const { data, error } = await client
    .from("contacts")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createContact(payload) {
  const client = getClient();
  const { data, error } = await client.from("contacts").insert(payload).select("*").single();

  if (error) throw error;
  return data;
}

export async function updateContact(contactId, payload) {
  const client = getClient();
  const { data, error } = await client
    .from("contacts")
    .update(payload)
    .eq("id", contactId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteContact(contactId) {
  const client = getClient();
  const { error } = await client.from("contacts").delete().eq("id", contactId);

  if (error) throw error;
}
