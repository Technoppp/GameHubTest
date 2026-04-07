const PANDASCORE_BASE_URL = 'https://api.pandascore.co';
const UPCOMING_LIMIT = 30;
const RUNNING_LIMIT = 15;
const PAST_LIMIT = 20;
const AUTO_SOURCE_TYPE = 'pandascore-match';
const MATCH_STALE_AFTER_MS = 3 * 60 * 60 * 1000;
const COMPLETED_RETENTION_MS = 6 * 60 * 60 * 1000;

const GAME_MAPPINGS = [
  { title: 'Valorant', keywords: ['valorant'] },
  { title: 'Dota 2', keywords: ['dota 2', 'dota2'] },
  { title: 'League of Legends', keywords: ['league of legends', 'lol'] },
  { title: 'Counter-Strike 2', keywords: ['counter-strike', 'cs2', 'csgo'] },
  { title: "Tom Clancy's Rainbow Six Siege X", keywords: ['rainbow six', 'r6 siege', 'r6'] },
];

function formatTournamentDate(value) {
  if (!value) return 'TBA';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBA';

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    hour12: false,
  }).format(date).replace(',', '') + ' UTC';
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function parseDateValue(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getMatchStartTime(match) {
  return parseDateValue(match?.begin_at || match?.scheduled_at);
}

function getMatchReferenceEndTime(match) {
  const explicitEnd = parseDateValue(match?.end_at || match?.end_time);
  if (explicitEnd) return explicitEnd;

  const startAt = getMatchStartTime(match);
  if (!startAt) return null;

  if (match?.status === 'running') {
    return new Date(startAt.getTime() + MATCH_STALE_AFTER_MS);
  }

  if (match?.status === 'finished' || match?.status === 'canceled') {
    return startAt;
  }

  return null;
}

function isPastRetentionWindow(date) {
  return Boolean(date && date.getTime() <= Date.now() - COMPLETED_RETENTION_MS);
}

function shouldKeepCompletedDoc(data) {
  if (data?.status !== 'Completed') return false;
  const completedAt = parseDateValue(data?.endAtRaw || data?.dateRaw);
  return Boolean(completedAt && !isPastRetentionWindow(completedAt));
}

function detectGame(match) {
  const haystack = normalizeText([
    match?.videogame?.name,
    match?.videogame?.slug,
    match?.name,
    match?.league?.name,
    match?.serie?.full_name,
    match?.tournament?.name,
  ].filter(Boolean).join(' '));

  return GAME_MAPPINGS.find((entry) => entry.keywords.some((keyword) => haystack.includes(keyword)))?.title || '';
}

function detectRegion(match) {
  const haystack = normalizeText([
    match?.league?.name,
    match?.league?.slug,
    match?.serie?.full_name,
    match?.tournament?.name,
    match?.name,
  ].filter(Boolean).join(' '));

  if (haystack.includes('thailand')) return 'Thailand';
  if (haystack.includes('southeast asia') || haystack.includes('sea')) return 'Southeast Asia';
  if (haystack.includes('pacific') || haystack.includes('apac') || haystack.includes('asia')) return 'Asia-Pacific';
  if (haystack.includes('europe') || haystack.includes('emea') || haystack.includes('eu ')) return 'Europe';
  if (haystack.includes('north america') || haystack.includes('americas') || haystack.includes('na ')) return 'North America';
  return 'International';
}

function detectStatus(match) {
  const now = Date.now();
  const startAt = getMatchStartTime(match);
  const endAt = parseDateValue(match?.end_at || match?.end_time);

  if (endAt && endAt.getTime() <= now) {
    return 'Completed';
  }

  if (startAt && startAt.getTime() <= now - MATCH_STALE_AFTER_MS) {
    return 'Completed';
  }

  switch (match?.status) {
    case 'running':
      return 'Live Now';
    case 'not_started':
      return 'Upcoming';
    case 'postponed':
      return 'Coming Soon';
    case 'canceled':
      return 'Completed';
    case 'finished':
      return 'Completed';
    default:
      return startAt && startAt.getTime() > now ? 'Upcoming' : 'Completed';
  }
}

function collectStreamCandidates(match) {
  const candidates = [];

  const push = (value) => {
    if (typeof value === 'string' && value.trim()) candidates.push(value.trim());
  };

  push(match?.official_stream_url);
  push(match?.live_url);
  push(match?.english?.raw_url);
  push(match?.english?.embed_url);
  push(match?.russian?.raw_url);
  push(match?.russian?.embed_url);

  if (Array.isArray(match?.streams_list)) {
    for (const item of match.streams_list) {
      push(item?.raw_url);
      push(item?.embed_url);
      push(item?.url);
    }
  } else if (match?.streams_list && typeof match.streams_list === 'object') {
    for (const item of Object.values(match.streams_list)) {
      push(item?.raw_url);
      push(item?.embed_url);
      push(item?.url);
    }
  }

  return candidates;
}

function pickWatchUrl(match) {
  return collectStreamCandidates(match).find((url) => /^https?:\/\//i.test(url)) || '';
}

function buildTournamentName(match, gameTitle) {
  if (match?.name) return match.name;

  const league = match?.league?.name || match?.tournament?.name || gameTitle || 'Esports Match';
  const opponents = Array.isArray(match?.opponents)
    ? match.opponents
        .map((entry) => entry?.opponent?.name)
        .filter(Boolean)
        .join(' vs ')
    : '';

  return opponents ? `${league}: ${opponents}` : league;
}

function buildDescription(match, gameTitle) {
  const normalizedStatus = detectStatus(match);
  const league = match?.league?.name || match?.tournament?.name || gameTitle || 'esports event';
  const serie = match?.serie?.full_name ? ` in ${match.serie.full_name}` : '';
  const opponents = Array.isArray(match?.opponents)
    ? match.opponents
        .map((entry) => entry?.opponent?.name)
        .filter(Boolean)
        .join(' vs ')
    : '';
  const intro = opponents ? `${opponents} in ${league}${serie}.` : `${league}${serie}.`;

  if (normalizedStatus === 'Live Now') {
    return `${intro} Live watch link is synced automatically when PandaScore provides an official stream.`;
  }

  if (normalizedStatus === 'Completed') {
    return `${intro} Completed match imported automatically from PandaScore. This listing stays available for 6 hours after the match ends.`;
  }

  return `${intro} Upcoming pro match imported automatically from PandaScore.`;
}

function buildTournamentPayload(match, Timestamp) {
  const gameTitle = detectGame(match);
  if (!gameTitle) return null;

  const watchUrl = pickWatchUrl(match);
  const scheduledAt = match?.scheduled_at || match?.begin_at || null;
  const referenceEndAt = getMatchReferenceEndTime(match);

  return {
    name: buildTournamentName(match, gameTitle),
    game: gameTitle,
    date: formatTournamentDate(scheduledAt),
    dateRaw: scheduledAt || '',
    endAtRaw: referenceEndAt ? referenceEndAt.toISOString() : '',
    prize: match?.tournament?.prizepool || match?.league?.prizepool || 'TBA',
    type: match?.live_supported ? 'LAN Finals' : 'Online',
    region: detectRegion(match),
    description: buildDescription(match, gameTitle),
    requirements: '',
    maxTeams: 0,
    registered: 0,
    joinable: false,
    status: detectStatus(match),
    watchUrl,
    autoImported: true,
    manualOverride: false,
    sourceName: 'PandaScore',
    sourceType: AUTO_SOURCE_TYPE,
    sourceUrl: `https://api.pandascore.co/matches/${match.id}`,
    externalId: String(match.id),
    updatedAt: Timestamp.now(),
    createdAt: Timestamp.now(),
  };
}

async function loadAdmin() {
  const { initializeApp, cert, getApps } = await import('firebase-admin/app');
  const { getFirestore, Timestamp } = await import('firebase-admin/firestore');

  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!rawServiceAccount) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON secret.');
  }

  const serviceAccount = JSON.parse(rawServiceAccount);
  const normalizedServiceAccount = {
    ...serviceAccount,
    private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
  };

  const app = getApps()[0] || initializeApp({ credential: cert(normalizedServiceAccount) });
  return { db: getFirestore(app), Timestamp };
}

async function fetchJson(path, token) {
  const response = await fetch(`${PANDASCORE_BASE_URL}${path}`, {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
      'user-agent': 'GameHubWatchBot/1.0 (+https://github.com/Technoppp/GameHubTest)',
    },
  });

  if (!response.ok) {
    throw new Error(`PandaScore request failed for ${path}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchMatches(token) {
  const [running, upcoming, past] = await Promise.all([
    fetchJson('/matches/running', token),
    fetchJson('/matches/upcoming', token),
    fetchJson('/matches/past', token),
  ]);

  const recentPast = past
    .filter((match) => !isPastRetentionWindow(getMatchReferenceEndTime(match)))
    .slice(0, PAST_LIMIT);

  return Array.from(new Map([
    ...running.slice(0, RUNNING_LIMIT),
    ...upcoming.slice(0, UPCOMING_LIMIT),
    ...recentPast,
  ].map((match) => [String(match.id), match])).values());
}

async function loadExistingAutoDocs(db) {
  const snapshot = await db.collection('tournaments').where('sourceType', '==', AUTO_SOURCE_TYPE).get();
  const docs = new Map();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.externalId) {
      docs.set(String(data.externalId), { id: doc.id, ...data });
    }
  }

  return docs;
}

async function syncTournaments(db, Timestamp, matches) {
  const existingDocs = await loadExistingAutoDocs(db);
  const liveIds = new Set();

  for (const match of matches) {
    const payload = buildTournamentPayload(match, Timestamp);
    if (!payload) continue;

    const externalId = payload.externalId;
    liveIds.add(externalId);

    const existing = existingDocs.get(externalId);
    if (existing?.manualOverride) {
      console.log(`Skipped manual override for match ${externalId}`);
      continue;
    }

    const docId = existing?.id || `${AUTO_SOURCE_TYPE}-${externalId}`;
    if (existing?.createdAt) {
      delete payload.createdAt;
    }

    await db.collection('tournaments').doc(docId).set(payload, { merge: true });
  }

  for (const [externalId, existing] of existingDocs.entries()) {
    if (existing.manualOverride) continue;
    if (liveIds.has(externalId)) continue;
    if (shouldKeepCompletedDoc(existing)) continue;

    await db.collection('tournaments').doc(existing.id).delete();
  }
}

async function main() {
  const token = process.env.PANDASCORE_API_TOKEN;
  if (!token) {
    throw new Error('Missing PANDASCORE_API_TOKEN secret.');
  }

  const { db, Timestamp } = await loadAdmin();
  const matches = await fetchMatches(token);
  console.log(`Fetched ${matches.length} PandaScore matches.`);
  await syncTournaments(db, Timestamp, matches);
  console.log('Watch-only tournaments synced successfully.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
