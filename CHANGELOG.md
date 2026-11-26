# PlateScan patch notes

The same notes are in the app under Settings → Help → Patch notes.

## v23.4: Admin reward sliders (Nov 26, 2026)
- Admins: Rewards sliders in Developer tools (under Boss health). XP and gold 0–300% for bosses, monthly boss, event bosses, training dummy, daily login, chest, pet gifts, monthly race and referrals, with live previews. Saved to `config/game` for everyone.
- Boss health and reward saves now merge instead of overwriting each other.

## v23.3: LIVE tags, badge equipping, fairer grades and more (Nov 26, 2026)
- Lots more brand-name foods built in (about 140 new, close to 800 total): Burger King, Domino’s, Pizza Hut, Panera, Jersey Mike’s, Jimmy John’s, Sonic, Arby’s, Whataburger, Culver’s, Shake Shack, Wingstop, Cava, Sweetgreen, Olive Garden, Costco and Kirkland, plus protein bars and shakes, yogurts, cereals, breads, chips, cookies, frozen meals, deli meats, sauces and drinks. If the built-in list has fewer than 4 matches, the app now searches the online food database on its own (popular US products first), so most packaged foods show up as you type. Scanning a barcode still fills in the exact label values.
- Admins can change boss health for everyone: Settings → Help → Developer tools → Boss health. One slider for all bosses, one per difficulty, and one for new monthly bosses (20%–300%), showing the real boss HP and reps for each difficulty (first and last boss) and the monthly boss HP. Save for everyone applies it to every player within seconds. Fights already going and this month’s boss keep their health.
- Database rules: new `config` collection (everyone can read, only admins can change). Publish the rules again.
- LIVE badge on the Friends list: a red pulsing LIVE tag shows next to a friend’s name (friends list and leaderboard) while they work out live. Tap it to watch. It goes away within about 3 minutes if their workout ends or the app closes.
- Badge equipping, now in your Locker: Locker → Badges has 3 Equipped slots at the top and an Equip button on every badge you’ve earned. Equipped badges show next to your name on the leaderboard, friends list and your profile. Tap a slot’s × to remove one. If you don’t equip any, your best 3 show automatically.
- More gold from bosses (about 1.4–1.6× more): Boss gold is now 40 + 25 per stage (was 30 + 15), times your difficulty bonus, so later bosses are worth a lot more: boss 1 pays 65 gold on Easy, boss 5 pays 165 and boss 7 pays 215. Every rewarded replay pays 50% gold (XP still drops from 40% to 15%), so a higher boss always pays more than a lower one. Monthly boss rewards: Easy 450 gold and 1,500 XP, Normal 700 and 2,300, Hard 1,000 and 3,200, Legend 1,400 and 4,200 (was 150/220/320/440 gold). Event boss: 300 gold (was 200).
- Food details: tap ⓘ next to any food (search results, online results, barcode scans and the foods in a meal) to see a full Nutrition Facts label scaled to your serving: calories, fat, saturated fat, sodium, carbs, fiber, sugars, protein and % Daily Value. Packaged foods also show the ingredients and allergen warnings. General foods show what we have, with a button to search online for the full label.
- Fixed a big sync bug: saving a custom, barcode or online food to My foods made every account save fail after that (gold, progress, settings), because the database can’t store that list format. Saved foods are now stored in a format it accepts, and all your progress syncs again.
- Happy pet gift: now every hour instead of once a day (10 to 50 gold depending on rarity, +10 when your pet is thrilled). Fixed: refreshing the app used to give the gift again. A countdown shows when the next one is ready.
- High knees: you have to alternate legs. Lifting the same knee over and over doesn’t count anymore.
- The Refresh bar now also checks a few seconds after you open the app, not only when you come back to it. There’s still no “What’s new” pop-up; patch notes stay in Settings → Help.
- Your phone now shows the Refresh bar for new updates. Every update used to share the version number 23, so installed phones could keep running an older copy without knowing. That’s why the monthly boss podium showed on a computer but not on a phone. Each upload now gets its own number (this one is 23.1).
- High knees: marching doesn’t count anymore. A rep needs your knee at least 70% of the way to hip height and a quick lift, so run in place. Crits are easier: every knee at hip height or higher is a perfect rep. Each high knee does a little less damage (fast cardio was out-damaging everything else), and mountain climbers were evened out the same way.
- Bosses get faster the longer a fight goes: every minute you get 8% less time between hits before the boss attacks, down to 55%. A message tells you when it speeds up.
- Monthly boss replays pay 50% the first time, then 30% after that.
- Balance: monthly boss rewards now match the effort: Easy 450 gold and 1,500 XP, Normal 700 and 2,300, Hard 1,000 and 3,200, Legend 1,400 and 4,200.
- Monthly boss race: the first 3 players (or parties) to beat each month’s boss win prizes. 1st: 1,000 gold, a Golden Egg and the exclusive animated Champion frame. 2nd: 500 gold and a Golden Egg. 3rd: 250 gold and a Basic Egg. The podium shows live on the monthly boss card, and a party that wins together shares its spot. Replays don’t count. Needs the updated database rules.
- Fixed: with lots of gold, the gold counter could overlap the PlateScan name at the top of the screen.
- Getting started checklist for new players on Today: log your first meal, beat your first boss, add a friend and try a home workout. Each pays gold, and finishing all four gives +100 gold and a Basic Egg. Tap any step to jump right to it.
- Automatic bug reports: if something breaks on a player’s phone, the error is saved privately for admins (Settings → Developer tools → Bug reports) with the app version and screen, so problems get fixed without anyone having to report them. Needs the updated database rules.
- Fixed: taking a photo could freeze the whole screen while the food recognizer downloaded, learned the food list or looked at your photo. It now runs in the background, so the app stays responsive and the progress bar keeps moving. In a test, the longest freeze dropped from over 6 seconds to under 0.1 seconds.
- Admin: Developer tools → Make a test account walks you through a second, real account (Safari plus your home-screen app) with your invite link and a ready-made test email, so you can invite yourself, watch yourself live, duel and party up.
- Push-ups can’t be faked anymore: a rep only counts when your hands stay planted under your shoulders and your shoulders actually sink toward the floor. Just bending or raising your arms (lying down, or holding a plank with still shoulders) shows a tip instead of counting.
- A simpler first week for new players: day 1 is just Today, Progress, Quests, boss battles and Friends. Shop and Locker, Badges, Pets, Duels, your Gym, Groups and the monthly boss unlock over the next 5 days, or sooner as you level up, each with a quick pop-up. A card on Today shows what’s next, and “Show everything now” unlocks it all. Players from before this update keep everything.
- Share cards: share a picture of a boss win, a level-up or your progress (level, rank, streak, reps, bosses) to Instagram, TikTok or Messages. Every card shows your friend code. Look for 📸 on the win screen, the level-up screen, the Quest tab and Friends. The weekly recap image shows your code too.
- Invite rewards: exclusive items you can only get by inviting friends: Recruiter banner (1 friend), VIP lounge avatar background (3), Party time pet habitat (5), and the Legendary Ambassador banner plus a Golden Egg (10). Your progress is in Friends → Invite your people.
- Referral bonus fixed to match what the app promised: 250 gold and 300 XP for both of you, plus an egg. A new player who types a friend code in their first 3 days now gets the bonus too, not just people who used the link.
- Change the monthly boss difficulty before you start: until you land your first hit (and no friend has joined your party), a “Change difficulty” button on the boss card and on the fight screen takes you back to pick another one. Replays can switch too, and the fight screen now shows the real replay reward.
- Boss party invites are easier to see: a new invite now pops up in the app (once) and stays in the bell inbox. Before, invites were hidden from anyone who had already beaten this month’s boss. Now they can join a friend’s party as a replay for 30% of the rewards. Invites also send a phone notification to friends who have notifications on.
- Fixed: the Quick workout and home workout screen still said “1 gold per 5 reps (up to 20 a day)”. It now shows the real rate (1 gold for every 2 good reps, up to 100 a day) and how much you’ve earned today.
- Faster food recognizer download: only the picture half of the recognizer downloads up front (roughly half the size). The food list now comes ready-made from the app (well under 1 MB) instead of being learned on your phone, which used to take a few minutes. It’s published from an admin’s phone the first time an admin scans after this update.
- Reopening the app no longer replays pop-ups you already saw (quests, achievements, badges, rewards, the daily reward, friend requests). The app now waits for your data to load before checking, and remembers what you’ve already seen in your account, not just on the phone.
- Fixed: ending a Quick workout with no reps counted, before your first boss fight, got stuck on the workout screen.
- Training dummy (Quick workout) pays more: 1 gold for every 2 good reps, up to 100 a day (was 1 per 5, up to 30). The results screen shows how much training gold you’ve earned today.
- Duel, nudge and boss alerts arrive much faster: the notification job now runs every 5 minutes instead of once an hour (upload the new reminders.yml).
- Happy pets help you: when your pet’s mood is 60 or higher you get +5% gold and XP from boss fights and training (+10% at 80, +15% at 90, plus a little more for rarer pets), and your pet brings you a gift of gold every hour (sometimes an XP potion when it’s thrilled). Tap the 🎁 button on the home card or in Pets.
- Live sharing switch in Settings → Account (Live workouts). Also fixed: the live switch on the fight screen wasn’t showing its on/off toggle.
- Phone calls no longer freeze the camera. If a call, FaceTime or Siri takes the camera (or the picture freezes), the fight pauses so the boss can’t hit you, the camera reconnects on its own when it’s free, and you get 5 seconds before the next attack.
- Steadier, more accurate tracking: a more accurate pose model (slow phones switch back to the lighter one automatically), smoothing on every joint so the lines stop jumping, one-frame glitches ignored, and lines no longer flicker on and off.
- Smoother live view for friends: it now sends the steadied skeleton, so what friends watch doesn’t glitch either.
- Glute bridges count properly now. The old check needed you to start lying almost flat, so most reps didn’t count. It now learns your starting position (feet close or far) and counts a clear lift of your hips.
- Leveling up is easier: each level needs about 20% less XP. Your XP stays the same, so you may jump up a level or two right away.
- Fewer pop-ups when you open the app: at most one install or notification pop-up per app open, never in the first 25 seconds, and “Later” snoozes it for 3 days (then 7, then 14). Achievement banners wait until the daily reward is closed. The old duplicate install pop-up is gone.
- Quest tab opens on Quests and the Friends tab opens on Friends each time you open the app.
- All levels and ranks: a new list under your level card on the Quest tab shows every rank and level and the XP needed for each.
- 8 new ranks up to level 100 with 3 new emblem tiers: Ruby, Obsidian and Celestial (Gainz Warlord, Mythic Overlord, Ruby Juggernaut, Crimson Colossus, Obsidian Warden, Shadow Titan, Celestial Ascendant and PlateScan Immortal).
- 6 new bosses: Fry Phantom, Snack Kraken, Scrollmancer, Midnight Muncher, Excuse Hydra and Donut Dreadnought. There are now 16 bosses before they come back Ascended, plus new Cosmic and Godlike versions.
- The monthly boss has a lot more health: Easy 4,500, Normal 6,500, Hard 8,500 and Legend 10,500 HP, the same whenever in the month you start. Bosses already in progress keep their health.
- Already beat the monthly boss? Replay it on any difficulty for 30% of the gold and XP (no extra egg or elixir, and replays don’t attack overnight).
- More customization: 6 new avatar frames (Frostbite, Sakura, Toxic, Rainbow, Obsidian, Celestial), 7 app themes, 7 profile banners, 5 hair colors, 6 outfit colors, 5 avatar backgrounds and 3 pet habitats.
- Boss reward cap resets after 1 hour: after 5 rewarded replays of a boss, it’s practice only for an hour, then rewards start over. You get a pop-up in the app, or a push notification if reminders are on and the app is closed (not between 10 pm and 7 am). The old once-a-day limit per boss is gone.
- Reward cap timer: a capped boss shows a live countdown on the boss map and in the Rewards box. Everyone’s existing caps were reset once with this update.
- Fixed: the friend workout streak gold could pay out again after visiting the boss screen. Each streak reward now saves to your account, so it only pays once. Old saved copies of the food list are also cleared from the phone to free space.
- The food recognizer only downloads and loads when you tap the camera to take or pick a photo, not when you open Scan to search.
- Harder difficulties need fewer reps. To beat a stage-1 boss: Normal 14 reps (was 19), Hard 20 (was 34), Legend 26 (was 63). Their rewards are adjusted to match (Normal ×1.4, Hard ×1.9, Legend ×2.5), and bosses still attack faster on harder levels. Monthly boss daily targets: Normal 14, Hard 18, Legend 24.
- Fairer health grades: fruit, veggies and other whole foods score well even without protein; healthy fats like nuts, salmon, avocado and olive oil aren’t marked down; meal size is judged against your own daily calories; and food words are matched properly (chocolate no longer counts as “cola”, and jelly beans and pepperoni no longer count as healthy). An apple is now an A, almonds an A (was C), jelly beans an F (was B), and sweet drinks like hot chocolate count as sugary.
- The date in the top bar is shorter (Wed, Nov 25) so it doesn’t get cut off.

## v22.9: Potion bag and more gold (Nov 25, 2026)
- Potions don’t auto-use anymore: buying one (or getting one from a login reward or monthly boss) puts it in your bag. A purple Use button sits right next to Buy and shows how many you have (Use ×2). Drink it when you want the boost; using the same potion again adds more days.
- Gold is easier to get. Daily chest: 30–70 plus up to 30 for your streak (was 15–35 plus 20). Login rewards are doubled (20 to 150 gold). Boss gold is about double. Workout reps pay 1 gold per 5 reps, up to 30 a day (was 1 per 10, up to 10). Guided circuits pay 30, a lost boss fight still pays up to 10, and each daily quest you finish now gives 10 gold.

## v22.8: Workouts count as activity (Nov 25, 2026)
- Fixed sound glitching after you leave the app and come back: the sound engine now shuts down cleanly when you leave and starts fresh when you return, and leftover voice counting is cleared.
- Working out now counts as activity on the Friends list: reps, boss fights, circuits, water and weigh-ins all update “active today”, not just food logs.
- Friends still running an older version of PlateScan show an “old app” tag. Their level catches up the next time they open the app.
- No more “What’s new” pop-up after updates. Patch notes are still in Settings → Help → Patch notes.

## v22.7: Live levels, mythic cutscene, sharper tracking (Nov 24, 2026)
- Friends’ levels finally update: after someone earned their first badge, the database rejected every profile update they sent (badges were saved in a format it doesn’t allow), so friends saw old levels forever. Fixed, and level changes now go out instantly, retry if the signal drops, and save when you leave the app.
- Mythic hatch cutscene: hatching a Mythic pet plays a cinematic. The egg glows and cracks under a rush of stars, a white flash opens a rainbow portal, your pet rises as a silhouette, MYTHIC slams in, and the pet is revealed. It has sound and vibration, and you can tap to skip.
- Smarter motion tracking for every workout: a quick body check before counting ignores hands waved at the camera, tracking glitches and skeletons that jump around, and only uses joints that are actually inside the picture.
- Real reps count more reliably: squats, push-ups, lunges, sit-ups, glute bridges, mountain climbers and jumping jacks accept slightly less perfect camera angles. Half reps still don’t count.
- Changing the difficulty, exercise or camera before a fight no longer scrolls you back to the top.
- .5× now also works on the front camera on phones with a wide selfie lens.
- Fixed a crash when previewing a hatch before you own any pets.

## v22.6: Fair levels and boss rewards (Nov 24, 2026)
- Friends’ levels are accurate and live: your level no longer changes when you edit your goal or weight (finished days keep the XP they earned), old boss and bonus XP is never thrown away anymore, and you get a pop-up when a friend levels up.
- Boss replay cap: each boss pays rewards for 5 replays (40%, 30%, 25%, 20%, then 15%). After that it’s practice only, so beat the next boss for full rewards. Practice wins no longer count toward boss totals, eggs or unlocks.
- Boss XP is about 20% lower across regular, event and monthly bosses.
- Monthly boss: you can’t join a party that already beat the boss, an invite from last month, or a party when you already beat this month’s boss. Those invites are cleared automatically, and you can’t send invites after your boss is defeated.
- Safety fix: if your data fails to load (bad signal), the app now retries and won’t save anything until it loads, so it can never overwrite your progress or show friends a blank profile.
- Database rules: parties that beat the boss can’t take new members or invites. Publish the rules again.

## v22.5: Easy weight-loss goals (Nov 24, 2026)
- Setting a weight-loss goal is easy now: Settings → Goal has Lose weight, Maintain and Gain weight buttons, so you just type how many pounds. No minus sign needed (the iPhone keypad doesn’t have one).
- Weight changes show a plus or minus sign, like “▼ −5.0 lb” on your weight chart.

## v22.4: Cheat-proof pull-ups (Nov 24, 2026)
- Pull-ups can’t be cheated: lowering your hands to your shoulders, pushing up with your legs while your feet are on the floor, or jumping to the bar doesn’t count. It plays the miss sound and tells you why.
- More real reps count: it no longer needs a perfect dead hang between reps, handles fast and explosive reps, works close to or far from the camera, and doesn’t play a false “pull higher” right after a good rep.

## v22.3: Pull-ups that actually count (Nov 24, 2026)
- Pull-ups rebuilt: the counter now watches how far your shoulders rise toward your hands on the bar, so it works from behind, from far away and with .5× zoom. It no longer resets at the top when your shoulders reach the bar, and it still counts if your hands briefly drop out of view at the top. Half reps still don’t count.

## v22.2: Pull-ups from behind (Nov 24, 2026)
- Pull-ups now count with your back to the camera too. Turn around so the camera sees your back, hands and shoulders; it checks that your head clears the bar and your arms bend, the same as facing it.

## v22.1: Party invite fix (Nov 24, 2026)
- The quote of the day is back on Today. Your pet’s message now shows under it instead of replacing it.
- Your avatar in the top bar is centered again, and its red notification dot is no longer cut off.
- Fixed party invites for the monthly boss: inviting a friend you already invited, or after your saved party went away, no longer fails. It clears the old invite or starts a fresh party automatically.
- Database rules: invites can now be refreshed by the person who sent them. Publish the rules again.

## v22: Your own 3D gym, avatars everywhere and a better plank (Nov 24, 2026)
- Your own 3D gym: a new Gym tab in the menu. Place equipment and wall decor, pick floors, walls and lighting, and name your gym. Your avatar and pet hang out in it.
- Gym shop: 15 pieces of equipment, 9 wall decorations, 6 floors, 6 wall styles and 4 lighting moods. Most cost gold; some unlock from daily quests, levels and bosses, and each month’s boss gives a holiday decoration you can only get that month.
- Visit friends’ gyms from the Gym tab or their profile and leave a like. You get a heads-up when someone likes yours, and gyms earn up to 5 stars as they fill up.
- Your avatar now shows everywhere friends see you: leaderboards, friend requests, duels, activity, the top bar and your account. Friends without a custom avatar get their own starter look instead of a shared hero.
- Plank fix: lying flat on the floor no longer counts. You need to be up on your elbows or hands with your hips off the floor.
- Non-critical hits now play a bright two-note “counted!” chime, so every good rep sounds like it landed. Critical hits keep the big sound.
- Live workouts look smoother and more accurate: 15 frames a second instead of 10, finer body positions, the right camera shape, steady playback that smooths out network hiccups, and hidden body points hold still instead of jumping.
- .5× camera zoom in workouts on phones with an ultra-wide lens (back camera), so your whole body fits. Your choice is remembered.
- Sound in screen recordings: game sounds and voice counting now play even with the silent switch on, so phone screen recordings capture them. Turn it off in Settings → Alerts if you’d rather keep music from other apps playing.
- Forgot your email? The sign-in screen now shows the email last used on your phone and tips to find it. Forgot password emails now say where they went.
- After the tour, adding to your Home Screen and turning on notifications are now two quick pop-ups, one at a time, instead of a list.
- Tidier screens: Fill your bars and the suggestion box fold up with a tap (they remember how you left them), and admin sections fold too.
- Fixes: every pop-up page (privacy, report, delete account, message actions) now has a proper header so the × is always reachable on iPhone, Esc closes the top page on a keyboard, the date in the top bar no longer wraps, and egg rewards no longer pop up on the sign-in screen.

## v21: Safety, weekly recap 2.0 and a faster app (Nov 23, 2026)
- Block and report: from a friend’s profile, a group message (tap it) or a live workout. Blocked people can’t friend, nudge, duel, invite or cheer you, and their messages are hidden.
- Download all your data or permanently delete your account in Settings → Account.
- A plain-language privacy notice, and new accounts confirm they’re 13 or older.
- Weekly recap 2.0: a shareable card with your hero and pet, reps, workout days, average meal grade, ▲▼ versus last week and your top wins.
- Faster: smoother tab switching (up to 2x quicker on older phones), quicker number formatting, and the app now opens instantly from cache and updates in the background.
- Starts faster on slow connections: the app’s Firebase files begin downloading right away instead of waiting.

## v20: Live workouts, health scores and smart reminders (Nov 23, 2026)
- Live workouts: friends can watch your hero move as you work out (never your real camera) and send emoji cheers. Cheers give +5% damage for 10 seconds, up to +25%.
- A “just went live” alert, a Watch button on Today and Friends, and a push notification for friends.
- Meal health score: every meal gets an A to F grade, a score out of 100, how well it fits your goal and why.
- Meals without a photo now get a food picture based on what’s in them, plus their grade.
- Smart reminders: up to 3 a day, only when needed, for streaks, boss battles, logging and your pet. Choose the kinds in Settings → Reminders.
- After you sign in, a quick “Get the full PlateScan” screen helps you add the app to your Home Screen and turn on notifications.
- The daily login reward now resets at midnight and pops up right away, with a countdown to the next one.
- Referrals now give a Basic Egg to you and your friend, and new Referral badges go from Bronze Recruiter up to Legendary Ambassador.
- Special badges: the PlateScan team can now award one-of-a-kind badges, which show on your profile.
- Tap a friend to see their friend code with a Copy button. Admins also get a Give badge button there.

## v19: Pet eggs and 36 pets (Nov 23, 2026)
- Pet eggs! Hatch Basic, Gym and Golden eggs in the new Pets tab (side menu), with a hatching animation and odds shown on every egg.
- 36 pets in 5 rarities, including 11 gym-themed originals like the Kettlebell Kraken, Barbell Bear, Protein Shake Slime, Gym Gorilla and Protein Phoenix.
- The rarest pet: the Mythic Celestial Swole Dragon, 2% from Golden Eggs only.
- Free eggs: a Basic Egg every 1,000 reps, a Gym Egg every 5 bosses and every 7-day streak, and a Golden Egg for beating the monthly boss. Everyone starts with one free Basic Egg.
- Duplicates raise a pet’s stars (up to ★5) and give 20% of the egg’s gold back. Lucky streak protection guarantees better pets after enough misses.
- Collection book with silhouettes of pets you haven’t found yet.
- Pet gear (bandana, sweatband, shades, cap, gold chain, medal, cape, tiny crown, halo) and 9 pet habitats from Sunny park to Mount Olympus.
- More to work for: Neon tracksuit, Beastmaster armor, a Shoulder dragon, 5 new hero backgrounds (Neon gym, Volcano forge, Aurora peaks, Beast sanctuary, Hall of Fame), new banners and collector titles.
- Fixed: your hero, pet, hearts, monthly boss, profile and sharing choices now save to your account, so they stay after you reload or switch devices.

## v18: Holiday bosses, live leaderboard and Fill your bars (Nov 23, 2026)
- Monthly bosses are now themed on each month’s biggest holiday (Halloween, Thanksgiving, Christmas and more).
- Monthly boss health is one big total. Beat it however you like; the daily reps are just a recommended pace. A pace bar shows if you’re ahead or behind.
- Hearts: the boss only attacks overnight if you fall more than a full day behind pace, so big catch-up days count. Monthly bosses have more health: about 10, 20, 30 or 40 reps a day by difficulty.
- The friends leaderboard now updates live, and you get a heads-up when a friend passes you.
- Choose what friends can see (Locker → Profile): workouts, monthly boss, water, food as % of goals, weight progress and your goal. Tap a friend to see their progress.
- New Fill your bars card on Today: food suggestions that fit what’s left of your calories and macros, a one-tap combo to finish the day, and ✨ AI meal ideas with your free key.
- Party members on the monthly boss now show their total reps for the month.

## v17: Side menu, Locker and reminders on the web (Nov 23, 2026)
- New side menu: tap ☰ or swipe from the left edge. On computers and iPads it stays on the left and can be collapsed to icons. Scan stays in the middle at the bottom.
- New Locker tab: hero, pet, profile, frames and themes in one place, with a card that shows how friends see you.
- Reminders now work from the website: turn on notifications in your browser on a computer or Android, or add Calendar reminders (meals, workout, water, weigh-in) on any device, including iPhone Safari.
- Reminders go to every device you turn them on for, not just the last one.
- New fitness gear: race singlet, compression gear, martial arts gi, champion robe, coach whistle, gym towel, gold medal and a title belt.
- New hero backgrounds: running track, lap pool, veggie garden, mountain trail, court, yoga sunrise, stadium lights and champion podium.
- 12 new profile banners (Heartbeat, Hydrate, Fresh greens, Iron, Summit and more), 4 new avatar frames and 4 new app themes.
- Some of the best items unlock with workouts, levels, streaks and boss wins, not just gold.

## v16: Monthly boss, heroes and pets (Nov 23, 2026)
- Bosses now fight back on a timer, even while you rep. When it starts charging (the boss glows and a ⚡ bar appears), do 3 quick reps in 6 seconds, or hold your plank or wall sit, to block. Miss it and you take a hit. Easy every 60s, Normal 45s, Hard 35s, Legend 28s.
- Fixed: your hero now fills its circle on wider screens (computers and iPads) instead of showing up small in the corner.
- Animated demo for every exercise: watch the move and see exactly where to put your phone (side or front, 6–8 ft / 2 m back).
- Monthly boss with a whole month of health: pick 5, 10, 15 or 20 reps a day. Miss your reps and it attacks, costing a heart. Invite friends to a party for more HP and +50% rewards.
- Hearts: 5 max. Get them back every 45 minutes, by finishing quests, or in the Shop.
- Your hero: customize skin, hair, outfits, gear and backgrounds, with luxury items that shimmer. Your hero gets more muscular and leaner as you make progress.
- Pets that are happy when you eat well, drink water and finish quests, and sad when you don’t. Treats keep them happy.
- Profiles: motto, title, favorite exercise and banners. Friends see your hero, pet and motto.
- Notification box (bell): friend requests, duel challenges and party invites, plus friend codes. Push notifications are optional when you send.
- Badges for boss wins on each difficulty. Harder difficulties now give bosses more HP.
- Portions: S/M/L/XL, exact amounts in g, oz, cups or tbsp, and AI portion suggestions.
- Scanner: more accurate, smaller and faster, and runs the AI estimate automatically if you’ve added your key.
- Search millions of foods online, plus about 150 more cheeses, nuts, brand and fast foods.
- Water: bottle sizes, oz or ml, and a recommended goal.
- Daily motivation quotes from athletes and artists.
- Workout directions and camera tips for every move.
- Gold rewards are lower and shop prices are higher, so the best items take time to earn. Invited friends get gold but no XP.
- In-app Guide (Settings → Help). Double-tap no longer zooms.

## v15: Friend streaks and mutual friends (Nov 23, 2026)
- Workout streaks with each friend: a day counts when you both do 10+ good reps (any workout, boss fight, duel or circuit).
- 🔥 streak counts next to friends, with ⏳ when a streak is about to end.
- Streak card on each friend’s profile showing who has worked out today.
- Milestone rewards at 3, 7, 14, 30, 50, 100 and 365 days (up to 250 gold) and posts in the activity feed.
- Today shows a reminder when a friend streak ends tonight; reminders also send a 7 PM notification.
- Mutual friends on every friend’s profile, plus People you may know (friends of friends) with friend requests.
- Full patch notes are now in Settings → Help → Patch notes.

## v14: Duels, home workouts, invites (Nov 23, 2026)
- Duels: bet 25–250 gold on a 60-second rep battle with a friend. Winner takes all.
- 5 guided no-equipment circuits: Quick 7, Leg day, Core crusher, Upper body, Cardio burner.
- New exercises: burpees, high knees, mountain climbers, glute bridges and wall sits, each with badges.
- Invite your people: Messages, WhatsApp, share sheet, contacts (Android) or a phone number.
- 43 more foods.
- Nudge each friend once an hour and earn 5 XP per nudge (up to 25 a day).
- Pop-ups stop for good after two “Not now”s; the daily reward opens once a day.
- Fixed: a finished duel could pay out twice.

## v13: Daily rewards and cleaner tabs (Nov 22, 2026)
- Daily login reward with a 7-day calendar; day 7 adds an XP potion.
- Quest tab split into Bosses, Badges, Shop and Quests; Friends split into Challenge, Friends, Duels and Groups.
- Friendly pop-ups to add PlateScan to your Home Screen and turn on reminders.

## v12: Team fights and badges (Nov 22, 2026)
- Team boss fights with your group, live scoreboards and a 25% team bonus.
- Exercise badges from Bronze to Mythic; show 3 on your avatar.
- Lunges, sit-ups, jumping jacks and plank holds, with reps counted out loud.
- Monthly event boss with an exclusive badge.
- Style shop: avatar frames and app themes.
- AI portion estimates from photos, recipes, weekly meal planner with grocery list.
- Private progress photos, personal insights, CSV and PDF export.
- Friends activity feed with high-fives; meal, water and weigh-in reminders.
- Owner dashboard and a new app icon.

## v11: Navigation, suggestions, referrals (Nov 22, 2026)
- Quick actions on Today and a Help tab in settings.
- Suggestion box with a private inbox for the owner.
- Referral rewards: 250 gold + 300 XP for both people.
- 112 new foods, meal search and copy-yesterday.
- Levels rebalanced to take more XP.
- Offline and new-version banners.

## v10: Progress redesign (Nov 22, 2026)
- Progress tab with Food log, Trends and Body, a week strip, calendar and swipe between days.
- Meals grouped by Breakfast, Lunch, Dinner and Snack.
- Forms accept “185 lb”, 5'11", centimeters, commas and more.

## v9: Boss battles and friends (Nov 22, 2026)
- Boss battles with camera-checked reps, difficulties, gold and a shop.
- New fitness ranks with emblems.
- Friends, group chats, a fair weekly challenge and nudges.
- Works offline and loads faster; install guide in settings.

## v1–8: The beginning (Nov 2026)
- Photo food scanning, calorie and macro targets, accounts and sync.
- Food log, stats, XP and levels, dark mode and animations.
- Streak reminders, Home Screen widget, onboarding tour.
- Barcode scanning, fast food and drinks, meal editing.
- AI coach with human avatars, sounds and effects.
