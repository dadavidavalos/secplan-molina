import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://doxfyozsiiwxzmtwsjhj.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRveGZ5b3pzaWl3eHptdHdzamhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTUyNDIsImV4cCI6MjA5MDQ3MTI0Mn0.wCZ8fZzvDMKtVeevf_ZuF04HdXRlczGSFBguPsApz-Q'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)