"use client";

import { getPlayersByRoom } from "@/actions/players";
import { Player, Room } from "@/types/supabase";
import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Pencil, User } from "lucide-react";

interface SelectScenarioProps {
  currentPlayer: Player;
  selectedRoom: Room;
  onSelectScenario?: (scenario: string) => void;
}

export default function SelectScenario({
  currentPlayer,
  selectedRoom,
  onSelectScenario,
}: SelectScenarioProps) {
  const [scenarioAuthor, setScenarioAuthor] = useState<Player | null>(null);
  const [scenario, setScenario] = useState("");

  useEffect(() => {
    const getPlayers = async () => {
      const players = (await getPlayersByRoom(selectedRoom.id)) ?? [];
      const author =
        players.find(
          (player) => player.id === selectedRoom.scenario_author_id
        ) ?? null;
      setScenarioAuthor(author);
    };

    getPlayers();
  }, [selectedRoom]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        {scenarioAuthor ? (
          <>
            {scenarioAuthor.id === currentPlayer.id && onSelectScenario ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Wybierz scenariusz:
                  </h2>
                  <Label htmlFor="scenario" className="flex items-center gap-2">
                    <Pencil className="w-4 h-4" />
                    Scenariusz
                  </Label>
                  <Input
                    id="scenario"
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="Wymyśl swój scenariusz..."
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => onSelectScenario(scenario.trim())}
                  disabled={!scenario.trim()}
                >
                  Wybierz
                </Button>
              </div>
            ) : (
              <h2 className="text-2xl font-semibold text-gray-800">
                Gracz {scenarioAuthor?.name} wybiera scenariusz...
              </h2>
            )}
          </>
        ) : (
          <h2 className="text-2xl font-semibold text-gray-800">
            Ładowanie scenariusza...
          </h2>
        )}
      </div>
    </>
  );
}
