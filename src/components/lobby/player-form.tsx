"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { createPlayer } from "@/actions/players";
import { Player } from "@/types/supabase";
import { User } from "lucide-react";

interface PlayerFormProps {
  onPlayerCreated: (player: Player) => void;
}

export default function PlayerForm({ onPlayerCreated }: PlayerFormProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = async () => {
    if (!name.trim()) return;

    setIsLoading(true);
    const player = await createPlayer(name.trim());
    setIsLoading(false);

    if (player) {
      onPlayerCreated(player);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePlay();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nickname" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Nickname
        </Label>
        <Input
          id="nickname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Wpisz swój nickname..."
          disabled={isLoading}
        />
      </div>

      <Button
        className="w-full"
        onClick={handlePlay}
        disabled={!name.trim() || isLoading}
      >
        {isLoading ? "Ładowanie..." : "Zagrajmy"}
      </Button>
    </div>
  );
}
