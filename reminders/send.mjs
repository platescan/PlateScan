// Runs every hour on GitHub Actions. Sends a streak reminder to each user who:
//  - turned reminders on, and it's at or past their chosen hour (in their time zone)
//  - hasn't logged a meal today, and hasn't already been reminded today
import admin from 'firebase-admin';
import webpush from 'web-push';

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
if (!sa.project_id) { console.log('FIREBASE_SERVICE_ACCOUNT secret is missing. Skipping.'); process.exit(0); }
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();
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
