// Dashboard-Daten: Leads, Abonnenten, Fit-Check-Funnel, Whitepapers, News.
import { listItems, getItem } from './lib/store.mjs';
import { json, preflight, requireAuth } from './lib/auth.mjs';

export default async (req) => {
  const pf = preflight(req); if (pf) return pf;
  if (!requireAuth(req)) return json({ error: 'auth' }, 401);

  const [leads, subscribers, news, whitepapers, events] = await Promise.all([
    listItems('leads'), listItems('subscribers'), listItems('news'), listItems('whitepapers'), listItems('events'),
  ]);

  const subStats = { confirmed: 0, pending: 0, unsubscribed: 0 };
  subscribers.forEach((s) => { subStats[s.status] = (subStats[s.status] || 0) + 1; });

  const funnel = { start: 0, complete: 0, signup: 0 };
  events.forEach((e) => {
    if (e.event === 'fitcheck_start') funnel.start++;
    else if (e.event === 'fitcheck_complete') funnel.complete++;
    else if (e.event === 'fitcheck_signup') funnel.signup++;
  });
  funnel.completeRate = funnel.start ? Math.round((funnel.complete / funnel.start) * 100) : 0;
  funnel.signupRate = funnel.complete ? Math.round((funnel.signup / funnel.complete) * 100) : 0;
  funnel.dropoff = Math.max(0, funnel.start - funnel.complete);

  for (const wp of whitepapers) {
    const c = await getItem('counters', 'dl:' + wp.id);
    wp.downloads = c ? c.value : 0;
  }

  return json({
    totals: { leads: leads.length, subscribers: subscribers.length, news: news.length, whitepapers: whitepapers.length },
    leads: leads.sort((a, b) => b.created - a.created),
    subscriberStats: subStats,
    subscribers: subscribers.map((s) => ({ email: s.email, status: s.status, created: s.created || 0 })).sort((a, b) => b.created - a.created),
    funnel,
    whitepapers: whitepapers.sort((a, b) => (b.created || 0) - (a.created || 0)),
    news: news.sort((a, b) => (b.created || 0) - (a.created || 0)),
  });
};
