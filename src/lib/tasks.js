import { supabase, supabaseConfigError } from "./supabase.js";

function getClient() {
  if (!supabase) {
    throw new Error(supabaseConfigError || "Supabase is not configured.");
  }

  return supabase;
}

export async function listTasksByOrganization(organizationId) {
  const client = getClient();
  const { data, error } = await client
    .from("tasks")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createTask(payload) {
  const client = getClient();
  const { data, error } = await client.from("tasks").insert(payload).select("*").single();

  if (error) throw error;
  return data;
}

export async function updateTask(taskId, payload) {
  const client = getClient();
  const { data, error } = await client
    .from("tasks")
    .update(payload)
    .eq("id", taskId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(taskId) {
  const client = getClient();
  const { error } = await client.from("tasks").delete().eq("id", taskId);

  if (error) throw error;
}
