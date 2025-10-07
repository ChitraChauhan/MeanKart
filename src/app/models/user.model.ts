export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  lastActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
