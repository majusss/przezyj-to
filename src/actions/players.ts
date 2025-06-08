"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Player } from "@/types/supabase";
import { revalidatePath } from "next/cache";

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
    revalidatePath("/");
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
  revalidatePath("/");
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

  // need to change master to oldest player in room
  const { data: masterData, error: masterError } = await supabase
    .from("room")
    .select("id")
    .eq("master_id", playerId)
    .maybeSingle();

  if (masterError) {
    console.error("Error fetching master room data:", masterError);
  }

  if (masterData) {
    const { data: playersInRoom, error: playersError } = await supabase
      .from("players")
      .select("id")
      .eq("room_id", masterData.id);

    if (playersError) {
      console.error("Error fetching players in room:", playersError);
    }

    if (playersInRoom && playersInRoom.length > 0) {
      const newMasterId = playersInRoom[playersInRoom.length - 1].id;

      const { error: updateError } = await supabase
        .from("rooms")
        .update({ master_id: newMasterId })
        .eq("id", masterData.id);

      if (updateError) {
        console.error("Error updating room master:", updateError);
      }
    } else {
      // delete empty room when master is deleted
      const { error: deleteRoomError } = await supabase
        .from("rooms")
        .delete()
        .eq("id", masterData.id);

      if (deleteRoomError) {
        console.error("Error deleting empty room:", deleteRoomError);
      }
    }
  }

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
