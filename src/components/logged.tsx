import { deletePlayer, getCurrentPlayer } from "@/actions/players";

export default async function Logged() {
  const player = await getCurrentPlayer();

  return (
    <div className="absolute top-0 right-0 pr-5 pt-3">
      {player ? (
        <div className="text-sm text-gray-500">
          Zalogowany jako: {player.name}
          <span
            onClick={deletePlayer}
            className="ml-2 text-blue-500 hover:underline cursor-pointer"
          >
            Wyloguj
          </span>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Niezalogowany</div>
      )}
    </div>
  );
}
