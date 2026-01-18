import { createClient } from '@supabase/supabase-js'

// REPLACE WITH YOUR SUPABASE URL AND ANON KEY
const supabaseUrl = 'https://qwifaauejfmhuhyyjius.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aWZhYXVlamZtaHVoeXlqaXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMDE1MTYsImV4cCI6MjA4MTY3NzUxNn0.sm0OYygWgRPUvUuyb3R1lC8KXD0C9l1tJ5PduUHHzOU'

if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
    console.error("Supabase URL is missing or invalid! Check your .env file or DigitalOcean settings.");
}
export const supabase = createClient(supabaseUrl, supabaseKey)
