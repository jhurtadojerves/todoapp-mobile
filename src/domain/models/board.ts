export interface Board {
  id: number;
  name: string;
  description: string;
  user_id: number;
  created: string;
  modified: string;
}

export interface BoardInput {
  name: string;
  description: string;
}
