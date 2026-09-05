export interface BoardStatus {
  id: number;
  name: string;
  order: number;
  color: string;
}

export interface BoardStatusInput {
  name: string;
  order: number;
  color: string;
}
