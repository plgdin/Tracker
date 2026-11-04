import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://jwcwvodcltzuobxtbyuv.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3Y3d2b2RjbHR6dW9ieHRieXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTY3ODIsImV4cCI6MjA5NTg3Mjc4Mn0.3i57KgG8U8TXGfTJqR1qQfgfi0doVSH6nolgGbhXBhE";

// Ephemeral client for auth actions (e.g. creating worker accounts) that must not
// overwrite the current user's session in localStorage.
export const supabaseEphemeral = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

