export interface TaskStatusBrief {
  id: number;
  name: string;
  color: string;
}

export interface TaskSprintBrief {
  id: number;
  name: string;
}

export interface Task {
  id: number;
  board_id: number;
  sprint: TaskSprintBrief | null;
  status: TaskStatusBrief | null;
  user_id: number;
  assigned_to_id: number | null;
  title: string;
  description: string;
  created: string;
  modified: string;
}

export interface TaskInput {
  title: string;
  description: string;
  status_id: number | null;
  sprint_id: number | null;
  assigned_to_id: number | null;
}

export interface TaskFilters {
  status?: number;
  sprint?: number;
  assigned_to?: number;
}
