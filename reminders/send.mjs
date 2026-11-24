// Runs every 15 minutes on GitHub Actions.
// 1) Delivers friend nudges (a push to the friend who was nudged).
// 2) Sends a streak reminder to each user who:
//  - turned reminders on, and it's at or past their chosen hour (in their time zone)
//  - hasn't logged a meal today, and hasn't already been reminded today
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import webpush from 'web-push';

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
if (!sa.project_id) { console.log('FIREBASE_SERVICE_ACCOUNT secret is missing. Skipping.'); process.exit(0); }
initializeApp({ credential: cert(sa) });
const db = getFirestore();
webpush.setVapidDetails('mailto:' + (process.env.CONTACT_EMAIL || 'reminders@platescan.app'), process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);


// Each device (phone app, computer browser, etc.) has its own push subscription.
// reminder.subs holds all of them; reminder.sub is the older single-device field.
const subsOf = r => { const a = Array.isArray(r.subs) ? r.subs.filter(x => x && x.endpoint) : []; if (r.sub && r.sub.endpoint && !a.some(x => x.endpoint === r.sub.endpoint)) a.push(r.sub); return a; };
const hasSub = r => subsOf(r).length > 0;
async function pushAll(r, body, opts, ref) {
  let ok = 0; const dead = [];
  for (const s of subsOf(r)) {
    try { await webpush.sendNotification(s, body, opts); ok++; }
    catch (e) { console.error('push', e.statusCode, e.body || e.message); if (e.statusCode === 404 || e.statusCode === 410) dead.push(s.endpoint); }
  }
  if (dead.length && ref) {
    const left = subsOf(r).filter(x => !dead.includes(x.endpoint));
    await ref.update({ 'reminder.subs': left, 'reminder.sub': left[0] || null, ...(left.length ? {} : { 'reminder.on': false }) }).catch(() => {});
  }
  if (!ok) { const err = new Error('no device accepted the push'); err.statusCode = dead.length ? 410 : 0; throw err; }
  return ok;
}

function localNow(tz) {
  let p;
  try { p = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()); }
  catch (_) { return localNow('America/Phoenix'); }
  const o = Object.fromEntries(p.map(x => [x.type, x.value]));
  const today = `${o.year}-${o.month}-${o.day}`;
  const yest = new Date(Date.UTC(+o.year, +o.month - 1, +o.day - 1)).toISOString().slice(0, 10);
  return { today, yest, hour: +o.hour };
}

const snap = await db.collection('users').where('reminder.on', '==', true).get();
let sent = 0, skipped = 0;
for (const doc of snap.docs) {
  const u = doc.data(), r = u.reminder || {};
  if (!hasSub(r)) { skipped++; continue; }
  const { today, yest, hour } = localNow(r.tz || 'America/Phoenix');
  const st = u.status || {};
  if (hour < (r.hour ?? 19) || r.lastSent === today || st.lastLogDay === today) { skipped++; continue; }
  const streak = st.lastLogDay === yest ? (st.streak || 0) : 0;
  const payload = streak > 0
    ? { title: `Keep your ${streak}-day streak going`, body: 'Log a meal in PlateScan before midnight to keep it alive.' }
    : { title: 'Time to log today’s meals', body: 'Snap a meal in PlateScan to start a new streak.' };
  try {
    await pushAll(r, JSON.stringify({ ...payload, url: r.url || './' }), { TTL: 3600 }, doc.ref);
    await doc.ref.update({ 'reminder.lastSent': today });
    sent++;
  } catch (e) {
    console.error(doc.id, e.statusCode, e.body || e.message);
  }
}
console.log(`Reminders sent: ${sent}, skipped: ${skipped}`);

const yestOf = d => { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() - 1); return x.toISOString().slice(0, 10); };
// ---- meal, water, weigh-in and pet reminders ----
let extra = 0;
for (const doc of snap.docs) {
  const u = doc.data(), r = u.reminder || {}, m = r.more || {};
  if (!hasSub(r)) continue;
  const { today, hour } = localNow(r.tz || 'America/Phoenix');
  const dow = new Date(today + 'T12:00:00Z').getUTCDay();
  const st = u.status || {}, isToday = st.day === today, sentKeys = r.sentKeys || [];
  let msg = null, key = null;
  if (m.meals && m.meals.on) {
    for (const [type, h] of [['Breakfast', m.meals.b ?? 8], ['Lunch', m.meals.l ?? 12], ['Dinner', m.meals.d ?? 18]]) {
      if (hour === h && !(isToday && (st.types || []).includes(type))) { key = `${today}-${type}`; msg = { title: `${type} time 🍽️`, body: `Snap your ${type.toLowerCase()} in PlateScan to stay on track.` }; break; }
    }
  }
  if (!msg && m.water && m.water.on && [11, 14, 17].includes(hour)) {
    const goal = st.waterGoal || 8, had = isToday ? (st.water || 0) : 0, expected = Math.round(goal * (hour - 8) / 12);
    if (had < expected) { key = `${today}-water-${hour}`; msg = { title: 'Water check 💧', body: `You've had ${had} of ${goal} glasses today. Grab a glass and tap + Water.` }; }
  }
  if (!msg && m.weigh && m.weigh.on && dow === (m.weigh.dow ?? 1) && hour === 8) {
    const last = st.lastWeigh ? new Date(st.lastWeigh + 'T12:00:00Z') : null, days = last ? (new Date(today + 'T12:00:00Z') - last) / 864e5 : 99;
    if (days >= 6) { key = `${today}-weigh`; msg = { title: 'Weekly weigh-in ⚖️', body: 'Step on the scale and log it in PlateScan to keep your trend accurate.' }; }
  }
  // smart reminders: up to 3 a day (noon, 4 PM, 8 PM), only when something needs attention
  let extraKey = null;
  const sm = m.smart || {}, smartOn = sm.on !== false && !(m.pet && m.pet.on === false && !m.smart);
  if (!msg && smartOn && [12, 16, 20].includes(hour) && !sentKeys.includes(`${today}-smart-${hour}`)) {
    const cats = Object.assign({ pet: true, log: true, streak: true, battle: true }, sm.cats || {});
    const goal = st.waterGoal || 8, had = isToday ? (st.water || 0) : 0, reps = isToday ? (st.reps || 0) : 0;
    const nMeals = isToday ? (st.types || []).length : 0, logged = st.lastLogDay === today, mb = st.mb && st.mb.d === today ? st.mb : null, pet = st.pet;
    const C = [];
    if (cats.streak && hour === 20 && !logged && (st.streak || 0) > 0 && r.lastSent !== today) C.push({ p: 100, title: `🔥 Your ${st.streak}-day streak ends at midnight`, body: 'Log anything, even a snack, to keep it alive.' });
    if (cats.battle && mb && !mb.won) {
      if (hour >= 16 && mb.behind > 0) C.push({ p: hour === 20 ? 90 : 80, title: `⚔️ ${mb.n} attacks tonight`, body: `You're ${mb.behind} reps behind pace. Catch up before midnight to keep your hearts.` });
      else if (hour === 12 && mb.hfull && !mb.mine) C.push({ p: 48, title: 'Your hearts are full ❤️', body: `${mb.n} is waiting. About ${mb.rec} reps today keeps you on pace.` });
    }
    if (cats.log && !(m.meals && m.meals.on)) {
      if (hour === 12 && nMeals === 0) C.push({ p: 70, title: 'Nothing logged yet today 🍽️', body: 'Snap your breakfast or lunch so your bars stay accurate.' });
      if (hour === 16 && nMeals === 1) C.push({ p: 52, title: 'Log your lunch? 📸', body: 'A quick snap keeps your calories and protein on track.' });
      if (hour === 20 && nMeals > 0 && !(st.types || []).includes('Dinner')) C.push({ p: 55, title: 'Dinner time 🍽️', body: 'Log dinner to finish your day strong.' });
    }
    if (cats.pet && pet && pet.n) {
      if (hour <= 16 && had < goal * (hour === 12 ? 0.3 : 0.55)) C.push({ p: 65, title: `${pet.n} is thirsty 💧`, body: `You've had ${had} of ${goal} glasses. Drink one and log it so ${pet.n} perks up.` });
      if (hour >= 16 && reps < 10) C.push({ p: 58, title: `${pet.n} wants to train 🏋️`, body: `Do 10 quick reps or fight a boss to make ${pet.n}'s day.` });
      if ((pet.mood ?? 100) < 40 && pet.d >= yestOf(today)) C.push({ p: 62, title: `${pet.n} is feeling down 🥺`, body: 'Log a meal, drink water or finish a quest to cheer them up.' });
      if ((st.eggs || 0) > 0 && !sentKeys.includes(`egg-${st.eggN || 0}`)) C.push({ p: 45, k2: `egg-${st.eggN || 0}`, title: 'An egg is ready to hatch 🥚', body: `You have ${st.eggs} egg${st.eggs > 1 ? 's' : ''} waiting. Open Pets to see who's inside!` });
    }
    if (C.length) { C.sort((a, b) => b.p - a.p); const c = C[0]; key = `${today}-smart-${hour}`; extraKey = c.k2 || null; msg = { title: c.title, body: c.body }; }
  }
  if (!msg || sentKeys.includes(key)) continue;
  try {
    await pushAll(r, JSON.stringify({ ...msg, url: r.url || './', tag: key }), { TTL: 3600 });
    await doc.ref.update({ 'reminder.sentKeys': [...sentKeys, key, ...(extraKey ? [extraKey] : [])].slice(-16) });
    extra++;
  } catch (e) { console.error('extra', doc.id, e.statusCode, e.body || e.message); }
}
console.log(`Meal/water/weigh-in reminders sent: ${extra}`);

// ---- friend workout streak about to end (7 PM local) ----
let fsSent = 0;
const dayBefore = d => { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() - 1); return x.toISOString().slice(0, 10); };
for (const doc of snap.docs) {
  const r = (doc.data().reminder) || {};
  if (!hasSub(r)) continue;
  const { today, hour } = localNow(r.tz || 'America/Phoenix');
  const key = `${today}-fstreak`;
  if (hour !== 19 || (r.sentKeys || []).includes(key)) continue;
  try {
    const me = await db.collection('profiles').doc(doc.id).get();
    const mine = new Set((me.exists && me.data().wo) || []);
    if (mine.has(today)) continue;
    const fr = await db.collection('friendships').where('members', 'array-contains', doc.id).get();
    let best = null;
    for (const f of fr.docs) {
      const other = f.data().members.find(x => x !== doc.id), p = await db.collection('profiles').doc(other).get();
      if (!p.exists) continue;
      const theirs = new Set(p.data().wo || []);
      let d = dayBefore(today), n = 0;
      while (mine.has(d) && theirs.has(d)) { n++; d = dayBefore(d); }
      if (n >= 2 && (!best || n > best.n)) best = { n, name: p.data().name || 'your friend' };
    }
    if (!best) continue;
    await pushAll(r, JSON.stringify({ title: `⏳ Your ${best.n}-day streak with ${best.name} ends tonight`, body: 'Do 10+ good reps in PlateScan to keep it alive.', url: (r.url || './') + '#friends', tag: 'fstreak' }), { TTL: 4 * 3600 });
    const fresh = ((await doc.ref.get()).data().reminder || {}).sentKeys || [];
    await doc.ref.update({ 'reminder.sentKeys': [...fresh, key].slice(-12) });
    fsSent++;
  } catch (e) { console.error('fstreak', doc.id, e.statusCode, e.body || e.message); }
}
console.log(`Friend streak alerts: ${fsSent}`);

// ---- friend went live ----
const pings = await db.collection('livePings').where('sent', '==', false).limit(200).get();
let lSent = 0;
for (const doc of pings.docs) {
  const pg = doc.data();
  try {
    const lv = await db.collection('lives').doc(pg.from).get(), L = lv.exists ? lv.data() : null;
    const still = L && L.on && Date.now() - (L.ts || 0) < 120000 && Date.now() - (pg.ts || 0) < 20 * 60000;
    if (still) {
      const fr = await db.collection('friendships').where('members', 'array-contains', pg.from).get();
      for (const f of fr.docs) {
        const other = f.data().members.find(x => x !== pg.from);
        const u = await db.collection('users').doc(other).get(), r = (u.exists && u.data().reminder) || {};
        if (!r.on || !hasSub(r)) continue;
        await pushAll(r, JSON.stringify({ title: `🔴 ${(pg.name || 'A friend').slice(0, 30)} is working out live`, body: 'Tap to watch and send some cheers 🔥', url: (r.url || './') + '#live-' + pg.from, tag: 'live-' + pg.from }), { TTL: 1200 }).then(() => lSent++).catch(() => {});
      }
    }
  } catch (e) { console.error('live', doc.id, e.message); }
  await doc.ref.update({ sent: true });
}
console.log(`Live alerts sent: ${lSent}`);

// ---- friend nudges ----
const nudges = await db.collection('nudges').where('sent', '==', false).limit(500).get();
let nSent = 0;
for (const doc of nudges.docs) {
  const n = doc.data();
  try {
    const to = await db.collection('users').doc(n.to).get();
    const r = (to.exists && to.data().reminder) || {};
    if (r.on && hasSub(r) && Date.now() - (n.ts || 0) < 864e5) {
      await pushAll(r, JSON.stringify({
        title: `${(n.fromName || 'A friend').slice(0, 30)} nudged you 👊`,
        body: 'Time to get a workout in! Fight a boss or log your meals in PlateScan.',
        url: (r.url || './') + '#friends', tag: 'nudge'
      }), { TTL: 6 * 3600 });
      nSent++;
    }
  } catch (e) {
    console.error('nudge', doc.id, e.statusCode, e.body || e.message);
  }
  await doc.ref.update({ sent: true });
}
console.log(`Nudges delivered: ${nSent} of ${nudges.size}`);

// ---- duel alerts ----
for (const side of ['a', 'b']) {
  const q = await db.collection('duels').where('ping', '==', side).limit(200).get();
  for (const doc of q.docs) {
    const d = doc.data(), to = side === 'a' ? d.a : d.b;
    try {
      const u = await db.collection('users').doc(to).get(), r = (u.exists && u.data().reminder) || {};
      if (r.on && hasSub(r)) {
        const msg = side === 'b'
          ? { title: `⚔️ ${d.aName} challenged you to a duel`, body: `${d.stake * 2} gold pot. Beat ${d.aScore} reps in 60 seconds!` }
          : d.status === 'declined' ? { title: 'Duel declined', body: `${d.bName} passed. Your ${d.stake} gold is back.` }
          : { title: d.bScore > d.aScore ? `${d.bName} won the duel` : d.bScore === d.aScore ? 'Duel tied!' : `You won the duel! 🏆`, body: `Final score: you ${d.aScore}, ${d.bName} ${d.bScore}.` };
        await pushAll(r, JSON.stringify({ ...msg, url: (r.url || './') + '#friends', tag: 'duel-' + doc.id }), { TTL: 6 * 3600 });
      }
    } catch (e) { console.error('duel', doc.id, e.statusCode, e.body || e.message); }
    await doc.ref.update({ ping: null });
  }
}

// ---- friend requests ----
const reqs = await db.collection('friendReqs').where('ping', '==', true).limit(200).get();
for (const doc of reqs.docs) {
  const q = doc.data();
  try {
    const u = await db.collection('users').doc(q.to).get(), r = (u.exists && u.data().reminder) || {};
    if (r.on && hasSub(r)) await pushAll(r, JSON.stringify({ title: `${q.fromName || 'Someone'} wants to be friends`, body: q.mutual ? `${q.mutual} mutual friend${q.mutual > 1 ? 's' : ''}. Tap to accept in PlateScan.` : 'Tap to accept in PlateScan.', url: (r.url || './') + '#friends', tag: 'req-' + doc.id }), { TTL: 24 * 3600 });
  } catch (e) { console.error('req', doc.id, e.statusCode, e.body || e.message); }
  await doc.ref.update({ ping: false });
}

// ---- monthly boss party invites ----
const pinv = await db.collection('mpInv').where('ping', '==', true).limit(200).get();
for (const doc of pinv.docs) {
  const q = doc.data();
  try {
    const u = await db.collection('users').doc(q.to).get(), r = (u.exists && u.data().reminder) || {};
    if (r.on && hasSub(r)) await pushAll(r, JSON.stringify({ title: `${q.fromName || 'A friend'} invited you to a boss party 🐲`, body: `Team up against ${q.boss} this month. Open PlateScan to join.`, url: (r.url || './') + '#friends', tag: 'party-' + doc.id }), { TTL: 24 * 3600 });
  } catch (e) { console.error('party', doc.id, e.statusCode, e.body || e.message); }
  await doc.ref.update({ ping: false });
}
