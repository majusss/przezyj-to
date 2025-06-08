"use client";

import { Room, Player } from "@/types/supabase";
import { usePlayersPolling } from "@/hooks/usePlayersPolling";
import { Button } from "../ui/button";
import { Users, Crown } from "lucide-react";

interface RoomCardProps {
  room: Room;
  currentPlayer?: Player;
  onJoinRoom?: (roomId: string) => void;
}

const RoomCard = ({ room, currentPlayer, onJoinRoom }: RoomCardProps) => {
  const { players } = usePlayersPolling(room.id);
  // Debug log to track re-renders
  console.log(
    `🔍 RoomCard render - Room: ${room.name} (${room.id}), Players: ${players.length}`
  );

  const isCurrentPlayerInRoom =
    currentPlayer && players.some((p) => p.id === currentPlayer.id);
  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 space-y-3 hover:border-gray-300 transition-colors w-full max-w-2xl">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">{room.name}</h3>{" "}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            {players.length}
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Status: <span className="capitalize">{room.state}</span>
      </div>

      {players.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-medium">Gracze:</p>
          <ul className="text-sm space-y-1">
            {players.map((player) => (
              <li
                key={player.id}
                className={`flex items-center gap-2 ${
                  player.id === currentPlayer?.id
                    ? "font-bold text-blue-600"
                    : ""
                }`}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {player.name}
                {player.id === room.master_id && (
                  <Crown className="w-3 h-3 text-yellow-500" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {onJoinRoom && !isCurrentPlayerInRoom && room.state === "waiting" && (
        <Button
          onClick={() => onJoinRoom(room.id)}
          className="w-full"
          variant="outline"
        >
          Dołącz do pokoju
        </Button>
      )}
    </div>
  );
};

export default RoomCard;
