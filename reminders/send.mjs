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
  if (!r.sub || !r.sub.endpoint) { skipped++; continue; }
  const { today, yest, hour } = localNow(r.tz || 'America/Phoenix');
  const st = u.status || {};
  if (hour < (r.hour ?? 19) || r.lastSent === today || st.lastLogDay === today) { skipped++; continue; }
  const streak = st.lastLogDay === yest ? (st.streak || 0) : 0;
  const payload = streak > 0
    ? { title: `Keep your ${streak}-day streak going`, body: 'Log a meal in PlateScan before midnight to keep it alive.' }
    : { title: 'Time to log today’s meals', body: 'Snap a meal in PlateScan to start a new streak.' };
  try {
    await webpush.sendNotification(r.sub, JSON.stringify({ ...payload, url: r.url || './' }), { TTL: 3600 });
    await doc.ref.update({ 'reminder.lastSent': today });
    sent++;
  } catch (e) {
    console.error(doc.id, e.statusCode, e.body || e.message);
    if (e.statusCode === 404 || e.statusCode === 410) await doc.ref.update({ 'reminder.on': false, 'reminder.sub': null });
  }
}
console.log(`Reminders sent: ${sent}, skipped: ${skipped}`);

// ---- meal, water and weigh-in reminders ----
let extra = 0;
for (const doc of snap.docs) {
  const u = doc.data(), r = u.reminder || {}, m = r.more;
  if (!m || !r.sub || !r.sub.endpoint) continue;
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
  if (!msg || sentKeys.includes(key)) continue;
  try {
    await webpush.sendNotification(r.sub, JSON.stringify({ ...msg, url: r.url || './', tag: key }), { TTL: 3600 });
    await doc.ref.update({ 'reminder.sentKeys': [...sentKeys, key].slice(-12) });
    extra++;
  } catch (e) { console.error('extra', doc.id, e.statusCode, e.body || e.message); }
}
console.log(`Meal/water/weigh-in reminders sent: ${extra}`);

// ---- friend workout streak about to end (7 PM local) ----
let fsSent = 0;
const dayBefore = d => { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() - 1); return x.toISOString().slice(0, 10); };
for (const doc of snap.docs) {
  const r = (doc.data().reminder) || {};
  if (!r.sub || !r.sub.endpoint) continue;
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
    await webpush.sendNotification(r.sub, JSON.stringify({ title: `⏳ Your ${best.n}-day streak with ${best.name} ends tonight`, body: 'Do 10+ good reps in PlateScan to keep it alive.', url: (r.url || './') + '#friends', tag: 'fstreak' }), { TTL: 4 * 3600 });
    const fresh = ((await doc.ref.get()).data().reminder || {}).sentKeys || [];
    await doc.ref.update({ 'reminder.sentKeys': [...fresh, key].slice(-12) });
    fsSent++;
  } catch (e) { console.error('fstreak', doc.id, e.statusCode, e.body || e.message); }
}
console.log(`Friend streak alerts: ${fsSent}`);

// ---- friend nudges ----
const nudges = await db.collection('nudges').where('sent', '==', false).limit(500).get();
let nSent = 0;
for (const doc of nudges.docs) {
  const n = doc.data();
  try {
    const to = await db.collection('users').doc(n.to).get();
    const r = (to.exists && to.data().reminder) || {};
    if (r.on && r.sub && r.sub.endpoint && Date.now() - (n.ts || 0) < 864e5) {
      await webpush.sendNotification(r.sub, JSON.stringify({
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
      if (r.on && r.sub && r.sub.endpoint) {
        const msg = side === 'b'
          ? { title: `⚔️ ${d.aName} challenged you to a duel`, body: `${d.stake * 2} gold pot. Beat ${d.aScore} reps in 60 seconds!` }
          : d.status === 'declined' ? { title: 'Duel declined', body: `${d.bName} passed. Your ${d.stake} gold is back.` }
          : { title: d.bScore > d.aScore ? `${d.bName} won the duel` : d.bScore === d.aScore ? 'Duel tied!' : `You won the duel! 🏆`, body: `Final score: you ${d.aScore}, ${d.bName} ${d.bScore}.` };
        await webpush.sendNotification(r.sub, JSON.stringify({ ...msg, url: (r.url || './') + '#friends', tag: 'duel-' + doc.id }), { TTL: 6 * 3600 });
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
    if (r.on && r.sub && r.sub.endpoint) await webpush.sendNotification(r.sub, JSON.stringify({ title: `${q.fromName || 'Someone'} wants to be friends`, body: q.mutual ? `${q.mutual} mutual friend${q.mutual > 1 ? 's' : ''}. Tap to accept in PlateScan.` : 'Tap to accept in PlateScan.', url: (r.url || './') + '#friends', tag: 'req-' + doc.id }), { TTL: 24 * 3600 });
  } catch (e) { console.error('req', doc.id, e.statusCode, e.body || e.message); }
  await doc.ref.update({ ping: false });
}

// ---- monthly boss party invites ----
const pinv = await db.collection('mpInv').where('ping', '==', true).limit(200).get();
for (const doc of pinv.docs) {
  const q = doc.data();
  try {
    const u = await db.collection('users').doc(q.to).get(), r = (u.exists && u.data().reminder) || {};
    if (r.on && r.sub && r.sub.endpoint) await webpush.sendNotification(r.sub, JSON.stringify({ title: `${q.fromName || 'A friend'} invited you to a boss party 🐲`, body: `Team up against ${q.boss} this month. Open PlateScan to join.`, url: (r.url || './') + '#friends', tag: 'party-' + doc.id }), { TTL: 24 * 3600 });
  } catch (e) { console.error('party', doc.id, e.statusCode, e.body || e.message); }
  await doc.ref.update({ ping: false });
}
