import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rzmwhgtytmhfocpzrpzn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bXdoZ3R5dG1oZm9jcHpycHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjQ5MTYsImV4cCI6MjA5NDM0MDkxNn0.mftAOMyKNU5Bh8oM8cM8FVuknWP366y9vuWVpRfLLvk';

export const supabase = createClient(supabaseUrl, supabaseKey);
