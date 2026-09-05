export interface Sprint {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  created: string;
  modified: string;
}

export interface SprintInput {
  name: string;
  start_date: string | null;
  end_date: string | null;
}
