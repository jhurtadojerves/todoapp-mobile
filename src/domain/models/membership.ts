export type BoardRole = 'owner' | 'member';

export interface UserBrief {
  id: number;
  username: string;
  email: string;
}

export interface BoardMembership {
  id: number;
  board_id: number;
  user: UserBrief;
  role: BoardRole;
  created: string;
}

export interface BoardMembershipInput {
  email: string;
  role?: BoardRole;
}
