
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables if available, otherwise fall back to the project constants
const SUPABASE_URL = "https://zbiyxrzbqisamabxkeqg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaXl4cnpicWlzYW1hYnhrZXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNTU0MTMsImV4cCI6MjA1NzYzMTQxM30.YvzPUePhoH2nQpj5dqWcUVQLkDTulbP22JrhWINzKB0";

if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL');
if (!SUPABASE_ANON_KEY) throw new Error('Missing SUPABASE_ANON_KEY');

// Create the Supabase client
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Log connection status for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth state changed:", event, session);
});

// Test connection by getting session
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("Error connecting to Supabase:", error);
  } else {
    console.log("Supabase connection successful");
  }
});
