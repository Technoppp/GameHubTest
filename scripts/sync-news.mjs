import crypto from 'node:crypto';

const FEED_SOURCES = [
  {
    name: 'PC Gamer',
    url: 'https://www.pcgamer.com/rss/',
    defaultCategory: 'Gaming News',
  },
  {
    name: 'GamesRadar',
    url: 'https://www.gamesradar.com/feeds/articletype/news/',
    defaultCategory: 'Gaming News',
  },
  {
    name: 'VGC',
    url: 'https://www.videogameschronicle.com/feed/',
    defaultCategory: 'Gaming News',
  },
];

const GAME_RULES = [
  { title: 'Valorant', keywords: ['valorant'], category: 'Esports' },
  { title: "PUBG: PlayerUnknown's Battlegrounds", keywords: ['pubg', 'battlegrounds'], category: 'Esports' },
  { title: 'Counter-Strike 2', keywords: ['counter-strike 2', 'counter strike 2', 'cs2'], category: 'Esports' },
  { title: "Tom Clancy's Rainbow Six Siege X", keywords: ['rainbow six', 'siege x', 'r6 siege'], category: 'Esports' },
  { title: 'Apex Legends', keywords: ['apex legends'], category: 'Esports' },
  { title: 'Call of Duty: Warzone', keywords: ['warzone', 'call of duty'], category: 'Esports' },
  { title: 'ROV (Arena of Valor)', keywords: ['arena of valor', 'rov'], category: 'Esports' },
  { title: 'Mobile Legends: Bang Bang', keywords: ['mobile legends', 'mlbb'], category: 'Esports' },
  { title: 'Dota 2', keywords: ['dota 2'], category: 'Esports' },
  { title: 'League of Legends', keywords: ['league of legends', 'lol esports'], category: 'Esports' },
  { title: 'EA Sports FC 26', keywords: ['ea sports fc', 'fc 26', 'fifa'], category: 'Sports' },
  { title: 'NBA 2K26', keywords: ['nba 2k26', 'nba 2k'], category: 'Sports' },
  { title: 'WWE 2K26', keywords: ['wwe 2k26', 'wwe 2k'], category: 'Sports' },
  { title: 'Madden NFL 26', keywords: ['madden nfl', 'madden 26'], category: 'Sports' },
  { title: 'F1 25', keywords: ['f1 25', 'formula 1'], category: 'Sports' },
  { title: 'Football Manager 2026', keywords: ['football manager'], category: 'Sports' },
  { title: 'Overcooked! All You Can Eat', keywords: ['overcooked'], category: 'Party' },
  { title: 'Gang Beasts', keywords: ['gang beasts'], category: 'Party' },
  { title: 'Among Us', keywords: ['among us'], category: 'Party' },
  { title: 'Mario Party Superstars', keywords: ['mario party'], category: 'Party' },
  { title: 'The Witcher 3: Wild Hunt', keywords: ['witcher 3', 'the witcher'], category: 'RPG' },
  { title: 'Cyberpunk 2077', keywords: ['cyberpunk 2077', 'cyberpunk'], category: 'RPG' },
  { title: 'Elden Ring', keywords: ['elden ring'], category: 'RPG' },
  { title: 'Final Fantasy XV', keywords: ['final fantasy xv', 'final fantasy 15'], category: 'RPG' },
  { title: 'Civilization VI', keywords: ['civilization vi', 'civilization 6', 'civ 6'], category: 'Strategy' },
  { title: 'Age of Empires IV', keywords: ['age of empires iv', 'age of empires 4'], category: 'Strategy' },
  { title: 'StarCraft II', keywords: ['starcraft ii', 'starcraft 2'], category: 'Strategy' },
  { title: 'Clash of Clans', keywords: ['clash of clans'], category: 'Strategy' },
];

const MAX_ITEMS_PER_FEED = 8;
const MAX_STORED_ITEMS = 18;
const LOOKBACK_DAYS = 7;

function decodeHtml(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(value = '') {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function summarize(text, maxLength = 220) {
  if (!text) return '';
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 3).trim()}...`;
}

function extractFirst(block, tagNames) {
  for (const tagName of tagNames) {
    const escaped = tagName.replace(':', '\\:');
    const match = block.match(new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, 'i'));
    if (match?.[1]) return match[1].trim();
  }
  return '';
}

function extractAttr(block, tagName, attrName) {
  const escaped = tagName.replace(':', '\\:');
  const match = block.match(new RegExp(`<${escaped}[^>]*\\s${attrName}="([^"]+)"[^>]*\\/?>`, 'i'));
  return match?.[1]?.trim() || '';
}

function extractBlocks(xml, tagName) {
  const escaped = tagName.replace(':', '\\:');
  return [...xml.matchAll(new RegExp(`<${escaped}\\b[\\s\\S]*?<\\/${escaped}>`, 'gi'))].map((match) => match[0]);
}

function extractImage(block) {
  return (
    extractAttr(block, 'media:content', 'url') ||
    extractAttr(block, 'media:thumbnail', 'url') ||
    extractAttr(block, 'enclosure', 'url') ||
    ''
  );
}

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseFeedItems(xml, source) {
  const rssItems = extractBlocks(xml, 'item').map((block) => ({
    title: stripHtml(extractFirst(block, ['title'])),
    link: stripHtml(extractFirst(block, ['link'])),
    description: stripHtml(extractFirst(block, ['description', 'content:encoded', 'content'])),
    content: stripHtml(extractFirst(block, ['content:encoded', 'content', 'description'])),
    pubDate: extractFirst(block, ['pubDate', 'dc:date', 'published', 'updated']),
    imageUrl: extractImage(block),
    source: source.name,
    sourceUrl: source.url,
    defaultCategory: source.defaultCategory,
  }));

  const atomEntries = extractBlocks(xml, 'entry').map((block) => ({
    title: stripHtml(extractFirst(block, ['title'])),
    link: extractAttr(block, 'link', 'href') || stripHtml(extractFirst(block, ['link'])),
    description: stripHtml(extractFirst(block, ['summary', 'content'])),
    content: stripHtml(extractFirst(block, ['content', 'summary'])),
    pubDate: extractFirst(block, ['updated', 'published']),
    imageUrl: extractImage(block),
    source: source.name,
    sourceUrl: source.url,
    defaultCategory: source.defaultCategory,
  }));

  return [...rssItems, ...atomEntries]
    .filter((item) => item.title && item.link)
    .slice(0, MAX_ITEMS_PER_FEED);
}

function detectGame(item) {
  const haystack = `${item.title} ${item.description} ${item.content}`.toLowerCase();
  return GAME_RULES.find((rule) => rule.keywords.some((keyword) => haystack.includes(keyword)));
}

function makeDocId(item) {
  return crypto
    .createHash('sha1')
    .update(item.link || item.title)
    .digest('hex')
    .slice(0, 24);
}

async function loadAdmin() {
  const { initializeApp, cert, getApps } = await import('firebase-admin/app');
  const { getFirestore, Timestamp } = await import('firebase-admin/firestore');

  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!rawServiceAccount) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON secret.');
  }

  const serviceAccount = JSON.parse(rawServiceAccount);
  if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is missing required service account fields.');
  }

  const normalizedServiceAccount = {
    ...serviceAccount,
    private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
  };

  const app = getApps()[0] || initializeApp({ credential: cert(normalizedServiceAccount) });
  return { db: getFirestore(app), Timestamp };
}

async function fetchFeed(source) {
  const response = await fetch(source.url, {
    headers: {
      'user-agent': 'GameHubNewsBot/1.0 (+https://github.com/Technoppp/GameHubTest)',
      accept: 'application/rss+xml, application/xml, text/xml, application/atom+xml, text/plain;q=0.9, */*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.name}: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  return parseFeedItems(xml, source);
}

async function loadRecentNewsIndex(db) {
  const snapshot = await db.collection('news').orderBy('publishedAt', 'desc').limit(200).get();
  const seenLinks = new Set();
  const seenTitles = new Set();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.sourceUrl) seenLinks.add(String(data.sourceUrl).trim().toLowerCase());
    if (data.title) seenTitles.add(String(data.title).trim().toLowerCase());
  }

  return { seenLinks, seenTitles };
}

async function storeItems(db, Timestamp, items) {
  const existing = await loadRecentNewsIndex(db);
  const cutoff = Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
  const uniqueItems = [];

  for (const item of items) {
    const linkKey = item.link.trim().toLowerCase();
    const titleKey = item.title.trim().toLowerCase();
    const publishedDate = parseDate(item.pubDate);

    if (!publishedDate || publishedDate.getTime() < cutoff) continue;
    if (existing.seenLinks.has(linkKey) || existing.seenTitles.has(titleKey)) continue;

    existing.seenLinks.add(linkKey);
    existing.seenTitles.add(titleKey);
    uniqueItems.push(item);
  }

  const limitedItems = uniqueItems
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, MAX_STORED_ITEMS);

  for (const item of limitedItems) {
    const gameMatch = detectGame(item);
    const publishedDate = parseDate(item.pubDate) || new Date();
    const description = item.description || item.content;
    const payload = {
      title: item.title,
      summary: summarize(description),
      content: summarize(item.content || description, 500),
      imageUrl: item.imageUrl || '',
      sourceUrl: item.link,
      publishedAt: Timestamp.fromDate(publishedDate),
      game: gameMatch?.title || '',
      category: gameMatch?.category || item.defaultCategory || 'Gaming News',
      sourceName: item.source,
      autoImported: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await db.collection('news').doc(makeDocId(item)).set(payload, { merge: true });
  }

  return limitedItems.length;
}

async function main() {
  const { db, Timestamp } = await loadAdmin();
  const feedResults = await Promise.allSettled(FEED_SOURCES.map((source) => fetchFeed(source)));

  const allItems = [];
  for (let index = 0; index < feedResults.length; index += 1) {
    const result = feedResults[index];
    const source = FEED_SOURCES[index];

    if (result.status === 'fulfilled') {
      console.log(`Fetched ${result.value.length} items from ${source.name}`);
      allItems.push(...result.value);
    } else {
      console.error(`Feed failed: ${source.name}`);
      console.error(result.reason);
    }
  }

  if (allItems.length === 0) {
    throw new Error('No feed items were fetched from any source.');
  }

  const storedCount = await storeItems(db, Timestamp, allItems);
  console.log(`Stored ${storedCount} new articles in Firestore.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
