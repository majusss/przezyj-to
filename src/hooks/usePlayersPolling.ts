"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Player } from "@/types/supabase";
import { getPlayersByRoom } from "@/actions/players";

export function usePlayersPolling(roomId: string) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  const fetchPlayers = useCallback(async () => {
    if (!roomId || !isActiveRef.current) return;

    try {
      const fetchedPlayers = await getPlayersByRoom(roomId);
      if (fetchedPlayers && isActiveRef.current) {
        setPlayers(fetchedPlayers);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("❌ Error fetching players:", error);
      setIsLoading(false);
    }
  }, [roomId]);

  const startPolling = useCallback(() => {
    if (!isActiveRef.current || !roomId) return;

    const poll = async () => {
      if (isActiveRef.current) {
        await fetchPlayers();
        pollingTimeoutRef.current = setTimeout(poll, 1500);
      }
    };

    poll();
  }, [roomId, fetchPlayers]);

  const stopPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, [roomId]);

  const cleanup = useCallback(() => {
    stopPolling();
  }, [stopPolling]);

  useEffect(() => {
    if (!roomId) {
      setPlayers([]);
      setIsLoading(false);
      return;
    }

    isActiveRef.current = true;
    setIsLoading(true);

    fetchPlayers();

    const initTimeout = setTimeout(() => {
      if (isActiveRef.current) {
        startPolling();
      }
    }, 1000);

    return () => {
      isActiveRef.current = false;
      clearTimeout(initTimeout);
      cleanup();
    };
  }, [roomId, fetchPlayers, startPolling, cleanup]);

  return { players, isLoading };
}
