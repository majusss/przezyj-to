export interface Room {
  id: string;
  created_at: string;
  name: string;
  master_id: string;
  state: string;
  scenario: string;
}

export interface Player {
  id: string;
  created_at: string;
  name: string;
  room_id: string | null;
}
