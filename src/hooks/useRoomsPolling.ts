"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Room } from "@/types/supabase";
import { getRooms } from "@/actions/rooms";

export function useRoomsPolling(initialRooms: Room[]) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  const fetchRooms = useCallback(async () => {
    if (!isActiveRef.current) return;

    try {
      const fetchedRooms = await getRooms();
      if (fetchedRooms && isActiveRef.current) {
        setRooms(fetchedRooms);
      }
    } catch (error) {
      console.error("❌ Error fetching rooms:", error);
    }
  }, []);

  const startPolling = useCallback(() => {
    if (!isActiveRef.current) return;

    const poll = async () => {
      if (isActiveRef.current) {
        await fetchRooms();
        pollingTimeoutRef.current = setTimeout(poll, 3000);
      }
    };

    poll();
  }, [fetchRooms]);

  const stopPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    stopPolling();
  }, [stopPolling]);

  useEffect(() => {
    isActiveRef.current = true;
    setRooms(initialRooms);

    const initTimeout = setTimeout(() => {
      if (isActiveRef.current) {
        startPolling();
      }
    }, 2000);

    return () => {
      isActiveRef.current = false;
      clearTimeout(initTimeout);
      cleanup();
    };
  }, [initialRooms, startPolling, cleanup]);

  return { rooms };
}
