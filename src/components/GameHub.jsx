import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Trophy, Calendar, Zap, Gamepad2, Newspaper, Info, Target, Swords, Users, Laugh, Crown, Brain, Car, Shield } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';

// ─────────────────────────────────────────────
// FIREBASE AUTH CONFIG
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

const AuthContext = React.createContext(null);
const useAuth = () => React.useContext(AuthContext);

// ─────────────────────────────────────────────
// RAWG API & UTILS
// ─────────────────────────────────────────────

const RAWG_API_KEY = '2e74ac2b248241ab924856c410254295';

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
        const res = await fetch(`https://api.rawg.io/api/games/${slug}?key=${RAWG_API_KEY}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.background_image) setImages(prev => ({ ...prev, [title]: data.background_image }));
      } catch (_) {}
    };
    titles.forEach((title, i) => setTimeout(() => fetchImage(title), i * 80));
  }, []);
  return images;
}

// ─────────────────────────────────────────────
// DATA SECTION
// ─────────────────────────────────────────────

const CATEGORIES = [
  { id: 'fps', label: 'FPS', fullName: 'First-Person Shooter', icon: Target, color: '#ef4444', glow: 'rgba(239,68,68,0.4)', description: 'Fast-paced first-person combat across tactical, battle royale, and hero shooter experiences', subcategories: ['All', 'Tactical', 'Battle Royale', 'Hero Shooter'] },
  { id: 'moba', label: 'MOBA', fullName: 'Multiplayer Online Battle Arena', icon: Swords, color: '#8b5cf6', glow: 'rgba(139,92,246,0.4)', description: 'Team-based strategy games where heroes clash for map control and glory', subcategories: ['All', 'Mobile MOBA', 'PC MOBA'] },
  { id: 'sports', label: 'Sports', fullName: 'Sports & Racing', icon: Crown, color: '#22c55e', glow: 'rgba(34,197,94,0.4)', description: 'Athletic competitions, racing simulations, and sports management titles', subcategories: ['All', 'Football', 'Basketball', 'Racing', 'Combat', 'Management'] },
  { id: 'party', label: 'Party', fullName: 'Party & Casual', icon: Laugh, color: '#f59e0b', glow: 'rgba(245,158,11,0.4)', description: 'Fun multiplayer games perfect for groups, friends, and family of all skill levels', subcategories: ['All', 'Co-op', 'Versus', 'Social'] },
  { id: 'rpg', label: 'RPG', fullName: 'Role-Playing Game', icon: Shield, color: '#3b82f6', glow: 'rgba(59,130,246,0.4)', description: 'Deep story-driven adventures with rich character progression and open worlds', subcategories: ['All', 'Action RPG', 'Open World'] },
  { id: 'strategy', label: 'Strategy', fullName: 'Strategy & Tactics', icon: Brain, color: '#06b6d4', glow: 'rgba(6,182,212,0.4)', description: 'Games that demand planning, resource management, and long-term thinking', subcategories: ['All', 'RTS', '4X', 'Mobile Strategy'] },
];

const GAMES_DATA = [
  { id: 1, title: 'Valorant', category: 'fps', subcategory: 'Tactical', image: 'https://media.rawg.io/media/games/b11/b11127b9ee3c3701bd15b9af3286d20e.jpg', description: 'A 5v5 character-based tactical shooter where precise gunplay meets unique agent abilities.', releaseDate: '2020-06-02', rating: 4.8, players: '10 Online (5v5)', developer: 'Riot Games', publisher: 'Riot Games', platforms: ['PC'], tags: ['Tactical', 'Free-to-Play', 'Esports'], details: 'Valorant combines precise tactical gunplay with hero-based abilities...', features: ['Unique Agent abilities', 'Anti-cheat system', 'Regular updates', 'Global esports scene'] },
  { id: 2, title: "PUBG: PlayerUnknown's Battlegrounds", category: 'fps', subcategory: 'Battle Royale', image: '/images/games/pubg.jpg', description: 'The game that defined the battle royale genre. Drop onto a massive island...', releaseDate: '2017-12-20', rating: 4.5, players: '1–100 Online', developer: 'PUBG Studios', publisher: 'Krafton', platforms: ['PC', 'PS5', 'Xbox Series X', 'Mobile'], tags: ['Battle Royale', 'Realistic', 'Squads'], details: 'PUBG pioneered the battle royale genre...', features: ['Multiple maps', 'Realistic ballistics', 'Solo/Duo/Squad', 'Free-to-Play'] },
  { id: 3, title: 'Counter-Strike 2', category: 'fps', subcategory: 'Tactical', image: '/images/games/cs2.jpg', description: 'The world\'s most iconic competitive shooter, rebuilt on Source 2.', releaseDate: '2023-09-27', rating: 4.7, players: '10 Online (5v5)', developer: 'Valve', publisher: 'Valve', platforms: ['PC'], tags: ['Tactical', 'Free-to-Play', 'Esports'], details: 'Counter-Strike 2 is the largest technical leap in CS history...', features: ['Source 2 engine', 'Responsive smoke', 'Overhauled maps', 'Competitive matchmaking'] },
  { id: 4, title: "Tom Clancy's Rainbow Six Siege X", category: 'fps', subcategory: 'Tactical', image: '/images/games/r6siege.jpg', description: 'Elite operators, destructible environments, and intense 5v5 team play.', releaseDate: '2015-12-01', rating: 4.6, players: '10 Online (5v5)', developer: 'Ubisoft Montreal', publisher: 'Ubisoft', platforms: ['PC', 'PS5', 'Xbox Series X'], tags: ['Tactical', 'Destructible', 'Esports'], details: 'Siege features 60+ operators...', features: ['60+ unique operators', 'Fully destructible walls', 'Cross-play', 'Ranked seasons'] },
  { id: 5, title: 'Apex Legends', category: 'fps', subcategory: 'Hero Shooter', image: 'https://media.rawg.io/media/games/b72/b7233d5d5b1e75e86bb860ccc7aeca85.jpg', description: 'A hero-based battle royale where squad synergy defines the fight.', releaseDate: '2019-02-04', rating: 4.7, players: '1–60 Online', developer: 'Respawn Entertainment', publisher: 'EA', platforms: ['PC', 'PS5', 'Xbox Series X', 'Mobile'], tags: ['Battle Royale', 'Hero Shooter', 'Free-to-Play'], details: 'Apex combines speed and hero-based abilities...', features: ['Unique Legends', 'Fluid movement', 'Innovative ping system', 'Seasonal content'] },
  { id: 6, title: 'Call of Duty: Warzone', category: 'fps', subcategory: 'Battle Royale', image: '/images/games/warzone.jpg', description: 'The massive free-to-play Call of Duty battle royale.', releaseDate: '2020-03-10', rating: 4.4, players: '1–150 Online', developer: 'Infinity Ward', publisher: 'Activision', platforms: ['PC', 'PS5', 'Xbox Series X'], tags: ['Battle Royale', 'Free-to-Play', 'Cross-Play'], details: 'Warzone features iconic CoD gunplay...', features: ['Gulag mechanic', 'Full cross-play', 'Massive maps', 'Integrated progression'] },
  { id: 7, title: 'ROV (Arena of Valor)', category: 'moba', subcategory: 'Mobile MOBA', image: '/images/games/rov.jpg', description: 'The most popular mobile MOBA in SE Asia.', releaseDate: '2016-09-15', rating: 4.5, players: '10 Online (5v5)', developer: 'TiMi Studio', publisher: 'Tencent', platforms: ['Mobile'], tags: ['Mobile', 'Free-to-Play', 'Esports'], details: '5v5 action optimized for mobile...', features: ['100+ heroes', 'Smooth mobile controls', 'Huge esports scene', 'Regular patches'] },
  { id: 8, title: 'Mobile Legends: Bang Bang', category: 'moba', subcategory: 'Mobile MOBA', image: 'https://media.rawg.io/media/games/b7d/b7d3f1715fa0332f39f31e34e6d18187.jpg', description: 'The global mobile MOBA phenomenon.', releaseDate: '2016-07-14', rating: 4.4, players: '10 Online (5v5)', developer: 'Moonton', publisher: 'Moonton', platforms: ['Mobile'], tags: ['Mobile', 'Free-to-Play', 'Esports'], details: 'Fast 10-15 minute matches...', features: ['120+ heroes', 'Fast matchmaking', 'Global tournaments', 'Skin customization'] },
  { id: 9, title: 'Dota 2', category: 'moba', subcategory: 'PC MOBA', image: 'https://media.rawg.io/media/games/6fc/6fcf4cd3b17c288821388e6085bb0fc9.jpg', description: 'The deepest MOBA ever made.', releaseDate: '2013-07-09', rating: 4.7, players: '10 Online (5v5)', developer: 'Valve', publisher: 'Valve', platforms: ['PC'], tags: ['PC', 'Free-to-Play', 'High Skill'], details: 'Infinite strategic depth...', features: ['All heroes free', 'The International', 'Complex mechanics', 'Deep meta'] },
  { id: 10, title: 'League of Legends', category: 'moba', subcategory: 'PC MOBA', image: 'https://media.rawg.io/media/games/78b/78bc81e247fc7e77af700cbd632a9297.jpg', description: 'The most played PC game in the world.', releaseDate: '2009-10-27', rating: 4.6, players: '10 Online (5v5)', developer: 'Riot Games', publisher: 'Riot Games', platforms: ['PC'], tags: ['PC', 'Free-to-Play', 'Esports'], details: 'Master 160+ champions...', features: ['160+ Champions', 'Global Leagues', 'Worlds event', 'Seasonal updates'] },
  { id: 11, title: 'EA Sports FC 26', category: 'sports', subcategory: 'Football', image: 'https://media.rawg.io/media/games/7a4/7a4b424fb50dd0454db5a1880c28f7e6.jpg', description: 'The world\'s #1 football game, reimagined.', releaseDate: '2025-09-26', rating: 4.5, players: '1–22 Online', developer: 'EA Vancouver', publisher: 'EA', platforms: ['PC', 'PS5', 'Xbox'], tags: ['Football', 'Simulation', 'UT'], details: '19,000+ licensed players...', features: ['HyperMotion V', 'Ultimate Team', 'Career Mode', 'Licensed Leagues'] },
  { id: 21, title: 'The Witcher 3: Wild Hunt', category: 'rpg', subcategory: 'Open World', image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg', description: 'Hunt monsters in a living open world.', releaseDate: '2015-05-19', rating: 5.0, players: 'Single Player', developer: 'CD Projekt Red', publisher: 'CD Projekt', platforms: ['PC', 'PS5', 'Xbox', 'Switch'], tags: ['Open World', 'Story-Rich', 'Fantasy'], details: 'Widely considered the best RPG...', features: ['Branching story', 'Expansive DLCs', 'Geralt of Rivia', 'Next-gen updates'] },
  { id: 22, title: 'Cyberpunk 2077', category: 'rpg', subcategory: 'Open World', image: 'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg', description: 'Welcome to Night City.', releaseDate: '2020-12-10', rating: 4.7, players: 'Single Player', developer: 'CD Projekt Red', publisher: 'CD Projekt', platforms: ['PC', 'PS5', 'Xbox'], tags: ['Open World', 'Cyberpunk', 'RPG'], details: 'Build your legend as V...', features: ['Night City', 'Cyberware system', 'Phantom Liberty', 'Ray tracing'] },
  { id: 23, title: 'Elden Ring', category: 'rpg', subcategory: 'Action RPG', image: 'https://media.rawg.io/media/games/6fc/6fcf4cd3b17c288821388e6085bb0fc9.jpg', description: 'A brutal open-world action RPG.', releaseDate: '2022-02-25', rating: 4.9, players: 'Single Player / Co-op', developer: 'FromSoftware', publisher: 'Bandai Namco', platforms: ['PC', 'PS5', 'Xbox'], tags: ['Soulslike', 'Open World', 'RPG'], details: 'From the mind of Miyazaki...', features: ['Lands Between', 'George RR Martin lore', 'Hard bosses', 'Exploration'] }
];

const NEWS_DATA = [
  { id: 1, title: 'Valorant Episode 9 Brings New Agent', date: '2026-02-14', category: 'Update', game: 'Valorant', content: 'Riot Games reveals Episode 9 with a brand new Controller Agent...' },
  { id: 2, title: 'Elden Ring DLC Wins GOTY', date: '2026-02-10', category: 'Award', game: 'Elden Ring', content: 'Shadow of the Erdtree wins GOTY at Golden Joysticks...' }
];

const TOURNAMENTS_DATA = [
  { id: 1, name: 'VCT 2026', game: 'Valorant', date: 'March 10–30, 2026', prize: '$1,000,000', status: 'Registration Open', type: 'LAN', description: 'Global Valorant tournament.' }
];

// ─────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────

function WishlistNavButton({ navigateTo, currentPage }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const load = async () => {
      try {
        const r = await window.storage.get('wishlist');
        if (r) setCount(JSON.parse(r.value).length);
      } catch (_) {}
    };
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button onClick={() => navigateTo('wishlist')} className={`flex items-center gap-2 text-sm font-semibold transition-all hover:text-red-400 relative ${currentPage === 'wishlist' ? 'text-red-400' : 'text-slate-400'}`}>
      ♥ Wishlist {count > 0 && <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{count}</span>}
    </button>
  );
}

function AuthNavButton({ navigateTo, currentPage, user, authLoading }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (authLoading) return <div className="w-8 h-8 skeleton rounded-full" />;

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <button onClick={() => navigateTo('login')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Login</button>
        <button onClick={() => navigateTo('register')} className="text-sm font-bold px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-all text-white">Sign Up</button>
      </div>
    );
  }

  const initials = user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 hover:opacity-80 transition-all">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">{initials}</div>
        <span className="text-sm font-bold text-white hidden md:block">{user.displayName || user.email.split('@')[0]}</span>
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 top-12 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-slate-800"><p className="text-xs text-slate-500">Account</p><p className="text-sm font-bold text-white truncate">{user.email}</p></div>
          <button onClick={() => {navigateTo('profile'); setDropdownOpen(false);}} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 transition-all">👤 Profile</button>
          <button onClick={() => {navigateTo('wishlist'); setDropdownOpen(false);}} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 transition-all">♥ Wishlist</button>
          <button onClick={async () => { await signOut(auth); navigateTo('home'); }} className="w-full text-left px-4 py-3 text-sm text-red-400 border-t border-slate-800 hover:bg-slate-800 transition-all">🚪 Sign Out</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APPLICATION COMPONENT
// ─────────────────────────────────────────────

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
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const rawgImages = useRawgImages();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setAuthLoading(false); });
    return () => unsub();
  }, []);

  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    if (page === 'game-detail') setSelectedGame(data);
    else if (page === 'category') setSelectedCategory(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthContext.Provider value={{ user, auth }}>
    <RawgImagesContext.Provider value={rawgImages}>
    <div className="min-h-screen bg-slate-950 text-slate-100 font-mono">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@700;900&display=swap');
        .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .skeleton { background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%); background-size: 200% 100%; animation: skeleton-wave 1.5s infinite; }
        @keyframes skeleton-wave { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      {/* Header */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all ${scrolled ? 'bg-slate-950/95 backdrop-blur shadow-xl' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div onClick={() => navigateTo('home')} className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              <Gamepad2 className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black font-orbitron"><span className="text-blue-400">GAME</span>HUB</h1>
          </div>
          <nav className="hidden lg:flex gap-8">
            {['Home', 'Games', 'Tournaments', 'Leaderboard', 'News'].map((p) => (
              <button key={p} onClick={() => navigateTo(p.toLowerCase())} className={`text-sm font-bold transition-all hover:text-blue-400 ${currentPage === p.toLowerCase() ? 'text-blue-400' : 'text-slate-400'}`}>{p}</button>
            ))}
            <WishlistNavButton navigateTo={navigateTo} currentPage={currentPage} />
          </nav>
          <AuthNavButton navigateTo={navigateTo} currentPage={currentPage} user={user} authLoading={authLoading} />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 min-h-[80vh]">
        {currentPage === 'home' && <HomePage navigateTo={navigateTo} />}
        {currentPage === 'games' && <GamesPage navigateTo={navigateTo} />}
        {currentPage === 'category' && <CategoryPage category={selectedCategory} navigateTo={navigateTo} />}
        {currentPage === 'game-detail' && <GameDetailPage game={selectedGame} navigateTo={navigateTo} />}
        {currentPage === 'tournaments' && <TournamentsPage />}
        {currentPage === 'leaderboard' && <LeaderboardPage navigateTo={navigateTo} />}
        {currentPage === 'wishlist' && <WishlistPage navigateTo={navigateTo} />}
        {currentPage === 'news' && <NewsPage navigateTo={navigateTo} />}
        {currentPage === 'login' && <LoginPage navigateTo={navigateTo} />}
        {currentPage === 'register' && <RegisterPage navigateTo={navigateTo} />}
        {currentPage === 'profile' && <ProfilePage navigateTo={navigateTo} />}
      </main>

      <footer className="mt-20 border-t border-slate-800 bg-slate-900/50 py-10 text-center text-slate-500 text-sm">
        <p>© 2026 GameHub. Elevate your gaming experience.</p>
      </footer>
    </div>
    </RawgImagesContext.Provider>
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// PAGES COMPONENTS
// ─────────────────────────────────────────────

function HomePage({ navigateTo }) {
  const images = React.useContext(RawgImagesContext);
  return (
    <div className="container mx-auto px-6">
      <div className="relative h-[500px] rounded-3xl overflow-hidden mb-12 fade-in-up">
        <img src={images['Valorant'] || GAMES_DATA[0].image} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-center p-12">
          <span className="bg-red-500/20 text-red-500 text-xs font-bold px-3 py-1 rounded-full w-fit mb-4">FEATURED GAME</span>
          <h2 className="text-6xl font-black font-orbitron mb-6">VALORANT</h2>
          <p className="text-slate-300 max-w-lg mb-8">Defy the limits in the ultimate 5v5 character-based tactical shooter. Every round is a test of skill and strategy.</p>
          <button onClick={() => navigateTo('game-detail', GAMES_DATA[0])} className="w-fit bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-3 rounded-xl transition-all">Explore Game</button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold font-orbitron text-blue-400">TOP PICKS</h3>
        <button onClick={() => navigateTo('games')} className="text-sm font-bold text-slate-500 hover:text-white">View All →</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {GAMES_DATA.slice(1, 5).map((g, i) => <GameCard key={g.id} game={g} index={i} navigateTo={navigateTo} />)}
      </div>
    </div>
  );
}

function GameCard({ game, index, navigateTo }) {
  const image = useGameImage(game);
  return (
    <div onClick={() => navigateTo('game-detail', game)} className="bg-slate-900 rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-all border border-slate-800 fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
      <div className="h-48 relative"><img src={image} className="w-full h-full object-cover" /><div className="absolute top-3 right-3 bg-slate-900/80 text-[10px] font-bold px-2 py-1 rounded">{game.subcategory}</div></div>
      <div className="p-5">
        <div className="flex justify-between items-center mb-1"><h4 className="font-bold truncate pr-2">{game.title}</h4><span className="text-yellow-500 text-sm">★{game.rating}</span></div>
        <p className="text-xs text-slate-500 mb-4 line-clamp-2">{game.description}</p>
        <button className="w-full py-2 bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors">Details</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// UPDATED GAME DETAIL PAGE (AS REQUESTED)
// ─────────────────────────────────────────────

function GameDetailPage({ game, navigateTo }) {
  const { user } = useAuth(); // ดึงข้อมูล user
  const cat = CATEGORIES.find(c => c.id === game.category);
  const color = cat?.color || '#3b82f6';
  const heroImage = useGameImage(game);
  const [activeTab, setActiveTab] = useState('about');

  // Community States
  const storageKey = `game-community-${game.id}`;
  const [community, setCommunity] = useState({ reviews: [], discussions: [] });
  const [wishlist, setWishlist] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [discussText, setDiscussText] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await window.storage.get(storageKey);
        if (res) setCommunity(JSON.parse(res.value));
        const wl = await window.storage.get('wishlist');
        if (wl) setWishlist(JSON.parse(wl.value));
      } catch (_) {}
    };
    loadData();
  }, [game.id]);

  const isWishlisted = wishlist.includes(game.id);

  const toggleWishlist = async () => {
    const updated = isWishlisted ? wishlist.filter(id => id !== game.id) : [...wishlist, game.id];
    setWishlist(updated);
    try { await window.storage.set('wishlist', JSON.stringify(updated)); } catch (_) {}
  };

  const handlePostReview = async () => {
    if (!reviewText.trim()) return;
    const newR = { id: Date.now(), name: user.displayName || user.email.split('@')[0], text: reviewText, stars: 5, date: new Date().toLocaleDateString() };
    const updated = { ...community, reviews: [newR, ...community.reviews] };
    setCommunity(updated);
    try { await window.storage.set(storageKey, JSON.stringify(updated)); } catch (_) {}
    setReviewText('');
  };

  const handlePostDiscuss = async () => {
    if (!discussText.trim()) return;
    const newD = { id: Date.now(), name: user.displayName || user.email.split('@')[0], text: discussText, date: new Date().toLocaleDateString() };
    const updated = { ...community, discussions: [newD, ...community.discussions] };
    setCommunity(updated);
    try { await window.storage.set(storageKey, JSON.stringify(updated)); } catch (_) {}
    setDiscussText('');
  };

  return (
    <div className="container mx-auto px-6">
      {/* Hero Section */}
      <div className="relative h-[400px] rounded-3xl overflow-hidden mb-10 fade-in-up">
        <img src={heroImage} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex items-end p-10">
          <div className="max-w-3xl">
            <div className="flex gap-2 mb-4">
              <span className="bg-blue-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase">{game.subcategory}</span>
              {game.tags.slice(0, 3).map(t => <span key={t} className="bg-slate-900/80 text-[10px] px-3 py-1 rounded-full border border-slate-700">{t}</span>)}
            </div>
            <h2 className="text-5xl font-black font-orbitron mb-4">{game.title}</h2>
            <p className="text-slate-300 line-clamp-2">{game.description}</p>
            {/* Wishlist Button ใน Hero ถูกลบออกแล้วตามคำขอ */}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-slate-800 mb-8">
            {['About', 'Reviews', 'Discussion'].map(t => (
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} className={`pb-4 text-sm font-bold transition-all relative ${activeTab === t.toLowerCase() ? 'text-blue-400' : 'text-slate-500'}`}>
                {t} {activeTab === t.toLowerCase() && <div className="absolute bottom-0 inset-x-0 h-1 bg-blue-400 rounded-full" />}
              </button>
            ))}
          </div>

          {activeTab === 'about' && (
            <div className="fade-in-up">
              <h3 className="text-2xl font-bold mb-4">The Story</h3>
              <p className="text-slate-400 leading-relaxed mb-8">{game.details}</p>
              <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
                <h4 className="text-lg font-bold mb-4 text-blue-400">Key Features</h4>
                <ul className="space-y-3">
                  {game.features.map(f => <li key={f} className="text-slate-400 flex items-center gap-3"> <Zap size={14} className="text-blue-400" /> {f}</li>)}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6 fade-in-up">
              {/* ตรวจสอบการ Login สำหรับ Review */}
              {user ? (
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                  <h4 className="font-bold mb-4">Write a Review</h4>
                  <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Tell us what you think..." className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm mb-4 h-24 focus:outline-none focus:border-blue-500 transition-all" />
                  <button onClick={handlePostReview} className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-sm font-bold transition-all">Submit Review</button>
                </div>
              ) : (
                <div className="bg-slate-900/50 p-10 rounded-2xl border border-dashed border-slate-700 text-center">
                  <p className="text-slate-500 mb-6">Please login to write a review for this game.</p>
                  <button onClick={() => navigateTo('login')} className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-bold transition-all">Login Now</button>
                </div>
              )}
              <div className="space-y-4">
                {community.reviews.map(r => (
                  <div key={r.id} className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                    <div className="flex justify-between mb-2"><span className="font-bold text-blue-400">{r.name}</span><span className="text-xs text-slate-600">{r.date}</span></div>
                    <p className="text-slate-400 text-sm">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'discussion' && (
            <div className="space-y-6 fade-in-up">
              {/* ตรวจสอบการ Login สำหรับ Discussion */}
              {user ? (
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                  <h4 className="font-bold mb-4">Start Discussion</h4>
                  <textarea value={discussText} onChange={e => setDiscussText(e.target.value)} placeholder="Ask a question or share a tip..." className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm mb-4 h-24 focus:outline-none focus:border-blue-500 transition-all" />
                  <button onClick={handlePostDiscuss} className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-lg text-sm font-bold transition-all">Post Message</button>
                </div>
              ) : (
                <div className="bg-slate-900/50 p-10 rounded-2xl border border-dashed border-slate-700 text-center">
                  <p className="text-slate-500 mb-6">Want to join the discussion? Please login first.</p>
                  <button onClick={() => navigateTo('login')} className="bg-purple-600 hover:bg-purple-500 px-8 py-3 rounded-xl font-bold transition-all">Login Now</button>
                </div>
              )}
              <div className="space-y-4">
                {community.discussions.map(d => (
                  <div key={d.id} className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                    <div className="flex justify-between mb-2"><span className="font-bold text-purple-400">{d.name}</span><span className="text-xs text-slate-600">{d.date}</span></div>
                    <p className="text-slate-400 text-sm">{d.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <button onClick={toggleWishlist} className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all ${isWishlisted ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-blue-600/10 border-blue-600/50 text-blue-400 hover:bg-blue-600/20'}`}>
            {isWishlisted ? '♥ Wishlisted' : '♡ Add to Wishlist'}
          </button>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <h4 className="font-bold font-orbitron text-blue-400 mb-6 uppercase text-sm">Game Info</h4>
            <div className="space-y-4">
              <div><p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Developer</p><p className="text-sm font-bold">{game.developer}</p></div>
              <div><p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Publisher</p><p className="text-sm font-bold">{game.publisher}</p></div>
              <div><p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Release Date</p><p className="text-sm font-bold">{game.releaseDate}</p></div>
              <div><p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Players</p><p className="text-sm font-bold">{game.players}</p></div>
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <p className="text-sm font-bold">RAWG Rating</p><span className="text-yellow-500 font-black">★ {game.rating}</span>
              </div>
            </div>
          </div>
          <button onClick={() => navigateTo('games')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all">← Back to Gallery</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// AUTHENTICATION PAGES
// ─────────────────────────────────────────────

function LoginPage({ navigateTo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    try { await signInWithEmailAndPassword(auth, email, password); navigateTo('home'); } catch (_) { alert('Invalid credentials'); }
    setLoading(false);
  };
  return (
    <div className="flex items-center justify-center py-20 px-6">
      <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl w-full max-w-md shadow-2xl fade-in-up">
        <h2 className="text-3xl font-black font-orbitron text-blue-400 mb-8 text-center uppercase">Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4 focus:outline-none" />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 mb-8 focus:outline-none" />
        <button onClick={handleLogin} disabled={loading} className="w-full py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all">{loading ? '...' : 'Sign In'}</button>
        <p className="text-center mt-6 text-slate-500 text-sm">No account? <button onClick={()=>navigateTo('register')} className="text-blue-400 font-bold">Register</button></p>
      </div>
    </div>
  );
}

function RegisterPage({ navigateTo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const handleReg = async () => {
    try {
      const cr = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cr.user, { displayName: name });
      navigateTo('home');
    } catch (_) { alert('Error registering'); }
  };
  return (
    <div className="flex items-center justify-center py-20 px-6">
      <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl w-full max-w-md shadow-2xl fade-in-up">
        <h2 className="text-3xl font-black font-orbitron text-purple-400 mb-8 text-center uppercase">Register</h2>
        <input type="text" placeholder="Gamer Name" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4 focus:outline-none" />
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4 focus:outline-none" />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 mb-8 focus:outline-none" />
        <button onClick={handleReg} className="w-full py-4 bg-purple-600 rounded-xl font-bold hover:bg-purple-500 transition-all">Join GameHub</button>
        <p className="text-center mt-6 text-slate-500 text-sm">Back to <button onClick={()=>navigateTo('login')} className="text-purple-400 font-bold">Login</button></p>
      </div>
    </div>
  );
}

function ProfilePage({ navigateTo }) {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="container mx-auto px-6 max-w-2xl py-20">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center fade-in-up">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-black">
          {user.displayName ? user.displayName[0] : user.email[0]}
        </div>
        <h2 className="text-3xl font-black font-orbitron mb-2 uppercase">{user.displayName || 'Gamer'}</h2>
        <p className="text-slate-500 mb-10">{user.email}</p>
        <button onClick={async () => { await signOut(auth); navigateTo('home'); }} className="w-full py-3 border border-red-500/30 text-red-500 font-bold rounded-xl hover:bg-red-500/10 transition-all">Sign Out</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADDITIONAL PAGES (PLACEHOLDERS)
// ─────────────────────────────────────────────

function GamesPage({ navigateTo }) {
  return (
    <div className="container mx-auto px-6">
      <h2 className="text-4xl font-black font-orbitron mb-12 uppercase text-blue-400">Game Gallery</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {GAMES_DATA.map((g, i) => <GameCard key={g.id} game={g} index={i} navigateTo={navigateTo} />)}
      </div>
    </div>
  );
}

function CategoryPage({ category, navigateTo }) {
  const filtered = GAMES_DATA.filter(g => g.category === category.id);
  return (
    <div className="container mx-auto px-6">
      <h2 className="text-4xl font-black font-orbitron mb-4 uppercase" style={{color: category.color}}>{category.label}</h2>
      <p className="text-slate-500 mb-12">{category.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {filtered.map((g, i) => <GameCard key={g.id} game={g} index={i} navigateTo={navigateTo} />)}
      </div>
    </div>
  );
}

function TournamentsPage() {
  return (
    <div className="container mx-auto px-6 py-20 text-center fade-in-up">
      <Trophy size={60} className="text-yellow-500 mx-auto mb-6" />
      <h2 className="text-4xl font-black font-orbitron mb-4 uppercase">Upcoming Tournaments</h2>
      <p className="text-slate-500">Coming soon in 2026. Stay tuned for the biggest events in gaming.</p>
    </div>
  );
}

function LeaderboardPage() {
  return (
    <div className="container mx-auto px-6 py-20 text-center fade-in-up">
      <Crown size={60} className="text-blue-500 mx-auto mb-6" />
      <h2 className="text-4xl font-black font-orbitron mb-4 uppercase">Global Leaderboard</h2>
      <p className="text-slate-500">Rankings based on user engagement and reviews will be available soon.</p>
    </div>
  );
}

function NewsPage() {
  return (
    <div className="container mx-auto px-6">
      <h2 className="text-4xl font-black font-orbitron mb-12 uppercase text-purple-400">Latest News</h2>
      <div className="space-y-6">
        {NEWS_DATA.map(n => (
          <div key={n.id} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl fade-in-up">
            <div className="flex gap-4 mb-4"><span className="text-purple-400 text-xs font-bold uppercase">{n.category}</span><span className="text-slate-600 text-xs">{n.date}</span></div>
            <h3 className="text-xl font-bold mb-4">{n.title}</h3>
            <p className="text-slate-400">{n.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WishlistPage({ navigateTo }) {
  const [list, setList] = useState([]);
  useEffect(() => {
    const load = async () => {
      try { const r = await window.storage.get('wishlist'); if (r) setList(JSON.parse(r.value)); } catch (_) {}
    };
    load();
  }, []);
  const wishGames = GAMES_DATA.filter(g => list.includes(g.id));
  return (
    <div className="container mx-auto px-6">
      <h2 className="text-4xl font-black font-orbitron mb-12 uppercase text-red-500">Your Wishlist</h2>
      {wishGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {wishGames.map((g, i) => <GameCard key={g.id} game={g} index={i} navigateTo={navigateTo} />)}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl border-dashed">
          <p className="text-slate-500">No games in your wishlist yet.</p>
        </div>
      )}
    </div>
  );
}