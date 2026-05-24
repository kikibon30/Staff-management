# Database Error Fix Guide

## Problem
Your frontend can't load staff and department data because:
1. **Tables don't exist** in your Supabase database
2. **RLS (Row Level Security) policies** are not configured
3. **Permissions** haven't been granted to the anonymous user

## Solution - Step by Step

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Log into your project
3. Click the **SQL Editor** icon on the left sidebar
4. Click **New Query**

### Step 2: Copy and Paste the Complete Setup Script
1. Open this file in VS Code: `database/wellmeadows_complete_setup.sql`
2. Copy ALL the content
3. Paste it into the Supabase SQL Editor
4. Click the **RUN** button (or press Ctrl+Enter)

### Step 3: Wait for Completion
- The script will create all 14 tables
- Set up Row Level Security
- Grant permissions to anonymous users
- The process usually takes 5-10 seconds

### Step 4: Verify in Browser
1. Go back to your browser
2. **Hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)
3. Click on "Staff Management" or "Department Management"
4. Your data should now load!

## What the Script Does
✅ Creates all 14 database tables  
✅ Sets up proper foreign key relationships  
✅ Enables Row Level Security (RLS)  
✅ Grants SELECT, INSERT, UPDATE, DELETE permissions to anonymous users  
✅ Creates RLS policies to allow all operations

## If You Get an Error
If you see an error like "table already exists":
1. Uncomment the DROP TABLE lines at the top of the SQL file
2. Re-run the entire script
3. This will rebuild your database from scratch

## If It Still Doesn't Work
Check the browser console (F12 → Console tab):
- Are there any error messages?
- Is the Supabase client initialized?
- Are you using the correct Supabase credentials?

## Important Notes
- The RLS policies allow **full public access** (this is fine for development)
- In production, you should implement proper authentication
- Your Supabase credentials in `supabase-config.js` must match your project

## File Location
The complete setup script is here:
```
database/wellmeadows_complete_setup.sql
```
