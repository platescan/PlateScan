# PlateScan setup

Steps 1–3 are already done if your app and accounts work. For this update (team boss fights, exercise badges, event bosses, style shop, AI portions, recipes, meal planner, progress photos, activity feed, more reminders and a new icon), do **Upload the update**, then **step 4: publish the new database rules (required)**. Team fights, high-fives and the owner dashboard won't work until you do.

**New icon:** iPhone keeps the old Home Screen icon until you remove PlateScan from your Home Screen (press and hold → Remove App → Delete from Home Screen) and add it again from Safari. Your data is safe because it's in your account.

## Install PlateScan as an app on your phone
PlateScan is a web app, so you install it from the browser instead of the App Store. Once installed it opens full screen from its own icon, works offline, and can send reminders and nudges.

**iPhone or iPad**
1. Open your PlateScan address (for example `https://platescan.github.io/PlateScan/`) in **Safari**.
2. Tap the **Share** button (the square with an arrow pointing up) at the bottom of the screen. On iPad it's at the top right.
3. Scroll down and tap **Add to Home Screen**. If it isn't listed, tap **Edit Actions** at the bottom and add it.
4. Make sure **Open as Web App** is on (newer iOS versions show this switch), then tap **Add**.
5. Close Safari and open PlateScan from the new icon on your Home Screen. Sign in once. From now on, always open it from the icon.

**Android**
1. Open the PlateScan address in **Chrome**.
2. Tap **⋮** (top right) → **Add to Home screen** or **Install app** → **Install**.

**Windows or Mac computer**
1. Open the PlateScan address in **Chrome** or **Edge**.
2. Click the install icon at the right end of the address bar (a screen with a down arrow), or open the browser menu → **Install PlateScan** (Edge: **Apps → Install this site as an app**).

These same steps are in the app under your initial (top right) → **Account → Install PlateScan as an app**. Once it's installed, that card shows **Installed as an app**.

## Upload the update
1. Unzip PlateScan.zip. Inside are `index.html`, `sw.js`, `SETUP.md`, `manifest.json`, the icons, a `reminders` folder and a `.github` folder.
2. In your repository: **Add file → Upload files**. Drag in **everything** from the unzipped folder, including both folders. Files with the same name replace the old ones.
3. **Commit changes.**

`config.js` is not in the zip on purpose. Your copy on GitHub already has your Firebase settings, so leave it alone.

## 1. Put the app online (GitHub Pages), already done
Settings → Pages → Branch **main**, folder **/ (root)** → Save. Leave Custom domain empty.

## 2–3. Accounts (Firebase), already done
Email/Password sign-in turned on, your github.io address in Authorized domains, Firestore created, settings pasted into `config.js`.

## 4. Update the database rules (required for this update)
Firebase console → **Databases & Storage → Firestore → Rules**. Select everything in the box, delete it, paste this in, and click **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function me() { return request.auth.uid; }

    // Your own data: only you
    match /users/{uid}/{document=**} {
      allow read, write: if signedIn() && me() == uid;
    }

    // Widget summary, read by your widget script with a secret code
    match /widgets/{token} {
      allow get: if true;
      allow create: if signedIn() && request.resource.data.uid == me();
      allow update, delete: if signedIn() && resource.data.uid == me();
    }

    // Public game card (name, level, streak, weekly points). No food, calories or weight.
    match /profiles/{uid} {
      allow get: if signedIn();
      allow list: if signedIn() && exists(/databases/$(database)/documents/admins/$(me()));
      allow write: if signedIn() && me() == uid;
      // Activity feed: friends can read and send high-fives
      match /events/{eid} {
        allow read: if signedIn();
        allow create, delete: if signedIn() && me() == uid;
        allow update: if signedIn() && (me() == uid
          || (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['fives'])
              && request.resource.data.fives.toSet().difference(resource.data.fives.toSet()) == [me()].toSet()));
      }
    }

    // Friendships are made by opening a friend's invite link
    match /friendships/{fid} {
      allow get: if signedIn() && (resource == null || me() in resource.data.members);
      allow list: if signedIn() && me() in resource.data.members;
      allow create: if signedIn()
        && request.resource.data.members is list
        && request.resource.data.members.size() == 2
        && me() in request.resource.data.members
        && request.resource.data.by in request.resource.data.members
        && request.resource.data.by != me()
        && request.resource.data.members[0] < request.resource.data.members[1]
        && fid == request.resource.data.members[0] + '_' + request.resource.data.members[1]
        && get(/databases/$(database)/documents/profiles/$(request.resource.data.by)).data.invite == request.resource.data.code;
      allow delete: if signedIn() && me() in resource.data.members;
    }

    // Group chats (up to 25 people)
    match /groups/{gid} {
      allow get: if signedIn() && (resource == null || me() in resource.data.members);
      allow list: if signedIn() && me() in resource.data.members;
      allow create: if signedIn() && request.resource.data.owner == me()
        && request.resource.data.members == [me()]
        && request.resource.data.name is string && request.resource.data.name.size() <= 40;
      allow update: if signedIn() && (
        // members post the latest message preview or rename the group
        (me() in resource.data.members
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['last', 'name'])
          && request.resource.data.name.size() <= 40)
        // joining with the invite code
        || (!(me() in resource.data.members)
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['members', 'joinCode'])
          && request.resource.data.joinCode == resource.data.code
          && request.resource.data.members.toSet() == resource.data.members.toSet().union([me()].toSet())
          && request.resource.data.members.size() <= 25)
        // leaving
        || (me() in resource.data.members
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['members'])
          && request.resource.data.members.toSet() == resource.data.members.toSet().difference([me()].toSet()))
      );
      allow delete: if signedIn() && resource.data.owner == me();

      // Team boss fights
      match /raids/{rid} {
        allow read, create, update: if signedIn() && me() in get(/databases/$(database)/documents/groups/$(gid)).data.members;
      }
      match /messages/{mid} {
        allow read: if signedIn() && me() in get(/databases/$(database)/documents/groups/$(gid)).data.members;
        allow create: if signedIn() && me() in get(/databases/$(database)/documents/groups/$(gid)).data.members
          && request.resource.data.uid == me()
          && request.resource.data.t is string && request.resource.data.t.size() <= 500;
      }
    }

    // Nudges: one per friend per day
    match /nudges/{nid} {
      allow create: if signedIn()
        && request.resource.data.from == me()
        && request.resource.data.sent == false
        && request.resource.data.day == math.floor(request.time.toMillis() / 86400000)
        && nid == me() + '_' + request.resource.data.to + '_' + string(request.resource.data.day)
        && (exists(/databases/$(database)/documents/friendships/$(me() + '_' + request.resource.data.to))
            || exists(/databases/$(database)/documents/friendships/$(request.resource.data.to + '_' + me())));
      allow get: if signedIn() && (resource == null || resource.data.from == me() || resource.data.to == me());
      allow list: if signedIn() && resource.data.to == me();
    }

    // Suggestion box: anyone signed in can send; only you (the admin) can read them all
    match /admins/{uid} {
      allow get: if signedIn() && me() == uid;
    }
    match /suggestions/{sid} {
      allow create: if signedIn() && request.resource.data.uid == me()
        && request.resource.data.text is string && request.resource.data.text.size() > 0 && request.resource.data.text.size() <= 1000
        && request.resource.data.status == 'new';
      allow read: if signedIn() && (resource.data.uid == me() || exists(/databases/$(database)/documents/admins/$(me())));
      allow update, delete: if signedIn() && exists(/databases/$(database)/documents/admins/$(me()));
    }

    // Referrals: a new account records who invited it (once); the inviter marks it claimed
    match /referrals/{rid} {
      allow create: if signedIn() && rid == me()
        && request.resource.data.by != me()
        && request.resource.data.claimed == false
        && get(/databases/$(database)/documents/profiles/$(request.resource.data.by)).data.invite == request.resource.data.code;
      allow get: if signedIn() && (resource == null || rid == me() || resource.data.by == me());
      allow list: if signedIn() && resource.data.by == me();
      allow update: if signedIn() && resource.data.by == me()
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['claimed'])
        && request.resource.data.claimed == true;
    }
  }
}
```

What these rules allow:
- Your meals, weight and settings stay private to you.
- Friends can see only your game card: name, hero, level, rank, streak, weekly challenge points and boss stage. Never your food, calories or weight.
- A friendship is created only when someone opens **your** invite link. Group chats can be read only by their members, and people join only with the group's invite link.
- Each person can nudge each friend once per day.
- Anyone signed in can send a suggestion. Only accounts listed under `admins` (you, after step 7) can read all of them.
- A referral reward is recorded once per new account, and only with a real invite link.
- Team boss fights can only be seen and joined by members of that group.
- Activity posts (badges, boss wins, streaks) are visible to signed-in friends, who can only add their own high-five.
- Only you (the admin) can load the owner dashboard's player counts.

If friends or groups show an error after the update, the rules probably weren't published. Check that the box shows the new rules and click **Publish** again.

## 5. Turn on streak reminders (free, about 10 minutes)
Reminders and friend nudges are sent by a free job that runs on GitHub every 15 minutes.

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
2. Click **Streak reminders and nudges → Run workflow**. A green check means it worked. After that it runs by itself every 15 minutes.

**d. Turn it on in the app (on your iPhone)**
1. Open PlateScan **from your Home Screen icon**. Notifications only work there, not in a Safari tab.
2. Tap your initial (top right) → **Alerts** → turn on **Streak reminder**, choose a time, and tap **Allow**.
3. Tap **Send a test notification** to check.

If you haven't logged a meal by your chosen time, you'll get a lock screen notification. When a friend nudges you, you get a notification within about 15 minutes (GitHub can run it a little late). Friends who haven't turned on reminders see the nudge the next time they open PlateScan. GitHub also pauses scheduled jobs if a repository has no changes for 60 days. If reminders stop, open **Actions** and turn the workflow back on.

## 6. Home & Lock Screen widget
1. Install **Scriptable** (free) from the App Store.
2. In PlateScan: your initial → **Alerts** → **Copy widget script**.
3. Open Scriptable → **+** → paste → name the script `PlateScan`.
4. **Home Screen:** press and hold an empty spot → Edit → **Add Widget** → Scriptable → pick a size → Add. Tap the widget and set Script to **PlateScan**.
5. **Lock Screen:** press and hold the Lock Screen → **Customize → Lock Screen** → tap the widget area → Scriptable. Tap the new widget and set Script to **PlateScan**.

The widget refreshes on its own every so often. iOS decides exactly when, usually every 15–30 minutes.

## 7. See suggestions from your users (suggestion box)
People can send ideas, problems and missing foods from **Settings → Help → Suggestion box**. To make yourself the only person who can read them:
1. In PlateScan, sign in, then tap your initial → **Help**. At the bottom it says **Your user ID**. Tap **Copy**.
2. Firebase console → **Firestore → Data** → **+ Start collection**.
3. Collection ID: `admins` → **Next**.
4. Document ID: paste your user ID. Add a field: name `role`, type string, value `owner`. Click **Save**.
5. Reopen PlateScan. **Help** now shows a **Suggestions inbox** with everything people send. A red dot on your initial means there's something new. Mark each one **Planned** or **Done** (the sender sees that status) or delete it.

## Referral rewards
When someone creates a new account using a friend's invite link (Friends → Invite), the new person gets 250 gold and 300 XP right away, and the friend who sent the link gets the same the next time they open the app (up to 20 referrals each).

## When you publish an update
GitHub Pages goes live about a minute after you commit. People who open PlateScan afterward get the new version automatically. Anyone who already has it open sees a yellow **"A new version of PlateScan is ready · Refresh"** bar. Data is never lost by updating.

## Team boss fights
1. Make a group in **Friends → Groups** and invite people with the group link.
2. In **Quest**, tap **Fight boss**, choose **Team (group)**, pick the group, then **Open team lobby**. A **Join fight** button appears in the group chat.
3. When everyone is in, the host taps **Start fight**. Each person fights from their own phone. Every extra fighter adds 75% boss HP, and everyone gets 25% bonus rewards.

## AI portion estimates
Add your free Google AI key once (coach ⚙ → Smart answers). Then after you take a meal photo, tap **✨ Estimate portions with AI**. Photos are sent to Google's Gemini only when you tap that button.

## Boss battles: camera tips
- Fights need camera access. The first time, tap **Allow**. If you said no: iPhone **Settings → Apps → Safari → Camera → Allow** (or for the installed app, delete and re-add it to get the prompt again).
- The rep tracker downloads once (about 6 MB) and then works offline.
- **Lunges and sit-ups:** side-on to the camera.
- **Jumping jacks:** face the camera from 6–8 feet back.
- **Plank:** phone on the floor beside you, side-on. Every 2 seconds of a straight plank is one hit.
- **Squats:** stand side-on, 6–8 feet from the phone, with hips, knees and ankles in view.
- **Push-ups:** put the phone on the floor beside you, side-on, with your whole body in view.
- **Pull-ups:** face the camera from a few feet back so your hands on the bar and your head are visible.
- Video never leaves your phone. Nothing is recorded or uploaded.

## Troubleshooting
- **Friends, groups or nudges say "Couldn't…" or stay empty:** publish the rules from step 4 again.
- **Old version still showing:** close the app fully and reopen it, or wait a few minutes.
- **Reminder switch is grayed out:** open PlateScan from the Home Screen icon and make sure you're signed in.
- **No notification arrives:** check iPhone **Settings → Notifications → PlateScan**, and the job's latest run in the **Actions** tab.
- **Widget shows 0 or nothing:** check that the rules from step 4 are published, then open PlateScan once so it saves your latest streak.
