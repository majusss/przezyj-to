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
    console.log(
      `Player ${playerId} is moving from room ${playerCheck.room_id} to room ${roomId}.`
    );
    const { data: playersInRoom } = await supabase
      .from("players")
      .select()
      .eq("room_id", playerCheck.room_id);

    if (playersInRoom?.length === 1) {
      console.log(
        `Room ${playerCheck.room_id} is now empty after player ${playerId} left.`
      );
      const { error: deleteRoomError } = await supabase
        .from("rooms")
        .delete()
        .eq("id", playerCheck.room_id);

      if (deleteRoomError) {
        console.error("Error deleting empty room:", deleteRoomError);
      }
    }
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
