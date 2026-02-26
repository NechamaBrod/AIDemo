/** טיפוסים לאימות משתמשים - משותף לקליינט ולשרת */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: IUser;
}
