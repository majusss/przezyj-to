"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Player } from "@/types/supabase";
import { revalidatePath } from "next/cache";
import { leaveRoom } from "./rooms";

export async function createPlayer(name: string): Promise<Player | null> {
  const supabase = await createServerSupabaseClient();
  const playerId = (await supabase.auth.getUser()).data.user?.id;

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .maybeSingle();
  if (error) {
    console.error("Error fetching player:", error);
    return null;
  }
  if (data) {
    return data as Player;
  }
  const { data: newData, error: newError } = await supabase
    .from("players")
    .insert({ name, id: playerId })
    .select()
    .maybeSingle();
  if (newError) {
    console.error("Error creating player with existing ID:", error);
    return null;
  }
  return newData as Player;
}

export async function getCurrentPlayer(): Promise<Player | null> {
  const supabase = await createServerSupabaseClient();
  const playerId = (await supabase.auth.getUser()).data.user?.id;

  if (!playerId) {
    return null;
  }

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching player:", error);
    return null;
  }

  return data as Player;
}

export async function deletePlayer(): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const playerId = (await supabase.auth.getUser()).data.user?.id;

  if (!playerId) {
    console.error("No player ID found in session");
    return false;
  }

  await leaveRoom(playerId);

  const { error: dbError } = await supabase
    .from("players")
    .delete()
    .eq("id", playerId);

  const { error } = await supabase.auth.signOut();

  if (error || dbError) {
    console.error("Error deleting player:", error ?? dbError);
    return false;
  }

  revalidatePath("/");

  return true;
}

export async function getPlayersByRoom(
  roomId: string
): Promise<Player[] | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", roomId);

  if (error) {
    console.error("Error fetching players by room:", error);
    return null;
  }

  return data as Player[];
}
