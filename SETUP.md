# PlateScan setup

Steps 1–3 are already done if your app and accounts work. For this update, start at **Upload the update**, then do steps 4–6.

## Upload the update
1. Unzip PlateScan.zip. Inside are `index.html`, `sw.js`, `SETUP.md`, a `reminders` folder and a `.github` folder.
2. In your repository: **Add file → Upload files**. Drag in **everything** from the unzipped folder, including both folders. Files with the same name replace the old ones.
3. **Commit changes.**

`config.js` is not in the zip on purpose. Your copy on GitHub already has your Firebase settings, so leave it alone.

## 1. Put the app online (GitHub Pages), already done
Settings → Pages → Branch **main**, folder **/ (root)** → Save. Leave Custom domain empty.

## 2–3. Accounts (Firebase), already done
Email/Password sign-in turned on, your github.io address in Authorized domains, Firestore created, settings pasted into `config.js`.

## 4. Update the database rules (needed for the widget)
Firebase console → **Databases & Storage → Firestore → Rules**. Replace everything with this and click **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /widgets/{token} {
      allow get: if true;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.uid == request.auth.uid;
    }
  }
}
```

The widget reads a small public summary (streak, level, logged today) stored under a random code that only your widget script knows. Your meals and everything else stay private.

## 5. Turn on streak reminders (free, about 10 minutes)
Reminders are sent by a free hourly job that runs on GitHub.

**a. Get a Firebase key for the job**
1. Firebase console → gear icon → **Project settings → Service accounts** tab.
2. Click **Generate new private key → Generate key**. A `.json` file downloads.
3. Open that file in Notepad and copy everything in it.

**b. Add three secrets on GitHub**
In your repository: **Settings → Secrets and variables → Actions → New repository secret**. Add each of these:

| Name | Value |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | everything from the `.json` file |
| `VAPID_PUBLIC_KEY` | from `reminder-keys.txt` |
| `VAPID_PRIVATE_KEY` | from `reminder-keys.txt` |

Keep the `.json` file and `reminder-keys.txt` private. Never upload them to the repository.

**c. Check that the job runs**
1. Open the **Actions** tab. If GitHub asks, click to enable workflows.
2. Click **Streak reminders → Run workflow**. A green check means it worked. After that it runs by itself every hour.

**d. Turn it on in the app (on your iPhone)**
1. Open PlateScan **from your Home Screen icon**. Notifications only work there, not in a Safari tab.
2. Tap your initial (top right) → **Alerts** → turn on **Streak reminder**, choose a time, and tap **Allow**.
3. Tap **Send a test notification** to check.

If you haven't logged a meal by your chosen time, you'll get a lock screen notification. GitHub's hourly job can run several minutes late. GitHub also pauses scheduled jobs if a repository has no changes for 60 days. If reminders stop, open **Actions** and turn the workflow back on.

## 6. Home & Lock Screen widget
1. Install **Scriptable** (free) from the App Store.
2. In PlateScan: your initial → **Alerts** → **Copy widget script**.
3. Open Scriptable → **+** → paste → name the script `PlateScan`.
4. **Home Screen:** press and hold an empty spot → Edit → **Add Widget** → Scriptable → pick a size → Add. Tap the widget and set Script to **PlateScan**.
5. **Lock Screen:** press and hold the Lock Screen → **Customize → Lock Screen** → tap the widget area → Scriptable. Tap the new widget and set Script to **PlateScan**.

The widget refreshes on its own every so often. iOS decides exactly when, usually every 15–30 minutes.

## Troubleshooting
- **Old version still showing:** close the app fully and reopen it, or wait a few minutes.
- **Reminder switch is grayed out:** open PlateScan from the Home Screen icon and make sure you're signed in.
- **No notification arrives:** check iPhone **Settings → Notifications → PlateScan**, and the job's latest run in the **Actions** tab.
- **Widget shows 0 or nothing:** check that the rules from step 4 are published, then open PlateScan once so it saves your latest streak.
