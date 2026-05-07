import { supabase, supabaseConfigError } from "./supabase.js";

function getClient() {
  if (!supabase) {
    throw new Error(supabaseConfigError || "Supabase is not configured.");
  }

  return supabase;
}

export async function listDealsByOrganization(organizationId) {
  const client = getClient();
  const { data, error } = await client
    .from("deals")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createDeal(payload) {
  const client = getClient();
  const { data, error } = await client.from("deals").insert(payload).select("*").single();

  if (error) throw error;
  return data;
}

export async function updateDeal(dealId, payload) {
  const client = getClient();
  const { data, error } = await client
    .from("deals")
    .update(payload)
    .eq("id", dealId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDeal(dealId) {
  const client = getClient();
  const { error } = await client.from("deals").delete().eq("id", dealId);

  if (error) throw error;
}
