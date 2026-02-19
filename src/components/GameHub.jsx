import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Trophy, Calendar, Zap, Gamepad2, Newspaper, Info, Target, Swords, Users, Laugh, Crown, Brain, Car, Shield } from 'lucide-react';

// ─────────────────────────────────────────────
// RAWG API
// ─────────────────────────────────────────────

const RAWG_API_KEY = '2e74ac2b248241ab924856c410254295';

// Maps each game title to its RAWG slug for precise lookups
const RAWG_SLUGS = {
  'Valorant': 'valorant',
  "PUBG: PlayerUnknown's Battlegrounds": 'pubg-battlegrounds',
  'Counter-Strike 2': 'counter-strike-2',
  "Tom Clancy's Rainbow Six Siege X": 'tom-clancys-rainbow-six-siege',
  'Apex Legends': 'apex-legends',
  'Call of Duty: Warzone': 'call-of-duty-warzone',
  'ROV (Arena of Valor)': 'arena-of-valor',
  'Mobile Legends: Bang Bang': 'mobile-legends-bang-bang',
  'Dota 2': 'dota-2',
  'League of Legends': 'league-of-legends',
  'EA Sports FC 26': 'ea-sports-fc-25',
  'NBA 2K26': 'nba-2k25',
  'WWE 2K26': 'wwe-2k24',
  'Madden NFL 26': 'madden-nfl-25',
  'F1 25': 'f1-2024',
  'Football Manager 2026': 'football-manager-2024',
  'Overcooked! All You Can Eat': 'overcooked-all-you-can-eat',
  'Gang Beasts': 'gang-beasts',
  'Among Us': 'among-us',
  'Mario Party Superstars': 'mario-party-superstars',
  'The Witcher 3: Wild Hunt': 'the-witcher-3-wild-hunt',
  'Cyberpunk 2077': 'cyberpunk-2077',
  'Elden Ring': 'elden-ring',
  'Final Fantasy XV': 'final-fantasy-xv',
  'Civilization VI': 'sid-meiers-civilization-vi',
  'Age of Empires IV': 'age-of-empires-iv',
  'StarCraft II': 'starcraft-ii',
  'Clash of Clans': 'clash-of-clans',
};

// Fetches background images for all games from RAWG and returns a title→url map
function useRawgImages() {
  const [images, setImages] = useState({});
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const titles = Object.keys(RAWG_SLUGS);

    const fetchImage = async (title) => {
      const slug = RAWG_SLUGS[title];
      try {
        const res = await fetch(
          `https://api.rawg.io/api/games/${slug}?key=${RAWG_API_KEY}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const url = data.background_image;
        if (url) {
          setImages(prev => ({ ...prev, [title]: url }));
        }
      } catch (_) {}
    };

    // Stagger requests slightly to avoid rate-limiting
    titles.forEach((title, i) => {
      setTimeout(() => fetchImage(title), i * 80);
    });
  }, []);

  return images;
}

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'fps',
    label: 'FPS',
    fullName: 'First-Person Shooter',
    icon: Target,
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.4)',
    description: 'Fast-paced first-person combat across tactical, battle royale, and hero shooter experiences',
    subcategories: ['All', 'Tactical', 'Battle Royale', 'Hero Shooter'],
  },
  {
    id: 'moba',
    label: 'MOBA',
    fullName: 'Multiplayer Online Battle Arena',
    icon: Swords,
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.4)',
    description: 'Team-based strategy games where heroes clash for map control and glory',
    subcategories: ['All', 'Mobile MOBA', 'PC MOBA'],
  },
  {
    id: 'sports',
    label: 'Sports',
    fullName: 'Sports & Racing',
    icon: Crown,
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.4)',
    description: 'Athletic competitions, racing simulations, and sports management titles',
    subcategories: ['All', 'Football', 'Basketball', 'Racing', 'Combat', 'Management'],
  },
  {
    id: 'party',
    label: 'Party',
    fullName: 'Party & Casual',
    icon: Laugh,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.4)',
    description: 'Fun multiplayer games perfect for groups, friends, and family of all skill levels',
    subcategories: ['All', 'Co-op', 'Versus', 'Social'],
  },
  {
    id: 'rpg',
    label: 'RPG',
    fullName: 'Role-Playing Game',
    icon: Shield,
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.4)',
    description: 'Deep story-driven adventures with rich character progression and open worlds',
    subcategories: ['All', 'Action RPG', 'Open World'],
  },
  {
    id: 'strategy',
    label: 'Strategy',
    fullName: 'Strategy & Tactics',
    icon: Brain,
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.4)',
    description: 'Games that demand planning, resource management, and long-term thinking',
    subcategories: ['All', 'RTS', '4X', 'Mobile Strategy'],
  },
];

const GAMES_DATA = [
  // ── FPS ──
  {
    id: 1,
    title: 'Valorant',
    category: 'fps',
    subcategory: 'Tactical',
    image: 'https://media.rawg.io/media/games/b11/b11127b9ee3c3701bd15b9af3286d20e.jpg',
    description: 'A 5v5 character-based tactical shooter where precise gunplay meets unique agent abilities. Every round is a high-stakes test of strategy and skill.',
    releaseDate: '2020-06-02',
    rating: 4.8,
    players: '10 Online (5v5)',
    developer: 'Riot Games',
    publisher: 'Riot Games',
    platforms: ['PC'],
    tags: ['Tactical', 'Free-to-Play', 'Esports'],
    details: 'Valorant combines precise tactical gunplay with hero-based abilities. With a roster of unique Agents drawn from across the globe, players compete in 5v5 matches across diverse maps, each with different tactical possibilities.',
    features: [
      'Unique Agent abilities that complement gunplay',
      'Anti-cheat system (Vanguard) for fair play',
      'Regular seasonal updates with new Agents and maps',
      'Thriving global esports scene',
    ],
  },
  {
    id: 2,
    title: "PUBG: PlayerUnknown's Battlegrounds",
    category: 'fps',
    subcategory: 'Battle Royale',
    image: 'https://media.rawg.io/media/games/736/73619bd336c894d6941d926bfd563946.jpg',
    description: 'The game that defined the battle royale genre. Drop onto a massive island with 99 other players, scavenge for gear, and be the last one standing.',
    releaseDate: '2017-12-20',
    rating: 4.5,
    players: '1–100 Online',
    developer: 'PUBG Studios',
    publisher: 'Krafton',
    platforms: ['PC', 'PS5', 'Xbox Series X', 'Mobile'],
    tags: ['Battle Royale', 'Realistic', 'Squads'],
    details: 'PUBG pioneered the battle royale genre with its intense survival gameplay. Players parachute onto large maps, find weapons and supplies, and fight to be the last player or team alive as the playzone constantly shrinks.',
    features: [
      'Multiple large-scale maps with distinct environments',
      'Realistic ballistics and vehicle mechanics',
      'Solo, duo, and squad modes',
      'Free-to-Play on PC and Mobile',
    ],
  },
  {
    id: 3,
    title: 'Counter-Strike 2',
    category: 'fps',
    subcategory: 'Tactical',
    image: 'https://media.rawg.io/media/games/f87/f87457e8347484033cb34cde6101d08d.jpg',
    description: 'The world\'s most iconic competitive shooter, rebuilt on the Source 2 engine. Buy, defuse, and dominate in the definitive tactical FPS.',
    releaseDate: '2023-09-27',
    rating: 4.7,
    players: '10 Online (5v5)',
    developer: 'Valve',
    publisher: 'Valve',
    platforms: ['PC'],
    tags: ['Tactical', 'Free-to-Play', 'Esports'],
    details: 'Counter-Strike 2 is the largest technical leap in CS history, built on Source 2 engine. Featuring overhauled maps, responsive smokes, and updated audio, CS2 is the definitive competitive FPS experience.',
    features: [
      'Source 2 engine with improved graphics',
      'Volumetric smoke grenades that react to gunfire',
      'Redesigned competitive matchmaking',
      'Massive global esports ecosystem',
    ],
  },
  {
    id: 4,
    title: "Tom Clancy's Rainbow Six Siege X",
    category: 'fps',
    subcategory: 'Tactical',
    image: 'https://media.rawg.io/media/games/2ba/2bac0e87cf45e5b508f227d281c9252a.jpg',
    description: 'Elite operators, destructible environments, and intense 5v5 team play. Every match is a chess game played at bullet speed.',
    releaseDate: '2015-12-01',
    rating: 4.6,
    players: '10 Online (5v5)',
    developer: 'Ubisoft Montreal',
    publisher: 'Ubisoft',
    platforms: ['PC', 'PS5', 'Xbox Series X'],
    tags: ['Tactical', 'Destructible', 'Esports'],
    details: 'Rainbow Six Siege X features 60+ unique operators each with their own gadgets, fully destructible walls and floors, and tactical gameplay that rewards teamwork and communication above all else.',
    features: [
      '60+ unique operators with distinct gadgets',
      'Fully destructible environments',
      'Cross-platform play support',
      'Year-round ranked seasons',
    ],
  },
  {
    id: 5,
    title: 'Apex Legends',
    category: 'fps',
    subcategory: 'Hero Shooter',
    image: 'https://media.rawg.io/media/games/b72/b7233d5d5b1e75e86bb860ccc7aeca85.jpg',
    description: 'A hero-based battle royale where squad synergy and fluid movement define the fight. Drop in, master your Legend, and become champion.',
    releaseDate: '2019-02-04',
    rating: 4.7,
    players: '1–60 Online',
    developer: 'Respawn Entertainment',
    publisher: 'Electronic Arts',
    platforms: ['PC', 'PS5', 'Xbox Series X', 'Mobile'],
    tags: ['Battle Royale', 'Hero Shooter', 'Free-to-Play'],
    details: 'Apex Legends combines the speed and fluidity of Titanfall with hero-based abilities and a polished battle royale format. Each Legend has a unique ultimate, tactical, and passive ability that reshapes squad dynamics.',
    features: [
      'Unique Legends with distinct abilities',
      'Fluid movement system with sliding and climbing',
      'Innovative ping communication system',
      'Regular seasonal content and new Legends',
    ],
  },
  {
    id: 6,
    title: 'Call of Duty: Warzone',
    category: 'fps',
    subcategory: 'Battle Royale',
    image: 'https://media.rawg.io/media/games/4a0/4a0a1316102366260e6f38fd2a9cfdce.jpg',
    description: 'The massive free-to-play Call of Duty battle royale. Drop into Verdansk with 150 players, survive the Gulag, and claim victory.',
    releaseDate: '2020-03-10',
    rating: 4.4,
    players: '1–150 Online',
    developer: 'Infinity Ward / Raven Software',
    publisher: 'Activision',
    platforms: ['PC', 'PS5', 'Xbox Series X'],
    tags: ['Battle Royale', 'Free-to-Play', 'Cross-Play'],
    details: 'Call of Duty: Warzone is a free-to-play battle royale featuring the iconic CoD gunplay across massive maps. The Gulag gives eliminated players a second chance, and constant seasonal updates keep the experience fresh.',
    features: [
      'Gulag second-chance mechanic',
      'Full cross-platform play',
      'Integrated with CoD multiplayer progression',
      'Regular seasonal map and content updates',
    ],
  },

  // ── MOBA ──
  {
    id: 7,
    title: 'ROV (Arena of Valor)',
    category: 'moba',
    subcategory: 'Mobile MOBA',
    image: 'https://media.rawg.io/media/games/f46/f466571d536f2e3ea9e815ad17177501.jpg',
    description: 'The most popular mobile MOBA in Southeast Asia. Battle in real-time 5v5 matches with over 100 heroes across stunning arenas.',
    releaseDate: '2016-09-15',
    rating: 4.5,
    players: '10 Online (5v5)',
    developer: 'TiMi Studio Group',
    publisher: 'Tencent Games',
    platforms: ['Mobile', 'PC'],
    tags: ['Mobile', 'Free-to-Play', 'Esports'],
    details: 'ROV (Realm of Valor) is a 5v5 action MOBA optimized for mobile with a massive hero roster and deep ranked ladder. It dominates esports across Southeast Asia with huge regional tournaments.',
    features: [
      '100+ heroes across multiple classes',
      'Optimized for mobile touchscreen controls',
      'Southeast Asia\'s biggest MOBA esports scene',
      'Regular hero and patch updates',
    ],
  },
  {
    id: 8,
    title: 'Mobile Legends: Bang Bang',
    category: 'moba',
    subcategory: 'Mobile MOBA',
    image: 'https://media.rawg.io/media/games/b7d/b7d3f1715fa0332f39f31e34e6d18187.jpg',
    description: 'The global mobile MOBA phenomenon. Fast-paced 5v5 matches, over 120 heroes, and a thriving competitive scene played by millions worldwide.',
    releaseDate: '2016-07-14',
    rating: 4.4,
    players: '10 Online (5v5)',
    developer: 'Moonton',
    publisher: 'Moonton',
    platforms: ['Mobile'],
    tags: ['Mobile', 'Free-to-Play', 'Esports'],
    details: 'MLBB delivers fast 10–15 minute 5v5 matches on mobile. With 120+ heroes and a massive global playerbase, it\'s one of the most played games in Southeast Asia and beyond.',
    features: [
      '120+ heroes with unique abilities',
      'Fast 10–15 minute match length',
      'Large global esports ecosystem (MPL)',
      'Regular hero releases and balancing',
    ],
  },
  {
    id: 9,
    title: 'Dota 2',
    category: 'moba',
    subcategory: 'PC MOBA',
    image: 'https://media.rawg.io/media/games/6fc/6fcf4cd3b17c288821388e6085bb0fc9.jpg',
    description: 'The deepest MOBA ever made. With 120+ heroes and near-infinite strategic depth, Dota 2 rewards thousands of hours of mastery.',
    releaseDate: '2013-07-09',
    rating: 4.7,
    players: '10 Online (5v5)',
    developer: 'Valve',
    publisher: 'Valve',
    platforms: ['PC'],
    tags: ['PC', 'Free-to-Play', 'High Skill Cap'],
    details: 'Dota 2 is a complex, endlessly deep MOBA with a fully free hero roster and cosmetic-only monetization. Home to The International — the world\'s most prestigious esports tournament with prize pools exceeding $30 million.',
    features: [
      '120+ heroes, all free to play',
      'Cosmetic-only monetization',
      'The International — $30M+ prize pool',
      'Extensive in-game guides and coaching tools',
    ],
  },
  {
    id: 10,
    title: 'League of Legends',
    category: 'moba',
    subcategory: 'PC MOBA',
    image: 'https://media.rawg.io/media/games/78b/78bc81e247fc7e77af700cbd632a9297.jpg',
    description: 'The most played PC game in the world. Master 160+ champions and battle in the iconic 5v5 Summoner\'s Rift with millions of players daily.',
    releaseDate: '2009-10-27',
    rating: 4.6,
    players: '10 Online (5v5)',
    developer: 'Riot Games',
    publisher: 'Riot Games',
    platforms: ['PC'],
    tags: ['PC', 'Free-to-Play', 'Esports'],
    details: 'League of Legends is the world\'s most popular MOBA with over 160 champions and one of the largest esports ecosystems in the world. The World Championship draws tens of millions of viewers annually.',
    features: [
      '160+ champions with regular additions',
      'Ranked ladder with 9 tiers',
      'World Championship with global viewership',
      'Regular seasonal updates and events',
    ],
  },

  // ── SPORTS ──
  {
    id: 11,
    title: 'EA Sports FC 26',
    category: 'sports',
    subcategory: 'Football',
    image: 'https://media.rawg.io/media/games/7a4/7a4b424fb50dd0454db5a1880c28f7e6.jpg',
    description: 'The world\'s #1 football game, reimagined. Experience authentic football with real clubs, players, and leagues across the globe.',
    releaseDate: '2025-09-26',
    rating: 4.5,
    players: '1–22 Online',
    developer: 'EA Vancouver',
    publisher: 'Electronic Arts',
    platforms: ['PC', 'PS5', 'Xbox Series X', 'Switch', 'Mobile'],
    tags: ['Football', 'Simulation', 'Ultimate Team'],
    details: 'EA Sports FC 26 features over 19,000 fully licensed players, 700+ clubs, and 30+ leagues. FC Ultimate Team mode lets you build your dream squad from current stars and legends.',
    features: [
      '19,000+ fully licensed players',
      'FC Ultimate Team card-building mode',
      'Revamped Career and Pro Club modes',
      'HyperMotion V animation technology',
    ],
  },
  {
    id: 12,
    title: 'NBA 2K26',
    category: 'sports',
    subcategory: 'Basketball',
    image: 'https://media.rawg.io/media/games/5bd/5bd244c878c3a18dc9c89a3a580e2d75.jpg',
    description: 'The gold standard in basketball simulation. Play as your favorite NBA stars, build your MyPlayer, and dominate the courts online.',
    releaseDate: '2025-09-05',
    rating: 4.4,
    players: '1–10 Online',
    developer: 'Visual Concepts',
    publisher: '2K Sports',
    platforms: ['PC', 'PS5', 'Xbox Series X'],
    tags: ['Basketball', 'Simulation', 'MyCareer'],
    details: 'NBA 2K26 delivers the most authentic basketball experience with true-to-life player animations, deep MyCareer story mode, and the massive online MyCity open world.',
    features: [
      'ProPlay technology using real NBA footage',
      'MyCareer narrative-driven story mode',
      'MyCity open-world online hub',
      'MyTeam card-collecting mode',
    ],
  },
  {
    id: 13,
    title: 'WWE 2K26',
    category: 'sports',
    subcategory: 'Combat',
    image: 'https://media.rawg.io/media/games/48c/48cb04ca483be865e3a18cef6f0f6612.jpg',
    description: 'Step into the ring with the most comprehensive WWE game ever made. Battle 200+ superstars and create your own legend.',
    releaseDate: '2026-03-07',
    rating: 4.3,
    players: '1–8 Online/Local',
    developer: 'Visual Concepts',
    publisher: '2K Sports',
    platforms: ['PC', 'PS5', 'Xbox Series X'],
    tags: ['Wrestling', 'Combat', 'Create-A-Superstar'],
    details: 'WWE 2K26 features the most complete roster in series history, a deep MyRise career mode, and robust creation tools to build your own arenas, superstars, and championship storylines.',
    features: [
      '200+ WWE superstars and legends',
      'MyRise career mode with branching story',
      'Extensive creation suite',
      'Online multiplayer towers and ranked',
    ],
  },
  {
    id: 14,
    title: 'Madden NFL 26',
    category: 'sports',
    subcategory: 'Football',
    image: 'https://media.rawg.io/media/games/9a7/9a78fc52cc8f2e9bdfab9bc8ef985ef7.jpg',
    description: 'The NFL is in your hands. Take your franchise to the Super Bowl or build the ultimate team in Madden\'s most feature-rich entry yet.',
    releaseDate: '2025-08-15',
    rating: 4.3,
    players: '1–2 Online',
    developer: 'EA Tiburon',
    publisher: 'Electronic Arts',
    platforms: ['PC', 'PS5', 'Xbox Series X'],
    tags: ['American Football', 'Simulation', 'Franchise'],
    details: 'Madden NFL 26 brings the most authentic NFL simulation with real-time physics, revamped Franchise mode with deeper scouting, and Superstar mode for building your NFL legacy.',
    features: [
      'All 32 NFL teams with real rosters',
      'Revamped Franchise mode with enhanced scouting',
      'Superstar X-Factor abilities',
      'MUT (Madden Ultimate Team) mode',
    ],
  },
  {
    id: 15,
    title: 'F1 25',
    category: 'sports',
    subcategory: 'Racing',
    image: 'https://media.rawg.io/media/games/441/4416f1f2cdf56cccb26ddfc13b2e3e0e.jpg',
    description: 'Get behind the wheel of the fastest cars on earth. F1 25 delivers the authentic Formula 1 experience with all teams, drivers, and circuits.',
    releaseDate: '2025-05-30',
    rating: 4.6,
    players: '1–20 Online',
    developer: 'Codemasters',
    publisher: 'Electronic Arts',
    platforms: ['PC', 'PS5', 'Xbox Series X'],
    tags: ['Racing', 'Simulation', 'F1'],
    details: 'F1 25 features all 24 circuits, all 20 drivers, and a deeply authentic driving model. My Team mode lets you create your own F1 constructor and compete across a full season.',
    features: [
      'All 24 official F1 circuits',
      'My Team constructor mode',
      'Authentic car physics and tyre simulation',
      'Split-screen and online multiplayer',
    ],
  },
  {
    id: 16,
    title: 'Football Manager 2026',
    category: 'sports',
    subcategory: 'Management',
    image: 'https://media.rawg.io/media/games/093/0937d207e3d2fc85e32d7d7adea5a24d.jpg',
    description: 'The world\'s most detailed football management simulation. Scout, train, and tactically outwit opponents on your way to football glory.',
    releaseDate: '2025-11-07',
    rating: 4.7,
    players: 'Single Player / Online',
    developer: 'Sports Interactive',
    publisher: 'SEGA',
    platforms: ['PC', 'Mobile'],
    tags: ['Management', 'Simulation', 'Football'],
    details: 'Football Manager 2026 gives you total control of your club with real players from 50+ leagues, deep scouting networks, press conferences, and tactical setups that affect real match outcomes.',
    features: [
      'Real players from 50+ leagues worldwide',
      'Deep tactical and formation editor',
      'Transfer market and contract negotiations',
      'Online multiplayer leagues with friends',
    ],
  },

  // ── PARTY ──
  {
    id: 17,
    title: 'Overcooked! All You Can Eat',
    category: 'party',
    subcategory: 'Co-op',
    image: 'https://media.rawg.io/media/games/fd9/fd985db2d44a3e951080fa6a60fe4f09.jpg',
    description: 'The ultimate co-op cooking chaos game. Work together to serve orders in the most ridiculous kitchens imaginable — or destroy your friendships trying.',
    releaseDate: '2020-11-10',
    rating: 4.8,
    players: '1–4 Local/Online',
    developer: 'Ghost Town Games',
    publisher: 'Team17',
    platforms: ['PC', 'PS5', 'Xbox Series X', 'Switch'],
    tags: ['Co-op', 'Couch Gaming', 'Casual'],
    details: 'All You Can Eat combines both Overcooked games and all DLC in one definitive package with 4K visuals, accessibility options, and cross-platform online play. Over 200 levels of kitchen chaos.',
    features: [
      '200+ levels across both games and all DLC',
      'Online and local co-op',
      'Accessibility and assist options',
      'Cross-platform online multiplayer',
    ],
  },
  {
    id: 18,
    title: 'Gang Beasts',
    category: 'party',
    subcategory: 'Versus',
    image: 'https://media.rawg.io/media/games/78b/78bc81e247fc7e77af700cbd632a9297.jpg',
    description: 'Punch, grab, and throw your wobbly opponents off platforms in this hilariously chaotic brawler. Easily the most fun you can have falling over.',
    releaseDate: '2017-12-12',
    rating: 4.6,
    players: '1–8 Local/Online',
    developer: 'Boneloaf',
    publisher: 'Double Fine Presents',
    platforms: ['PC', 'PS5', 'Xbox Series X'],
    tags: ['Brawler', 'Couch Gaming', 'Versus'],
    details: 'Gang Beasts features gummy bear-style characters with ragdoll physics in increasingly absurd arenas. Grab a friend\'s head and throw them into a moving fan — it\'s always hilarious.',
    features: [
      'Hilarious ragdoll physics engine',
      'Online and local multiplayer',
      'Dozens of wild arena stages',
      'Costume customization for your character',
    ],
  },
  {
    id: 19,
    title: 'Among Us',
    category: 'party',
    subcategory: 'Social',
    image: 'https://media.rawg.io/media/games/e74/e74458058b35e01c1ae3feeb39a3f724.jpg',
    description: 'Complete tasks on a space station — but Impostors walk among the crew. Discuss, deceive, and deduce your way to victory.',
    releaseDate: '2018-06-15',
    rating: 4.5,
    players: '4–15 Online',
    developer: 'Innersloth',
    publisher: 'Innersloth',
    platforms: ['PC', 'Mobile', 'PS5', 'Xbox Series X', 'Switch'],
    tags: ['Social Deduction', 'Free-to-Play', 'Cross-Play'],
    details: 'Among Us is a social deduction game where Crewmates try to complete tasks while Impostors sabotage and eliminate them in secret. Perfect for large groups, it sparked one of gaming\'s biggest cultural moments.',
    features: [
      'Up to 15 players per match',
      'Cross-platform play across all devices',
      'Custom roles: Sheriff, Scientist, Engineer',
      'Free to play on mobile',
    ],
  },
  {
    id: 20,
    title: 'Mario Party Superstars',
    category: 'party',
    subcategory: 'Versus',
    image: 'https://media.rawg.io/media/games/7ab/7ab9d5b0a5d5a1f6a8d3e8c4956b2b26.jpg',
    description: 'The classic board game party experience returns with 5 iconic boards, 100 classic minigames, and full online play for the whole family.',
    releaseDate: '2021-10-29',
    rating: 4.7,
    players: '1–4 Local/Online',
    developer: 'NDcube',
    publisher: 'Nintendo',
    platforms: ['Switch'],
    tags: ['Party', 'Family', 'Minigames'],
    details: 'Mario Party Superstars brings back fan-favourite boards from the N64 era with 100 remastered minigames, full online play, and support for any controller type making it the definitive Mario Party experience.',
    features: [
      '5 classic N64-era boards remastered',
      '100 minigames from series history',
      'Full online play with friends',
      'Works with any Switch controller',
    ],
  },

  // ── RPG ──
  {
    id: 21,
    title: 'The Witcher 3: Wild Hunt',
    category: 'rpg',
    subcategory: 'Open World',
    image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg',
    description: 'One of the greatest games ever made. Hunt monsters, make impossible choices, and lose yourself in a living open world of unmatched storytelling depth.',
    releaseDate: '2015-05-19',
    rating: 5.0,
    players: 'Single Player',
    developer: 'CD Projekt Red',
    publisher: 'CD Projekt',
    platforms: ['PC', 'PS5', 'Xbox Series X', 'Switch'],
    tags: ['Open World', 'Story-Rich', 'Dark Fantasy'],
    details: 'The Witcher 3 is widely considered one of the best RPGs ever made, featuring 100+ hours of content, morally complex storytelling, and a hand-crafted open world teeming with life. The Complete Edition includes both DLCs: Hearts of Stone and Blood and Wine.',
    features: [
      '100+ hours of main + DLC content',
      'Branching choices with real consequences',
      'Hearts of Stone and Blood and Wine DLC included',
      'Next-gen update with ray tracing and 60fps',
    ],
  },
  {
    id: 22,
    title: 'Cyberpunk 2077',
    category: 'rpg',
    subcategory: 'Open World',
    image: 'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg',
    description: 'Welcome to Night City — a megalopolis of crime, technology, and broken dreams. Build your legend as V in this sprawling first-person open-world RPG.',
    releaseDate: '2020-12-10',
    rating: 4.7,
    players: 'Single Player',
    developer: 'CD Projekt Red',
    publisher: 'CD Projekt',
    platforms: ['PC', 'PS5', 'Xbox Series X'],
    tags: ['Open World', 'Cyberpunk', 'Story-Rich'],
    details: 'Cyberpunk 2077 features a dense, vertical open world full of branching quests and deep character customization. The Phantom Liberty expansion adds a new district and spy-thriller storyline.',
    features: [
      'Massive vertical open-world Night City',
      'Deep character class and cyberware system',
      'Phantom Liberty expansion included',
      'Multiple quest paths and endings',
    ],
  },
  {
    id: 23,
    title: 'Elden Ring',
    category: 'rpg',
    subcategory: 'Action RPG',
    image: 'https://media.rawg.io/media/games/6fc/6fcf4cd3b17c288821388e6085bb0fc9.jpg',
    description: 'From the minds of Hidetaka Miyazaki and George R.R. Martin — a brutal, breathtaking open-world action RPG set in the shattered Lands Between.',
    releaseDate: '2022-02-25',
    rating: 4.9,
    players: 'Single Player / Co-op',
    developer: 'FromSoftware',
    publisher: 'Bandai Namco',
    platforms: ['PC', 'PS5', 'Xbox Series X'],
    tags: ['Action RPG', 'Soulslike', 'Open World'],
    details: 'Elden Ring won Game of the Year 2022 and redefined the action RPG genre. Its vast open world, cryptic lore by George R.R. Martin, and punishing-but-fair combat make it an essential experience.',
    features: [
      'Massive open world — The Lands Between',
      'Lore co-created by George R.R. Martin',
      'Online co-op and PvP invasion system',
      'Shadow of the Erdtree expansion',
    ],
  },
  {
    id: 24,
    title: 'Final Fantasy XV',
    category: 'rpg',
    subcategory: 'Action RPG',
    image: 'https://media.rawg.io/media/games/7ab/7ab9d5b0a5d5a1f6a8d3e8c4956b2b26.jpg',
    description: 'A fantasy based on reality. Join Prince Noctis and his friends on a road trip across a stunning world filled with epic battles and unforgettable moments.',
    releaseDate: '2016-11-29',
    rating: 4.4,
    players: 'Single Player',
    developer: 'Square Enix',
    publisher: 'Square Enix',
    platforms: ['PC', 'PS5', 'Xbox Series X'],
    tags: ['Action RPG', 'Open World', 'Story-Rich'],
    details: 'Final Fantasy XV blends real-time action combat with a rich emotional story of brotherhood and sacrifice. The Royal Edition includes all DLC chapters, adding hours of story content for each companion.',
    features: [
      'Real-time action combat with Warp-Strike',
      'Open world exploration with your party',
      'All DLC episodes: Gladiolus, Ignis, Prompto',
      'Gorgeous visuals and soundtrack',
    ],
  },

  // ── STRATEGY ──
  {
    id: 25,
    title: 'Civilization VI',
    category: 'strategy',
    subcategory: '4X',
    image: 'https://media.rawg.io/media/games/441/4416f1f2cdf56cccb26ddfc13b2e3e0e.jpg',
    description: 'Build an empire to stand the test of time. Guide your civilization from the Stone Age to the Space Age through war, diplomacy, culture, and science.',
    releaseDate: '2016-10-21',
    rating: 4.7,
    players: '1–12 Online',
    developer: 'Firaxis Games',
    publisher: '2K',
    platforms: ['PC', 'PS5', 'Xbox Series X', 'Switch', 'Mobile'],
    tags: ['4X', 'Turn-Based', 'Strategy'],
    details: 'Civilization VI features a redesigned technology and civics tree, unstacked cities that physically expand across the map, and a diverse roster of 40+ civilizations each with unique bonuses and playstyles.',
    features: [
      '40+ civilizations with unique abilities',
      'Unstacked cities that grow across the map',
      'Multiple victory conditions: Science, Culture, Military, Religion',
      'Online multiplayer up to 12 players',
    ],
  },
  {
    id: 26,
    title: 'Age of Empires IV',
    category: 'strategy',
    subcategory: 'RTS',
    image: 'https://media.rawg.io/media/games/4e0/4e0e7b6d6906a131307c94266e5c9a1c.jpg',
    description: 'One of history\'s greatest real-time strategy series returns. Command armies, build civilizations, and rewrite history across rich historical campaigns.',
    releaseDate: '2021-10-28',
    rating: 4.5,
    players: '1–8 Online',
    developer: 'Relic Entertainment',
    publisher: 'Xbox Game Studios',
    platforms: ['PC'],
    tags: ['RTS', 'Historical', 'Esports'],
    details: 'Age of Empires IV brings back the beloved RTS series with 8 unique civilizations, four rich historical campaigns spanning the Norman, Mongol, and Chinese empires, and a vibrant online multiplayer scene.',
    features: [
      '8 distinct civilizations with unique mechanics',
      'Four documentary-style historical campaigns',
      'Active ranked online multiplayer',
      'Regular post-launch civilization additions',
    ],
  },
  {
    id: 27,
    title: 'StarCraft II',
    category: 'strategy',
    subcategory: 'RTS',
    image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg',
    description: 'The definitive real-time strategy game. Master one of three asymmetric races — Terran, Zerg, or Protoss — and compete in one of esports\' most enduring scenes.',
    releaseDate: '2010-07-27',
    rating: 4.8,
    players: '1–8 Online',
    developer: 'Blizzard Entertainment',
    publisher: 'Blizzard Entertainment',
    platforms: ['PC'],
    tags: ['RTS', 'Esports', 'Free-to-Play'],
    details: 'StarCraft II is the pinnacle of RTS game design, featuring three completely asymmetric races requiring entirely different strategies. The Wings of Liberty campaign is free-to-play and the ladder remains one of gaming\'s most competitive arenas.',
    features: [
      'Three deeply asymmetric races',
      'Wings of Liberty campaign free-to-play',
      'Global ranked ladder with GM tier',
      'Co-op Commander mode for casual play',
    ],
  },
  {
    id: 28,
    title: 'Clash of Clans',
    category: 'strategy',
    subcategory: 'Mobile Strategy',
    image: 'https://media.rawg.io/media/games/b7d/b7d3f1715fa0332f39f31e34e6d18187.jpg',
    description: 'Build your village, raise a clan, and compete in epic Clan Wars. The mobile strategy phenomenon that has captivated hundreds of millions of players worldwide.',
    releaseDate: '2012-08-02',
    rating: 4.5,
    players: 'Online (Clan Wars)',
    developer: 'Supercell',
    publisher: 'Supercell',
    platforms: ['Mobile'],
    tags: ['Mobile', 'Free-to-Play', 'Clan Wars'],
    details: 'Clash of Clans is a landmark mobile strategy game combining base building, resource management, and competitive clan warfare. Constant updates have kept it one of the highest-grossing mobile games for over a decade.',
    features: [
      'Base building and village customization',
      'Clan Wars and Clan War Leagues',
      'Builder Base side game',
      'Regular balance updates and new content',
    ],
  },
];

const NEWS_DATA = [
  { id: 1, title: 'Valorant Episode 9 Brings New Agent & Map', date: '2026-02-14', category: 'Update', game: 'Valorant', content: 'Riot Games reveals Episode 9 with a brand new Controller Agent and a redesigned split map featuring vertical gameplay elements. Ranked reset arrives with exclusive Episode rewards.' },
  { id: 2, title: 'Elden Ring: Shadow of the Erdtree DLC Wins GOTY', date: '2026-02-10', category: 'Award', game: 'Elden Ring', content: 'FromSoftware\'s massive expansion took home Game of the Year at the Golden Joystick Awards, beating out competition from across all genres. Director Miyazaki hints at future projects.' },
  { id: 3, title: 'FC 26 Title Update 3: New Mechanics & Fixes', date: '2026-02-08', category: 'Update', game: 'EA Sports FC 26', content: 'EA Sports releases Title Update 3 addressing player movement responsiveness, goalkeeper AI improvements, and adjustments to Ultimate Team economy. Full patch notes available.' },
  { id: 4, title: 'League of Legends Worlds 2026 Location Confirmed', date: '2026-02-05', category: 'Esports', game: 'League of Legends', content: 'Riot Games confirms the 2026 World Championship will be held across three cities in Southeast Asia. Ticket sales open March 1st with a record-breaking expected viewership.' },
  { id: 5, title: 'Cyberpunk 2077 Free Update 2.3 Now Available', date: '2026-02-01', category: 'Update', game: 'Cyberpunk 2077', content: 'CD Projekt Red drops Update 2.3 for Cyberpunk 2077, adding new vehicles, expanded photo mode features, and quality-of-life improvements across all platforms.' },
];

const TOURNAMENTS_DATA = [
  { id: 1, name: 'Valorant Champions Tour 2026', game: 'Valorant', date: 'March 10–30, 2026', prize: '$1,000,000', status: 'Registration Open', type: 'Online + LAN Finals', description: 'The premier Valorant global event. Regional leagues feed into the international Champions event with the world\'s best teams.' },
  { id: 2, name: 'Dota 2: The International 2026', game: 'Dota 2', date: 'August 5–17, 2026', prize: '$20,000,000+', status: 'Upcoming', type: 'LAN', description: 'The most prestigious esports tournament in history. Prize pool grows with community Battle Pass contributions every year.' },
  { id: 3, name: 'League of Legends World Championship', game: 'League of Legends', date: 'October 1–November 2, 2026', prize: '$2,250,000', status: 'Upcoming', type: 'LAN', description: 'The annual LoL World Championship crowns the best team on the planet. Viewership regularly exceeds 70 million.' },
  { id: 4, name: 'CS2 Major: GameHub Invitational', game: 'Counter-Strike 2', date: 'April 14–27, 2026', prize: '$1,250,000', status: 'Registration Open', type: 'Online + LAN Finals', description: 'A Valve-sponsored CS2 Major featuring 24 top teams from global Regional Major Rankings. Held in Stockholm.' },
];

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────

// Context so all child components can access RAWG images without prop drilling
const RawgImagesContext = React.createContext({});
export const useGameImage = (game) => {
  const images = React.useContext(RawgImagesContext);
  return images[game.title] || game.image;
};

export default function GameHub() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const rawgImages = useRawgImages();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    if (page === 'game-detail') setSelectedGame(data);
    else if (page === 'category') setSelectedCategory(data);
    else if (page === 'games') { setSelectedCategory(null); setSelectedGame(null); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RawgImagesContext.Provider value={rawgImages}>
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'Space Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@700;900&display=swap');

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.3), 0 0 40px rgba(59,130,246,0.1); }
          50% { box-shadow: 0 0 30px rgba(59,130,246,0.5), 0 0 60px rgba(59,130,246,0.2); }
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          from { left: -100%; }
          to { left: 100%; }
        }

        .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .slide-in-right { animation: slideInRight 0.6s ease-out forwards; }
        .glow-effect { animation: glow 3s ease-in-out infinite; }
        .status-badge { animation: pulse 2s ease-in-out infinite; }

        .grid-bg {
          background-image:
            linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .game-card {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .game-card::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent);
          transition: left 0.5s ease;
          z-index: 1;
        }
        .game-card:hover::before { left: 100%; }
        .game-card:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 20px 60px rgba(59,130,246,0.25); }

        .category-card {
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: pointer;
        }
        .category-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.04) 100%);
          transition: opacity 0.3s;
          opacity: 0;
        }
        .category-card:hover::after { opacity: 1; }
        .category-card:hover { transform: translateY(-10px) scale(1.03); }

        .cyber-border {
          position: relative;
          padding: 2px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }

        .tag-chip {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 3px 8px;
          border-radius: 4px;
          background: rgba(59,130,246,0.15);
          color: #93c5fd;
          border: 1px solid rgba(59,130,246,0.3);
        }

        .subcategory-pill {
          transition: all 0.2s;
          cursor: pointer;
          border: 2px solid transparent;
        }
        .subcategory-pill.active {
          border-color: currentColor;
          background: rgba(255,255,255,0.08);
        }
        .subcategory-pill:hover:not(.active) {
          background: rgba(255,255,255,0.05);
        }

        .breadcrumb-item { transition: color 0.2s; }
        .breadcrumb-item:hover { color: #93c5fd; }
      `}</style>

      {/* ── Header ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/95 backdrop-blur-lg shadow-lg shadow-blue-500/10' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('home')}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center glow-effect">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">GAME</span>
                <span className="text-white">HUB</span>
              </h1>
            </div>
            <nav className="flex gap-8">
              {[
                { name: 'Home', icon: Gamepad2, page: 'home' },
                { name: 'Games', icon: Zap, page: 'games' },
                { name: 'Tournaments', icon: Trophy, page: 'tournaments' },
                { name: 'News', icon: Newspaper, page: 'news' },
                { name: 'About', icon: Info, page: 'about' },
              ].map((item) => (
                <button
                  key={item.page}
                  onClick={() => navigateTo(item.page)}
                  className={`flex items-center gap-2 text-sm font-semibold transition-all duration-300 hover:text-blue-400 ${currentPage === item.page || (currentPage === 'category' && item.page === 'games') || (currentPage === 'game-detail' && item.page === 'games') ? 'text-blue-400' : 'text-slate-400'}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="pt-20">
        {currentPage === 'home' && <HomePage navigateTo={navigateTo} />}
        {currentPage === 'games' && <GamesPage navigateTo={navigateTo} />}
        {currentPage === 'category' && selectedCategory && <CategoryPage category={selectedCategory} navigateTo={navigateTo} />}
        {currentPage === 'game-detail' && selectedGame && <GameDetailPage game={selectedGame} navigateTo={navigateTo} />}
        {currentPage === 'tournaments' && <TournamentsPage />}
        {currentPage === 'news' && <NewsPage navigateTo={navigateTo} />}
        {currentPage === 'about' && <AboutPage />}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-32 bg-slate-900/50 border-t border-blue-500/20">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent" style={{ fontFamily: "'Orbitron', sans-serif" }}>GAMEHUB</h3>
              <p className="text-sm text-slate-400">Your ultimate destination for gaming news, tournaments, and community.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-blue-400">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Games</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Tournaments</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">News</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-blue-400">Community</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Reddit</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-blue-400">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            <p>© 2026 GameHub. All rights reserved. MVP Version 1.0</p>
          </div>
        </div>
      </footer>
    </div>
    </RawgImagesContext.Provider>
  );
}

// ─────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────

// Featured: Valorant, Elden Ring, League of Legends, EA Sports FC 26, Cyberpunk 2077
const FEATURED_GAMES = [GAMES_DATA[0], GAMES_DATA[22], GAMES_DATA[9], GAMES_DATA[10], GAMES_DATA[21]];

function HomePage({ navigateTo }) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const rawgImages = React.useContext(RawgImagesContext);

  const switchHero = (idx) => {
    if (idx === heroIndex || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setHeroIndex(idx);
      setTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setHeroIndex(prev => (prev + 1) % FEATURED_GAMES.length);
        setTransitioning(false);
      }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const hero = FEATURED_GAMES[heroIndex];
  const heroCat = CATEGORIES.find(c => c.id === hero.category);
  const heroImage = rawgImages[hero.title] || hero.image;

  return (
    <div>
      {/* ── Cinematic Hero ── */}
      <section className="relative overflow-hidden" style={{ height: '92vh', minHeight: 600, maxHeight: 900 }}>
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url(${heroImage})`,
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? 'scale(1.04)' : 'scale(1)',
            transition: 'opacity 0.4s ease, transform 0.7s ease',
          }}
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30" />
        <div className="absolute inset-0 grid-bg opacity-10" />

        {/* Accent color bleed from category */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: heroCat?.color, boxShadow: `4px 0 40px ${heroCat?.glow}` }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl" style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(12px)' : 'translateY(0)', transition: 'opacity 0.35s ease, transform 0.35s ease' }}>

              {/* Category badge */}
              <div className="flex items-center gap-3 mb-5">
                {heroCat && (
                  <span className="flex items-center gap-2 text-xs font-black px-3 py-1.5 rounded-full tracking-widest uppercase"
                    style={{ background: `${heroCat.color}25`, color: heroCat.color, border: `1px solid ${heroCat.color}55` }}>
                    <heroCat.icon className="w-3.5 h-3.5" /> {heroCat.label}
                  </span>
                )}
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700 tracking-widest uppercase">
                  {hero.subcategory}
                </span>
                <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                  ★ {hero.rating}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-6xl md:text-7xl font-black mb-4 leading-none" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                {hero.title}
              </h2>

              {/* Description */}
              <p className="text-lg text-slate-300 mb-4 leading-relaxed max-w-xl">{hero.description}</p>

              {/* Meta row */}
              <div className="flex items-center gap-5 text-xs text-slate-500 font-semibold mb-8">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{hero.players}</span>
                <span className="w-px h-3 bg-slate-700" />
                <span>{hero.developer}</span>
                <span className="w-px h-3 bg-slate-700" />
                <span>{hero.releaseDate}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-10">
                {hero.tags.map(tag => (
                  <span key={tag} className="tag-chip">{tag}</span>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => navigateTo('game-detail', hero)}
                  className="font-black px-8 py-4 rounded-xl text-white flex items-center gap-2 transition-all hover:scale-105 hover:brightness-110"
                  style={{ background: heroCat?.color, boxShadow: `0 8px 32px ${heroCat?.glow}` }}
                >
                  View Game <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigateTo('games')}
                  className="font-bold px-8 py-4 rounded-xl border-2 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800/60 transition-all"
                >
                  Browse All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Hero Selector — right side thumbnails ── */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
          {FEATURED_GAMES.map((g, i) => {
            const c = CATEGORIES.find(cat => cat.id === g.category);
            const thumbImg = rawgImages[g.title] || g.image;
            return (
              <button
                key={g.id}
                onClick={() => switchHero(i)}
                className="relative overflow-hidden rounded-xl transition-all duration-300"
                style={{
                  width: i === heroIndex ? 120 : 80,
                  height: 64,
                  border: i === heroIndex ? `2px solid ${c?.color}` : '2px solid rgba(255,255,255,0.1)',
                  boxShadow: i === heroIndex ? `0 0 20px ${c?.glow}` : 'none',
                  opacity: i === heroIndex ? 1 : 0.5,
                }}
              >
                <img src={thumbImg} alt={g.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {i === heroIndex && (
                  <div className="absolute bottom-1.5 left-2 right-2">
                    <p className="text-white text-xs font-bold truncate leading-tight">{g.title}</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Progress dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {FEATURED_GAMES.map((_, i) => (
            <button
              key={i}
              onClick={() => switchHero(i)}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === heroIndex ? 32 : 8,
                background: i === heroIndex ? heroCat?.color : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </div>
      </section>

      {/* ── Genre Quick Access ── */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <span className="text-blue-400">BROWSE</span> BY GENRE
          </h3>
          <button onClick={() => navigateTo('games')} className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm font-bold">
            All Genres <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat, index) => {
            const Icon = cat.icon;
            const count = GAMES_DATA.filter(g => g.category === cat.id).length;
            return (
              <div
                key={cat.id}
                className="category-card rounded-xl p-4 text-center cursor-pointer fade-in-up"
                style={{
                  background: `${cat.color}0e`,
                  border: `1px solid ${cat.color}22`,
                  animationDelay: `${index * 0.06}s`,
                }}
                onClick={() => navigateTo('category', cat)}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 32px ${cat.glow}`; e.currentTarget.style.borderColor = `${cat.color}66`; e.currentTarget.style.background = `${cat.color}1a`; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = `${cat.color}22`; e.currentTarget.style.background = `${cat.color}0e`; }}
              >
                <div className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center" style={{ background: `${cat.color}22` }}>
                  <Icon className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <p className="font-black text-sm mb-0.5" style={{ fontFamily: "'Orbitron', sans-serif", color: cat.color }}>{cat.label}</p>
                <p className="text-xs text-slate-500">{count} games</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Featured Games ── */}
      <section className="container mx-auto px-6 py-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <span className="text-blue-400">TOP</span> PICKS
          </h3>
          <button onClick={() => navigateTo('games')} className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm font-bold">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[GAMES_DATA[0], GAMES_DATA[22], GAMES_DATA[10], GAMES_DATA[16]].map((game, index) => {
            const cat = CATEGORIES.find(c => c.id === game.category);
            const img = rawgImages[game.title] || game.image;
            return (
              <div
                key={game.id}
                className="game-card bg-slate-900 rounded-xl overflow-hidden cursor-pointer fade-in-up"
                style={{ animationDelay: `${index * 0.07}s`, border: '1px solid rgba(255,255,255,0.05)' }}
                onClick={() => navigateTo('game-detail', game)}
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={img} alt={game.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  {/* Category stripe */}
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: cat?.color }} />
                  <div className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: `${cat?.color}dd`, color: '#fff' }}>
                    {game.subcategory}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-black text-base leading-tight">{game.title}</h4>
                    <span className="text-yellow-400 text-xs font-bold flex-shrink-0 ml-2">★ {game.rating}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{game.developer}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-500">{game.players}</span>
                    <span className="text-xs font-bold flex items-center gap-1" style={{ color: cat?.color }}>
                      Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Active Tournaments Strip ── */}
      <section className="border-y border-slate-800 bg-slate-900/40 py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              <span className="text-yellow-400">ACTIVE</span> TOURNAMENTS
            </h3>
            <button onClick={() => navigateTo('tournaments')} className="text-yellow-400 hover:text-yellow-300 flex items-center gap-2 text-sm font-bold">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TOURNAMENTS_DATA.filter(t => t.status === 'Registration Open').map((t, i) => (
              <div
                key={t.id}
                className="flex items-center gap-5 bg-slate-900 rounded-xl p-5 border border-slate-800 hover:border-yellow-500/40 transition-all cursor-pointer slide-in-right"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-green-400 status-badge">● OPEN</span>
                    <span className="text-xs text-slate-500">{t.game}</span>
                  </div>
                  <p className="font-bold text-sm truncate">{t.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.date}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-500 mb-0.5">Prize</p>
                  <p className="text-lg font-black text-yellow-400">{t.prize}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest News ── */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <span className="text-purple-400">LATEST</span> NEWS
          </h3>
          <button onClick={() => navigateTo('news')} className="text-purple-400 hover:text-purple-300 flex items-center gap-2 text-sm font-bold">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Big + small layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Lead story */}
          <div
            className="lg:col-span-3 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group fade-in-up"
            onClick={() => {
              const g = GAMES_DATA.find(gm => gm.title === NEWS_DATA[0].game);
              if (g) navigateTo('game-detail', g);
            }}
          >
            <div className="relative h-52 overflow-hidden">
              <img
                src={rawgImages[NEWS_DATA[0].game] || GAMES_DATA.find(g => g.title === NEWS_DATA[0].game)?.image}
                alt={NEWS_DATA[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <span className="absolute top-4 left-4 bg-purple-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {NEWS_DATA[0].category}
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-slate-500">{NEWS_DATA[0].date}</span>
                <span className="text-xs text-blue-400 font-bold">{NEWS_DATA[0].game}</span>
              </div>
              <h4 className="text-xl font-black mb-2 group-hover:text-purple-400 transition-colors">{NEWS_DATA[0].title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{NEWS_DATA[0].content}</p>
            </div>
          </div>

          {/* Side stories */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {NEWS_DATA.slice(1, 4).map((news, i) => (
              <div
                key={news.id}
                className="flex-1 bg-slate-900 rounded-xl p-5 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer slide-in-right"
                style={{ animationDelay: `${i * 0.08}s` }}
                onClick={() => {
                  const g = GAMES_DATA.find(gm => gm.title === news.game);
                  if (g) navigateTo('game-detail', g);
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400">{news.category}</span>
                  <span className="text-xs text-slate-600">{news.date}</span>
                </div>
                <h4 className="font-bold text-sm mb-1.5 hover:text-purple-400 transition-colors leading-snug">{news.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{news.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────
// GAMES PAGE  — Category Grid
// ─────────────────────────────────────────────

function GamesPage({ navigateTo }) {
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="mb-14 fade-in-up">
        <h2 className="text-4xl font-black mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          <span className="text-blue-400">BROWSE</span> BY GENRE
        </h2>
        <p className="text-slate-400">Select a category to explore games, subcategories, and detailed info</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat, index) => {
          const Icon = cat.icon;
          const count = GAMES_DATA.filter(g => g.category === cat.id).length;
          return (
            <div
              key={cat.id}
              className="category-card bg-slate-900 rounded-2xl overflow-hidden fade-in-up"
              style={{
                animationDelay: `${index * 0.07}s`,
                border: `1px solid ${cat.color}22`,
              }}
              onClick={() => navigateTo('category', cat)}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 20px 60px ${cat.glow}`; e.currentTarget.style.borderColor = `${cat.color}66`; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = `${cat.color}22`; }}
            >
              {/* Color stripe top */}
              <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${cat.color}, transparent)` }} />

              <div className="p-8">
                {/* Icon + label */}
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `${cat.color}22` }}>
                    <Icon className="w-7 h-7" style={{ color: cat.color }} />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${cat.color}22`, color: cat.color }}>
                    {count} {count === 1 ? 'GAME' : 'GAMES'}
                  </span>
                </div>

                <h3 className="text-2xl font-black mb-1" style={{ fontFamily: "'Orbitron', sans-serif", color: cat.color }}>
                  {cat.label}
                </h3>
                <p className="text-xs text-slate-500 mb-3 font-semibold tracking-widest uppercase">{cat.fullName}</p>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">{cat.description}</p>

                {/* Subcategory pills preview */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {cat.subcategories.filter(s => s !== 'All').map(sub => (
                    <span key={sub} className="text-xs px-3 py-1 rounded-full border font-semibold" style={{ borderColor: `${cat.color}44`, color: `${cat.color}bb`, background: `${cat.color}11` }}>
                      {sub}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 font-bold text-sm" style={{ color: cat.color }}>
                  Explore {cat.label} <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CATEGORY PAGE  — Subcategory filter + game list
// ─────────────────────────────────────────────

function CategoryPage({ category, navigateTo }) {
  const [activeSub, setActiveSub] = useState('All');
  const Icon = category.icon;

  const filtered = GAMES_DATA.filter(g =>
    g.category === category.id && (activeSub === 'All' || g.subcategory === activeSub)
  );

  return (
    <div>
      {/* Category Hero */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${category.color}18, transparent 60%)` }}>
        <div className="absolute inset-0 grid-bg opacity-10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: category.color, transform: 'translate(-30%, -30%)' }} />
        <div className="container mx-auto px-6 py-20 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 fade-in-up">
            <button className="breadcrumb-item hover:text-blue-400" onClick={() => navigateTo('games')}>Games</button>
            <ChevronRight className="w-4 h-4" />
            <span style={{ color: category.color }}>{category.label}</span>
          </div>

          <div className="flex items-center gap-6 fade-in-up">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${category.color}22`, border: `2px solid ${category.color}44` }}>
              <Icon className="w-10 h-10" style={{ color: category.color }} />
            </div>
            <div>
              <h2 className="text-5xl font-black" style={{ fontFamily: "'Orbitron', sans-serif", color: category.color }}>
                {category.label}
              </h2>
              <p className="text-slate-400 mt-1">{category.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Subcategory Filter */}
        <div className="flex items-center gap-3 mb-10 flex-wrap fade-in-up">
          <span className="text-xs text-slate-500 font-bold tracking-widest uppercase mr-2">Filter:</span>
          {category.subcategories.map(sub => (
            <button
              key={sub}
              onClick={() => setActiveSub(sub)}
              className={`subcategory-pill text-sm font-bold px-5 py-2 rounded-full transition-all ${activeSub === sub ? 'active' : ''}`}
              style={{
                color: activeSub === sub ? category.color : '#94a3b8',
                borderColor: activeSub === sub ? category.color : 'transparent',
                background: activeSub === sub ? `${category.color}15` : 'rgba(255,255,255,0.03)',
              }}
            >
              {sub}
              {sub !== 'All' && (
                <span className="ml-2 text-xs opacity-60">
                  {GAMES_DATA.filter(g => g.category === category.id && g.subcategory === sub).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Games Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((game, index) => (
              <GameCard key={game.id} game={game} index={index} navigateTo={navigateTo} accentColor={category.color} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No games in this subcategory yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// GAME CARD  — shared component
// ─────────────────────────────────────────────

function GameCard({ game, index, navigateTo, accentColor = '#3b82f6' }) {
  const cat = CATEGORIES.find(c => c.id === game.category);
  const color = accentColor || cat?.color || '#3b82f6';
  const image = useGameImage(game);

  return (
    <div
      className="game-card bg-slate-900 rounded-xl overflow-hidden cursor-pointer fade-in-up"
      style={{ animationDelay: `${index * 0.05}s`, border: '1px solid rgba(255,255,255,0.05)' }}
      onClick={() => navigateTo('game-detail', game)}
    >
      <div className="relative h-52 overflow-hidden">
        <img src={image} alt={game.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
        <div className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${color}dd`, color: '#fff' }}>
          {game.subcategory}
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold leading-tight">{game.title}</h3>
          <div className="flex items-center gap-1 text-yellow-400 flex-shrink-0 ml-3">
            <span className="text-sm">★</span>
            <span className="font-bold text-sm">{game.rating}</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-3">{game.developer}</p>
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{game.description}</p>

        <div className="flex flex-wrap gap-1 mb-4">
          {game.tags.slice(0, 3).map(tag => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <span className="text-xs text-slate-500">{game.players}</span>
          <span className="text-sm font-bold flex items-center gap-1" style={{ color }}>
            View Details <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

// Small card used in the "More X Games" section — needs its own hook call
function RelatedGameCard({ game, navigateTo }) {
  const image = useGameImage(game);
  return (
    <div
      className="game-card bg-slate-900 rounded-xl overflow-hidden cursor-pointer border border-slate-800 hover:border-slate-600"
      onClick={() => navigateTo('game-detail', game)}
    >
      <div className="h-28 overflow-hidden">
        <img src={image} alt={game.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <p className="font-bold text-sm truncate">{game.title}</p>
        <div className="flex items-center gap-1 text-yellow-400 mt-1">
          <span className="text-xs">★</span>
          <span className="text-xs font-bold">{game.rating}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// GAME DETAIL PAGE
// ─────────────────────────────────────────────

function GameDetailPage({ game, navigateTo }) {
  const cat = CATEGORIES.find(c => c.id === game.category);
  const color = cat?.color || '#3b82f6';
  const Icon = cat?.icon || Gamepad2;
  const heroImage = useGameImage(game);

  // Related games
  const related = GAMES_DATA.filter(g => g.category === game.category && g.id !== game.id).slice(0, 3);

  return (
    <div className="fade-in-up">
      {/* Hero */}
      <div className="relative h-[480px] overflow-hidden">
        <img src={heroImage} alt={game.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-6 pb-14">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
              <button className="breadcrumb-item hover:text-blue-400" onClick={() => navigateTo('games')}>Games</button>
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <button className="breadcrumb-item" style={{ color }} onClick={() => navigateTo('category', cat)}>{cat?.label}</button>
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <span className="text-slate-300">{game.title}</span>
            </div>

            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold px-4 py-2 rounded-full" style={{ background: `${color}dd`, color: '#fff' }}>
                  {game.subcategory}
                </span>
                {game.tags.map(tag => (
                  <span key={tag} className="tag-chip hidden sm:inline">{tag}</span>
                ))}
              </div>
              <h2 className="text-5xl font-black mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>{game.title}</h2>
              <p className="text-lg text-slate-300">{game.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* ── Left: Main Content ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* About */}
            <div>
              <h3 className="text-2xl font-bold mb-5" style={{ color }}>About This Game</h3>
              <p className="text-slate-300 text-lg leading-relaxed">{game.details}</p>
            </div>

            {/* Features */}
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
              <h4 className="text-xl font-bold mb-6">Key Features</h4>
              <ul className="space-y-4">
                {game.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}22` }}>
                      <Zap className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <span className="text-slate-300">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platforms */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-slate-300">Available On</h4>
              <div className="flex flex-wrap gap-3">
                {game.platforms.map(p => (
                  <span key={p} className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-800 border border-slate-700 text-slate-300">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Related Games */}
            {related.length > 0 && (
              <div>
                <h4 className="text-lg font-bold mb-5 text-slate-300">More {cat?.label} Games</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map(rg => (
                    <RelatedGameCard key={rg.id} game={rg} navigateTo={navigateTo} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Sidebar ── */}
          <div className="space-y-6">
            {/* Info card */}
            <div className="cyber-border rounded-2xl">
              <div className="bg-slate-900 rounded-2xl p-6">
                <h4 className="text-xl font-bold mb-6">Game Info</h4>
                <div className="space-y-5 text-sm">
                  {[
                    { label: 'Developer', value: game.developer },
                    { label: 'Publisher', value: game.publisher },
                    { label: 'Release Date', value: game.releaseDate },
                    { label: 'Players', value: game.players },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <span className="text-slate-500 block mb-1">{label}</span>
                      <p className="text-white font-semibold">{value}</p>
                    </div>
                  ))}
                  <div>
                    <span className="text-slate-500 block mb-1">Rating</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl text-yellow-400">★</span>
                      <span className="text-white font-black text-xl">{game.rating}</span>
                      <span className="text-slate-500">/ 5.0</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-2">Tags</span>
                    <div className="flex flex-wrap gap-2">
                      {game.tags.map(tag => (
                        <span key={tag} className="tag-chip">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Genre card */}
            <div className="rounded-2xl p-6 border" style={{ background: `${color}0d`, borderColor: `${color}33` }}>
              <div className="flex items-center gap-3 mb-3">
                <Icon className="w-5 h-5" style={{ color }} />
                <span className="font-bold" style={{ color }}>{cat?.fullName}</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">{cat?.description}</p>
              <button
                onClick={() => navigateTo('category', cat)}
                className="text-sm font-bold flex items-center gap-1"
                style={{ color }}
              >
                Browse all {cat?.label} games <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Back */}
            <button
              onClick={() => navigateTo('category', cat)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to {cat?.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TOURNAMENTS PAGE
// ─────────────────────────────────────────────

function TournamentsPage() {
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="mb-12 fade-in-up">
        <h2 className="text-4xl font-black mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          <span className="text-yellow-400">TOURNAMENTS</span> & COMPETITIONS
        </h2>
        <p className="text-slate-400">Join competitive gaming events and win amazing prizes</p>
      </div>
      <div className="space-y-6">
        {TOURNAMENTS_DATA.map((tournament, index) => (
          <div key={tournament.id} className="bg-slate-900 border-2 border-slate-800 rounded-xl overflow-hidden hover:border-yellow-500/50 transition-all slide-in-right" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <span className="text-sm text-slate-500">{tournament.game}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${tournament.status === 'Registration Open' ? 'bg-green-500/20 text-green-400 status-badge' : 'bg-blue-500/20 text-blue-400'}`}>
                      {tournament.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{tournament.name}</h3>
                  <p className="text-slate-400 mb-4">{tournament.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" /><span>{tournament.date}</span></div>
                    <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-purple-400" /><span>{tournament.type}</span></div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Prize Pool</p>
                    <p className="text-3xl font-black text-yellow-400">{tournament.prize}</p>
                  </div>
                  {tournament.status === 'Registration Open' && (
                    <button className="cyber-border rounded-lg">
                      <div className="bg-slate-950 px-6 py-3 rounded-lg font-bold hover:bg-slate-900 transition-colors">Register Now</div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// NEWS PAGE
// ─────────────────────────────────────────────

function NewsPage({ navigateTo }) {
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="mb-12 fade-in-up">
        <h2 className="text-4xl font-black mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          <span className="text-purple-400">GAMING</span> NEWS
        </h2>
        <p className="text-slate-400">Stay updated with the latest news and announcements</p>
      </div>
      <div className="space-y-6">
        {NEWS_DATA.map((news, index) => {
          const game = GAMES_DATA.find(g => g.title === news.game);
          return (
            <article key={news.id} className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-purple-500/50 transition-all cursor-pointer fade-in-up" style={{ animationDelay: `${index * 0.05}s` }} onClick={() => game && navigateTo('game-detail', game)}>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-4 py-2 rounded-full">{news.category}</span>
                <span className="text-sm text-slate-500">{news.date}</span>
                <span className="text-sm text-slate-600">•</span>
                <span className="text-sm text-blue-400 font-semibold">{news.game}</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 hover:text-purple-400 transition-colors">{news.title}</h3>
              <p className="text-slate-300 leading-relaxed">{news.content}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ABOUT PAGE
// ─────────────────────────────────────────────

function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 fade-in-up">
          <h2 className="text-4xl font-black mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <span className="text-blue-400">ABOUT</span> GAMEHUB
          </h2>
          <p className="text-xl text-slate-400">Your central hub for everything gaming</p>
        </div>
        <div className="space-y-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Our Mission</h3>
            <p className="text-slate-300 leading-relaxed">GameHub is dedicated to bringing gamers together with comprehensive information about the latest games, exciting tournaments, and breaking news from the gaming industry. We're building a community where players can discover new experiences, compete at the highest levels, and stay connected with the games they love.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-purple-400">What We Offer</h3>
            <div className="space-y-5">
              {[
                { Icon: Gamepad2, color: 'text-blue-400', bg: 'bg-blue-500/20', title: 'Game Database', desc: 'Comprehensive category-based database of the hottest games across all genres — browse by FPS, MOBA, Sports, Party, RPG, and Strategy.' },
                { Icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500/20', title: 'Tournament Hub', desc: 'Discover competitive gaming events with massive prize pools and live registration.' },
                { Icon: Newspaper, color: 'text-pink-400', bg: 'bg-pink-500/20', title: 'Latest News', desc: 'Stay updated with breaking news and game announcements directly linked to game pages.' },
              ].map(({ Icon, color, bg, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{title}</h4>
                    <p className="text-slate-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}