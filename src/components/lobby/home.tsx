"use client";

import { useEffect, useState } from "react";
import { Player, Room } from "@/types/supabase";
import { useRoomsPolling } from "@/hooks/useRoomsPolling";
import PlayerForm from "./player-form";
import RoomsList from "./rooms-list";
import CreateRoomForm from "./create-room-form";
import { Gamepad2 } from "lucide-react";
import {
  leaveRoom,
  movePlayerToRoom,
  startGame,
  startScenario,
} from "@/actions/rooms";
import SelectScenario from "./select-scenario";
import WritingAnswer from "./writing-answer";

interface HomeProps {
  rooms: Room[];
  player: Player | null;
}

export default function Home({
  rooms: initialRooms,
  player: initialPlayer,
}: HomeProps) {
  const [player, setPlayer] = useState<Player | null>(initialPlayer);
  const { rooms } = useRoomsPolling(initialRooms);

  const selectedRoom = rooms.find((room) => room.id === player?.room_id);

  const handlePlayerCreated = (newPlayer: Player) => {
    setPlayer(newPlayer);
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!player) return;
    await movePlayerToRoom(player?.id, roomId);
  };

  const handleLeaveRoom = async () => {
    if (!player) return;
    await leaveRoom(player.id);
  };

  const handleStartGame = async (roomId: string) => {
    await startGame(roomId);
  };

  const handleSelectScenario = async (scenario: string) => {
    if (!selectedRoom) return;
    await startScenario(scenario, selectedRoom.id);
  };

  const handleSubmitAnswer = async (answer: string) => {
    if (!selectedRoom) return;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gamepad2 className="w-12 h-12 text-indigo-600" />
              <h1 className="text-5xl font-bold text-gray-800">Przeżyj to!</h1>
            </div>
            <p className="text-xl text-gray-600">Czy uda ci się przeżyć?</p>
          </div>
          {"" + JSON.stringify(selectedRoom)}
          {selectedRoom?.state == "answering" && (
            <WritingAnswer
              scenario={selectedRoom.scenario}
              onSubmitAnswer={handleSubmitAnswer}
            />
          )}
          {selectedRoom?.state == "scenario" && player && (
            <SelectScenario
              currentPlayer={player}
              selectedRoom={selectedRoom}
              onSelectScenario={handleSelectScenario}
            />
          )}
          {selectedRoom?.state == "lobby" ||
            (!selectedRoom && (
              <div className="space-y-8">
                {player ? (
                  <div className="space-y-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="text-center mb-4">
                        <p className="text-lg">
                          Witaj,{" "}
                          <span className="font-bold text-indigo-600">
                            {player.name}
                          </span>
                          !
                        </p>
                      </div>
                      <CreateRoomForm player={player} />
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                      <RoomsList
                        rooms={rooms}
                        currentPlayer={player}
                        onJoinRoom={handleJoinRoom}
                        onLeaveRoom={handleLeaveRoom}
                        onStartGame={handleStartGame}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        Zacznij grę
                      </h2>
                      <p className="text-gray-600">
                        Podaj swój nickname aby rozpocząć
                      </p>
                    </div>
                    <PlayerForm onPlayerCreated={handlePlayerCreated} />
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
