export type RegistrationModel = {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  verificationToken: string | null;
};
