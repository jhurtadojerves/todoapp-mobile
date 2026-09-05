export interface UserProfile {
  bio: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  date_joined?: string;
  // The real API can return null here even though the schema marks it required
  // (a user without a profile row) — always guard with optional chaining.
  profile: UserProfile | null;
}
