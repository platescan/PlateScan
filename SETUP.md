# PlateScan setup

Steps 1–3 are already done if your app and accounts work. For this update (v21: block and report, account deletion and data download, privacy notice and 13+ check, weekly recap 2.0, and a faster app), do **Upload the update** (including the new `sw.js`), then **step 4: publish the new database rules (required for blocking, reports and bans)**.

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
          && request.resource.data.t is string && request.resource.data.t.size() <= 500
          && !exists(/databases/$(database)/documents/bans/$(me()));
      }
    }

    // Nudges: one per friend per hour
    match /nudges/{nid} {
      allow create: if signedIn()
        && request.resource.data.from == me()
        && request.resource.data.sent == false
        && request.resource.data.hr == math.floor(request.time.toMillis() / 3600000)
        && nid == me() + '_' + request.resource.data.to + '_' + string(request.resource.data.hr)
        && !exists(/databases/$(database)/documents/blocks/$(request.resource.data.to + '_' + me())) && !exists(/databases/$(database)/documents/bans/$(me()))
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

    // Duels: 60-second rep battles between friends for gold
    match /duels/{did} {
      allow create: if signedIn() && request.resource.data.a == me()
        && request.resource.data.status == 'open'
        && request.resource.data.stake is int && request.resource.data.stake >= 10 && request.resource.data.stake <= 500
        && !exists(/databases/$(database)/documents/blocks/$(request.resource.data.b + '_' + me()))
        && (exists(/databases/$(database)/documents/friendships/$(me() + '_' + request.resource.data.b))
            || exists(/databases/$(database)/documents/friendships/$(request.resource.data.b + '_' + me())));
      allow read: if signedIn() && (resource.data.a == me() || resource.data.b == me());
      allow update: if signedIn() && (resource.data.a == me() || resource.data.b == me())
        && request.resource.data.a == resource.data.a && request.resource.data.b == resource.data.b
        && request.resource.data.stake == resource.data.stake;
    }

    // Friend requests (from "People you may know")
    match /friendReqs/{rid} {
      allow create: if signedIn() && request.resource.data.from == me()
        && rid == me() + '_' + request.resource.data.to && request.resource.data.to != me()
        && !exists(/databases/$(database)/documents/blocks/$(request.resource.data.to + '_' + me())) && !exists(/databases/$(database)/documents/bans/$(me()));
      allow read: if signedIn() && (resource == null || resource.data.to == me() || resource.data.from == me());
      allow delete: if signedIn() && (resource.data.to == me() || resource.data.from == me());
    }

    // Friend codes
    match /tags/{tag} {
      allow get: if signedIn();
      allow create: if signedIn() && request.resource.data.uid == me();
      allow delete: if signedIn() && resource.data.uid == me();
    }

    // Monthly boss parties
    match /mparty/{pid} {
      allow read: if signedIn() && (resource == null || me() in resource.data.members);
      allow create: if signedIn() && request.resource.data.owner == me() && request.resource.data.members == [me()];
      allow update: if signedIn() && (me() in resource.data.members
        || (exists(/databases/$(database)/documents/mpInv/$(pid + '_' + me()))
            && request.resource.data.members.toSet() == resource.data.members.toSet().union([me()].toSet())
            && request.resource.data.members.size() <= 10));
    }
    match /mpInv/{iid} {
      allow create: if signedIn() && request.resource.data.from == me()
        && iid == request.resource.data.pid + '_' + request.resource.data.to
        && !exists(/databases/$(database)/documents/blocks/$(request.resource.data.to + '_' + me()))
        && me() in get(/databases/$(database)/documents/mparty/$(request.resource.data.pid)).data.members;
      allow read: if signedIn() && (resource == null || resource.data.to == me() || resource.data.from == me());
      allow delete: if signedIn() && (resource.data.to == me() || resource.data.from == me());
    }
      // v20: live workouts (avatar motion only, never video)
    // Gym likes: one per friend per gym
    match /gymLikes/{lid} {
      allow read: if signedIn();
      allow create: if signedIn() && request.resource.data.by == me() && request.resource.data.owner != me()
        && lid == request.resource.data.owner + '_' + me()
        && request.resource.data.keys().hasOnly(['owner','by','name','ts'])
        && !exists(/databases/$(database)/documents/blocks/$(request.resource.data.owner + '_' + me())) && !exists(/databases/$(database)/documents/bans/$(me()));
      allow delete: if signedIn() && (resource.data.by == me() || resource.data.owner == me());
    }

    match /lives/{uid} {
      allow read: if signedIn() && !exists(/databases/$(database)/documents/blocks/$(uid + '_' + me()));
      allow write: if signedIn() && me() == uid && !exists(/databases/$(database)/documents/bans/$(me()));
      match /cheers/{cid} {
        allow read: if signedIn();
        allow create: if signedIn() && request.resource.data.from == me()
          && request.resource.data.e is string && request.resource.data.e.size() <= 8
          && !exists(/databases/$(database)/documents/blocks/$(uid + '_' + me())) && !exists(/databases/$(database)/documents/bans/$(me()));
        allow delete: if signedIn() && me() == uid;
      }
      match /viewers/{vid} {
        allow read: if signedIn();
        allow write: if signedIn() && me() == vid;
        allow delete: if signedIn() && (me() == vid || me() == uid);
      }
    }
    match /livePings/{pid} {
      allow create: if signedIn() && request.resource.data.from == me() && pid.matches(me() + '_.*');
    }
    // v20: special badges given by admins
    match /grants/{gid} {
      allow read: if signedIn() && (resource.data.uid == me() || exists(/databases/$(database)/documents/admins/$(me())));
      allow create, delete: if signedIn() && exists(/databases/$(database)/documents/admins/$(me()));
    }
      // v21: blocking, reports and bans
    match /blocks/{bid} {
      allow create: if signedIn() && request.resource.data.by == me() && bid == me() + '_' + request.resource.data.uid;
      allow read, delete: if signedIn() && resource.data.by == me();
    }
    match /reports/{rid} {
      allow create: if signedIn() && request.resource.data.by == me() && request.resource.data.status == 'new'
        && request.resource.data.reason is string && request.resource.data.reason.size() <= 20
        && request.resource.data.details is string && request.resource.data.details.size() <= 500
        && request.resource.data.ctx is string && request.resource.data.ctx.size() <= 300;
      allow read, update, delete: if signedIn() && exists(/databases/$(database)/documents/admins/$(me()));
    }
    match /bans/{uid} {
      allow get: if signedIn() && (me() == uid || exists(/databases/$(database)/documents/admins/$(me())));
      allow write: if signedIn() && exists(/databases/$(database)/documents/admins/$(me()));
    }
  }
}
```

What these rules allow:
- Your meals, weight and settings stay private to you.
- Friends can see only your game card: name, hero, level, rank, streak, weekly challenge points and boss stage. Never your food, calories or weight.
- A friendship is created only when someone opens **your** invite link. Group chats can be read only by their members, and people join only with the group's invite link.
- Each person can nudge each friend once per hour.
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

**d. Turn it on in the app**
1. Open the menu (☰) → **Reminders** (or tap your initial → **Alerts**).
2. Turn on **Streak reminder**, choose a time, and tap **Allow**. Then tap **Send a test notification** to check.

Where notifications work:
- **Computer (Chrome, Edge, Firefox, Safari on Mac) and Android:** right from the website. No install needed.
- **iPhone/iPad:** Apple only allows notifications from the Home Screen app, not a Safari tab. On the website, use **Calendar reminders** instead (below).
- Each device you turn it on for gets its own notifications (for example your phone app *and* your work computer).

**Calendar reminders (any device, no app or setup needed):** in **Reminders**, tick meals, workout, water and/or weekly weigh-in, pick times, then tap **Add to Apple / Outlook calendar** (on iPhone tap the file, then **Add All**) or the **Google Calendar** links. They repeat daily with an alert. These don't need the GitHub job at all.

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

## Your gym (new in v22)
Menu → **Gym**. A 3D gym that's yours to build:
- **Edit**: tap a glowing spot on the floor (6 spots) or wall (2 spots) to buy and place something. Tap a placed item's spot again to swap it or leave it empty.
- **Style**: floors, wall styles and lighting. **Shop**: everything in one place. Tap ✏️ to name your gym.
- **How you get items**: gold for most; the Smoothie bar and Quest Master plaque from daily quests (30 and 100), the Cable machine at level 12, the Trophy case after 10 bosses, the Golden champion statue after 20 bosses plus gold, and one holiday decoration from each month's boss (only that month).
- **Stars**: 1 to 5, based on how much is in your gym.
- **Friends**: visit from **Friends' gyms** on the Gym tab or the **Visit gym** button on a friend's profile, and tap **Like**. You get a pop-up when someone likes yours. Likes need the v22 database rules (step 4).

## Avatars everywhere (v22)
Your custom avatar (Locker → Avatar) replaces the old preset heroes everywhere: leaderboards, friend requests, duels, the activity feed, the top bar and Settings → Account. Tapping your avatar on Friends opens the Locker.

## Forgot password or email (v22)
On **Sign in**: **Forgot password?** sends a reset email (tell users to check spam). **Forgot email?** shows the email last used on that phone (partly hidden) with a **Use this email** button, plus tips for finding it.

## Camera zoom, plank and sounds (v22)
- **.5× zoom**: during a workout with the **back camera**, a **.5×** button appears at the top if the phone has an ultra-wide lens (most iPhones since the 11, many Androids). The front camera can't zoom out. The choice is remembered.
- **Planks** only count on elbows or hands with hips off the floor; lying flat says "Prop up on your elbows or hands".
- **Hit sounds**: normal hits play a bright two-note chime; critical hits keep the big sound.
- **Screen recordings**: Settings → Alerts → **Sound in screen recordings** (on by default) plays game sounds and voice counting even with the silent switch on, so iPhone screen recordings capture them. It can pause music from other apps; turn it off to keep music playing.

## Live workouts: smoother playback (v22)
Live workouts now send 15 frames a second with finer positions and the real camera shape, and viewers' phones buffer about a second and smooth between frames, so movement looks fluid instead of jumpy. Uses about the same database writes as before.

## Folding cards (v22)
Fill your bars, the suggestion box and the admin sections (suggestions inbox, owner dashboard, reports, developer tools) fold with a tap on their title and remember how you left them.

## Daily rewards and tips
Everyone gets a daily reward the first time they open PlateScan each day: gold that grows over 7 days, with an XP potion on day 7. Missing a single day keeps their progress; missing two starts over. PlateScan also shows at most one friendly tip a day: how to add it to the Home Screen (if they haven't), or to turn on reminders (once it's installed). Tapping **Not now** hides that tip for 3 days.

## Referral rewards
When someone creates a new account using a friend's invite link (Friends → Invite), the new person gets 250 gold and 300 XP right away, and the friend who sent the link gets the same the next time they open the app (up to 20 referrals each).

## When you publish an update
GitHub Pages goes live about a minute after you commit. People who open PlateScan afterward get the new version automatically. Anyone who already has it open sees a yellow **"A new version of PlateScan is ready · Refresh"** bar. Data is never lost by updating.

## Friend workout streaks
A day counts toward your streak with a friend when you **both** do 10+ good tracked reps (any workout, boss fight, duel or circuit). 🔥 shows the streak next to each friend, ⏳ means it ends at midnight. If reminders are on, you get a 7 PM notification when a streak is about to end. Milestones at 3, 7, 14, 30, 50, 100 and 365 days pay gold.

## Mutual friends
Each friend's profile shows your mutual friends. **Friends → Friends → People you may know** suggests friends of your friends; tap **Add** to send a request, and they accept from **Friend requests**.

## Monthly boss and hearts
Quest → Bosses → **Monthly boss**. Each month's boss is themed on that month's biggest holiday (🎃 Halloween, 🦃 Thanksgiving, 🎄 Christmas, 💘 Valentine's Day and so on). Pick a difficulty: the boss gets one big **total** health pool for the rest of the month (about 10, 20, 30 or 40 reps a day's worth). Beat it however you like: a little every day or a few big sessions. **Recommended today** is only a guide and adjusts as you go; the pace bar shows if you're ahead or behind.
**Hearts:** up to 5. The boss attacks overnight (-1 ❤) only if you fall more than a full day behind pace, and it hits you during fights if you stop repping or don't block a ⚡ charge attack. Get hearts back: 1 every 45 minutes, 1 per daily quest, or buy them in the Shop.
**Parties:** tap **+ Invite friends**. Each friend adds 80% HP, everyone shares the pace, and rewards are +50% (gold, XP, an exclusive badge and an Elixir of Legends). Each member's total reps for the month are shown.

## Safety: block, report and ban
- **Block:** tap a friend → **🚫 Block**, or tap someone's group message → **Block**. They're removed from your friends and can't send you friend requests, nudges, duels, party invites or cheers, or watch you live. Their group messages are hidden for you. They aren't told. Unblock in Settings → Account.
- **Report:** tap a friend → **🚩 Report**, tap a group message, or tap 🚩 while watching someone live. Pick a reason, add details, and optionally block them too.
- **For you (admin):** reports show at the top of Settings → Help under **Reports**. Mark them Reviewing or Close. **Ban** stops someone from going live, cheering, chatting, nudging and sending friend requests (they can still log food). **Unban** undoes it. Bans are enforced by the database rules, so they can't be bypassed.

## Your data, privacy and age
- **Settings → Account → Download my data** saves everything as a file.
- **Delete my account** permanently removes the account, meals, weight log, progress, pets, friendships and public card (asks for the password and the word DELETE).
- **Privacy notice** (Settings → Help or Account) explains in plain words what's stored, what stays on the phone, and that there are no ads and no data selling.
- New accounts must tick **I'm 13 or older and agree to the privacy notice**.

## Weekly recap
From Sunday to Tuesday, Today shows **Your week in review** (also any time from Progress → See your weekly recap). It's a shareable image card with your hero and pet, days logged, average calories and protein, reps and workout days, average meal grade, weight change, streak and XP, with ▲▼ compared to last week and your top 3 wins. Tap **Share** to send it or save it.

## Speed
- The app now opens **instantly from your phone's cache** and quietly downloads updates in the background. When a new version is ready you'll see "A new version of PlateScan is ready" with a **Refresh** button.
- Tab switching is smoother (no more repeated layout work while drawing screens), and the database files start downloading the moment the app opens.

## Live workouts (avatar cam) and cheers
When you start a fight or workout, friends can watch **live**. They see your hero moving along with your body (from the rep tracker), your rep count and the boss's health, never your real camera. They tap emojis (🔥 💪 👏 😤 🏆 🚀) that fly up on your screen. Each cheer gives **+5% damage for 10 seconds** (up to +25%). Friends get a "just went live" alert in the app, a **Watch** button on Today and Friends, and a push notification (sent by the reminder job, so it can arrive a few minutes late). Turn it off with **Let friends watch live** on the workout setup screen. Needs the v20 rules.

## Smart reminders
Settings → Reminders → **Smart reminders**. Up to 3 a day (around noon, 4 PM and 8 PM), only when something needs attention: your streak ends tonight, you're behind on the monthly boss, you haven't logged a meal, or your pet is thirsty, sad, wants to train or has an egg to hatch. Tap the chips to choose **Streak saves**, **Boss battles**, **Logging** and **Pet**. These need the streak reminder switch on.

## Meal health score and food pictures
While building a meal, PlateScan shows an **A to F grade**, a **Health score out of 100**, a **Goal fit** (Great, Good, Okay or Poor for losing, gaining or maintaining) and the reasons (protein, whole foods, processed or sugary items, meal size, calories and protein left today). Logged meals without a photo get a food picture based on what's in them, plus their grade, on Today and in Progress.

## Get the app (after signing in)
After the tour (and after signing in), PlateScan shows two quick pop-ups, one at a time: **Add to Home Screen** (steps for iPhone, an Install button on Android and desktop), then **Turn on notifications** (on iPhone in Safari it offers Calendar reminders instead). Each only shows if that step isn't done yet, and never on top of another screen.

## Daily login reward
The reward resets at **midnight** your time. If the app is open at midnight it pops up right away, and after claiming you see a countdown to the next one.

## Referrals
Each friend who joins with your link gives you **100 gold and a Basic Egg**; they get a welcome gift and a Basic Egg too. **Referral badges** go Bronze (1 friend), Silver (3), Gold (5), Platinum (10), Diamond (15) and Legendary Ambassador (20).

## Developer tools (admins only)
Settings → Help, below the suggestions inbox:
- **Sign up as a fake new user:** opens a sandbox that walks through the welcome screen, sign-up, setup and tour exactly like a new person. Nothing is saved online and your real account isn't touched. Tap **Exit** in the purple bar to go back.
- Quick buttons: +5,000 gold, +1 of each egg, refill hearts, preview the Mythic hatch, reset today's login reward, preview level-up, replay the tour, show "Get the app", show patch notes.
- **Custom badge:** name it, describe it, pick a symbol (crown, bolt, flame, gem, rocket, dumbbell, paw and more) and a finish (Gold, Holographic, Ruby, Emerald, Sapphire, Obsidian, Rose gold, Frost), then give it to anyone by friend code (like MIKE-1234) or user ID. Shortcut: tap the friend in your Friends list and tap **🏅 Give badge**, which fills in their code. (Everyone can see a friend's code there with a Copy button; your own code is under the bell 🔔.) They get a popup and it shows on their profile and Badges. **Take back** removes it. Needs the v20 rules.

## Pets and eggs
Menu (☰) → **Pets** (its own tab). Sections: **My pet**, **Eggs**, **Collection**, **Gear**, **Habitat**.
- **Eggs:** Basic (250 gold: common 70%, rare 25%, epic 5%), Gym (900: common 25%, rare 45%, epic 25%, legendary 5%) and Golden (3,000: rare 30%, epic 45%, legendary 23%, **mythic 2%**). The Mythic **Celestial Swole Dragon** only hatches from Golden Eggs.
- **36 pets** in 5 rarities, including gym-themed originals: Kettlebell Kraken, Barbell Bear, Cardio Cheetah, Yoga Yeti, Protein Shake Slime, Spin-Class Unicorn, Gym Gorilla, Deadlift Bulldog, Protein Phoenix, Gainz Griffin, Titan Tiger.
- **Free eggs:** everyone starts with one Basic Egg; a Basic Egg every 1,000 reps; a Gym Egg every 5 bosses beaten and every 7-day logging streak; a Golden Egg for beating the monthly boss.
- **Duplicates** add a star (up to ★5) and give 20% of the egg's price back. **Lucky streak protection:** a Gym Egg is guaranteed Epic+ after 9 misses; a Golden Egg is guaranteed Legendary+ after 14.
- **Gear** (bandana up to a halo) and **Habitats** (Sunny park up to Mount Olympus). Some unlock by collecting pets, beating bosses or leveling up. Friends see your pet and its gear.
- **New hero items to work for:** Neon tracksuit, Beastmaster armor (25 pets), Shoulder dragon (15 pets), backgrounds Neon gym, Volcano forge, Aurora peaks, Beast sanctuary and Hall of Fame, the Menagerie and Mythic banners, and collector titles (Egg Hunter, Beast Collector, Master of Beasts, Mythic Tamer).

## Fill your bars (food suggestions)
On Today, **Fill your bars** suggests foods that best fit what's left of your calories, protein, carbs and fat, favoring healthy whole foods, plus a combo that finishes the day. Tap a food (or **Add all**) to put it in a new meal, then confirm. Tap ✕ to stop seeing a food. With a free AI key, **✨ AI meal ideas** suggests whole meals.

## Friends: live leaderboard and shared progress
The weekly leaderboard updates live (watch for the red **LIVE** dot), and you get a heads-up when a friend passes you. In **Locker → Profile → What friends can see**, choose what to share: workouts this week, monthly boss, water today, food today (only % of goals, never what you ate), weight progress and your goal. Workouts, boss and water are on by default; food, weight and goal are off. Tap a friend to see what they share.

## The menu
The tabs moved from the bottom to a side menu. On a phone tap **☰** (top left) or swipe in from the left edge; tap outside, ×, or swipe left to close. On a computer or iPad it stays open on the left, and **Collapse** shrinks it to icons. **Scan** stays in the middle at the bottom.

## Locker (avatar, profile, frames, themes)
Menu → **Locker** (or tap the avatar card on Today, or your avatar on Friends). The card at the top shows how friends see you. Tabs: **Avatar**, **Profile**, **Frames**, **Themes**. New fitness items: race singlet, compression gear, martial arts gi, champion robe, coach whistle, gym towel, gold medal, title belt; backgrounds like running track, lap pool, veggie garden, mountain trail, court, yoga sunrise, stadium lights and champion podium; 12 new banners; 4 frames; 4 themes. Items marked 🔒 unlock by doing reps, reaching a level, keeping a streak or beating bosses, and some also cost gold.

## Your avatar, pet and profile
In the Locker. **Avatar**: skin, hair, hair color, facial hair, outfits, gear and backgrounds; expensive items shimmer. Your avatar gets more muscular as you log reps and leaner as you approach your weight goal. **Pet**: adopt one; it's happy when you log meals, hit protein, drink water, finish quests and work out. Treats, toys and a cozy bed (gold) keep it happy. **Profile**: motto, title, favorite exercise and banner. Friends see all of this.

## Notification box and friend codes
Tap the bell at the top. Friend requests, duel challenges and party invites all land here. Your friend code (like MIKE-4821) is at the top; type someone else's code to send them a request. When you send requests, duels or invites you can turn the push notification off and it will only go to their notification box.

## Logging, water and the scanner
Each food has S/M/L/XL buttons and an exact amount in g, oz, cups or tbsp. With your free AI key the scanner estimates portions automatically. Search finds millions more foods online. Water: pick your bottle size under the water bar; Settings → Goal sets a recommended goal and oz/ml.

## Workouts and the camera
Every move has an **animated demo** on the fight setup screen showing the movement, where the phone goes and how far back to stand. It also says whether the camera needs to see you from the **side** or the **front**, plus step-by-step directions. Prop the phone 6–8 feet away in good light so your whole body is visible.

## Duels
Tap a friend (Friends → Friends) → **Duel for gold**. Pick an exercise and a stake (25–250 gold). You do 60 seconds of reps first, then your friend has 48 hours to beat your score. The winner gets the whole pot. A tie, a decline or no answer returns the gold. Duel alerts arrive with the same 15-minute job as nudges.

## Home workouts
Quest → Bosses → **Home workouts**: 5 guided no-equipment circuits (Quick 7, legs, core, upper body, cardio). The camera counts each move, with 10 seconds of rest between moves. Finishing a circuit pays 30 gold and 50 XP once a day.

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
- **Reminder switch is grayed out:** make sure you're signed in. On iPhone in Safari, use Calendar reminders, or open PlateScan from the Home Screen icon.
- **Can't find a tab:** they're in the side menu (☰ top left).
- **No notification arrives:** check iPhone **Settings → Notifications → PlateScan**, and the job's latest run in the **Actions** tab.
- **Widget shows 0 or nothing:** check that the rules from step 4 are published, then open PlateScan once so it saves your latest streak.
