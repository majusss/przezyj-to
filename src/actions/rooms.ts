"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Room } from "@/types/supabase";

export async function createRoom(
  name: string,
  master_id: string
): Promise<Room | null> {
  const supabase = await createServerSupabaseClient();

  const { data: playerCheck } = await supabase
    .from("players")
    .select("id")
    .eq("id", master_id)
    .single();

  if (!playerCheck) {
    console.error("Player not found with ID:", master_id);
    return null;
  }

  const { data, error } = await supabase
    .from("rooms")
    .insert({ name, master_id, state: "waiting", scenario: "default" })
    .select()
    .single();

  if (error) {
    console.error("Error creating room:", error);
    return null;
  }

  await movePlayerToRoom(master_id, data.id);

  return data as Room;
}

export async function movePlayerToRoom(
  playerId: string,
  roomId: string
): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const { data: playerCheck } = await supabase
    .from("players")
    .select()
    .eq("id", playerId)
    .single();

  if (!playerCheck) {
    console.error("Player not found with ID:", playerId);
    return false;
  }

  if (playerCheck.room_id === roomId) {
    console.log("Player is already in the specified room.");
    return true;
  }

  if (playerCheck.room_id) {
    await leaveRoom(playerId);
  }

  const { error } = await supabase
    .from("players")
    .update({ room_id: roomId })
    .eq("id", playerId);

  if (error) {
    console.error("Error moving player to room:", error);
    return false;
  }

  return true;
}

export async function leaveRoom(playerId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const { data: playerCheck } = await supabase
    .from("players")
    .select()
    .eq("id", playerId)
    .single();

  if (!playerCheck) {
    console.error("Player not found with ID:", playerId);
    return false;
  }

  const { data: playersInRoom } = await supabase
    .from("players")
    .select()
    .eq("room_id", playerCheck.room_id);

  const { data: isMasterLeaving } = await supabase
    .from("rooms")
    .select()
    .eq("master_id", playerId)
    .maybeSingle();

  if (playersInRoom?.length === 1) {
    const { error: deleteRoomError } = await supabase
      .from("rooms")
      .delete()
      .eq("id", playerCheck.room_id);

    if (deleteRoomError) {
      console.error("Error deleting empty room:", deleteRoomError);
    }
  } else if (isMasterLeaving) {
    const newMaster = playersInRoom?.find((player) => player.id != playerId);
    if (newMaster) {
      console.log(
        "Updating room master. Room ID:",
        playerCheck.room_id,
        "New Master ID:",
        newMaster.id
      );

      const { error: updateRoomError, data } = await supabase
        .from("rooms")
        .update({ master_id: newMaster.id })
        .eq("id", playerCheck.room_id)
        .select();

      console.log("Update result:", data);

      if (updateRoomError) {
        console.error("Error updating room master:", updateRoomError);
        return false;
      }

      if (!data || data.length === 0) {
        console.error("No room found with ID:", playerCheck.room_id);
        return false;
      }

      const { error: leaveError } = await supabase
        .from("players")
        .update({ room_id: null })
        .eq("id", playerId);

      if (leaveError) {
        console.error("Error leaving room:", leaveError);
        return false;
      }
      return true;
    } else {
      console.error("No other players found to assign as new master.");
      return false;
    }
  } else {
    const { error: leaveError } = await supabase
      .from("players")
      .update({ room_id: null })
      .eq("id", playerId);

    if (leaveError) {
      console.error("Error leaving room:", leaveError);
      return false;
    }
  }

  return true;
}

export async function getRooms(): Promise<Room[] | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching rooms:", error);
    return null;
  }

  return data as Room[];
}
