# Authentication and Signup Flow Documentation
---

# 1. `/auth/callback` Route (Google OAuth Callback)

### Purpose
Handle the redirection from Google after user authentication and create or redirect the user based on existence.

### Detailed Steps

1. **Receive Authorization Code:**
   - Google redirects to `/auth/callback` with a `code` query parameter.
   - If `code` is missing, redirect to frontend with error `code_missing`.

2. **Exchange Code for Access Token:**
   - Make a POST request to Google's OAuth2 token endpoint (`https://oauth2.googleapis.com/token`).
   - Headers: `Content-Type: application/x-www-form-urlencoded`
   - Data:
     - `client_id`
     - `client_secret`
     - `redirect_uri`
     - `code`
     - `grant_type = authorization_code`

3. **Handle Token Response:**
   - If error occurs while fetching token, redirect to frontend with `token_exchange_failed` error.
   - Parse response JSON.
   - If response contains "error", redirect to frontend with `invalid_token_data` error.

4. **Fetch User Info from Google:**
   - Use access token to fetch user details from `https://www.googleapis.com/oauth2/v1/userinfo?alt=json`.
   - If user info fetch fails, redirect to frontend with `user_info_fetch_failed` error.

5. **Check if User Exists in Database:**
   - Query the PostgreSQL database using email.

6. **If User Exists:**
   - Generate a new `session_id` (using `secrets.token_urlsafe(32)`).
   - Prepare `sessionData`:
     - `user_id`
     - `oauth_id`
     - `role`
     - `name`
     - `email`
     - `image_url`
     - `access_token`
     - `refresh_token`
     - `created_at`
     - `expires_at`
     - `is_signedUp = True`

   - **Redis Session Handling:**
     - TTL: 7 days ("7d").
     - Check if an old session exists using:
       ```python
       old_session_id = await redis_client.get(f"user_session:{user_exists.user_id}")
       ```
     - If old session exists:
       - Delete old session key: `await redis_client.delete(old_session_id)`
       - Delete user_session mapping: `await redis_client.delete(f"user_session:{user_exists.user_id}")`
   
   - **Store new session:**
     - Use `store_session_in_redis(session_id, sessionData, ttl)`.
     - Inside this function:
       - `sessionid:{session_id}` stores session JSON data.
       - `user_session:{user_id}` maps to `sessionid:{session_id}` (only if TTL is 7 days).
   
   - **Set Cookie and Redirect:**
     - Set `session_id` as a secure HTTP-only cookie.
     - Redirect user to `/dashboard`.

7. **If User Does Not Exist:**
   - Generate a new `session_id`.
   - Prepare minimal `sessionData`:
     - `role: user`
     - `oauth_id`
     - `name`
     - `email`
     - `image_url`
     - `access_token`
     - `refresh_token`
     - `created_at`
     - `expires_at`
     - `is_signedUp = False`
   - TTL: 1 hour ("1h").

   - Store session in Redis using `store_session_in_redis()`.
   - Set `session_id` cookie.
   - Redirect user to `/signup` page.

---

# 2. `/auth/signup` Route (Complete Signup)

### Purpose
Handle new user signup after OAuth authentication.

### Detailed Steps

1. **Get `session_id` Cookie:**
   - Fetch cookies from request.
   - Get `session_id` cookie.
   - If missing, return 400 error `Session ID missing in cookie`.

2. **Fetch Session Data from Redis:**
   - Fetch data from Redis using `get_session_data(session_id)`.
   - If session is not found or expired, return 400 error `Invalid or expired session`.

3. **Delete Old Session:**
   - Delete old Redis key:
     ```python
     await redis_client.delete(f"sessionid:{old_session_id}")
     ```

4. **Insert User into Database:**
   - Call `insert_userDetails()` passing signup form data and email/oauth_id fetched from session.
   - If insertion fails, return 500 error `Failed to create user`.

5. **Create New Session:**
   - Generate new `session_id`.
   - Prepare new `sessionData`:
     - `user_id`
     - `role`
     - `name`
     - `email`
     - `image_url`
     - `access_token`
     - `refresh_token`
     - `created_at`
     - `expires_at`
     - `is_signedUp = True`

   - TTL: 7 days.

6. **Store New Session in Redis:**
   - Using `store_session_in_redis()`.
   - Set up mapping:
     - `sessionid:{session_id}`
     - `user_session:{user_id}`

7. **Set New Cookie and Redirect:**
   - Delete old `session_id` cookie.
   - Set new `session_id` cookie.
   - Redirect user to `/dashboard`.

---

# 3. `/auth/logout` Route (Logout User)

### Purpose
Logout the user by clearing session and cookies.

### Detailed Steps

1. **Fetch `session_id` Cookie:**
   - Get `session_id` from request cookies.
   - If missing, redirect to frontend base URL.

2. **Fetch Session Data:**
   - Fetch session from Redis using `sessionid:{session_id}`.
   - If session exists, extract `user_id`.

3. **Delete Session and Mapping:**
   - Delete:
     - `sessionid:{session_id}`
     - `user_session:{user_id}`

4. **Clear Cookie and Redirect:**
   - Delete `session_id` cookie.
   - Redirect user to frontend base URL.

---


# Helper Functions

## `get_userDetails_from_google(token: str)`
- Fetch user info from Google using access token.
- Handles request errors and Google API errors.

## `generate_session_id()`
- Generate a secure session ID using `secrets.token_urlsafe(32)`.

## `parse_ttl(ttl: str)`
- Parses TTL string:
  - `7d` ➔ 7 days in seconds.
  - `1h` ➔ 1 hour in seconds.
- Raises error if invalid format.

## `store_session_in_redis(session_id: str, data: dict, ttl: str)`
- Converts session data into JSON.
- Stores in Redis with given TTL.
- If TTL is "7d", additionally maps `user_session:{user_id}` to session ID.

## `get_session_data(session_id: str)`
- Fetch session data from Redis.
- If exists, decode bytes and parse JSON.

---

# Parameters Summary

| Field | Source | Purpose |
|:-----|:------|:-------|
| `code` | Query param | OAuth2 authorization code from Google |
| `session_id` | Cookie | Unique ID to identify user session |
| `access_token`, `refresh_token` | Google OAuth | Tokens for accessing Google APIs |
| `sessionData` | Redis | Stores session details like role, email, tokens, etc. |
| `signupData` | Request Body | User signup input fields |

---

# Redis Keys Used

| Key Format | Description |
|:-----------|:------------|
| `sessionid:{session_id}` | Stores individual session data |
| `user_session:{user_id}` | Maps user to their current session ID |

---

# Security Measures
- HTTP-only, Secure cookies for `session_id`.
- Access token and refresh token stored securely in Redis.
- TTLs set to expire sessions appropriately.

---

# Notes
- **Session Rotation:**
  - Old sessions are deleted if a new login happens.
- **Signup Flow:**
  - Temporary sessions are stored for only 1 hour if not signed up.
- **Logout Flow:**
  - Clears both session and mapping, ensuring full logout.

---

