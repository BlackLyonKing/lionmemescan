// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mndtxwyellifepixienq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uZHR4d3llbGxpZmVwaXhpZW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NjQ4MDMsImV4cCI6MjA1MjU0MDgwM30.xrxi8KcqsfP_Zyenpww1Xv8DwO60dXBYlKEk5DrikZE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);