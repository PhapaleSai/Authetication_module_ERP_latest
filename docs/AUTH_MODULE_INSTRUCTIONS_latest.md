# Instructions for the Authentication Module (Auth Team & AI)

## Context
The **Student Information System (SIS) Module** has upgraded its security. We are no longer accepting plain text URL parameters (`?user_id=...&role=...`) for the dashboard login handshake. 

We have fully implemented a **JWT (JSON Web Token) Verification** system. To successfully log a user into the SIS dashboard, the Authentication module must generate a signed JWT and pass it to our callback URL.

---

## What the Auth Module Needs to Do

### 1. The JWT Secret Key (The Most Important Step)
To ensure security, both our modules must use the exact same Secret Key. 
- **Action Required:** Your team (Auth) needs to generate a strong, random secret key. 
- Please add this key to your `.env` file as `JWT_SECRET_KEY`.
- Please **share this key** with the SIS team so we can add it to our `.env` file.
- *(Note: Until you provide a key, our SIS module is temporarily using a fallback key: `SIS_JWT_SECRET_2026` for testing).*

### 2. Generating the JWT
When a user successfully logs in, you must generate a JWT using the shared `JWT_SECRET_KEY` and the `HS256` algorithm.

**Required Payload Structure:**
Your JWT payload **must** include the following exact keys for our frontend and backend to understand it:
```json
{
  "user_id": "yogendra@example.com", 
  "email": "yogendra@example.com",
  "role": "student",
  "exp": 1716300000 
}
```
*Note: `user_id` should ideally be the email. The `role` must be one of the following exact 8 roles supported by the SIS module: `"admin"`, `"student"`, `"accountant"`, `"principal"`, `"teacher"`, `"hod"`, `"mooc_coordinator"`, or `"staff"`. You should set an expiration time (`exp`) of at least 1-2 hours.*

### 3. The Callback Redirect
Once you have generated the token, you must redirect the user to the SIS frontend using the `token` URL parameter.

**Old Redirect (Do NOT use):**
`https://<sis-frontend-ngrok-url>/callback?user_id=yogendra&role=student`

**New Required Redirect:**
`https://<sis-frontend-ngrok-url>/callback?token=eyJhbGciOiJIUzI1NiIsInR...`

---

## Summary for the Auth AI (Antigravity):
If you are the AI assistant helping the Auth team:
1. Write the code to generate a JWT upon successful login.
2. Include `user_id`, `email`, and `role` in the payload.
3. Sign it with a `JWT_SECRET_KEY` (either generate one and tell the SIS team, or use `SIS_JWT_SECRET_2026` for now).
4. Update your `next/navigation` or `window.location.href` redirect to point to the SIS `/callback` route with `?token=${generated_token}`. 

If you do these 4 steps, the SIS integration will be 100% flawless and secure.
