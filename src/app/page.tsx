import { getCurrentPlayer } from "@/actions/players";
import Home from "@/components/lobby/home";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: rooms, error } = await supabase.from("rooms").select("*");
  const player = await getCurrentPlayer();

  if (error) {
    console.error("Error fetching rooms:", error);
    return <div>Error loading rooms</div>;
  }

  return (
    <>
      <Home rooms={rooms} player={player} />
    </>
  );
}
