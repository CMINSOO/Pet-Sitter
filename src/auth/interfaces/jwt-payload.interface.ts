import { UserType } from '../types/user-type';

export interface JwtPayload {
  id: number;
  email: string;
  userType: UserType;
}
