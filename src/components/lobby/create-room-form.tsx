"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { createRoom } from "@/actions/rooms";
import { Player } from "@/types/supabase";
import { Plus, Home } from "lucide-react";

interface CreateRoomFormProps {
  player: Player;
  onRoomCreated?: () => void;
}

export default function CreateRoomForm({
  player,
  onRoomCreated,
}: CreateRoomFormProps) {
  const [roomName, setRoomName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    setIsLoading(true);
    const room = await createRoom(roomName.trim(), player.id);
    setIsLoading(false);

    if (room) {
      setRoomName("");
      setShowForm(false);
      onRoomCreated?.();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateRoom();
    }
  };

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        className="w-full"
        variant="default"
      >
        <Plus className="w-4 h-4 mr-2" />
        Stwórz nowy pokój
      </Button>
    );
  }

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex items-center gap-2">
        <Home className="w-5 h-5" />
        <h3 className="font-semibold">Nowy pokój</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="room-name">Nazwa pokoju</Label>
        <Input
          id="room-name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Wpisz nazwę pokoju..."
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleCreateRoom}
          disabled={!roomName.trim() || isLoading}
          className="flex-1"
        >
          {isLoading ? "Tworzenie..." : "Stwórz"}
        </Button>
        <Button
          onClick={() => {
            setShowForm(false);
            setRoomName("");
          }}
          variant="outline"
          disabled={isLoading}
        >
          Anuluj
        </Button>
      </div>
    </div>
  );
}
