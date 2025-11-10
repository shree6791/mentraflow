# Google OAuth Setup for This Fork

## Issue
Google Login is currently failing with CORS error because the OAuth Client ID needs to be configured for this fork's URL.

## Current Configuration
- **Fork URL**: `https://resume-session-13.preview.emergentagent.com`
- **Google Client ID**: `470321149192-291eh18146u9viph0637t0ke4qe8c0na`
- **Client Secret**: (stored in backend/.env)

## Error
```
Cross-Origin-Opener-Policy policy would block the window.closed call
```

This happens because the current OAuth Client ID is not configured to allow requests from this fork's domain.

---

## Solution 1: Update Existing OAuth Client (Recommended)

### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select the project containing the OAuth credentials
3. Navigate to **APIs & Services > Credentials**
4. Find OAuth 2.0 Client ID: `470321149192-291eh18146u9viph0637t0ke4qe8c0na`
5. Click **Edit**
6. Add the following:

**Authorized JavaScript origins:**
```
https://resume-session-13.preview.emergentagent.com
```

**Authorized redirect URIs:**
```
https://resume-session-13.preview.emergentagent.com
https://resume-session-13.preview.emergentagent.com/login
```

7. Click **Save**
8. Wait 5-10 minutes for changes to propagate
9. Test Google Login on the fork

---

## Solution 2: Create New OAuth Client for This Fork

If you don't have access to the existing OAuth client, create a new one:

### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services > Credentials**
4. Click **+ CREATE CREDENTIALS > OAuth client ID**
5. Select **Web application**
6. Configure:

**Application Name:**
```
MentraFlow - Brain Vault 3 Fork
```

**Authorized JavaScript origins:**
```
https://resume-session-13.preview.emergentagent.com
```

**Authorized redirect URIs:**
```
https://resume-session-13.preview.emergentagent.com
https://resume-session-13.preview.emergentagent.com/login
```

7. Click **Create**
8. Copy the **Client ID** and **Client Secret**
9. Update environment variables:

**Frontend** (`/app/frontend/.env`):
```env
REACT_APP_GOOGLE_CLIENT_ID="YOUR_NEW_CLIENT_ID"
```

**Backend** (`/app/backend/.env`):
```env
GOOGLE_CLIENT_ID="YOUR_NEW_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_NEW_CLIENT_SECRET"
```

10. Restart services:
```bash
sudo supervisorctl restart all
```

11. Test Google Login

---

## Testing After Setup

1. Navigate to: `https://resume-session-13.preview.emergentagent.com/login`
2. Click **Continue with Google**
3. Select your Google account
4. Grant permissions
5. You should be redirected to `/dashboard`

---

## Current Workaround

The email/password login with "Coming Soon" overlay is still visible, but Google OAuth is the primary authentication method.

---

## Files Affected
- `/app/frontend/.env` - Contains `REACT_APP_GOOGLE_CLIENT_ID`
- `/app/backend/.env` - Contains `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `/app/backend/routes/google_auth.py` - Google OAuth callback handler
- `/app/frontend/src/pages/Login.js` - Google login button implementation

---

## Notes
- Google OAuth typically takes 5-10 minutes to propagate changes
- Make sure cookies are enabled in the browser
- The backend must be accessible at the same domain as the frontend
- JWT tokens are stored as httpOnly cookies for security
