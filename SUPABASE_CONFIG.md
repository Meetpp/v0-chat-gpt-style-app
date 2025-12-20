# Supabase Configuration for Instant Sign Up

To disable email verification and allow users to sign in immediately after signup, you need to configure Supabase:

## Steps to Disable Email Confirmation:

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "Providers"
   - Click on "Email"

3. **Disable Email Confirmation**
   - Scroll down to "Email Auth"
   - **Uncheck "Confirm email"** option
   - Click "Save"

## Alternative: Auto-Confirm in RLS Policies

If you want to keep email confirmation enabled but auto-confirm for testing, you can use the approach already implemented in the code:

- The signup function automatically signs the user in after registration
- Users can access the chat immediately without email verification

## Current Implementation:

The app is configured to:
1. Sign up the user
2. Immediately sign them in with the same credentials
3. Redirect to `/chat` page
4. No email verification required

This allows instant access while maintaining Supabase Auth functionality.
