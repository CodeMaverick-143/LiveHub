// @ts-nocheck

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}


export interface AuthConfig {
  enabled?: boolean;
  profileTableName?: string;
  autoCreateProfile?: boolean;
}


export interface PaymentsConfig {
  enabled?: boolean;
  stripePublishableKey?: string;
}

export interface StorageConfig {
  enabled?: boolean;
  defaultBucket?: string;
}


export interface ModuleConfig {
  auth?: AuthConfig | false;
  payments?: PaymentsConfig | false;
  storage?: StorageConfig | false;
}


export interface OnSpaceConfig extends ModuleConfig {
  supabase: SupabaseConfig;
}


export interface SDKState {
  initialized: boolean;
  enabledModules: string[];
  config: OnSpaceConfig;
}


export interface OnSpaceError {
  code: string;
  message: string;
  module?: string;
  details?: any;
}