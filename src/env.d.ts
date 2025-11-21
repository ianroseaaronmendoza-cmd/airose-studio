/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;

  // Add these to fix "Property 'PROD' does not exist" errors
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
