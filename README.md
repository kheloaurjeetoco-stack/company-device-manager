# Company Device Manager — React + Vercel + Supabase

This version replaces the old PHP/MySQL hosting requirement with:
- React frontend hosted on Vercel
- Vercel serverless API routes
- Supabase Postgres database + Auth
- GitHub -> Vercel automatic deployments
- No terminal required for the deployment workflow

## 1. Create Supabase project
1. Open Supabase and create a free project.
2. Open SQL Editor and run `supabase.sql`.
3. In Authentication, create an admin user with email + password.
4. Copy Project URL, anon key, and service-role key.

## 2. Put project on GitHub from mobile
Create a new GitHub repository, then upload this entire project folder (you can upload the files through GitHub's website/app). Do NOT upload `.env` or real keys.

## 3. Import to Vercel
1. Open Vercel and sign in with GitHub.
2. Add New Project -> select this repository.
3. Vercel detects Vite automatically. Build command: `npm run build`. Output: `dist`.
4. Add Environment Variables:
   - VITE_SUPABASE_URL = Supabase Project URL
   - VITE_SUPABASE_ANON_KEY = Supabase anon/public key
   - SUPABASE_URL = Supabase Project URL
   - SUPABASE_SERVICE_ROLE_KEY = Supabase service-role key
   - API_KEY = a long private random value
   - VITE_SITE_NAME = Company Device Manager
5. Deploy.

## 4. Pages
- `/login` = admin login
- `/admin` = dashboard
- `/employee` = visible employee SMS consent page

## 5. Android app API
Base URL is your Vercel URL.
- POST `/api/heartbeat`
- POST `/api/sms-consent`
- POST `/api/share-sms`

Send `x-api-key: YOUR_API_KEY` with these requests.

`share-sms` is accepted only if that device has SMS consent enabled. The Android companion app must only send messages the employee explicitly selects.

## Security notes
- Never put the Supabase service-role key or API_KEY inside React/browser code.
- Do not commit `.env` files.
- Change the API key before production.
- Use HTTPS (Vercel provides it).
- This project does not implement hidden SMS, OTP, PIN, password collection, or covert monitoring.
