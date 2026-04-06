import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Trophy, Calendar, Zap, Gamepad2, Newspaper, Info, Target, Swords, Users, Laugh, Crown, Brain, Car, Shield, Globe, HelpCircle, Home, Joystick } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, onSnapshot, orderBy, query, where, writeBatch, updateDoc, arrayUnion, arrayRemove, deleteDoc, serverTimestamp } from 'firebase/firestore';

// ─────────────────────────────────────────────
// FIREBASE AUTH
// ─────────────────────────────────────────────

const firebaseConfig = {
  apiKey: "AIzaSyBnZxbaVzPMLdRKtadjLfjyf8kt3UHb0mk",
  authDomain: "gamehub26-940a5.firebaseapp.com",
  projectId: "gamehub26-940a5",
  storageBucket: "gamehub26-940a5.firebasestorage.app",
  messagingSenderId: "246239295653",
  appId: "1:246239295653:web:d7493e23030cdd6ccab54c",
  measurementId: "G-L8V645LX74",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Auth context - accessible anywhere in the app
const AuthContext = React.createContext(null);
const useAuth = () => React.useContext(AuthContext);

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
  'WWE 2K26': 'wwe-2k25',
  'Madden NFL 26': 'madden-nfl-25',
  'F1 25': 'f1-25',
  'Football Manager 2026': 'football-manager-2025',
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
    image: '/images/games/pubg.jpg',
    description: 'The game that defined the battle royale genre. Drop onto a massive island with 99 other players, scavenge for gear, and be the last one standing.',
    releaseDate: '2017-12-20',
    rating: 4.5,
    players: '1-100 Online',
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
    image: '/images/games/cs2.jpg',
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
    image: '/images/games/r6siege.jpg',
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
    players: '1-60 Online',
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
    image: '/images/games/warzone.jpg',
    description: 'The massive free-to-play Call of Duty battle royale. Drop into Verdansk with 150 players, survive the Gulag, and claim victory.',
    releaseDate: '2020-03-10',
    rating: 4.4,
    players: '1-150 Online',
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
    image: '/images/games/rov.jpg',
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
    details: 'MLBB delivers fast 10-15 minute 5v5 matches on mobile. With 120+ heroes and a massive global playerbase, it\'s one of the most played games in Southeast Asia and beyond.',
    features: [
      '120+ heroes with unique abilities',
      'Fast 10-15 minute match length',
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
    details: 'Dota 2 is a complex, endlessly deep MOBA with a fully free hero roster and cosmetic-only monetization. Home to The International - the world\'s most prestigious esports tournament with prize pools exceeding $30 million.',
    features: [
      '120+ heroes, all free to play',
      'Cosmetic-only monetization',
      'The International - $30M+ prize pool',
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
    players: '1-22 Online',
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
    image: '/images/games/nba2k26.jpg',
    description: 'The gold standard in basketball simulation. Play as your favorite NBA stars, build your MyPlayer, and dominate the courts online.',
    releaseDate: '2025-09-05',
    rating: 4.4,
    players: '1-10 Online',
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
    image: '/images/games/wwe2k26.jpg',
    description: 'Step into the ring with the most comprehensive WWE game ever made. Battle 200+ superstars and create your own legend.',
    releaseDate: '2026-03-07',
    rating: 4.3,
    players: '1-8 Online/Local',
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
    players: '1-2 Online',
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
    image: '/images/games/f125.jpg',
    description: 'Get behind the wheel of the fastest cars on earth. F1 25 delivers the authentic Formula 1 experience with all teams, drivers, and circuits.',
    releaseDate: '2025-05-30',
    rating: 4.6,
    players: '1-20 Online',
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
    image: '/images/games/fm26.jpg',
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
    description: 'The ultimate co-op cooking chaos game. Work together to serve orders in the most ridiculous kitchens imaginable - or destroy your friendships trying.',
    releaseDate: '2020-11-10',
    rating: 4.8,
    players: '1-4 Local/Online',
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
    image: 'https://media.rawg.io/media/games/d69/d69810315bd7e226ea2d21f9156af629.jpg',
    description: 'Punch, grab, and throw your wobbly opponents off platforms in this hilariously chaotic brawler. Easily the most fun you can have falling over.',
    releaseDate: '2017-12-12',
    rating: 4.6,
    players: '1-8 Local/Online',
    developer: 'Boneloaf',
    publisher: 'Double Fine Presents',
    platforms: ['PC', 'PS5', 'Xbox Series X'],
    tags: ['Brawler', 'Couch Gaming', 'Versus'],
    details: 'Gang Beasts features gummy bear-style characters with ragdoll physics in increasingly absurd arenas. Grab a friend\'s head and throw them into a moving fan - it\'s always hilarious.',
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
    description: 'Complete tasks on a space station - but Impostors walk among the crew. Discuss, deceive, and deduce your way to victory.',
    releaseDate: '2018-06-15',
    rating: 4.5,
    players: '4-15 Online',
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
    players: '1-4 Local/Online',
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
    description: 'Welcome to Night City - a megalopolis of crime, technology, and broken dreams. Build your legend as V in this sprawling first-person open-world RPG.',
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
    image: 'https://media.rawg.io/media/games/b29/b294fdd866dcdb643e7bab370a552855.jpg',
    description: 'From the minds of Hidetaka Miyazaki and George R.R. Martin - a brutal, breathtaking open-world action RPG set in the shattered Lands Between.',
    releaseDate: '2022-02-25',
    rating: 4.9,
    players: 'Single Player / Co-op',
    developer: 'FromSoftware',
    publisher: 'Bandai Namco',
    platforms: ['PC', 'PS5', 'Xbox Series X'],
    tags: ['Action RPG', 'Soulslike', 'Open World'],
    details: 'Elden Ring won Game of the Year 2022 and redefined the action RPG genre. Its vast open world, cryptic lore by George R.R. Martin, and punishing-but-fair combat make it an essential experience.',
    features: [
      'Massive open world - The Lands Between',
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
    image: '/images/games/civ6.jpg',
    description: 'Build an empire to stand the test of time. Guide your civilization from the Stone Age to the Space Age through war, diplomacy, culture, and science.',
    releaseDate: '2016-10-21',
    rating: 4.7,
    players: '1-12 Online',
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
    players: '1-8 Online',
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
    image: '/images/games/starcraft-ii.jpg',
    description: 'The definitive real-time strategy game. Master one of three asymmetric races - Terran, Zerg, or Protoss - and compete in one of esports\' most enduring scenes.',
    releaseDate: '2010-07-27',
    rating: 4.8,
    players: '1-8 Online',
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
    image: 'https://media.rawg.io/media/games/b11/b11e5bee5a6b6e0b2e6a83fea5c40fee.jpg',
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

function formatNewsDate(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value?.toDate) return value.toDate().toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  if (value instanceof Date) return value.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  return String(value);
}

function normalizeNewsItem(news, index = 0) {
  const toText = (value, fallback = '') => {
    if (typeof value === 'string') return value;
    if (value == null) return fallback;
    return String(value);
  };

  return {
    id: news?.id ?? `news-${index}`,
    title: toText(news?.title, 'Untitled News'),
    category: toText(news?.category, 'News'),
    game: toText(news?.game, ''),
    summary: toText(news?.summary, toText(news?.content, '')),
    content: toText(news?.content, toText(news?.summary, '')),
    imageUrl: toText(news?.imageUrl, ''),
    sourceUrl: toText(news?.sourceUrl, ''),
    publishedAt: news?.publishedAt ?? news?.date ?? '',
    dateLabel: formatNewsDate(news?.publishedAt ?? news?.date),
  };
}

const TOURNAMENTS_DATA = [
  // WATCHABLE ONLY
  { id: 1, joinable: false, name: 'Valorant Champions Tour 2026', game: 'Valorant', date: 'March 10-30, 2026', prize: '$1,000,000', status: 'Live Now', type: 'LAN Finals', description: 'The premier Valorant global event. Only top VCT regional teams qualify. Open for spectators worldwide.', watchUrl: 'https://www.twitch.tv/valorant', teams: 16, region: 'International' },
  { id: 2, joinable: false, name: 'Dota 2: The International 2026', game: 'Dota 2', date: 'August 5-17, 2026', prize: '$20,000,000+', status: 'Upcoming', type: 'LAN', description: 'The most prestigious esports event. Invite-only for the top 18 teams in the world. Prize pool grows via Battle Pass.', watchUrl: 'https://www.twitch.tv/dota2ti', teams: 18, region: 'International' },
  { id: 3, joinable: false, name: 'LoL World Championship 2026', game: 'League of Legends', date: 'October 1-November 2, 2026', prize: '$2,250,000', status: 'Upcoming', type: 'LAN', description: 'The annual LoL Worlds crowns the best team on the planet. 70M+ viewers. Qualification via regional splits only.', watchUrl: 'https://www.twitch.tv/riotgames', teams: 22, region: 'International' },
  { id: 4, joinable: false, name: 'CS2 Major: Copenhagen 2026', game: 'Counter-Strike 2', date: 'April 14-27, 2026', prize: '$1,250,000', status: 'Upcoming', type: 'LAN', description: 'Valve-sponsored CS2 Major. 24 top teams from Regional Major Rankings only. Qualification through RMR events.', watchUrl: 'https://www.twitch.tv/esl_csgo', teams: 24, region: 'International' },
  // JOINABLE (Public)
  { id: 5, joinable: true, name: 'GameHub Weekly Valorant Cup', game: 'Valorant', date: 'Every Saturday', prize: '$500', status: 'Registration Open', type: 'Online', description: 'Weekly open tournament for all ranks. Register your team of 5 and compete every weekend. No invite required!', maxTeams: 32, registered: 18, region: 'Southeast Asia', requirements: '5-player team • Any rank • PC only' },
  { id: 6, joinable: true, name: 'GameHub ROV Community Cup', game: 'ROV (Arena of Valor)', date: 'April 20, 2026', prize: '฿5,000', status: 'Registration Open', type: 'Online', description: 'Open ROV tournament for Thai players. Solo queue or pre-made team of 5. Join and prove your skills!', maxTeams: 64, registered: 41, region: 'Thailand', requirements: '5-player team • Gold+ rank • Mobile / PC' },
  { id: 7, joinable: true, name: 'GameHub CS2 Open Qualifier', game: 'Counter-Strike 2', date: 'May 3-4, 2026', prize: '$300', status: 'Registration Open', type: 'Online', description: 'Open CS2 5v5 tournament. Any team can register. Top teams advance to monthly finals. FACEIT accounts required.', maxTeams: 128, registered: 67, region: 'Asia-Pacific', requirements: '5-player team • FACEIT Account • PC only' },
  { id: 8, joinable: true, name: 'GameHub Mobile Legends Cup', game: 'Mobile Legends: Bang Bang', date: 'April 27, 2026', prize: '฿3,000', status: 'Coming Soon', type: 'Online', description: 'Open MLBB tournament for mobile players across SEA. Form your team and compete for prizes!', maxTeams: 64, registered: 0, region: 'Southeast Asia', requirements: '5-player team • Epic+ rank • Mobile' },
];

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────

// Wishlist nav button with live count badge
function WishlistNavButton({ navigateTo, currentPage }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const load = async () => {
      try {
        if (!auth.currentUser) { setCount(0); return; }
        const snap = await getDoc(doc(db, 'wishlists', auth.currentUser.uid));
        if (snap.exists()) setCount((snap.data().games || []).length);
      } catch (_) {}
    };
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={() => navigateTo('wishlist')}
      className={`flex items-center gap-2 text-sm font-semibold transition-all duration-300 hover:text-red-400 relative ${currentPage === 'wishlist' ? 'text-red-400' : 'text-slate-400'}`}
    >
      ♥ Wishlist
      {count > 0 && (
        <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-black rounded-full w-4 h-4 flex items-center justify-center leading-none">
          {count}
        </span>
      )}
    </button>
  );
}

// Auth button - shows login/register or user avatar+dropdown
function AuthNavButton({ navigateTo, currentPage, user, authLoading }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarEmoji, setAvatarEmoji] = useState(null);
  const [avatarColor, setAvatarColor] = useState(0);
  const [avatarPhoto, setAvatarPhoto] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Load avatar realtime when user logs in
  useEffect(() => {
    if (!user) { setAvatarEmoji(null); setAvatarColor(0); return; }
    const unsub = onSnapshot(doc(db, 'avatars', user.uid), (snap) => {
      if (snap.exists()) {
        setAvatarEmoji(snap.data().emoji || null);
        setAvatarColor(snap.data().colorIndex ?? 0);
        setAvatarPhoto(snap.data().photoURL || '');
      } else {
        setAvatarEmoji(null);
        setAvatarColor(0);
        setAvatarPhoto('');
      }
    }, () => {});
    return () => unsub();
  }, [user]);

  if (authLoading) return <div className="w-8 h-8 skeleton rounded-full flex-shrink-0" />;

  if (!user) {
    return (
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => navigateTo('login')}
          className="text-sm font-bold text-slate-400 hover:text-white transition-colors px-3 py-1.5"
        >Login</button>
        <button
          onClick={() => navigateTo('register')}
          className="text-sm font-bold px-4 py-2 rounded-lg transition-all bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
        >Sign Up</button>
      </div>
    );
  }

  const color = AVATAR_COLORS[avatarColor];
  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
          style={avatarPhoto ? {
            backgroundImage: `url(${avatarPhoto})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : { background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
        >
          {!avatarPhoto && (avatarEmoji || initials)}
        </div>
        <span className="text-sm font-bold text-white hidden md:block max-w-[100px] truncate">
          {user.displayName || user.email.split('@')[0]}
        </span>
        <span className="text-slate-400 text-xs">▾</span>
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 top-12 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 fade-in-up">
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-xs text-slate-500">Signed in as</p>
            <p className="text-sm font-bold text-white truncate">{user.email}</p>
          </div>
          <div className="py-1">
            {[
              { label: '👤 My Profile', page: 'profile' },
              { label: '♥ Wishlist', page: 'wishlist' },
              { label: '🏆 Leaderboard', page: 'leaderboard' },
            ].map(item => (
              <button
                key={item.page}
                onClick={() => { navigateTo(item.page); setDropdownOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >{item.label}</button>
            ))}
          </div>
          <div className="border-t border-slate-800 py-1">
            <button
              onClick={async () => { await signOut(auth); setDropdownOpen(false); navigateTo('home'); }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-800 transition-colors"
            >🚪 Sign Out</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Context so all child components can access RAWG images without prop drilling
const RawgImagesContext = React.createContext({});
export const useGameImage = (game) => {
  const images = React.useContext(RawgImagesContext);
  // If game has a local image path (uploaded by user), always use it
  if (game.image && game.image.startsWith('/images/')) return game.image;
  return images[game.title] || game.image;
};

// ─────────────────────────────────────────────
// INTRO SCREEN
// ─────────────────────────────────────────────

function IntroScreen({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const fullText = 'GAMEHUB';

  const stars = useRef(Array.from({ length: 60 }, (_, i) => ({
    id: i, x: Math.random()*100, y: Math.random()*100,
    size: Math.random()*1.5+0.5, dur: 1.5+Math.random()*3,
    delay: Math.random()*4,
    color: ['#c4b5fd','#93c5fd','#f0abfc','#e2e8f0'][i%4],
  }))).current;

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 2300),
    ];
    let typeTimer = null;
    const startType = setTimeout(() => {
      let i = 0;
      typeTimer = setInterval(() => {
        i++;
        setTypedText(fullText.slice(0, i));
        if (i >= fullText.length) { clearInterval(typeTimer); setTypingDone(true); }
      }, 110);
    }, 400);
    const cursorTimer = setInterval(() => setShowCursor(p => !p), 500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(startType);
      if (typeTimer) clearInterval(typeTimer);
      clearInterval(cursorTimer);
    };
  }, []);

  const handleStart = () => {
    if (exiting || phase < 3) return;
    setExiting(true);
    setTimeout(onComplete, 900);
  };

  useEffect(() => {
    const onKey = (e) => { if ((e.key === 'Enter' || e.key === ' ') && phase >= 3) handleStart(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, exiting]);

  return (
    <div
      onClick={handleStart}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#000010',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: phase >= 3 ? 'pointer' : 'default',
        opacity: exiting ? 0 : 1,
        transition: exiting ? 'opacity 0.9s ease' : 'none',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes IS_twinkle { 0%,100%{opacity:.08} 50%{opacity:1} }
        @keyframes IS_scanline { 0%{top:-2px} 100%{top:100%} }
        @keyframes IS_logoIn  { from{filter:blur(24px);opacity:0;transform:scale(.65)} to{filter:blur(0);opacity:1;transform:scale(1)} }
        @keyframes IS_float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes IS_aura    { 0%,100%{opacity:.15;transform:translate(-50%,-50%) scale(1)} 50%{opacity:.5;transform:translate(-50%,-50%) scale(1.18)} }
        @keyframes IS_ray     { 0%,100%{opacity:0} 50%{opacity:.18} }
        @keyframes IS_fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes IS_press   { 0%,100%{opacity:1;box-shadow:0 0 24px rgba(168,85,247,.6)} 50%{opacity:.35;box-shadow:0 0 6px rgba(168,85,247,.1)} }
      `}</style>

      {/* Scanline */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:20 }}>
        <div style={{ position:'absolute', left:0, right:0, height:2, background:'linear-gradient(transparent,rgba(168,85,247,.25),transparent)', animation:'IS_scanline 3.5s linear infinite' }}/>
      </div>

      {/* Grid */}
      <div style={{
        position:'absolute', inset:0, zIndex:0,
        backgroundImage:'linear-gradient(rgba(59,130,246,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.05) 1px,transparent 1px)',
        backgroundSize:'48px 48px',
      }}/>

      {/* Stars */}
      <div style={{ position:'absolute', inset:0, zIndex:1, pointerEvents:'none' }}>
        {stars.map(s => (
          <div key={s.id} style={{
            position:'absolute', left:`${s.x}%`, top:`${s.y}%`,
            width:s.size, height:s.size, borderRadius:'50%', background:s.color,
            animation:`IS_twinkle ${s.dur}s ease-in-out infinite ${s.delay}s`,
          }}/>
        ))}
      </div>

      {/* Logo */}
      {phase >= 1 && (
        <div style={{ textAlign:'center', animation:'IS_logoIn 0.9s cubic-bezier(0.34,1.3,0.64,1) forwards' }}>

          {/* Aura + rays */}
          {phase >= 2 && (
            <div style={{ position:'absolute', top:'50%', left:'50%', width:0, height:0, pointerEvents:'none' }}>
              <div style={{ position:'absolute', width:360, height:200, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(139,92,246,.3) 0%,transparent 70%)', filter:'blur(24px)', animation:'IS_aura 2.8s ease-in-out infinite', transform:'translate(-50%,-50%)' }}/>
              <div style={{ position:'absolute', width:540, height:280, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(59,130,246,.15) 0%,transparent 70%)', filter:'blur(36px)', animation:'IS_aura 3.5s ease-in-out infinite 0.5s', transform:'translate(-50%,-50%)' }}/>
              {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg,i) => (
                <div key={i} style={{
                  position:'absolute', top:0, left:0, width:2, height:200,
                  background:'linear-gradient(to bottom,rgba(168,85,247,.35),transparent)',
                  transformOrigin:'top center',
                  transform:`rotate(${deg}deg)`,
                  animation:`IS_ray ${3+i*0.2}s ease-in-out infinite ${i*0.12}s`,
                }}/>
              ))}
            </div>
          )}

          {/* Logo text */}
          <div style={{ position:'relative', zIndex:10, animation: phase >= 2 ? 'IS_float 4s ease-in-out infinite' : 'none' }}>
            <h1 style={{
              fontFamily:"'Orbitron',sans-serif",
              fontSize:'clamp(3rem,9vw,5.5rem)',
              fontWeight:900, letterSpacing:'0.08em', lineHeight:1,
              margin:0, marginBottom:12,
              filter:'drop-shadow(0 0 40px rgba(168,85,247,.9)) drop-shadow(0 0 80px rgba(59,130,246,.5))',
              whiteSpace:'nowrap',
            }}>
              <span style={{ background:'linear-gradient(135deg,#a855f7,#3b82f6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                {typedText.slice(0,4)}
              </span>
              <span style={{ color:'white' }}>
                {typedText.slice(4)}
              </span>
              {!typingDone && showCursor && (
                <span style={{ color:'#a855f7', WebkitTextFillColor:'#a855f7' }}>|</span>
              )}
            </h1>

            {phase >= 2 && (
              <p style={{
                color:'#475569', fontSize:'0.68rem', letterSpacing:'0.3em',
                fontFamily:"'Space Mono',monospace", margin:0,
                marginBottom: phase >= 3 ? 40 : 0,
                animation:'IS_fadeUp 1s ease-out forwards',
              }}>
                YOUR ULTIMATE GAMING UNIVERSE
              </p>
            )}
          </div>

          {/* PRESS START */}
          {phase >= 3 && (
            <div style={{ animation:'IS_fadeUp 0.8s ease-out forwards', marginTop:8 }}>
              <button
                onClick={handleStart}
                style={{
                  background:'none', border:'2px solid #a855f7', borderRadius:8,
                  color:'#a855f7', fontSize:'0.85rem', letterSpacing:'0.25em',
                  fontWeight:700, padding:'14px 44px', cursor:'pointer',
                  fontFamily:"'Space Mono',monospace",
                  animation:'IS_press 1.1s ease-in-out infinite',
                }}
                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(168,85,247,.15)'; e.currentTarget.style.boxShadow='0 0 50px rgba(168,85,247,.6)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='none'; e.currentTarget.style.boxShadow='none'; }}
              >
                ▶ &nbsp;PRESS START
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


export default function GameHub() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('introSeen'));
  const rawgImages = useRawgImages();
  const [navHistory, setNavHistory] = useState([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen to Firebase auth state + check admin
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, 'admins', u.email));
          setIsAdmin(snap.exists());
        } catch (_) { setIsAdmin(false); }
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('introSeen', '1');
    setShowIntro(false);
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileAvatarEmoji, setMobileAvatarEmoji] = useState(null);
  const [mobileAvatarColor, setMobileAvatarColor] = useState(0);
  const [mobileAvatarPhoto, setMobileAvatarPhoto] = useState('');

  useEffect(() => {
     if (!user) { setMobileAvatarEmoji(null); setMobileAvatarColor(0); setMobileAvatarPhoto(''); return; }
    const unsub = onSnapshot(doc(db, 'avatars', user.uid), (snap) => {
      if (snap.exists()) {
        setMobileAvatarEmoji(snap.data().emoji || null);
        setMobileAvatarColor(snap.data().colorIndex ?? 0);
        setMobileAvatarPhoto(snap.data().photoURL || '');
      } else {
        setMobileAvatarEmoji(null);
        setMobileAvatarColor(0);
        setMobileAvatarPhoto('');
      }
    }, () => {});
    return () => unsub();
  }, [user]);

  const [communityTagGame, setCommunityTagGame] = useState(null);

  const navigateTo = (page, data = null) => {
    setNavHistory(prev => [...prev, { page: currentPage, game: selectedGame, category: selectedCategory, news: selectedNews }]);
    setCurrentPage(page);
    setMenuOpen(false);
    if (page === 'game-detail') setSelectedGame(data);
    else if (page === 'category') setSelectedCategory(data);
    else if (page === 'news-detail') setSelectedNews(data);
    else if (page === 'games') { setSelectedCategory(null); setSelectedGame(null); }
    else if (page === 'community') {
      if (data?.tagGame) setCommunityTagGame(data.tagGame);
      else setCommunityTagGame(null);
    }
    if (page !== 'news-detail') setSelectedNews(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (navHistory.length === 0) return;
    const prev = navHistory[navHistory.length - 1];
    setNavHistory(h => h.slice(0, -1));
    setCurrentPage(prev.page);
    setMenuOpen(false);
    if (prev.game) setSelectedGame(prev.game);
    if (prev.category) setSelectedCategory(prev.category);
    setSelectedNews(prev.news || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showIntro) return <IntroScreen onComplete={handleIntroComplete} />;

  return (
    <AuthContext.Provider value={{ user, auth, isAdmin }}>
    <RawgImagesContext.Provider value={rawgImages}>
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'Inter', 'Noto Sans', system-ui, -apple-system, sans-serif" }}>
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

        .skeleton {
          background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
          background-size: 200% 100%;
          animation: skeleton-wave 1.5s infinite;
        }
        @keyframes skeleton-wave {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

      `}</style>

      {/* ── Header ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/95 backdrop-blur-lg shadow-lg shadow-blue-500/10' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => navigateTo('home')}>
                <img
                  src="/images/games/logo.png"
                  alt="GameHub Logo"
                  className="h-8 md:h-12 w-auto object-contain"
                />
                <h1 className="text-xl md:text-2xl font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">GAME</span>
                  <span className="text-white">HUB</span>
                </h1>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-3 items-center flex-1 justify-center flex-wrap">
              {[
                { name: 'Home', icon: Home, page: 'home' },
                { name: 'Games', icon: Gamepad2, page: 'games' },
                { name: 'Tournaments', icon: Trophy, page: 'tournaments' },
                { name: 'Leaderboard', icon: Crown, page: 'leaderboard' },
                { name: 'Community', icon: Users, page: 'community' },
                { name: 'News', icon: Newspaper, page: 'news' },
                { name: 'About', icon: Info, page: 'about' },
              ].map((item) => (
                <button
                  key={item.page}
                  onClick={() => navigateTo(item.page)}
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-all duration-300 hover:text-blue-400 ${currentPage === item.page || (currentPage === 'category' && item.page === 'games') || (currentPage === 'game-detail' && item.page === 'games') ? 'text-blue-400' : 'text-slate-300'}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </button>
              ))}
              <WishlistNavButton navigateTo={navigateTo} currentPage={currentPage} />
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {isAdmin && (
                <button onClick={() => navigateTo('admin')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${currentPage === 'admin' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'text-slate-400 hover:text-yellow-400 border border-slate-700 hover:border-yellow-500/40'}`}>
                  ⚙️ Admin
                </button>
              )}
              <button onClick={() => navigateTo('about')}
                title="Help & Support"
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all border ${currentPage === 'about' ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'text-slate-400 hover:text-green-400 border-slate-700 hover:border-green-500/40'}`}>
                <HelpCircle className="w-4 h-4"/> Help
              </button>
              <AuthNavButton navigateTo={navigateTo} currentPage={currentPage} user={user} authLoading={authLoading} />
            </div>

            {/* Mobile Right: Avatar (if logged in) + Hamburger */}
            <div className="flex md:hidden items-center gap-3">
              {/* Only show avatar on mobile when logged in, login/signup goes inside menu */}
              {user && !authLoading && (
                <button
                  onClick={() => navigateTo('profile')}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                  style={mobileAvatarPhoto ? {
                    backgroundImage: `url(${mobileAvatarPhoto})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  } : { background: `linear-gradient(135deg, ${AVATAR_COLORS[mobileAvatarColor % AVATAR_COLORS.length].from}, ${AVATAR_COLORS[mobileAvatarColor % AVATAR_COLORS.length].to})` }}
                >
                  {!mobileAvatarPhoto && (mobileAvatarEmoji || (user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()))}
                </button>
              )}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex flex-col justify-center items-center w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 gap-1.5 transition-all hover:bg-slate-700"
              >
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="lg:hidden bg-slate-950/98 backdrop-blur-lg border-t border-slate-800 px-6 py-4 fade-in-up">
            <div className="flex flex-col gap-1">
              {[
                { name: 'Home', icon: Home, page: 'home' },
                { name: 'Games', icon: Gamepad2, page: 'games' },
                { name: 'Tournaments', icon: Trophy, page: 'tournaments' },
                { name: 'Leaderboard', icon: Crown, page: 'leaderboard' },
                { name: 'Community', icon: Users, page: 'community' },
                { name: 'News', icon: Newspaper, page: 'news' },
                { name: 'About', icon: Info, page: 'about' },
              ].map((item) => (
                <button
                  key={item.page}
                  onClick={() => navigateTo(item.page)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                    currentPage === item.page || (currentPage === 'category' && item.page === 'games') || (currentPage === 'game-detail' && item.page === 'games')
                      ? 'bg-blue-500/15 text-blue-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {item.name}
                </button>
              ))}
              {/* Wishlist in mobile menu */}
              <button
                onClick={() => navigateTo('wishlist')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                  currentPage === 'wishlist' ? 'bg-red-500/15 text-red-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-base">♥</span>
                Wishlist
              </button>
              {/* Admin Panel in mobile menu */}
              {isAdmin && (
                <button onClick={() => navigateTo('admin')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                    currentPage === 'admin' ? 'bg-yellow-500/15 text-yellow-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}>
                  <span className="text-base">⚙️</span>
                  Admin Panel
                </button>
              )}
              {/* Auth actions in mobile menu */}
              {!user ? (
                <div className="flex gap-3 mt-3 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => navigateTo('login')}
                    className="flex-1 py-3 rounded-xl text-sm font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                  >Login</button>
                  <button
                    onClick={() => navigateTo('register')}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-colors"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                  >Sign Up</button>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs"
                      style={mobileAvatarPhoto ? {
                        backgroundImage: `url(${mobileAvatarPhoto})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      } : { background: `linear-gradient(135deg, ${AVATAR_COLORS[mobileAvatarColor % AVATAR_COLORS.length].from}, ${AVATAR_COLORS[mobileAvatarColor % AVATAR_COLORS.length].to})` }}>
                      {!mobileAvatarPhoto && (mobileAvatarEmoji || (user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()))}
                    </div>
                    <span className="text-sm font-bold text-white">{user.displayName || user.email.split('@')[0]}</span>
                  </div>
                  <button
                    onClick={() => { signOut(auth); navigateTo('home'); }}
                    className="text-sm text-red-400 font-bold hover:text-red-300 transition-colors"
                  >Sign Out</button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content ── */}
      <main className="pt-20">
        {currentPage === 'home' && <HomePage navigateTo={navigateTo} />}
        {currentPage === 'games' && <GamesPage navigateTo={navigateTo} />}
        {currentPage === 'category' && selectedCategory && <CategoryPage category={selectedCategory} navigateTo={navigateTo} goBack={goBack} navHistory={navHistory} />}
        {currentPage === 'game-detail' && selectedGame && <GameDetailPage game={selectedGame} navigateTo={navigateTo} goBack={goBack} navHistory={navHistory} />}
        {currentPage === 'tournaments' && <TournamentsPage navigateTo={navigateTo} />}
        {currentPage === 'leaderboard' && <LeaderboardPage navigateTo={navigateTo} />}
        {currentPage === 'wishlist' && <WishlistPage navigateTo={navigateTo} />}
        {currentPage === 'community' && <CommunityPage navigateTo={navigateTo} tagGame={communityTagGame} />}
        {currentPage === 'news' && <NewsPage navigateTo={navigateTo} />}
        {currentPage === 'news-detail' && selectedNews && <NewsDetailPage news={selectedNews} navigateTo={navigateTo} goBack={goBack} />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'login' && <LoginPage navigateTo={navigateTo} />}
        {currentPage === 'register' && <RegisterPage navigateTo={navigateTo} />}
        {currentPage === 'profile' && <ProfilePage navigateTo={navigateTo} />}
        {currentPage === 'admin' && <AdminPage navigateTo={navigateTo} />}
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
    </AuthContext.Provider>
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
  const [isPaused, setIsPaused] = useState(false);
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
    if (isPaused) return;
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setHeroIndex(prev => (prev + 1) % FEATURED_GAMES.length);
        setTransitioning(false);
      }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

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
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black mb-4 leading-none pr-4 sm:pr-0" style={{ fontFamily: "'Orbitron', sans-serif" }}>
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

        {/* ── Hero Selector - right side thumbnails ── */}
        <div className="hidden sm:flex absolute right-8 top-1/2 -translate-y-1/2 z-20 flex-col gap-3">
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

        {/* Progress dots + Pause */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          <button
            onClick={() => setIsPaused(p => !p)}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 border border-white/20 transition-all"
            title={isPaused ? 'Play' : 'Pause'}
          >
            {isPaused ? (
              <svg width="10" height="12" viewBox="0 0 10 12" fill="white"><polygon points="0,0 10,6 0,12"/></svg>
            ) : (
              <svg width="10" height="12" viewBox="0 0 10 12" fill="white"><rect x="0" y="0" width="3.5" height="12"/><rect x="6.5" y="0" width="3.5" height="12"/></svg>
            )}
          </button>
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
// GAMES PAGE  - Category Grid + Search + Filter
// ─────────────────────────────────────────────

function GamesPage({ navigateTo }) {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [showSearch, setShowSearch] = useState(false);

  const platforms = ['All', 'PC', 'PS5', 'Xbox Series X', 'Mobile', 'Switch'];
  const ratings = ['All', '4.5+', '4.7+', '4.9+'];

  // If searching, show matching games directly; otherwise show category grid
  const searchResults = search.trim().length > 0
    ? GAMES_DATA.filter(g => {
        const matchSearch = g.title.toLowerCase().includes(search.toLowerCase()) ||
          g.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
        const matchPlatform = platformFilter === 'All' || g.platforms.includes(platformFilter);
        const matchRating = ratingFilter === 'All' || g.rating >= parseFloat(ratingFilter);
        return matchSearch && matchPlatform && matchRating;
      })
    : platformFilter !== 'All' || ratingFilter !== 'All'
      ? GAMES_DATA.filter(g => {
          const matchPlatform = platformFilter === 'All' || g.platforms.includes(platformFilter);
          const matchRating = ratingFilter === 'All' || g.rating >= parseFloat(ratingFilter);
          return matchPlatform && matchRating;
        })
      : null;

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="mb-10 fade-in-up">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <h2 className="text-4xl font-black mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              <span className="text-blue-400">BROWSE</span> BY GENRE
            </h2>
            <p className="text-slate-400">Select a category to explore games, subcategories, and detailed info</p>
          </div>
          {/* Search toggle button */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200"
            style={{ background: showSearch ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)', color: showSearch ? '#60a5fa' : '#94a3b8', border: '1px solid', borderColor: showSearch ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)' }}
          >
            🔍 Search & Filter
          </button>
        </div>

        {/* Search + Filter Bar */}
        {showSearch && (
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 fade-in-up space-y-4">
            {/* Search input */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search games by title or tag..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-lg">×</button>
              )}
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap gap-6">
              {/* Platform filter */}
              <div>
                <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-2">Platform</p>
                <div className="flex flex-wrap gap-2">
                  {platforms.map(p => (
                    <button
                      key={p}
                      onClick={() => setPlatformFilter(p)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        background: platformFilter === p ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                        color: platformFilter === p ? '#60a5fa' : '#64748b',
                        border: `1px solid ${platformFilter === p ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >{p}</button>
                  ))}
                </div>
              </div>
              {/* Rating filter */}
              <div>
                <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-2">Min Rating</p>
                <div className="flex flex-wrap gap-2">
                  {ratings.map(r => (
                    <button
                      key={r}
                      onClick={() => setRatingFilter(r)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        background: ratingFilter === r ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.05)',
                        color: ratingFilter === r ? '#facc15' : '#64748b',
                        border: `1px solid ${ratingFilter === r ? 'rgba(234,179,8,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >{r === 'All' ? 'All' : `★ ${r}`}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults !== null ? (
        <div>
          <p className="text-sm text-slate-500 mb-6">
            {searchResults.length > 0
              ? `Found ${searchResults.length} game${searchResults.length > 1 ? 's' : ''}`
              : 'No games found - try a different search'}
          </p>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {searchResults.map((game, i) => {
                const cat = CATEGORIES.find(c => c.id === game.category);
                return <GameCard key={game.id} game={game} index={i} navigateTo={navigateTo} accentColor={cat?.color} />;
              })}
            </div>
          ) : (
            <div className="text-center py-24 text-slate-600">
              <p className="text-6xl mb-4">🎮</p>
              <p className="text-xl font-bold">No games found</p>
              <p className="text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      ) : (
        /* Category Grid */
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
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// CATEGORY PAGE  - Subcategory filter + game list
// ─────────────────────────────────────────────

function CategoryPage({ category, navigateTo, goBack, navHistory }) {
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
            {navHistory.length > 0 && (
              <button onClick={goBack} className="breadcrumb-item hover:text-white flex items-center gap-1 mr-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
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
// GAME CARD  - shared component
// ─────────────────────────────────────────────

function GameCard({ game, index, navigateTo, accentColor = '#3b82f6' }) {
  const cat = CATEGORIES.find(c => c.id === game.category);
  const color = accentColor || cat?.color || '#3b82f6';
  const image = useGameImage(game);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      className="game-card bg-slate-900 rounded-xl overflow-hidden cursor-pointer fade-in-up"
      style={{ animationDelay: `${index * 0.05}s`, border: '1px solid rgba(255,255,255,0.05)' }}
      onClick={() => navigateTo('game-detail', game)}
    >
      <div className="relative h-52 overflow-hidden">
        {/* Skeleton shown while image loads */}
        {!imgLoaded && <div className="skeleton absolute inset-0" />}
        <img
          src={image}
          alt={game.title}
          onLoad={() => setImgLoaded(true)}
          className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
          style={{ opacity: imgLoaded ? 1 : 0 }}
        />
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

// Small card used in the "More X Games" section - needs its own hook call
function RelatedGameCard({ game, navigateTo }) {
  const image = useGameImage(game);
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className="game-card bg-slate-900 rounded-xl overflow-hidden cursor-pointer border border-slate-800 hover:border-slate-600"
      onClick={() => navigateTo('game-detail', game)}
    >
      <div className="h-28 overflow-hidden relative">
        {!loaded && <div className="skeleton absolute inset-0" />}
        <img
          src={image}
          alt={game.title}
          onLoad={() => setLoaded(true)}
          className="w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: loaded ? 1 : 0 }}
        />
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
// GAME DETAIL PAGE  - with Community Features
// ─────────────────────────────────────────────

function GameDetailPage({ game, navigateTo, goBack, navHistory }) {
  const cat = CATEGORIES.find(c => c.id === game.category);
  const color = cat?.color || '#3b82f6';
  const Icon = cat?.icon || Gamepad2;
  const heroImage = useGameImage(game);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const { user } = useAuth();

  // Wishlist state
  const [wishlist, setWishlist] = useState([]);

  // Share state
  const [shareCopied, setShareCopied] = useState(false);

  // User rating state
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (!auth.currentUser) return;
        const snap = await getDoc(doc(db, 'wishlists', auth.currentUser.uid));
        if (snap.exists()) setWishlist(snap.data().games || []);
      } catch (_) {}
    };
    load();

    // Load ratings for this game
    const loadRatings = async () => {
      try {
        const snap = await getDoc(doc(db, 'ratings', `game-${game.id}`));
        if (snap.exists()) {
          const data = snap.data();
          const ratings = data.ratings || {};
          const values = Object.values(ratings);
          if (values.length > 0) {
            setRatingCount(values.length);
            setAvgRating((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));
          }
          // Load current user's rating
          if (auth.currentUser && ratings[auth.currentUser.uid]) {
            setUserRating(ratings[auth.currentUser.uid]);
            setRatingSubmitted(true);
          }
        }
      } catch (_) {}
    };
    loadRatings();
  }, [game.id]);

  const isWishlisted = wishlist.includes(game.id);

  const toggleWishlist = async () => {
    if (!auth.currentUser) { navigateTo('login'); return; }
    const updated = isWishlisted
      ? wishlist.filter(id => id !== game.id)
      : [...wishlist, game.id];
    setWishlist(updated);
    if (auth.currentUser) {
      await setDoc(doc(db, 'wishlists', auth.currentUser.uid), { games: updated });
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}?game=${game.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }).catch(() => {
      // fallback
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  const handleRating = async (stars) => {
    if (!auth.currentUser) { navigateTo('login'); return; }
    setUserRating(stars);
    setRatingSubmitted(true);
    try {
      const ref = doc(db, 'ratings', `game-${game.id}`);
      const snap = await getDoc(ref);
      const existing = snap.exists() ? (snap.data().ratings || {}) : {};
      const updated = { ...existing, [auth.currentUser.uid]: stars };
      await setDoc(ref, { ratings: updated });
      const values = Object.values(updated);
      setRatingCount(values.length);
      setAvgRating((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));
    } catch (_) {}
  };

  // Related games
  const related = GAMES_DATA.filter(g => g.category === game.category && g.id !== game.id).slice(0, 3);


  return (
    <div className="fade-in-up">
      {/* Hero */}
      <div className="relative h-[480px] overflow-hidden">
        {!heroLoaded && <div className="skeleton absolute inset-0" />}
        <img
          src={heroImage}
          alt={game.title}
          onLoad={() => setHeroLoaded(true)}
          className="w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: heroLoaded ? 1 : 0 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-6 pb-24 sm:pb-14">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
              {navHistory.length > 0 && (
                <button onClick={goBack} className="breadcrumb-item hover:text-white flex items-center gap-1 mr-1">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button className="breadcrumb-item hover:text-blue-400" onClick={() => navigateTo('games')}>Games</button>
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <button className="breadcrumb-item" style={{ color }} onClick={() => navigateTo('category', cat)}>{cat?.label}</button>
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <span className="text-slate-300">{game.title}</span>
            </div>
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-xs font-bold px-4 py-2 rounded-full" style={{ background: `${color}dd`, color: '#fff' }}>
                  {game.subcategory}
                </span>
                {game.tags.map(tag => (
                  <span key={tag} className="tag-chip hidden sm:inline">{tag}</span>
                ))}
              </div>
              <h2 className="text-5xl font-black mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>{game.title}</h2>
              <div className="flex items-center gap-4">
                <p className="text-lg text-slate-300">{game.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: Tabbed Content ── */}
          <div className="lg:col-span-2 lg:order-1 order-2">

            <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-bold mb-5" style={{ color }}>About This Game</h3>
                  <p className="text-slate-300 text-lg leading-relaxed">{game.details}</p>
                </div>
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
                <div>
                  <h4 className="text-lg font-bold mb-4 text-slate-300">Available On</h4>
                  <div className="flex flex-wrap gap-3">
                    {game.platforms.map(p => (
                      <span key={p} className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-800 border border-slate-700 text-slate-300">{p}</span>
                    ))}
                  </div>
                </div>
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
          </div>

          {/* ── Right: Sidebar ── */}
          <div className="space-y-6 lg:order-2 order-1">
            {/* Wishlist button */}
            <button
              onClick={toggleWishlist}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: isWishlisted ? 'rgba(239,68,68,0.15)' : `${color}22`,
                color: isWishlisted ? '#f87171' : color,
                border: `2px solid ${isWishlisted ? 'rgba(239,68,68,0.4)' : `${color}44`}`,
              }}
            >
              {isWishlisted ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'}
            </button>

            {/* Store Links */}
            {(() => {
              const storeMap = {
                'Valorant':                              { steam: null, epic: 'https://www.epicgames.com/store/en-US/p/valorant', official: 'https://playvalorant.com' },
                "PUBG: PlayerUnknown's Battlegrounds":   { steam: 'https://store.steampowered.com/app/578080', epic: null, official: null },
                'Counter-Strike 2':                      { steam: 'https://store.steampowered.com/app/730', epic: null, official: null },
                "Tom Clancy's Rainbow Six Siege X":      { steam: 'https://store.steampowered.com/app/359550', epic: 'https://www.epicgames.com/store/en-US/p/rainbow-six-siege', official: null },
                'Apex Legends':                          { steam: 'https://store.steampowered.com/app/1172470', epic: 'https://www.epicgames.com/store/en-US/p/apex-legends', official: null },
                'Call of Duty: Warzone':                 { steam: null, epic: null, official: 'https://www.callofduty.com/warzone' },
                'ROV (Arena of Valor)':                  { mobileOnly: true },
                'Mobile Legends: Bang Bang':             { mobileOnly: true },
                'Dota 2':                                { steam: 'https://store.steampowered.com/app/570', epic: null, official: null },
                'League of Legends':                     { steam: null, epic: null, official: 'https://www.leagueoflegends.com' },
                'EA Sports FC 26':                       { steam: 'https://store.steampowered.com/app/3405690', epic: null, official: 'https://www.ea.com/games/ea-sports-fc' },
                'NBA 2K26':                              { steam: 'https://store.steampowered.com/app/3472040', epic: null, official: 'https://nba.2k.com' },
                'WWE 2K26':                              { steam: 'https://store.steampowered.com/app/3717070', epic: null, official: 'https://wwe.2k.com' },
                'Madden NFL 26':                         { steam: 'https://store.steampowered.com/app/3230400', epic: null, official: 'https://www.ea.com/games/madden-nfl' },
                'F1 25':                                 { steam: 'https://store.steampowered.com/app/3059520', epic: null, official: 'https://www.ea.com/games/f1' },
                'Football Manager 2026':                 { steam: 'https://store.steampowered.com/app/3551340', epic: null, official: 'https://www.footballmanager.com' },
                'Overcooked! All You Can Eat':           { steam: 'https://store.steampowered.com/app/1243830', epic: 'https://www.epicgames.com/store/en-US/p/overcooked-all-you-can-eat', official: null },
                'Gang Beasts':                           { steam: 'https://store.steampowered.com/app/285900', epic: null, official: null },
                'Among Us':                              { steam: 'https://store.steampowered.com/app/945360', epic: null, official: 'https://www.innersloth.com/games/among-us' },
                'Mario Party Superstars':                { steam: null, epic: null, official: 'https://www.nintendo.com/store/products/mario-party-superstars-switch' },
                'The Witcher 3: Wild Hunt':              { steam: 'https://store.steampowered.com/app/292030', epic: 'https://www.epicgames.com/store/en-US/p/the-witcher-3-wild-hunt', official: null },
                'Cyberpunk 2077':                        { steam: 'https://store.steampowered.com/app/1091500', epic: 'https://www.epicgames.com/store/en-US/p/cyberpunk-2077', official: null },
                'Elden Ring':                            { steam: 'https://store.steampowered.com/app/1245620', epic: null, official: null },
                'Final Fantasy XV':                      { steam: 'https://store.steampowered.com/app/637650', epic: null, official: null },
                'Civilization VI':                       { steam: 'https://store.steampowered.com/app/289070', epic: 'https://www.epicgames.com/store/en-US/p/sid-meiers-civilization-vi', official: null },
                'Age of Empires IV':                     { steam: 'https://store.steampowered.com/app/1466860', epic: null, official: 'https://www.ageofempires.com/games/age-of-empires-iv' },
                'StarCraft II':                          { steam: null, epic: null, official: 'https://starcraft2.blizzard.com' },
                'Clash of Clans':                        { mobileOnly: true },
              };
              const stores = storeMap[game.title];
              if (!stores) return null;

              // Mobile-only games: show download info instead of buttons
              const mobileOnly = stores.mobileOnly;

              const buttons = mobileOnly ? [] : [
                stores.steam    && { label: 'Steam',        url: stores.steam,    bg: '#1b2838', border: '#4a90d9', icon: '🎮' },
                stores.epic     && { label: 'Epic Games',   url: stores.epic,     bg: '#2a2a2a', border: '#0078f2', icon: '⚡' },
                stores.official && { label: 'Official Site',url: stores.official, bg: '#1a1a2e', border: color,     icon: '🌐' },
              ].filter(Boolean);

              if (buttons.length === 0 && !mobileOnly) return null;

              return (
                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 p-5">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Get This Game</h4>
                  {mobileOnly ? (
                    <div className="space-y-3">
                      <p className="text-slate-300 text-sm mb-3">This game is available on mobile. Download for free on</p>
                      <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-slate-800 border border-slate-700">
                        <span className="text-2xl">🍎</span>
                        <div>
                          <p className="font-bold text-white text-sm">App Store</p>
                          <p className="text-slate-400 text-xs">For iPhone / iPad</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-slate-800 border border-slate-700">
                        <span className="text-2xl">🤖</span>
                        <div>
                          <p className="font-bold text-white text-sm">Google Play Store</p>
                          <p className="text-slate-400 text-xs">For Android</p>
                        </div>
                      </div>
                      <p className="text-slate-500 text-xs text-center pt-1">Search the game name in your app store</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {buttons.map((btn, i) => (
                        <a key={i} href={btn.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02]"
                          style={{ background: btn.bg, border: `1.5px solid ${btn.border}55`, color: '#fff' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = btn.border}
                          onMouseLeave={e => e.currentTarget.style.borderColor = `${btn.border}55`}
                        >
                          <span className="text-lg">{btn.icon}</span>
                          <span>Play on {btn.label}</span>
                          <span className="ml-auto text-slate-400">→</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

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

            {/* Rate this game */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Rate This Game</h4>
              {avgRating && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400 font-black text-lg">★ {avgRating}</span>
                  <span className="text-xs text-slate-500">from {ratingCount} user{ratingCount !== 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="flex gap-1 mb-2">
                {[1,2,3,4,5].map(star => (
                  <button key={star}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-2xl transition-transform hover:scale-125">
                    {star <= (hoverRating || userRating) ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              {ratingSubmitted && <p className="text-xs text-green-400">Thanks for rating! ✓</p>}
            </div>

            {/* Discuss in Community */}
            <button
              onClick={() => navigateTo('community', { tagGame: game })}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border-2 border-blue-500/40 hover:border-blue-500/70 text-blue-400"
            >
              💬 Discuss in Community
            </button>

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
// LOGIN PAGE
// ─────────────────────────────────────────────

function LoginPage({ navigateTo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => { if (user) navigateTo('home'); }, [user]);

  const handleLogin = async () => {
    if (!email || !password) return setError('Please fill in all fields.');
    setLoading(true); setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigateTo('home');
    } catch (e) {
      setError(e.code === 'auth/invalid-credential' ? 'Incorrect email or password.' : e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md fade-in-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <img src="/images/games/logo.png" alt="GameHub Logo" className="h-16 w-auto object-contain mx-auto mb-4"/>
          <h2 className="text-3xl font-black" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <span className="text-blue-400">WELCOME</span> BACK
          </h2>
          <p className="text-slate-400 mt-2">Sign in to your GameHub account</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 tracking-widest uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="you@example.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 tracking-widest uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-white transition-all disabled:opacity-50 text-sm tracking-wider"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              {loading ? 'Signing in...' : 'SIGN IN'}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <button onClick={() => navigateTo('register')} className="text-blue-400 font-bold hover:underline">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// REGISTER PAGE
// ─────────────────────────────────────────────

function RegisterPage({ navigateTo }) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => { if (user) navigateTo('home'); }, [user]);

  const handleRegister = async () => {
    if (!displayName || !email || !password || !confirm) return setError('Please fill in all fields.');
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true); setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      navigateTo('home');
    } catch (e) {
      setError(e.code === 'auth/email-already-in-use' ? 'This email is already registered.' : e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md fade-in-up">
        <div className="text-center mb-10">
          <img src="/images/games/logo.png" alt="GameHub Logo" className="h-16 w-auto object-contain mx-auto mb-4"/>
          <h2 className="text-3xl font-black" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <span className="text-purple-400">JOIN</span> GAMEHUB
          </h2>
          <p className="text-slate-400 mt-2">Create your free account</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
          <div className="space-y-5">
            {[
              { label: 'Display Name', value: displayName, setter: setDisplayName, type: 'text', placeholder: 'GamerTag123' },
              { label: 'Email', value: email, setter: setEmail, type: 'email', placeholder: 'you@example.com' },
              { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: '•••••••• (min 6 chars)' },
              { label: 'Confirm Password', value: confirm, setter: setConfirm, type: 'password', placeholder: '••••••••' },
            ].map(field => (
              <div key={field.label}>
                <label className="block text-xs font-bold text-slate-400 mb-2 tracking-widest uppercase">{field.label}</label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={e => field.setter(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                  placeholder={field.placeholder}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            ))}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-white transition-all disabled:opacity-50 text-sm tracking-wider"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
            >
              {loading ? 'Creating account...' : 'CREATE ACCOUNT'}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <button onClick={() => navigateTo('login')} className="text-purple-400 font-bold hover:underline">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PROFILE PAGE
// ─────────────────────────────────────────────

const AVATAR_EMOJIS = ['🎮', '🕹️', '👾', '🏆', '⚔️', '🔥', '💀', '🎯', '🛡️', '🚀', '🐉', '⚡', '🎲', '🦊', '🤖', '👑'];
const AVATAR_COLORS = [
  { from: '#3b82f6', to: '#8b5cf6' }, // blue-purple
  { from: '#ef4444', to: '#f97316' }, // red-orange
  { from: '#10b981', to: '#06b6d4' }, // green-cyan
  { from: '#f59e0b', to: '#ef4444' }, // yellow-red
  { from: '#8b5cf6', to: '#ec4899' }, // purple-pink
  { from: '#06b6d4', to: '#3b82f6' }, // cyan-blue
  { from: '#84cc16', to: '#10b981' }, // lime-green
  { from: '#f97316', to: '#f59e0b' }, // orange-yellow
];

function ProfilePage({ navigateTo }) {
  const { user, isAdmin } = useAuth();
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Avatar state
  const [selectedEmoji, setSelectedEmoji] = useState('🎮');
  const [selectedColor, setSelectedColor] = useState(0);
  const [photoURL, setPhotoURL] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarSaved, setAvatarSaved] = useState(false);
  const fileInputRef = useRef(null);
  const [cropSrc, setCropSrc] = useState(null);
  const cropImgRef = useRef(null);
  const [cropDrag, setCropDrag] = useState(null);
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const cropAspectRatio = 1;

  useEffect(() => {
    if (!user) { navigateTo('login'); return; }
    setNewName(user.displayName || '');
    const loadData = async () => {
      try {
        // Load wishlist count
        if (auth.currentUser) {
          const snap = await getDoc(doc(db, 'wishlists', auth.currentUser.uid));
          if (snap.exists()) setWishlistCount((snap.data().games || []).length);
        }
        // Load avatar from Firestore
        if (auth.currentUser) {
          const avatarSnap = await getDoc(doc(db, 'avatars', auth.currentUser.uid));
          if (avatarSnap.exists()) {
            setSelectedEmoji(avatarSnap.data().emoji || '🎮');
            setSelectedColor(avatarSnap.data().colorIndex ?? 0);
            setPhotoURL(avatarSnap.data().photoURL || '');
          }
        }
      } catch (_) {}
    };
    loadData();
  }, [user]);

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const trimmed = newName.trim();

      // 1. Update Firebase Auth displayName
      await updateProfile(user, { displayName: trimmed });

      // 2. Batch update all posts by this user
      const postsSnap = await getDocs(query(collection(db, 'community_posts'), where('authorId', '==', user.uid)));
      if (!postsSnap.empty) {
        const batch = writeBatch(db);
        postsSnap.docs.forEach(d => batch.update(d.ref, { authorName: trimmed }));
        await batch.commit();
      }

      // 3. Batch update all comments across all posts
      const allPostsSnap = await getDocs(collection(db, 'community_posts'));
      const commentBatch = writeBatch(db);
      let commentCount = 0;
      for (const postDoc of allPostsSnap.docs) {
        const commentsSnap = await getDocs(
          query(collection(db, 'community_posts', postDoc.id, 'comments'), where('authorId', '==', user.uid))
        );
        commentsSnap.docs.forEach(d => {
          commentBatch.update(d.ref, { authorName: trimmed });
          commentCount++;
        });
      }
      if (commentCount > 0) await commentBatch.commit();

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleSaveAvatar = async () => {
    try {
      await setDoc(doc(db, 'avatars', auth.currentUser.uid), {
        emoji: selectedEmoji,
        colorIndex: selectedColor,
        photoURL,
      });
      setAvatarSaved(true);
      setShowAvatarPicker(false);
      setTimeout(() => setAvatarSaved(false), 2000);
    } catch (_) {}
  };

  const initCrop = (img) => {
    const dw = img.offsetWidth;
    const dh = img.offsetHeight;
    const targetH = dw / cropAspectRatio;
    if (targetH <= dh) {
      setCropBox({ x: 0, y: Math.round((dh - targetH) / 2), w: dw, h: Math.round(targetH) });
    } else {
      const targetW = dh * cropAspectRatio;
      setCropBox({ x: Math.round((dw - targetW) / 2), y: 0, w: Math.round(targetW), h: dh });
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
  };

  const uploadCroppedProfile = () => {
    const img = cropImgRef.current;
    if (!img) return;
    const scaleX = img.naturalWidth / img.offsetWidth;
    const scaleY = img.naturalHeight / img.offsetHeight;
    const nx = Math.round(cropBox.x * scaleX);
    const ny = Math.round(cropBox.y * scaleY);
    const nw = Math.round(cropBox.w * scaleX);
    const nh = Math.round(cropBox.h * scaleY);
    const canvas = document.createElement('canvas');
    canvas.width = nw;
    canvas.height = nh;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, nx, ny, nw, nh, 0, 0, nw, nh);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setCropSrc(null);
      setPhotoUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', blob, 'avatar.jpg');
        formData.append('upload_preset', 'GameHub');
        const res = await fetch('https://api.cloudinary.com/v1_1/dz7hage1z/image/upload', { method: 'POST', body: formData });
        const data = await res.json();
        setPhotoURL(data.secure_url || '');
      } catch {
        alert('Upload failed');
      }
      setPhotoUploading(false);
    }, 'image/jpeg', 0.95);
  };

  if (!user) return null;

  const color = AVATAR_COLORS[selectedColor];
  const joinDate = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div className="container mx-auto px-6 py-20 max-w-2xl fade-in-up">
      <h2 className="text-4xl font-black mb-10" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        <span className="text-blue-400">MY</span> PROFILE
      </h2>

      {/* Avatar + info */}
      <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 mb-6">
        <div className="flex items-center gap-6 mb-8">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl cursor-pointer hover:scale-105 transition-transform"
              style={photoURL ? {
                backgroundImage: `url(${photoURL})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : { background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            >
              {!photoURL && selectedEmoji}
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-xs cursor-pointer hover:bg-slate-600 transition-colors"
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            >✏️</div>
          </div>
          <div>
            <h3 className="text-2xl font-black">{user.displayName || 'Gamer'}</h3>
            <p className="text-slate-400 text-sm mt-1">{user.email}</p>
            <p className="text-slate-500 text-xs mt-1">Joined {joinDate}</p>
            {avatarSaved && <p className="text-green-400 text-xs mt-1 font-bold">✓ Avatar saved!</p>}
          </div>
        </div>

        {/* Avatar Picker */}
        {showAvatarPicker && (
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 mb-6 fade-in-up">
            <p className="text-xs font-bold text-slate-400 mb-3 tracking-widest uppercase">Choose Emoji</p>
            <div className="grid grid-cols-8 gap-2 mb-5">
              {AVATAR_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: selectedEmoji === emoji ? `linear-gradient(135deg, ${color.from}, ${color.to})` : 'rgba(255,255,255,0.05)',
                    border: selectedEmoji === emoji ? `2px solid ${color.from}` : '2px solid transparent',
                  }}
                >{emoji}</button>
              ))}
            </div>

            <p className="text-xs font-bold text-slate-400 mb-3 tracking-widest uppercase">Choose Color</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {AVATAR_COLORS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  className="w-8 h-8 rounded-full transition-all hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
                    border: selectedColor === i ? '3px solid white' : '3px solid transparent',
                    boxShadow: selectedColor === i ? `0 0 12px ${c.from}` : 'none',
                  }}
                />
              ))}
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3 mb-4">
              <p className="text-xs text-slate-500">Preview:</p>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={photoURL ? {
                  backgroundImage: `url(${photoURL})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                } : { background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
              >{!photoURL && selectedEmoji}</div>
            </div>

            <div className="mb-4">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
                className="w-full py-2.5 rounded-xl font-bold text-sm bg-slate-700 hover:bg-slate-600 text-slate-100 transition-colors disabled:opacity-50"
              >
                {photoUploading ? 'Uploading...' : photoURL ? 'Change Photo' : 'Upload Photo'}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveAvatar}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
                style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
              >Save Avatar</button>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-400 bg-slate-700 hover:bg-slate-600 transition-colors"
              >Cancel</button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Wishlist', value: wishlistCount, icon: '♥', color: '#f87171', page: 'wishlist' },
            { label: 'Leaderboard', value: '🏆', icon: '👑', color: '#facc15', page: 'leaderboard' },
          ].map(stat => (
            <button
              key={stat.label}
              onClick={() => navigateTo(stat.page)}
              className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-blue-500/40 transition-all text-left"
            >
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Edit display name */}
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-2 tracking-widest uppercase">Display Name</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={handleSaveName}
              disabled={saving}
              className="px-5 py-3 rounded-xl font-bold text-sm transition-all text-white"
              style={{ background: saved ? '#22c55e' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              {saved ? '✓ Saved!' : saving ? '...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={async () => { await signOut(auth); navigateTo('home'); }}
        className="w-full py-3.5 rounded-xl font-bold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
      >
        🚪 Sign Out
      </button>

      {cropSrc && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-lg flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
              <p className="font-bold text-sm">Crop Profile Photo (1:1)</p>
              <button onClick={() => { setCropSrc(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="text-slate-500 hover:text-white text-lg leading-none">✕</button>
            </div>

            <div className="p-4 overflow-auto"
              onMouseMove={e => {
                if (!cropDrag) return;
                const img = cropImgRef.current;
                if (!img) return;
                const dx = e.clientX - cropDrag.startX;
                const dy = e.clientY - cropDrag.startY;
                setCropBox(prev => ({
                  ...prev,
                  x: Math.max(0, Math.min(img.offsetWidth - prev.w, cropDrag.origX + dx)),
                  y: Math.max(0, Math.min(img.offsetHeight - prev.h, cropDrag.origY + dy)),
                }));
              }}
              onMouseUp={() => setCropDrag(null)}
              onMouseLeave={() => setCropDrag(null)}>
              <div className="relative">
                <img ref={cropImgRef} src={cropSrc} alt="crop" className="w-full block"
                  onLoad={e => initCrop(e.target)} draggable={false}/>
                {cropImgRef.current && (
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ boxShadow: `${cropBox.x}px ${cropBox.y}px 0 0 rgba(0,0,0,0.65), inset ${-(cropImgRef.current.offsetWidth - cropBox.x - cropBox.w)}px ${-(cropImgRef.current.offsetHeight - cropBox.y - cropBox.h)}px 0 0 rgba(0,0,0,0.65)` }}>
                    <div className="absolute border-2 border-white pointer-events-auto cursor-move"
                      style={{ left: cropBox.x, top: cropBox.y, width: cropBox.w, height: cropBox.h }}
                      onMouseDown={e => {
                        e.preventDefault();
                        setCropDrag({ startX: e.clientX, startY: e.clientY, origX: cropBox.x, origY: cropBox.y });
                      }}>
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                        {Array(9).fill(0).map((_, i) => <div key={i} className="border border-white/20"/>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex gap-3 flex-shrink-0 bg-slate-900">
              <p className="text-xs text-slate-500 flex items-center flex-1">Drag box to reposition</p>
              <button onClick={() => { setCropSrc(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-400 font-bold text-sm hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button onClick={uploadCroppedProfile}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors">
                Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// LEADERBOARD PAGE
// ─────────────────────────────────────────────

function LeaderboardPage({ navigateTo }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buildLeaderboard = async () => {
      try {
        const snap = await getDocs(collection(db, 'community_posts'));
        const counts = {};
        snap.docs.forEach(d => {
          const tag = d.data().gameTag;
          if (tag?.id) {
            if (!counts[tag.id]) counts[tag.id] = { game: GAMES_DATA.find(g => g.id === tag.id), posts: 0, likes: 0 };
            counts[tag.id].posts += 1;
            counts[tag.id].likes += (d.data().likes || []).length;
          }
        });
        const scores = Object.values(counts)
          .filter(e => e.game)
          .map(e => ({ ...e, score: e.posts * 3 + e.likes }))
          .sort((a, b) => b.score - a.score);
        setLeaderboard(scores);
      } catch (_) {}
      setLoading(false);
    };
    buildLeaderboard();
  }, []);

  // Top games by built-in rating as fallback
  const topRated = [...GAMES_DATA].sort((a, b) => b.rating - a.rating).slice(0, 10);

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="mb-12 fade-in-up">
        <h2 className="text-4xl font-black mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          <span className="text-yellow-400">LEADER</span>BOARD
        </h2>
        <p className="text-slate-400">Most reviewed and discussed games in the community</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Community Activity Rankings */}
        <div>
          <h3 className="text-lg font-black mb-5 flex items-center gap-2">
            <span className="text-blue-400">💬</span> Most Active Community
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="bg-slate-900 rounded-2xl p-10 border border-slate-800 text-center text-slate-500">
              <p className="text-4xl mb-3">🏆</p>
              <p className="font-bold">No community activity yet</p>
              <p className="text-sm mt-1">Be the first to review or discuss a game!</p>
              <button onClick={() => navigateTo('games')} className="mt-4 text-blue-400 text-sm font-bold hover:underline">Browse Games →</button>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, i) => {
                const cat = CATEGORIES.find(c => c.id === entry.game.category);
                const medal = ['🥇','🥈','🥉'][i] || `#${i+1}`;
                return (
                  <div
                    key={entry.game.id}
                    className="bg-slate-900 rounded-xl p-4 border border-slate-800 hover:border-blue-500/30 transition-all cursor-pointer flex items-center gap-4"
                    onClick={() => navigateTo('game-detail', entry.game)}
                  >
                    <span className="text-2xl w-8 text-center">{medal}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{entry.game.title}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span style={{ color: cat?.color }}>● {cat?.label}</span>
                        <span>💬 {entry.posts} posts</span>
                        <span>❤️ {entry.likes} likes</span>
                      </div>
                    </div>
                    {entry.posts > 0 && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-blue-400 font-black">+{entry.score}</p>
                        <p className="text-xs text-slate-500">score</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Rated by Score */}
        <div>
          <h3 className="text-lg font-black mb-5 flex items-center gap-2">
            <span className="text-yellow-400">⭐</span> Top Rated Games
          </h3>
          <div className="space-y-3">
            {topRated.map((game, i) => {
              const cat = CATEGORIES.find(c => c.id === game.category);
              const medal = ['🥇','🥈','🥉'][i] || `#${i+1}`;
              return (
                <div
                  key={game.id}
                  className="bg-slate-900 rounded-xl p-4 border border-slate-800 hover:border-yellow-500/30 transition-all cursor-pointer flex items-center gap-4"
                  onClick={() => navigateTo('game-detail', game)}
                >
                  <span className="text-2xl w-8 text-center">{medal}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{game.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: cat?.color }}>● {cat?.label} · {game.subcategory}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-yellow-400 font-black text-lg">★ {game.rating}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// WISHLIST PAGE
// ─────────────────────────────────────────────

function WishlistPage({ navigateTo }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!auth.currentUser) { setLoading(false); return; }
      const snap = await getDoc(doc(db, 'wishlists', auth.currentUser.uid));
      if (snap.exists()) setWishlist(snap.data().games || []);
      setLoading(false);
    };
    load();
  }, []);

  const removeFromWishlist = async (gameId) => {
    const updated = wishlist.filter(id => id !== gameId);
    setWishlist(updated);
    if (auth.currentUser) {
      await setDoc(doc(db, 'wishlists', auth.currentUser.uid), { games: updated });
    }
  };

  const wishlistedGames = GAMES_DATA.filter(g => wishlist.includes(g.id));

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="mb-12 fade-in-up">
        <h2 className="text-4xl font-black mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          <span className="text-red-400">MY</span> WISHLIST
        </h2>
        <p className="text-slate-400">{wishlistedGames.length} game{wishlistedGames.length !== 1 ? 's' : ''} saved</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-64 rounded-xl" />)}
        </div>
      ) : wishlistedGames.length === 0 ? (
        <div className="text-center py-32 text-slate-600">
          <p className="text-6xl mb-4">♡</p>
          <p className="text-xl font-bold">Your wishlist is empty</p>
          <p className="text-sm mt-2 mb-6">Go to any game and click "Add to Wishlist"</p>
          <button
            onClick={() => navigateTo('games')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
          >Browse Games</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {wishlistedGames.map((game, i) => {
            const cat = CATEGORIES.find(c => c.id === game.category);
            return (
              <div key={game.id} className="relative group">
                <GameCard game={game} index={i} navigateTo={navigateTo} accentColor={cat?.color} />
                <button
                  onClick={(e) => { e.stopPropagation(); removeFromWishlist(game.id); }}
                  className="absolute top-3 left-3 bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >✕ Remove</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TOURNAMENTS PAGE
// ─────────────────────────────────────────────

function TournamentsPage({ navigateTo }) {
  const [tab, setTab] = useState('join');
  const [registerModal, setRegisterModal] = useState(null);
  const [myRegistrations, setMyRegistrations] = useState({});
  const [firestoreTournaments, setFirestoreTournaments] = useState([]);
  const [tLoading, setTLoading] = useState(true);
  const { user } = useAuth();

  // Load tournaments from Firestore
  useEffect(() => {
    const q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setFirestoreTournaments(snap.docs.map(d => ({ firestoreId: d.id, ...d.data() })));
      setTLoading(false);
    }, () => setTLoading(false));
    return () => unsub();
  }, []);

  // Use only Firestore tournaments — no hardcode fallback
  const allTournaments = firestoreTournaments;

  // Number of players per game
  const teamSize = (game) => {
    if (['ROV (Arena of Valor)', 'Mobile Legends: Bang Bang', 'Valorant', 'Counter-Strike 2'].includes(game)) return 5;
    return 5;
  };

  const [form, setForm] = useState({ teamName: '', phone: '', email: '', players: [] });
  const [editRegId, setEditRegId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [formStep, setFormStep] = useState(1); // 1 = Team Info, 2 = Players

  // Load user's existing registrations (all including rejected for count)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'tournament_registrations'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const map = {};
      const rejectCounts = {};
      snap.docs.forEach(d => {
        const data = { id: d.id, ...d.data() };
        const tid = data.tournamentId;
        // Count rejects per tournament
        if (!rejectCounts[tid]) rejectCounts[tid] = 0;
        if (data.status === 'rejected') rejectCounts[tid]++;
        // Keep latest non-rejected, or latest rejected if no active
        if (!map[tid] || data.status !== 'rejected') map[tid] = data;
      });
      // Attach rejectCount to each registration
      Object.keys(map).forEach(tid => { map[tid].rejectCount = rejectCounts[tid] || 0; });
      setMyRegistrations(map);
    });
    return () => unsub();
  }, [user]);

  const handleRegister = (tournament) => {
    if (!user) { navigateTo('login'); return; }
    const size = teamSize(tournament.game);
    setForm({
      teamName: '', phone: '', email: user.email || '',
      players: Array.from({ length: size }, () => ({ realName: '', ign: '' }))
    });
    setEditRegId(null);
    setSubmitDone(false);
    setFormStep(1);
    setRegisterModal(tournament);
  };

  const handleEdit = (tournament, reg) => {
    setForm({
      teamName: reg.teamName,
      phone: reg.phone,
      email: reg.contactEmail,
      players: reg.players || Array.from({ length: teamSize(tournament.game) }, () => ({ realName: '', ign: '' }))
    });
    setEditRegId(reg.id);
    setSubmitDone(false);
    setFormStep(1);
    setRegisterModal(tournament);
  };

  const handleSubmit = async () => {
    if (!form.teamName.trim() || !form.phone.trim() || !form.email.trim()) return;
    if (form.players.some(p => !p.realName.trim() || !p.ign.trim())) return;
    setSubmitting(true);
    try {
      if (editRegId && !form._isResubmit) {
        // Edit existing pending registration
        await updateDoc(doc(db, 'tournament_registrations', editRegId), {
          teamName: form.teamName.trim(),
          phone: form.phone.trim(),
          contactEmail: form.email.trim(),
          players: form.players,
          updatedAt: serverTimestamp(),
        });
      } else {
        // New registration or resubmit after rejection
        await addDoc(collection(db, 'tournament_registrations'), {
          tournamentId: registerModal.firestoreId || registerModal.id,
          tournamentName: registerModal.name,
          userId: user.uid,
          userEmail: user.email,
          teamName: form.teamName.trim(),
          phone: form.phone.trim(),
          contactEmail: form.email.trim(),
          players: form.players,
          status: 'pending',
          createdAt: serverTimestamp(),
        });
      }
      setSubmitDone(true);
      setEditRegId(null);
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  const watchable = allTournaments.filter(t => !t.joinable);
  const joinable  = allTournaments.filter(t => t.joinable);

  const statusColor = (s) => {
    if (s === 'Registration Open') return 'bg-green-700 text-green-100';
    if (s === 'Live Now')          return 'bg-red-500/20 text-red-400';
    if (s === 'Coming Soon')       return 'bg-slate-500/20 text-slate-400';
    return 'bg-blue-500/20 text-blue-400';
  };

  return (
    <div className="container mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-10 fade-in-up">
        <h2 className="text-4xl font-black mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          <span className="text-yellow-400">TOURNAMENTS</span> & COMPETITIONS
        </h2>
        <p className="text-slate-400">Watch pro-level tournaments or join open competitions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-slate-900 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('join')}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${tab === 'join' ? 'bg-yellow-500 text-black' : 'text-slate-400 hover:text-white'}`}>
          Joinable
        </button>
        <button onClick={() => setTab('watch')}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${tab === 'watch' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}>
          Watch Only
        </button>
      </div>

      {/* JOINABLE TAB */}
      {tab === 'join' && (
        <div className="space-y-5">
          {joinable.map((t, i) => {
            const pct = Math.round((t.registered / t.maxTeams) * 100);
            const full = t.registered >= t.maxTeams;
            const myReg = myRegistrations[t.firestoreId || t.id];
            return (
              <div key={t.id} className="bg-slate-900 border-2 border-slate-800 rounded-2xl overflow-hidden hover:border-yellow-500/40 transition-all fade-in-up" style={{ animationDelay: `${i*0.08}s` }}>
                <div className="p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-400">Open Tournament</span>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-300">{t.game}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor(t.status)}`}>{t.status}</span>
                      </div>
                      <h3 className="text-xl font-black mb-2">{t.name}</h3>
                      <p className="text-slate-400 text-sm mb-4">{t.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm mb-4">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-400"/>{t.date}</span>
                        <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-purple-400"/>{t.type}</span>
                        <span className="flex items-center gap-1.5 text-slate-400">🌏 {t.region}</span>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg px-4 py-2.5 text-xs text-slate-300 mb-4 inline-block">
                        📋 {t.requirements}
                      </div>
                      {/* My registration status */}
                      {myReg && (
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold mb-3 ${
                          myReg.status === 'approved' ? 'bg-green-500/15 text-green-400 border border-green-500/30' :
                          myReg.status === 'rejected' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                          'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {myReg.status === 'approved' ? '✅ Registered' : myReg.status === 'rejected' ? `❌ Rejected (${myReg.rejectCount}/3)` : '⏳ Pending approval'}
                          {myReg.status === 'pending' && <span className="font-normal">— Team: {myReg.teamName}</span>}
                        </div>
                      )}
                      {/* Slots bar */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                          <span>Teams Registered</span>
                          <span className={full ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>{t.registered} / {t.maxTeams} teams{full ? ' — Full' : ''}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${full ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }}/>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start lg:items-end gap-3 lg:min-w-[160px]">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Prize Pool</p>
                        <p className="text-3xl font-black text-yellow-400">{t.prize}</p>
                      </div>
                      {myReg ? (
                        <div className="flex flex-col gap-2 w-full lg:w-auto">
                          {myReg.status === 'pending' && (
                            <button onClick={() => handleEdit(t, myReg)}
                              className="w-full lg:w-auto bg-slate-700 hover:bg-slate-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all">
                              ✏️ Edit Registration
                            </button>
                          )}
                          {myReg.status === 'rejected' && (
                            myReg.rejectCount >= 3 ? (
                              <div className="text-xs text-red-400 font-bold text-center px-3 py-2 bg-red-500/10 rounded-xl border border-red-500/20">
                                ⛔ Max attempts reached
                              </div>
                            ) : (
                              <button onClick={() => {
                                const size = teamSize(t.game);
                                setForm({
                                  teamName: myReg.teamName || '',
                                  phone: myReg.phone || '',
                                  email: myReg.contactEmail || user.email || '',
                                  players: myReg.players || Array.from({ length: size }, () => ({ realName: '', ign: '' })),
                                  _isResubmit: true,
                                });
                                setEditRegId(null);
                                setSubmitDone(false);
                                setRegisterModal(t);
                              }}
                                className="w-full lg:w-auto bg-yellow-500 hover:bg-yellow-400 text-black font-black px-5 py-2.5 rounded-xl text-sm transition-all">
                                🔄 Resubmit ({3 - myReg.rejectCount} left)
                              </button>
                            )
                          )}
                          {myReg.status === 'approved' && (
                            <div className="text-xs text-slate-500 text-right">Already registered</div>
                          )}
                        </div>
                      ) : t.status === 'Registration Open' && !full ? (
                        <button onClick={() => handleRegister(t)}
                          className="w-full lg:w-auto bg-yellow-500 hover:bg-yellow-400 text-black font-black px-6 py-3 rounded-xl transition-all hover:scale-105 text-sm">
                          ✍️ Join Now
                        </button>
                      ) : t.status === 'Coming Soon' ? (
                        <button className="w-full lg:w-auto bg-slate-700 text-slate-400 font-bold px-6 py-3 rounded-xl text-sm cursor-not-allowed" disabled>Coming Soon</button>
                      ) : full ? (
                        <button className="w-full lg:w-auto bg-red-900/40 text-red-400 font-bold px-6 py-3 rounded-xl text-sm cursor-not-allowed" disabled>Full</button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WATCHABLE TAB */}
      {tab === 'watch' && (
        <div className="space-y-5">
          {watchable.map((t, i) => (
            <div key={t.id} className="bg-slate-900 border-2 border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/40 transition-all fade-in-up" style={{ animationDelay: `${i*0.08}s` }}>
              <div className="p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-400">👁️ Pro / Invitational</span>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-700 text-slate-300">{t.game}</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor(t.status)}`}>{t.status}</span>
                    </div>
                    <h3 className="text-xl font-black mb-2">{t.name}</h3>
                    <p className="text-slate-400 text-sm mb-4">{t.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm mb-4">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-400"/>{t.date}</span>
                      <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-purple-400"/>{t.type}</span>
                      <span className="flex items-center gap-1.5 text-slate-400">🌏 {t.region}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start lg:items-end gap-3 lg:min-w-[160px]">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Prize Pool</p>
                      <p className="text-3xl font-black text-yellow-400">{t.prize}</p>
                    </div>
                    <div className="flex flex-col gap-2 w-full lg:w-auto">
                      {t.watchUrl && (
                        <a href={t.watchUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 text-sm">
                          📺 Watch Live
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registration Modal */}
      {registerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => !submitting && setRegisterModal(null)}>
          <div className="bg-slate-900 border border-yellow-500/40 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg flex flex-col" style={{ maxHeight: '92dvh' }} onClick={e => e.stopPropagation()}>
            {submitDone ? (
              /* Success state */
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-black mb-2 text-green-400">{editRegId ? 'Registration Updated!' : 'Registration Submitted!'}</h3>
                <p className="text-slate-400 text-sm mb-2">Your team <span className="text-white font-bold">"{form.teamName}"</span> has been {editRegId ? 'updated for' : 'registered for'}</p>
                <p className="text-yellow-400 font-bold mb-6">{registerModal.name}</p>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-sm text-slate-300">
                  ⏳ Your registration is <span className="text-yellow-400 font-bold">pending approval</span>. The admin will review and confirm within 24 hours.
                </div>
                <button onClick={() => setRegisterModal(null)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-8 py-3 rounded-xl transition-all">
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-5 pb-0 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-black">{editRegId ? 'Edit Registration' : 'Team Registration'}</h3>
                    <button onClick={() => setRegisterModal(null)} className="text-slate-500 hover:text-white text-xl leading-none">✕</button>
                  </div>
                  <p className="text-yellow-400 font-bold text-sm mb-4">{registerModal.name}</p>

                  {/* Step indicator */}
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2].map(s => (
                      <React.Fragment key={s}>
                        <div className={`flex items-center gap-1.5 text-xs font-bold ${formStep === s ? 'text-yellow-400' : formStep > s ? 'text-green-400' : 'text-slate-600'}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${formStep === s ? 'bg-yellow-500 text-black' : formStep > s ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-500'}`}>
                            {formStep > s ? '✓' : s}
                          </div>
                          {s === 1 ? 'Team Info' : 'Players'}
                        </div>
                        {s < 2 && <div className={`flex-1 h-0.5 rounded ${formStep > s ? 'bg-green-500' : 'bg-slate-700'}`}/>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Scrollable form area */}
                <div className="overflow-y-auto flex-1 px-5 pb-3">
                  {formStep === 1 ? (
                    /* Step 1: Team Info */
                    <div className="space-y-3 py-3">
                      <input value={form.teamName} onChange={e => setForm(p => ({ ...p, teamName: e.target.value }))}
                        placeholder="Team name *" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"/>
                      <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="Contact phone number *" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"/>
                      <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="Contact email *" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"/>
                    </div>
                  ) : (
                    /* Step 2: Players */
                    <div className="space-y-3 py-3">
                      <p className="text-xs text-slate-500">Enter real name and in-game name for each player</p>
                      {form.players.map((p, i) => (
                        <div key={i} className="bg-slate-800/60 rounded-xl p-3 space-y-2">
                          <p className="text-xs text-yellow-400 font-bold">Player {i + 1}{i === 0 ? ' — Captain' : ''}</p>
                          <div className="flex gap-2">
                            <input value={p.realName} onChange={e => {
                              const updated = [...form.players];
                              updated[i] = { ...updated[i], realName: e.target.value };
                              setForm(prev => ({ ...prev, players: updated }));
                            }} placeholder="Real name *" className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"/>
                            <input value={p.ign} onChange={e => {
                              const updated = [...form.players];
                              updated[i] = { ...updated[i], ign: e.target.value };
                              setForm(prev => ({ ...prev, players: updated }));
                            }} placeholder="In-game name *" className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"/>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="p-5 pt-3 border-t border-slate-800 flex gap-3 flex-shrink-0">
                  {formStep === 1 ? (
                    <>
                      <button onClick={() => setRegisterModal(null)}
                        className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-400 font-bold hover:bg-slate-700 transition-colors text-sm">
                        Cancel
                      </button>
                      <button onClick={() => setFormStep(2)} disabled={!form.teamName.trim() || !form.phone.trim() || !form.email.trim()}
                        className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black font-black transition-all text-sm">
                        Next → Players
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setFormStep(1)}
                        className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-400 font-bold hover:bg-slate-700 transition-colors text-sm">
                        ← Back
                      </button>
                      <button onClick={handleSubmit} disabled={submitting || form.players.some(p => !p.realName.trim() || !p.ign.trim())}
                        className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black font-black transition-all text-sm">
                        {submitting ? 'Submitting...' : '✍️ Submit'}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────
// COMMUNITY PAGE
// ─────────────────────────────────────────────

function CommunityPage({ navigateTo, tagGame }) {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedTag, setSelectedTag] = useState(tagGame || null);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [tagFilter, setTagFilter] = useState(null); // filter feed by game
  const [submitting, setSubmitting] = useState(false);
  const [openComments, setOpenComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const fileInputRef = useRef(null);

  // Real-time posts listener
  useEffect(() => {
    const q = query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const requireLogin = () => { navigateTo('login'); };

  const [cropSrc, setCropSrc] = useState(null);
  const cropImgRef = useRef(null);
  const [cropDrag, setCropDrag] = useState(null);
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 100, h: 100 }); // display pixels
  const [aspectRatio] = useState(16/9);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Image must be under 10MB'); return; }
    setCropSrc(URL.createObjectURL(file));
  };

  const initCrop = (img) => {
    // cropBox in display pixels
    const dw = img.offsetWidth;
    const dh = img.offsetHeight;
    const targetH = dw / aspectRatio;
    if (targetH <= dh) {
      setCropBox({ x: 0, y: Math.round((dh - targetH) / 2), w: dw, h: Math.round(targetH) });
    } else {
      const targetW = dh * aspectRatio;
      setCropBox({ x: Math.round((dw - targetW) / 2), y: 0, w: Math.round(targetW), h: dh });
    }
  };

  const uploadCropped = () => {
    const img = cropImgRef.current;
    if (!img) return;
    // Convert display pixels → natural pixels
    const scaleX = img.naturalWidth / img.offsetWidth;
    const scaleY = img.naturalHeight / img.offsetHeight;
    const nx = Math.round(cropBox.x * scaleX);
    const ny = Math.round(cropBox.y * scaleY);
    const nw = Math.round(cropBox.w * scaleX);
    const nh = Math.round(cropBox.h * scaleY);
    const canvas = document.createElement('canvas');
    canvas.width = nw;
    canvas.height = nh;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, nx, ny, nw, nh, 0, 0, nw, nh);
    canvas.toBlob(async (blob) => {
      setCropSrc(null);
      setImagePreview(URL.createObjectURL(blob));
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', blob, 'crop.jpg');
        formData.append('upload_preset', 'GameHub');
        const res = await fetch('https://api.cloudinary.com/v1_1/dz7hage1z/image/upload', { method: 'POST', body: formData });
        const data = await res.json();
        setPostImage(data.secure_url);
      } catch { alert('Upload failed'); setImagePreview(null); }
      setUploading(false);
    }, 'image/jpeg', 0.92);
  };

  const removeImage = () => {
    setImagePreview(null);
    setPostImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async () => {
    if (!user) { requireLogin(); return; }
    if (!postText.trim()) return;
    if (uploading) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'community_posts'), {
        text: postText.trim(),
        imageUrl: postImage || null,
        authorId: user.uid,
        authorName: user.displayName || user.email.split('@')[0],
        authorEmail: user.email,
        likes: [],
        gameTag: selectedTag ? { id: selectedTag.id, title: selectedTag.title } : null,
        createdAt: serverTimestamp(),
      });
      setPostText('');
      setPostImage('');
      setImagePreview(null);
      setSelectedTag(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  const handleLike = async (post) => {
    if (!user) { requireLogin(); return; }
    const ref = doc(db, 'community_posts', post.id);
    const liked = (post.likes || []).includes(user.uid);
    await updateDoc(ref, { likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid) });
  };

  const handleComment = async (postId, prefix = '') => {
    if (!user) { requireLogin(); return; }
    const text = ((commentText[postId] || '')).trim();
    if (!text) return;
    await addDoc(collection(db, 'community_posts', postId, 'comments'), {
      text,
      authorId: user.uid,
      authorName: user.displayName || user.email.split('@')[0],
      likes: [],
      replyToId: null,
      createdAt: serverTimestamp(),
    });
    setCommentText(p => ({ ...p, [postId]: '' }));
  };

  const [confirmDeletePost, setConfirmDeletePost] = useState(null); // postId

  const handleDelete = async (postId, authorId) => {
    if (!user) return;
    if (user.uid !== authorId && !isAdmin) return;
    setConfirmDeletePost(postId);
  };

  const confirmDeletePostAction = async () => {
    if (!confirmDeletePost) return;
    await deleteDoc(doc(db, 'community_posts', confirmDeletePost));
    setConfirmDeletePost(null);
  };

  const toggleComments = (postId) => {
    setOpenComments(p => ({ ...p, [postId]: !p[postId] }));
  };

  const timeAgo = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  const avatar = (name) => {
    const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6'];
    const i = (name || 'U').charCodeAt(0) % colors.length;
    return { bg: colors[i], letter: (name || 'U')[0].toUpperCase() };
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-16 max-w-2xl">

      {/* Crop Modal */}
      {cropSrc && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-lg flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* Header — fixed */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
              <p className="font-bold text-sm">Crop Image (16:9)</p>
              <button onClick={() => { setCropSrc(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="text-slate-500 hover:text-white text-lg leading-none">✕</button>
            </div>

            {/* Image area — scrollable */}
            <div className="overflow-y-auto flex-1 relative bg-black select-none"
              onMouseMove={e => {
                if (!cropDrag) return;
                const img = cropImgRef.current;
                if (!img) return;
                const dx = e.clientX - cropDrag.startX;
                const dy = e.clientY - cropDrag.startY;
                setCropBox(prev => ({
                  ...prev,
                  x: Math.max(0, Math.min(img.offsetWidth - prev.w, cropDrag.origX + dx)),
                  y: Math.max(0, Math.min(img.offsetHeight - prev.h, cropDrag.origY + dy)),
                }));
              }}
              onMouseUp={() => setCropDrag(null)}
              onMouseLeave={() => setCropDrag(null)}>
              <div className="relative">
                <img ref={cropImgRef} src={cropSrc} alt="crop" className="w-full block"
                  onLoad={e => initCrop(e.target)} draggable={false}/>
                {cropImgRef.current && (
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ boxShadow: `${cropBox.x}px ${cropBox.y}px 0 0 rgba(0,0,0,0.65), inset ${-(cropImgRef.current.offsetWidth - cropBox.x - cropBox.w)}px ${-(cropImgRef.current.offsetHeight - cropBox.y - cropBox.h)}px 0 0 rgba(0,0,0,0.65)` }}>
                    <div className="absolute border-2 border-white pointer-events-auto cursor-move"
                      style={{ left: cropBox.x, top: cropBox.y, width: cropBox.w, height: cropBox.h }}
                      onMouseDown={e => {
                        e.preventDefault();
                        setCropDrag({ startX: e.clientX, startY: e.clientY, origX: cropBox.x, origY: cropBox.y });
                      }}>
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                        {Array(9).fill(0).map((_,i) => <div key={i} className="border border-white/20"/>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons — fixed at bottom */}
            <div className="p-4 border-t border-slate-800 flex gap-3 flex-shrink-0 bg-slate-900">
              <p className="text-xs text-slate-500 flex items-center flex-1">Drag box to reposition</p>
              <button onClick={() => { setCropSrc(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-400 font-bold text-sm hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button onClick={uploadCropped}
                className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-colors">
                ✂️ Crop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Post Dialog */}
      {confirmDeletePost && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setConfirmDeletePost(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-72 shadow-2xl" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-bold text-white mb-1">Delete this post?</p>
            <p className="text-xs text-slate-400 mb-5">This will permanently delete the post and all its comments.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeletePost(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold py-2 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={confirmDeletePostAction}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm font-bold py-2 rounded-xl transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-8 fade-in-up">
        <h2 className="text-4xl font-black mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          <span className="text-purple-400">COMMUNITY</span>
        </h2>
        <p className="text-slate-400">A space for all gamers — share thoughts, ask questions, and talk games</p>
      </div>

      {/* Create Post */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 mb-6 fade-in-up">
        {user ? (
          <>
            <div className="flex gap-3 mb-3">
              <UserAvatar uid={user.uid} name={user.displayName || user.email} db={db} />
              <textarea
                value={postText}
                onChange={e => setPostText(e.target.value)}
                placeholder="Share something with the community..."
                rows={3}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Image preview */}
            {imagePreview && (
              <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-700">
                <img src={imagePreview} alt="preview" className="w-full max-h-56 object-cover"/>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-sm font-bold animate-pulse">Uploading...</div>
                  </div>
                )}
                {!uploading && (
                  <button onClick={removeImage}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full text-white text-xs flex items-center justify-center transition-colors">
                    ✕
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden"/>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-400 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 px-3 py-2 rounded-lg transition-all border border-slate-700">
                🖼️ {imagePreview ? 'Change' : 'Add Image'}
              </button>

              {/* Game Tag Picker */}
              <div className="relative">
                <button onClick={() => setShowTagPicker(!showTagPicker)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all border ${selectedTag ? 'text-blue-400 bg-blue-500/10 border-blue-500/40' : 'text-slate-400 bg-slate-800 border-slate-700 hover:text-blue-400'}`}>
                  🎮 {selectedTag ? selectedTag.title : 'Tag Game'}
                  {selectedTag && <span onClick={e => { e.stopPropagation(); setSelectedTag(null); }} className="ml-1 hover:text-red-400">✕</span>}
                </button>
                {showTagPicker && (
                  <div className="absolute bottom-10 left-0 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden">
                    <div className="max-h-48 overflow-y-auto py-1">
                      {GAMES_DATA.map(g => (
                        <button key={g.id} onClick={() => { setSelectedTag(g); setShowTagPicker(false); }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors truncate">
                          {g.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1"/>
              <button onClick={handlePost}
                disabled={submitting || uploading || !postText.trim()}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-5 py-2 rounded-lg text-sm transition-all">
                {uploading ? 'Uploading...' : submitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-400 mb-3 text-sm">Sign in to post and participate in the community</p>
            <button onClick={requireLogin}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all">
              🔐 Sign In
            </button>
          </div>
        )}
      </div>

      {/* Filter bar */}
      {tagFilter && (
        <div className="flex items-center gap-2 mb-4 px-1">
          <span className="text-xs text-slate-400">Showing posts tagged:</span>
          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-1 rounded-full">🎮 {tagFilter.title}</span>
          <button onClick={() => setTagFilter(null)} className="text-xs text-slate-600 hover:text-slate-400 ml-auto">✕ Clear filter</button>
        </div>
      )}

      {/* Posts Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="bg-slate-900 rounded-2xl p-5 animate-pulse h-32"/>)}
        </div>
      ) : posts.filter(p => !tagFilter || p.gameTag?.id === tagFilter.id).length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-bold">{tagFilter ? `No posts about ${tagFilter.title} yet` : 'No posts yet'}</p>
          <p className="text-sm">Be the first to post in the community!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.filter(p => !tagFilter || p.gameTag?.id === tagFilter.id).map(post => {
            return (
              <PostCard key={post.id} post={post} user={user} isAdmin={isAdmin} openComments={openComments}
                commentText={commentText} setCommentText={setCommentText}
                onLike={handleLike} onComment={handleComment} onDelete={handleDelete}
                onToggleComments={toggleComments} onRequireLogin={requireLogin}
                timeAgo={timeAgo} db={db} navigateTo={navigateTo}
                onTagClick={(tag) => setTagFilter(tag)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// Avatar display using Firestore emoji+color (same as ProfilePage)
function UserAvatar({ uid, name, size = 'md', db }) {
  const [emoji, setEmoji] = useState(null);
  const [colorIdx, setColorIdx] = useState(0);
  const [photoURL, setPhotoURL] = useState('');

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'avatars', uid), (snap) => {
      if (snap.exists()) {
        setEmoji(snap.data().emoji || null);
        setColorIdx(snap.data().colorIndex ?? 0);
        setPhotoURL(snap.data().photoURL || '');
      }
    }, () => {});
    return () => unsub();
  }, [uid]);

  const color = AVATAR_COLORS[colorIdx % AVATAR_COLORS.length];
  const fallbackLetter = (name || 'U')[0].toUpperCase();
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm';

  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={photoURL ? {
        backgroundImage: `url(${photoURL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : { background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}>
      {!photoURL && (emoji || fallbackLetter)}
    </div>
  );
}

function PostCard({ post, user, isAdmin, openComments, commentText, setCommentText, onLike, onComment, onDelete, onToggleComments, onRequireLogin, timeAgo, db, navigateTo, onTagClick, onEdit }) {
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [editImageUrl, setEditImageUrl] = useState(post.imageUrl || '');
  const [editImagePreview, setEditImagePreview] = useState(post.imageUrl || null);
  const [editUploading, setEditUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const editFileRef = useRef(null);

  const liked = user && (post.likes || []).includes(user.uid);
  const likeCount = (post.likes || []).length;
  const isOwner = user && user.uid === post.authorId;
  const canDelete = isOwner || isAdmin;
  const canEdit = isOwner;

  const handleEditFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditImagePreview(URL.createObjectURL(file));
    setEditUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'GameHub');
      const res = await fetch('https://api.cloudinary.com/v1_1/dz7hage1z/image/upload', { method: 'POST', body: formData });
      const data = await res.json();
      setEditImageUrl(data.secure_url);
    } catch { alert('Upload failed'); }
    setEditUploading(false);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    await updateDoc(doc(db, 'community_posts', post.id), {
      text: editText.trim(),
      imageUrl: editImageUrl || null,
    });
    setSaving(false);
    setEditing(false);
  };

  useEffect(() => {
    const q = query(collection(db, 'community_posts', post.id, 'comments'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCommentCount(snap.size);
    }, () => {});
    return () => unsub();
  }, [post.id]);

  const [confirmDelete, setConfirmDelete] = useState(null); // commentId to delete

  const handleDeleteComment = async (commentId) => {
    if (!user) return;
    await deleteDoc(doc(db, 'community_posts', post.id, 'comments', commentId));
    setConfirmDelete(null);
  };

  const handleLikeComment = async (c) => {
    if (!user) { onRequireLogin(); return; }
    const ref = doc(db, 'community_posts', post.id, 'comments', c.id);
    const liked = (c.likes || []).includes(user.uid);
    await updateDoc(ref, { likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid) });
  };

  const handleSendComment = async () => {
    if (!user) { onRequireLogin(); return; }
    const text = (commentText[post.id] || '').trim();
    if (!text) return;
    await addDoc(collection(db, 'community_posts', post.id, 'comments'), {
      text,
      authorId: user.uid,
      authorName: user ? (user.displayName || user.email.split('@')[0]) : 'User',
      likes: [],
      replyToId: replyTo ? replyTo.id : null,
      createdAt: serverTimestamp(),
    });
    setCommentText(p => ({ ...p, [post.id]: '' }));
    setReplyTo(null);
  };

  const currentInput = commentText[post.id] || '';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden fade-in-up hover:border-slate-700 transition-colors">
      <div className="p-5">
        {/* Author */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <UserAvatar uid={post.authorId} name={post.authorName} db={db} />
            <div>
              <p className="font-bold text-sm">{post.authorName}</p>
              <p className="text-xs text-slate-500">{timeAgo(post.createdAt)}</p>
            </div>
          </div>
          {(canEdit || canDelete) && (
            <div className="flex items-center gap-1">
              {canEdit && (
                <button onClick={() => { setEditing(true); setEditText(post.text); }}
                  className="text-slate-600 hover:text-blue-400 text-sm transition-colors px-1 py-1 rounded">
                  ✏️
                </button>
              )}
              {canDelete && (
                <button onClick={() => onDelete(post.id, post.authorId)}
                  className="text-slate-600 hover:text-red-400 text-sm transition-colors px-1 py-1 rounded">
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {post.gameTag && (
          <button onClick={() => onTagClick ? onTagClick(post.gameTag) : null}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-2.5 py-1 rounded-full mb-3 transition-colors">
            🎮 {post.gameTag.title}
          </button>
        )}
        {editing ? (
          <div className="mb-3">
            <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3}
              className="w-full bg-slate-800 border border-blue-500/50 rounded-xl px-4 py-3 text-sm text-slate-100 resize-none focus:outline-none transition-colors mb-2"/>
            {/* Edit image section */}
            <input ref={editFileRef} type="file" accept="image/*" onChange={handleEditFileSelect} className="hidden"/>
            {editImagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 mb-2">
                <img src={editImagePreview} alt="preview" className="w-full max-h-48 object-cover"/>
                {editUploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white text-xs animate-pulse">Uploading...</span></div>}
                <button onClick={() => { setEditImagePreview(null); setEditImageUrl(''); }}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full text-white text-xs flex items-center justify-center">✕</button>
              </div>
            ) : (
              <button onClick={() => editFileRef.current?.click()}
                className="text-xs text-slate-500 hover:text-purple-400 flex items-center gap-1 mb-2 transition-colors">
                🖼️ Add / Change image
              </button>
            )}
            <div className="flex gap-2">
              <button onClick={() => { setEditing(false); setEditText(post.text); setEditImageUrl(post.imageUrl||''); setEditImagePreview(post.imageUrl||null); }}
                className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-lg bg-slate-800 transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={saving || editUploading || !editText.trim()}
                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 px-4 py-1.5 rounded-lg transition-colors">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-slate-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.text}</p>
        )}
        {!editing && post.imageUrl && (
          <img src={post.imageUrl} alt="" className="w-full rounded-xl object-cover max-h-80 mb-3"
            onError={e => e.target.style.display='none'}/>
        )}

        {/* Actions */}
        <div className="flex items-center gap-5 pt-2 border-t border-slate-800">
          <button onClick={() => onLike(post)}
            className={`flex items-center gap-1.5 text-sm font-bold transition-all hover:scale-110 ${liked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'}`}>
            {liked ? '❤️' : '🤍'} <span>{likeCount > 0 ? likeCount : ''}</span>
          </button>
          <button onClick={() => onToggleComments(post.id)}
            className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${openComments[post.id] ? 'text-blue-400' : 'text-slate-500 hover:text-blue-400'}`}>
            💬 <span>{commentCount > 0 ? commentCount : 'Comments'}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {openComments[post.id] && (
        <div className="border-t border-slate-800 bg-slate-950/50 px-5 py-4">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-600 mb-3">No comments yet — be the first!</p>
          ) : (
            <div className="space-y-3 mb-4">
              {comments.filter(c => !c.replyToId || c.replyToId === null || c.replyToId === undefined).map(c => {
                const replies = comments.filter(r => r.replyToId === c.id);
                const cLiked = user && (c.likes || []).includes(user.uid);
                const cLikeCount = (c.likes || []).length;
                return (
                  <div key={c.id}>
                    {/* Main comment */}
                    <div className="flex gap-2.5">
                      <UserAvatar uid={c.authorId} name={c.authorName} size="sm" db={db} />
                      <div className="flex-1">
                        <div className="bg-slate-800 rounded-xl px-3 py-2 relative">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-slate-300 mb-0.5">{c.authorName}</p>
                            {user && (user.uid === c.authorId || isAdmin) && (
                              <button onClick={() => setConfirmDelete(c.id)}
                                className="text-slate-600 hover:text-red-400 text-xs transition-colors flex-shrink-0 leading-none">
                                🗑️
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 whitespace-pre-wrap">{c.text}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-1 ml-1">
                          <button onClick={() => handleLikeComment(c)}
                            className={`text-xs font-bold transition-colors ${cLiked ? 'text-red-400' : 'text-slate-600 hover:text-red-400'}`}>
                            {cLiked ? '❤️' : '♡'} {cLikeCount > 0 ? cLikeCount : ''}
                          </button>
                          {user && (
                            <button onClick={() => {
                              setReplyTo({ id: c.id, name: c.authorName });
                              setCommentText(p => ({ ...p, [post.id]: `@${c.authorName} ` }));
                            }} className="text-xs text-slate-600 hover:text-blue-400 font-bold transition-colors">
                              Reply
                            </button>
                          )}
                          <span className="text-xs text-slate-700">{timeAgo(c.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Nested replies */}
                    {replies.length > 0 && (
                      <div className="ml-9 mt-2 space-y-2 border-l-2 border-slate-800 pl-3">
                        {replies.map(r => {
                          const rLiked = user && (r.likes || []).includes(user.uid);
                          const rLikeCount = (r.likes || []).length;
                          return (
                            <div key={r.id} className="flex gap-2">
                              <UserAvatar uid={r.authorId} name={r.authorName} size="sm" db={db} />
                              <div className="flex-1">
                                <div className="bg-slate-800/70 rounded-xl px-3 py-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs font-bold text-slate-300 mb-0.5">{r.authorName}</p>
                                    {user && (user.uid === r.authorId || isAdmin) && (
                                      <button onClick={() => setConfirmDelete(r.id)}
                                        className="text-slate-600 hover:text-red-400 text-xs transition-colors flex-shrink-0 leading-none">
                                        🗑️
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-400 whitespace-pre-wrap">{r.text}</p>
                                </div>
                                <div className="flex items-center gap-3 mt-1 ml-1">
                                  <button onClick={() => handleLikeComment(r)}
                                    className={`text-xs font-bold transition-colors ${rLiked ? 'text-red-400' : 'text-slate-600 hover:text-red-400'}`}>
                                    {rLiked ? '❤️' : '♡'} {rLikeCount > 0 ? rLikeCount : ''}
                                  </button>
                                  {user && (
                                    <button onClick={() => {
                                      setReplyTo({ id: c.id, name: r.authorName });
                                      setCommentText(p => ({ ...p, [post.id]: `@${r.authorName} ` }));
                                    }} className="text-xs text-slate-600 hover:text-blue-400 font-bold transition-colors">
                                      Reply
                                    </button>
                                  )}
                                  <span className="text-xs text-slate-700">{timeAgo(r.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Confirm Delete Dialog */}
          {confirmDelete && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setConfirmDelete(null)}>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-72 shadow-2xl" onClick={e => e.stopPropagation()}>
                <p className="text-sm font-bold text-white mb-1">Delete comment?</p>
                <p className="text-xs text-slate-400 mb-5">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmDelete(null)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold py-2 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => handleDeleteComment(confirmDelete)}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm font-bold py-2 rounded-xl transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reply indicator */}
          {replyTo && (
            <div className="flex items-center gap-2 bg-slate-800/60 rounded-lg px-3 py-1.5 mb-2 text-xs text-slate-400">
              <span>↩️ Replying to <span className="text-blue-400 font-bold">@{replyTo.name}</span></span>
              <button onClick={() => { setReplyTo(null); setCommentText(p => ({ ...p, [post.id]: '' })); }}
                className="ml-auto text-slate-600 hover:text-slate-400">✕</button>
            </div>
          )}

          {user ? (
            <div className="flex gap-2">
              <input
                value={currentInput}
                onChange={e => setCommentText(p => ({ ...p, [post.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                placeholder={replyTo ? `Reply to @${replyTo.name}...` : 'Write a comment...'}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button onClick={handleSendComment}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                Send
              </button>
            </div>
          ) : (
            <button onClick={onRequireLogin}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              Sign in to comment
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// NEWS PAGE
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// ADMIN PAGE
// ─────────────────────────────────────────────

function AdminPage({ navigateTo }) {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('registrations');

  // Registrations state
  const [registrations, setRegistrations] = useState([]);
  const [regLoading, setRegLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  // Tournament management state
  const [tournaments, setTournaments] = useState([]);
  const [tLoading, setTLoading] = useState(true);
  const [showTForm, setShowTForm] = useState(false);
  const [tForm, setTForm] = useState({
    name: '', game: '', date: '', prize: '', type: 'Online',
    region: 'Southeast Asia', description: '', requirements: '',
    maxTeams: 32, joinable: true, status: 'Registration Open', watchUrl: '',
  });
  const [tSaving, setTSaving] = useState(false);
  const [editTId, setEditTId] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'tournament_registrations'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setRegistrations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setRegLoading(false);
    });
    return () => unsub();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setTournaments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTLoading(false);
    });
    return () => unsub();
  }, [isAdmin]);

  const handleAction = async (regId, action) => {
    await updateDoc(doc(db, 'tournament_registrations', regId), { status: action });
  };

  const resetTForm = () => {
    setTForm({ name: '', game: '', date: '', prize: '', type: 'Online', region: 'Southeast Asia', description: '', requirements: '', maxTeams: 32, joinable: true, status: 'Registration Open', watchUrl: '' });
    setEditTId(null);
    setShowTForm(false);
  };

  const handleSaveTournament = async () => {
    if (!tForm.name.trim() || !tForm.game.trim() || !tForm.date.trim()) return;
    setTSaving(true);
    try {
      const data = {
        ...tForm,
        maxTeams: Number(tForm.maxTeams),
        registered: editTId ? undefined : 0,
        createdAt: editTId ? undefined : serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (!editTId) { data.registered = 0; }
      // remove undefined
      Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);
      if (editTId) {
        await updateDoc(doc(db, 'tournaments', editTId), data);
      } else {
        await addDoc(collection(db, 'tournaments'), data);
      }
      resetTForm();
    } catch (e) { console.error(e); }
    setTSaving(false);
  };

  const handleEditTournament = (t) => {
    setTForm({
      name: t.name, game: t.game, date: t.date, prize: t.prize,
      type: t.type, region: t.region, description: t.description,
      requirements: t.requirements || '', maxTeams: t.maxTeams,
      joinable: t.joinable, status: t.status, watchUrl: t.watchUrl || '',
    });
    setEditTId(t.id);
    setShowTForm(true);
  };

  const handleDeleteTournament = async (id) => {
    if (!window.confirm('Delete this tournament?')) return;
    await deleteDoc(doc(db, 'tournaments', id));
  };

  if (!user) return <div className="container mx-auto px-6 py-20 text-center"><p className="text-slate-400">Please sign in.</p></div>;
  if (!isAdmin) return <div className="container mx-auto px-6 py-20 text-center"><p className="text-4xl mb-4">🚫</p><p className="text-slate-400">No permission.</p></div>;

  const filtered = registrations.filter(r => filter === 'all' || r.status === filter);

  return (
    <div className="container mx-auto px-6 py-16 max-w-5xl">
      <div className="mb-8">
        <h2 className="text-3xl font-black mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          <span className="text-yellow-400">ADMIN</span> PANEL
        </h2>
      </div>

      {/* Admin tabs */}
      <div className="flex gap-2 mb-8 bg-slate-900 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab('registrations')}
          className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'registrations' ? 'bg-yellow-500 text-black' : 'text-slate-400 hover:text-white'}`}>
          📋 Registrations
        </button>
        <button onClick={() => setActiveTab('tournaments')}
          className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'tournaments' ? 'bg-yellow-500 text-black' : 'text-slate-400 hover:text-white'}`}>
          🏆 Tournaments
        </button>
      </div>

      {/* ── REGISTRATIONS TAB ── */}
      {activeTab === 'registrations' && (
        <>
          <div className="flex gap-2 mb-6 bg-slate-900 p-1 rounded-xl w-fit">
            {[{ key: 'pending', label: '⏳ Pending' }, { key: 'approved', label: '✅ Approved' }, { key: 'rejected', label: '❌ Rejected' }, { key: 'all', label: 'All' }].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${filter === f.key ? 'bg-yellow-500 text-black' : 'text-slate-400 hover:text-white'}`}>
                {f.label} <span className="ml-1 opacity-60">({registrations.filter(r => f.key === 'all' || r.status === f.key).length})</span>
              </button>
            ))}
          </div>
          {regLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-xl"/>)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500"><p className="text-3xl mb-3">📋</p><p>No {filter} registrations</p></div>
          ) : (
            <div className="space-y-4">
              {filtered.map(reg => (
                <div key={reg.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${reg.status === 'approved' ? 'bg-green-500/20 text-green-400' : reg.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {reg.status === 'approved' ? '✅ Approved' : reg.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                        </span>
                        <span className="text-xs text-slate-500">{reg.tournamentName}</span>
                      </div>
                      <p className="font-black text-lg mb-1">🏆 {reg.teamName}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-3">
                        <span>📧 {reg.contactEmail}</span>
                        <span>📞 {reg.phone}</span>
                        <span>👤 {reg.userEmail}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(reg.players || []).map((p, i) => (
                          <div key={i} className="bg-slate-800 rounded-lg px-3 py-2 text-xs">
                            <p className="text-slate-500 mb-0.5">Player {i+1}{i===0?' (Captain)':''}</p>
                            <p className="font-bold text-white">{p.realName}</p>
                            <p className="text-purple-400">{p.ign}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {reg.status === 'pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handleAction(reg.id, 'rejected')} className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-400 font-bold text-sm transition-colors border border-red-600/30">❌ Reject</button>
                        <button onClick={() => handleAction(reg.id, 'approved')} className="px-4 py-2 rounded-xl bg-green-600/20 hover:bg-green-600/40 text-green-400 font-bold text-sm transition-colors border border-green-600/30">✅ Approve</button>
                      </div>
                    )}
                    {reg.status === 'approved' && (
                      <button onClick={() => handleAction(reg.id, 'rejected')} className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-400 font-bold text-xs transition-colors flex-shrink-0">Revoke</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── TOURNAMENTS TAB ── */}
      {activeTab === 'tournaments' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-400 text-sm">{tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''}</p>
            <button onClick={() => { resetTForm(); setShowTForm(true); }}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-5 py-2.5 rounded-xl text-sm transition-all">
              + Create Tournament
            </button>
          </div>

          {/* Create/Edit Form */}
          {showTForm && (
            <div className="bg-slate-900 border border-yellow-500/40 rounded-2xl p-6 mb-6">
              <h3 className="font-black text-lg mb-5">{editTId ? '✏️ Edit Tournament' : '+ New Tournament'}</h3>

              {/* Style shared across all inputs */}
              <style>{`.tf-input { width:100%; background:#1e293b; border:1px solid #334155; border-radius:10px; padding:10px 14px; font-size:14px; color:#f1f5f9; outline:none; transition:border-color .2s; }
              .tf-input:focus { border-color:#eab308; }
              .tf-label { font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px; display:block; }`}</style>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                {/* Tournament Name */}
                <div className="sm:col-span-2">
                  <label className="tf-label">Tournament Name *</label>
                  <input value={tForm.name} onChange={e => setTForm(p=>({...p,name:e.target.value}))}
                    placeholder="e.g. GameHub Valorant Cup Season 1" className="tf-input"/>
                </div>

                {/* Game - dropdown from GAMES_DATA */}
                <div>
                  <label className="tf-label">Game *</label>
                  <select value={tForm.game} onChange={e => setTForm(p=>({...p,game:e.target.value}))} className="tf-input">
                    <option value="">— Select game —</option>
                    {GAMES_DATA.map(g => <option key={g.id} value={g.title}>{g.title}</option>)}
                  </select>
                </div>

                {/* Platform */}
                <div>
                  <label className="tf-label">Platform</label>
                  <select value={tForm.platform || ''} onChange={e => setTForm(p=>({...p,platform:e.target.value}))} className="tf-input">
                    <option value="">— Select platform —</option>
                    <option>PC</option>
                    <option>Mobile</option>
                    <option>PC / Mobile</option>
                    <option>Console</option>
                  </select>
                </div>

                {/* Date picker */}
                <div>
                  <label className="tf-label">Start Date *</label>
                  <input type="date" value={tForm.dateRaw || ''} onChange={e => {
                    const d = new Date(e.target.value);
                    const formatted = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                    setTForm(p=>({...p, dateRaw: e.target.value, date: formatted}));
                  }} className="tf-input" style={{ colorScheme: 'dark' }}/>
                </div>

                {/* End Date */}
                <div>
                  <label className="tf-label">End Date (optional)</label>
                  <input type="date" value={tForm.dateEndRaw || ''} onChange={e => {
                    const d = new Date(e.target.value);
                    const formatted = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                    setTForm(p=>({...p, dateEndRaw: e.target.value, dateEnd: formatted}));
                  }} className="tf-input" style={{ colorScheme: 'dark' }}/>
                </div>

                {/* Prize */}
                <div>
                  <label className="tf-label">Prize Pool</label>
                  <input value={tForm.prize} onChange={e => setTForm(p=>({...p,prize:e.target.value}))}
                    placeholder="e.g. $500 or ฿5,000" className="tf-input"/>
                </div>

                {/* Max Teams */}
                <div>
                  <label className="tf-label">Max Teams</label>
                  <select value={tForm.maxTeams} onChange={e => setTForm(p=>({...p,maxTeams:Number(e.target.value)}))} className="tf-input">
                    {[8,16,32,64,128].map(n => <option key={n} value={n}>{n} teams</option>)}
                  </select>
                </div>

                {/* Region */}
                <div>
                  <label className="tf-label">Region</label>
                  <select value={tForm.region} onChange={e => setTForm(p=>({...p,region:e.target.value}))} className="tf-input">
                    <option>Southeast Asia</option>
                    <option>Thailand</option>
                    <option>Asia-Pacific</option>
                    <option>International</option>
                    <option>North America</option>
                    <option>Europe</option>
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="tf-label">Tournament Type</label>
                  <select value={tForm.type} onChange={e => setTForm(p=>({...p,type:e.target.value}))} className="tf-input">
                    <option>Online</option>
                    <option>LAN</option>
                    <option>LAN Finals</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="tf-label">Status</label>
                  <select value={tForm.status} onChange={e => setTForm(p=>({...p,status:e.target.value}))} className="tf-input">
                    <option>Registration Open</option>
                    <option>Coming Soon</option>
                    <option>Live Now</option>
                    <option>Upcoming</option>
                    <option>Ended</option>
                  </select>
                </div>

                {/* Joinable toggle */}
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer bg-slate-800 rounded-xl px-4 py-3 border border-slate-700">
                    <div onClick={() => setTForm(p=>({...p,joinable:!p.joinable}))}
                      className={`w-10 h-6 rounded-full transition-colors flex items-center ${tForm.joinable ? 'bg-yellow-500' : 'bg-slate-600'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${tForm.joinable ? 'translate-x-4' : 'translate-x-0'}`}/>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{tForm.joinable ? 'Open for Registration' : 'Watch Only'}</p>
                      <p className="text-xs text-slate-400">{tForm.joinable ? 'Users can join and register their team' : 'Spectator/pro tournament — no public registration'}</p>
                    </div>
                  </label>
                </div>

                {/* Watch URL if not joinable */}
                {!tForm.joinable && (
                  <div className="sm:col-span-2">
                    <label className="tf-label">Watch URL (Twitch / YouTube)</label>
                    <input value={tForm.watchUrl} onChange={e => setTForm(p=>({...p,watchUrl:e.target.value}))}
                      placeholder="https://twitch.tv/..." className="tf-input"/>
                  </div>
                )}

                {/* Requirements */}
                <div className="sm:col-span-2">
                  <label className="tf-label">Requirements</label>
                  <input value={tForm.requirements} onChange={e => setTForm(p=>({...p,requirements:e.target.value}))}
                    placeholder="e.g. 5-player team • Gold+ rank • PC only" className="tf-input"/>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="tf-label">Description</label>
                  <textarea value={tForm.description} onChange={e => setTForm(p=>({...p,description:e.target.value}))}
                    placeholder="Describe the tournament..." rows={3}
                    className="tf-input" style={{ resize: 'vertical' }}/>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={resetTForm} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-400 font-bold text-sm hover:bg-slate-700 transition-colors">Cancel</button>
                <button onClick={handleSaveTournament} disabled={tSaving || !tForm.name.trim() || !tForm.game.trim() || !tForm.date.trim()}
                  className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black font-black text-sm transition-all">
                  {tSaving ? 'Saving...' : editTId ? 'Save Changes' : '🏆 Create Tournament'}
                </button>
              </div>
            </div>
          )}

          {/* Tournament list */}
          {tLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl"/>)}</div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p className="text-3xl mb-3">🏆</p>
              <p>No tournaments yet — create your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tournaments.map(t => (
                <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.joinable ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {t.joinable ? '🎮 Joinable' : '👁️ Watch Only'}
                      </span>
                      <span className="text-xs text-slate-500">{t.status}</span>
                    </div>
                    <p className="font-black truncate">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.game} · {t.date} · Prize: {t.prize}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleEditTournament(t)}
                      className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDeleteTournament(t.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-bold transition-colors border border-red-600/30">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// NEWS PAGE
// ─────────────────────────────────────────────

function NewsPage({ navigateTo }) {
  const [items, setItems] = useState(NEWS_DATA.map(normalizeNewsItem));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const newsQuery = query(collection(db, 'news'), orderBy('publishedAt', 'desc'));
    const unsub = onSnapshot(newsQuery, (snap) => {
      if (snap.empty) {
        setItems(NEWS_DATA.map(normalizeNewsItem));
      } else {
        setItems(snap.docs.map((docSnap, index) => normalizeNewsItem({ id: docSnap.id, ...docSnap.data() }, index)));
      }
      setLoading(false);
    }, () => {
      setItems(NEWS_DATA.map(normalizeNewsItem));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="mb-12 fade-in-up">
        <h2 className="text-4xl font-black mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          <span className="text-purple-400">GAMING</span> NEWS
        </h2>
        <p className="text-slate-400">Latest topics from Firestore with a full detail view for each story</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-8 h-40 skeleton" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((news, index) => {
            const game = GAMES_DATA.find(g => g.title === news.game);
            return (
              <article
                key={news.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-purple-500/50 transition-all fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-4 py-2 rounded-full">{news.category}</span>
                      {news.dateLabel && <span className="text-sm text-slate-500">{news.dateLabel}</span>}
                      {news.game && <span className="text-sm text-blue-400 font-semibold">{news.game}</span>}
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{news.title}</h3>
                    <p className="text-slate-300 leading-relaxed">{news.summary || news.content}</p>
                    <div className="mt-5 flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => navigateTo('news-detail', news)}
                        className="px-4 py-2 rounded-lg bg-blue-600/20 text-blue-300 text-sm font-bold hover:bg-blue-600/30 transition-colors"
                      >
                        Read Details
                      </button>
                      {game && (
                        <button
                          onClick={() => navigateTo('game-detail', game)}
                          className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                        >
                          View Game
                        </button>
                      )}
                    </div>
                  </div>
                  {news.imageUrl && (
                    <img src={news.imageUrl} alt={news.title} className="w-full lg:w-64 h-40 object-cover rounded-xl border border-slate-800" />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NewsDetailPage({ news, navigateTo, goBack }) {
  const safeNews = normalizeNewsItem(news);
  const game = GAMES_DATA.find(g => g.title === safeNews.game);

  return (
    <div className="container mx-auto px-6 py-20 max-w-4xl fade-in-up">
      <button
        onClick={goBack}
        className="mb-8 text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" /> Back to News
      </button>

      <article className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {safeNews.imageUrl && (
          <img src={safeNews.imageUrl} alt={safeNews.title} className="w-full h-64 md:h-80 object-cover border-b border-slate-800" />
        )}
        <div className="p-8">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-4 py-2 rounded-full">{safeNews.category}</span>
            {safeNews.dateLabel && <span className="text-sm text-slate-500">{safeNews.dateLabel}</span>}
            {safeNews.game && <span className="text-sm text-blue-400 font-semibold">{safeNews.game}</span>}
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            {safeNews.title}
          </h1>
          {safeNews.summary && <p className="text-lg text-slate-300 mb-6 leading-relaxed">{safeNews.summary}</p>}
          <div className="text-slate-300 leading-8 whitespace-pre-line">
            {safeNews.content || 'No details available for this news yet.'}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {game && (
              <button
                onClick={() => navigateTo('game-detail', game)}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
              >
                Open Game Page
              </button>
            )}
            {safeNews.sourceUrl && (
              <a
                href={safeNews.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
              >
                Open Source
              </a>
            )}
          </div>
        </div>
      </article>
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
                { Icon: Gamepad2, color: 'text-blue-400', bg: 'bg-blue-500/20', title: 'Game Database', desc: 'Comprehensive category-based database of the hottest games across all genres - browse by FPS, MOBA, Sports, Party, RPG, and Strategy.' },
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
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-green-400 flex items-center gap-2">
              <HelpCircle className="w-6 h-6"/> Help & Support
            </h3>
            <p className="text-slate-300 mb-6">Need help? We're here for you. Reach out through any of the channels below.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: '💬', title: 'Discord Community', desc: 'Join our Discord for live support and community discussion.', link: 'https://discord.gg/gamehub', label: 'Join Discord' },
                { icon: '📧', title: 'Email Support', desc: 'Send us an email for tournament or account help.', link: 'mailto:support@gamehub.gg', label: 'Email Us' },
                { icon: '📋', title: 'FAQ', desc: 'Find answers to the most common questions about GameHub.', link: '#', label: 'View FAQ' },
              ].map(item => (
                <div key={item.title} className="bg-slate-800 rounded-xl p-5 flex flex-col gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors mt-auto">
                    {item.label} →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}