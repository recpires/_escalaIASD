export type Role = 'leader' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  ministryIds: string[]; // IDs of ministries the user belongs to
  avatarUrl?: string;
  password?: string; // For mock auth
}

export interface Ministry {
  id: string;
  name: string;
  imageUrl?: string;
}

// Stores availability for a specific user.
// dates: array of ISO date strings (YYYY-MM-DD) representing when the user IS available.
export interface Availability {
  userId: string;
  dates: string[];
}

// Schedule for a specific ministry and date
export interface Schedule {
  id: string;
  ministryId: string;
  date: string; // ISO yyyy-MM-dd
  memberIds: string[];
}

export interface AppState {
  users: User[];
  ministries: Ministry[];
  availabilities: Availability[];
  schedules: Schedule[]; // Added
  currentUser: User | null;
}
