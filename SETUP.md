# PlateScan setup

## 1. Put the app online (GitHub Pages)
1. In your GitHub repository, click **Add file → Upload files** (or the "uploading an existing file" link on an empty repository).
2. Drag in all the files from this folder: `index.html`, `config.js`, `manifest.json`, `icon-180.png`, `icon-192.png`, `icon-512.png`. Files with the same name replace the old ones.
3. Click **Commit changes**.
4. **Settings → Pages** → Branch: **main**, folder **/ (root)** → **Save**.
5. Your app is at `https://YOUR-USERNAME.github.io/PlateScan/`. Open it in Safari on iPhone → **Share → Add to Home Screen**.

The app works right away without accounts. Steps 2–3 turn on sign-up.

## 2. Turn on accounts (free Firebase project, about 10 minutes, no credit card)
1. Go to **console.firebase.google.com** and sign in with a Google account.
2. **Create a project** → name it `PlateScan` → you can turn Google Analytics off → **Create project**.
3. Left menu: **Build → Authentication → Get started**.
   - **Sign-in method** tab → **Email/Password** → turn on the first switch → **Save**.
   - **Settings** tab → **Authorized domains** → **Add domain** → `YOUR-USERNAME.github.io` → **Add**.
4. Left menu: **Build → Firestore Database → Create database**.
   - Pick a location near you (for example `nam5 (United States)`), choose **Start in production mode**, then **Create**.
   - Open the **Rules** tab, replace everything with the rules below, and click **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

   These rules mean each person can only read and write their own data.

5. Click the gear icon next to **Project Overview → Project settings**. Under **Your apps**, click the **</>** (Web) icon → nickname `PlateScan` → **Register app** (skip Firebase Hosting).
6. Firebase shows a block of code with `const firebaseConfig = { apiKey: "...", authDomain: "...", ... };`. Copy just the lines **inside** the `{ }`.

## 3. Paste your settings into config.js
1. On GitHub, open `config.js` → click the **pencil icon (Edit)**.
2. Paste the lines between the `{` and `}` so it looks like:

```js
export const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "platescan-xxxx.firebaseapp.com",
  projectId: "platescan-xxxx",
  storageBucket: "platescan-xxxx.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123"
};
```

3. **Commit changes**. Wait a minute, then reload the app. **Create account** now works.

It's safe for these values to be public. They only identify your project, and the rules above protect the data.

## Troubleshooting
- **"Email sign-in isn't switched on"**: redo step 2.3, Sign-in method.
- **"This web address isn't on Firebase's approved list"**: redo step 2.3, Authorized domains.
- **"Couldn't load your data: permission-denied"**: check that the rules in step 2.4 were published.
- **Old version still showing on iPhone**: close the app fully and reopen it, or wait a few minutes for GitHub to update.
