
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zbiyxrzbqisamabxkeqg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaXl4cnpicWlzYW1hYnhrZXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNTU0MTMsImV4cCI6MjA1NzYzMTQxM30.YvzPUePhoH2nQpj5dqWcUVQLkDTulbP22JrhWINzKB0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
