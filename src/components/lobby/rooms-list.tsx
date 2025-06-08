"use client";

import { Room, Player } from "@/types/supabase";
import RoomCard from "./room-card";

interface RoomsListProps {
  rooms: Room[];
  currentPlayer?: Player;
  onJoinRoom?: (roomId: string) => void;
}

export default function RoomsList({
  rooms,
  currentPlayer,
  onJoinRoom,
}: RoomsListProps) {
  // Debug log
  console.log(
    `🔍 RoomsList render - ${rooms.length} rooms:`,
    rooms.map((r) => ({ id: r.id, name: r.name }))
  );

  if (rooms.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Brak dostępnych pokoi</p>
        <p className="text-sm">Stwórz pierwszy pokój!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center">Dostępne pokoje</h2>
      <div className="grid place-items-center w-full gap-4">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            currentPlayer={currentPlayer}
            onJoinRoom={onJoinRoom}
          />
        ))}
      </div>
    </div>
  );
}
