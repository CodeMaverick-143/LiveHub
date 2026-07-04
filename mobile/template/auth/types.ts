
import { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  created_at?: string;
  updated_at?: string;
}


interface BaseResult {
  error?: string;
  errorType?: 'timeout' | 'network' | 'business';
}


export interface AuthResult extends BaseResult {
  user?: AuthUser | null;
}


export interface LogoutResult extends BaseResult {}


export interface SendOTPResult extends BaseResult {}


export interface SignUpResult extends BaseResult {
  user?: AuthUser | null;
  needsEmailConfirmation?: boolean;
}


export interface VerifyOTPOptions {
  password?: string;  
}


export interface GoogleSignInResult {
  error: string | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  operationLoading: boolean;
  initialized: boolean;
  setOperationLoading: (loading: boolean) => void;
  sendOTP: (email: string) => Promise<SendOTPResult>;
  verifyOTPAndLogin: (email: string, otp: string, options?: VerifyOTPOptions) => Promise<AuthResult>;
  signUpWithPassword: (email: string, password: string, metadata?: Record<string, any>) => Promise<SignUpResult>;
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<GoogleSignInResult>;
  logout: () => Promise<LogoutResult>;
  refreshSession: () => Promise<void>;
}

export interface AuthConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  profileTableName?: string;
}

export interface SendOTPOptions {
  shouldCreateUser?: boolean;
  emailRedirectTo?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}