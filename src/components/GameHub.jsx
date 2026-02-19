import React, { useState, useEffect } from 'react';
import { ChevronRight, Trophy, Calendar, Zap, Gamepad2, Newspaper, Info } from 'lucide-react';

// Sample game data
const GAMES_DATA = [
  {
    id: 1,
    title: "Cyber Nexus",
    genre: "FPS",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450&fit=crop",
    description: "A futuristic first-person shooter set in a dystopian cyberpunk world. Battle through neon-lit streets and take down corporate overlords.",
    releaseDate: "2025-03-15",
    rating: 4.8,
    players: "1-64 Online",
    developer: "NeonStorm Studios",
    details: "Experience intense tactical combat in a sprawling cyberpunk metropolis. Features advanced AI, destructible environments, and a deep progression system."
  },
  {
    id: 2,
    title: "Dragon's Legacy",
    genre: "RPG",
    image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800&h=450&fit=crop",
    description: "An epic fantasy RPG where you embark on a quest to restore balance to a world torn apart by ancient dragon conflicts.",
    releaseDate: "2024-11-20",
    rating: 4.9,
    players: "Single Player",
    developer: "Mythic Games",
    details: "Explore vast kingdoms, make meaningful choices that shape the story, and master powerful magic. Over 100 hours of content with multiple endings."
  },
  {
    id: 3,
    title: "Street Kings Racing",
    genre: "Racing",
    image: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=800&h=450&fit=crop",
    description: "Take to the streets in the most realistic urban racing experience. Customize your ride and dominate the underground racing scene.",
    releaseDate: "2025-01-10",
    rating: 4.6,
    players: "1-12 Online",
    developer: "Velocity Interactive",
    details: "Features licensed cars, extensive customization options, and dynamic weather systems. Compete in various race types across global cities."
  },
  {
    id: 4,
    title: "Stellar Command",
    genre: "Strategy",
    image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=450&fit=crop",
    description: "Command your fleet across the galaxy in this deep space strategy game. Build alliances or conquer enemies.",
    releaseDate: "2024-09-05",
    rating: 4.7,
    players: "1-8 Online",
    developer: "Cosmos Interactive",
    details: "Manage resources, research technologies, and engage in tactical space battles. Dynamic campaign adapts to your playstyle."
  },
  {
    id: 5,
    title: "Shadow Assassin",
    genre: "Stealth",
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=450&fit=crop",
    description: "Master the art of stealth in this atmospheric action game. Every shadow is your ally, every sound a potential threat.",
    releaseDate: "2025-05-22",
    rating: 4.5,
    players: "Single Player",
    developer: "Silent Edge Games",
    details: "Non-linear levels reward creative approaches. Use advanced stealth mechanics, gadgets, and environmental manipulation."
  },
  {
    id: 6,
    title: "Mystic Realms",
    genre: "MMORPG",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=450&fit=crop",
    description: "Join millions in a living fantasy world. Create your hero, join guilds, and write your own legend in this vast MMORPG.",
    releaseDate: "2024-06-30",
    rating: 4.4,
    players: "Massively Multiplayer",
    developer: "Eternal Studios",
    details: "Persistent world with regular content updates. Dynamic events, player-driven economy, and cross-server competitions."
  }
];

const NEWS_DATA = [
  {
    id: 1,
    title: "Cyber Nexus Season 2 Launches Next Week",
    date: "2026-02-14",
    category: "Update",
    game: "Cyber Nexus",
    content: "The highly anticipated Season 2 brings new maps, weapons, and a ranking overhaul. Pre-season starts February 21st with exclusive rewards for early participants."
  },
  {
    id: 2,
    title: "Dragon's Legacy Wins Best RPG 2025",
    date: "2026-02-10",
    category: "Award",
    game: "Dragon's Legacy",
    content: "At the Global Gaming Awards, Dragon's Legacy took home Best RPG of the Year, beating out fierce competition. The team promises more DLC content in Q2."
  },
  {
    id: 3,
    title: "Street Kings Racing: New Urban Expansion",
    date: "2026-02-08",
    category: "DLC",
    game: "Street Kings Racing",
    content: "Tokyo Streets expansion adds 15 new tracks, 20 licensed vehicles, and a drift championship mode. Available March 1st for season pass holders."
  },
  {
    id: 4,
    title: "Stellar Command Tournament Prize Pool Hits $500K",
    date: "2026-02-05",
    category: "Esports",
    game: "Stellar Command",
    content: "The Spring Championship has reached a record-breaking $500,000 prize pool. Registration closes February 28th. Top 64 teams compete starting March 15th."
  },
  {
    id: 5,
    title: "Shadow Assassin Developer Diary: AI Systems",
    date: "2026-02-01",
    category: "Dev Update",
    game: "Shadow Assassin",
    content: "Silent Edge Games reveals the advanced NPC AI powering Shadow Assassin's stealth mechanics. Each guard has unique personalities and patrol patterns."
  }
];

const TOURNAMENTS_DATA = [
  {
    id: 1,
    name: "Cyber Nexus World Championship",
    game: "Cyber Nexus",
    date: "March 15-17, 2026",
    prize: "$250,000",
    status: "Registration Open",
    type: "Online + Finals LAN",
    description: "The premier FPS competition featuring the world's best teams. Regional qualifiers lead to a 16-team LAN final in Las Vegas."
  },
  {
    id: 2,
    name: "Dragon's Legacy Speedrun Gauntlet",
    game: "Dragon's Legacy",
    date: "April 5-7, 2026",
    prize: "$50,000",
    status: "Upcoming",
    type: "Online",
    description: "Compete in various speedrun categories including Any%, 100%, and No Magic. Live streamed with community voting on challenges."
  },
  {
    id: 3,
    name: "Street Kings Racing Grand Prix",
    game: "Street Kings Racing",
    date: "May 20-22, 2026",
    prize: "$100,000",
    status: "Upcoming",
    type: "Hybrid",
    description: "Race through 10 tracks in time trials and head-to-head eliminations. Top 8 advance to live final in Monaco."
  },
  {
    id: 4,
    name: "Stellar Command Galactic Championship",
    game: "Stellar Command",
    date: "March 15-30, 2026",
    prize: "$500,000",
    status: "Registration Open",
    type: "Online",
    description: "The biggest prize pool in strategy gaming. Double-elimination bracket with best-of-5 finals. All matches streamed with expert commentary."
  }
];

export default function GameHub() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedGame, setSelectedGame] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (page, game = null) => {
    setCurrentPage(page);
    setSelectedGame(game);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'Space Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@700;900&display=swap');
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.2);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
        }
        
        .glow-effect {
          animation: glow 3s ease-in-out infinite;
        }
        
        .grid-bg {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
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
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .game-card:hover::before {
          left: 100%;
        }
        
        .game-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.3);
        }
        
        .cyber-border {
          position: relative;
          padding: 2px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .status-badge {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
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
                { name: 'About', icon: Info, page: 'about' }
              ].map((item) => (
                <button
                  key={item.page}
                  onClick={() => navigateTo(item.page)}
                  className={`flex items-center gap-2 text-sm font-semibold transition-all duration-300 hover:text-blue-400 ${
                    currentPage === item.page ? 'text-blue-400' : 'text-slate-400'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {currentPage === 'home' && <HomePage navigateTo={navigateTo} />}
        {currentPage === 'games' && <GamesPage navigateTo={navigateTo} />}
        {currentPage === 'overview' && selectedGame && <GameOverview game={selectedGame} navigateTo={navigateTo} />}
        {currentPage === 'tournaments' && <TournamentsPage />}
        {currentPage === 'news' && <NewsPage navigateTo={navigateTo} />}
        {currentPage === 'about' && <AboutPage />}
      </main>

      {/* Footer */}
      <footer className="mt-32 bg-slate-900/50 border-t border-blue-500/20">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                GAMEHUB
              </h3>
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
  );
}

function HomePage({ navigateTo }) {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-purple-500/10"></div>
        
        <div className="container mx-auto px-6 py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center fade-in-up">
            <h2 className="text-6xl md:text-7xl font-black mb-6 leading-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                LEVEL UP
              </span>
              <br />
              <span className="text-white">YOUR GAMING</span>
            </h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
              Discover the latest games, join epic tournaments, and stay updated with breaking news from the gaming universe.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => navigateTo('games')}
                className="cyber-border rounded-lg"
              >
                <div className="bg-slate-950 px-8 py-4 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-900 transition-colors">
                  Explore Games
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
              <button 
                onClick={() => navigateTo('tournaments')}
                className="border-2 border-slate-700 px-8 py-4 rounded-lg font-bold hover:border-blue-500 hover:bg-slate-900 transition-all"
              >
                View Tournaments
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-3xl font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <span className="text-blue-400">FEATURED</span> GAMES
          </h3>
          <button 
            onClick={() => navigateTo('games')}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2 font-semibold"
          >
            View All
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GAMES_DATA.slice(0, 3).map((game, index) => (
            <div 
              key={game.id} 
              className="game-card bg-slate-900 rounded-xl overflow-hidden cursor-pointer fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigateTo('overview', game)}
            >
              <div className="relative h-48 overflow-hidden">
                <img src={game.image} alt={game.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {game.genre}
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold mb-2">{game.title}</h4>
                <p className="text-sm text-slate-400 mb-4">{game.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <span className="text-lg">★</span>
                    <span className="font-bold">{game.rating}</span>
                  </div>
                  <span className="text-xs text-slate-500">{game.players}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest News */}
      <section className="container mx-auto px-6 py-20 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-3xl font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <span className="text-purple-400">LATEST</span> NEWS
          </h3>
          <button 
            onClick={() => navigateTo('news')}
            className="text-purple-400 hover:text-purple-300 flex items-center gap-2 font-semibold"
          >
            View All
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {NEWS_DATA.slice(0, 4).map((news, index) => (
            <div 
              key={news.id} 
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-500/50 transition-all cursor-pointer slide-in-right"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-3 py-1 rounded-full">
                  {news.category}
                </span>
                <span className="text-xs text-slate-500">{news.date}</span>
              </div>
              <h4 className="text-lg font-bold mb-2">{news.title}</h4>
              <p className="text-sm text-slate-400">{news.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function GamesPage({ navigateTo }) {
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="mb-12 fade-in-up">
        <h2 className="text-4xl font-black mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          <span className="text-blue-400">ALL</span> GAMES
        </h2>
        <p className="text-slate-400">Browse our complete collection of featured games</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GAMES_DATA.map((game, index) => (
          <div 
            key={game.id} 
            className="game-card bg-slate-900 rounded-xl overflow-hidden cursor-pointer fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => navigateTo('overview', game)}
          >
            <div className="relative h-52 overflow-hidden">
              <img src={game.image} alt={game.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {game.genre}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent h-24"></div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{game.title}</h3>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{game.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-yellow-400">
                  <span className="text-lg">★</span>
                  <span className="font-bold">{game.rating}</span>
                </div>
                <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-semibold">
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GameOverview({ game, navigateTo }) {
  return (
    <div className="fade-in-up">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img src={game.image} alt={game.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"></div>
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-6 pb-12">
            <div className="max-w-3xl">
              <span className="bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-full inline-block mb-4">
                {game.genre}
              </span>
              <h2 className="text-5xl font-black mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                {game.title}
              </h2>
              <p className="text-xl text-slate-300">{game.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Details */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-6 text-blue-400">About This Game</h3>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              {game.details}
            </p>
            
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h4 className="text-xl font-bold mb-4">Key Features</h4>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                  <span>Stunning next-gen graphics and immersive gameplay</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                  <span>Deep progression system with customizable options</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                  <span>Regular content updates and seasonal events</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                  <span>Cross-platform multiplayer support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="cyber-border rounded-xl">
              <div className="bg-slate-900 rounded-xl p-6">
                <h4 className="text-xl font-bold mb-4">Game Info</h4>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-slate-500">Developer</span>
                    <p className="text-white font-semibold">{game.developer}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Release Date</span>
                    <p className="text-white font-semibold">{game.releaseDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Players</span>
                    <p className="text-white font-semibold">{game.players}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Rating</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl text-yellow-400">★</span>
                      <span className="text-white font-bold text-xl">{game.rating}</span>
                      <span className="text-slate-500">/ 5.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigateTo('games')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              Back to Games
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
          <div 
            key={tournament.id} 
            className="bg-slate-900 border-2 border-slate-800 rounded-xl overflow-hidden hover:border-yellow-500/50 transition-all slide-in-right"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <span className="text-sm text-slate-500">{tournament.game}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      tournament.status === 'Registration Open' 
                        ? 'bg-green-500/20 text-green-400 status-badge' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {tournament.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{tournament.name}</h3>
                  <p className="text-slate-400 mb-4">{tournament.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span>{tournament.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span>{tournament.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Prize Pool</p>
                    <p className="text-3xl font-black text-yellow-400">{tournament.prize}</p>
                  </div>
                  {tournament.status === 'Registration Open' && (
                    <button className="cyber-border rounded-lg">
                      <div className="bg-slate-950 px-6 py-3 rounded-lg font-bold hover:bg-slate-900 transition-colors">
                        Register Now
                      </div>
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
        {NEWS_DATA.map((news, index) => (
          <article 
            key={news.id} 
            className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-purple-500/50 transition-all cursor-pointer fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => navigateTo('overview', GAMES_DATA.find(g => g.title === news.game))}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-4 py-2 rounded-full">
                {news.category}
              </span>
              <span className="text-sm text-slate-500">{news.date}</span>
              <span className="text-sm text-slate-600">•</span>
              <span className="text-sm text-blue-400 font-semibold">{news.game}</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 hover:text-purple-400 transition-colors">
              {news.title}
            </h3>
            <p className="text-slate-300 leading-relaxed">
              {news.content}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

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
            <p className="text-slate-300 leading-relaxed">
              GameHub is dedicated to bringing gamers together with comprehensive information about the latest games, 
              exciting tournaments, and breaking news from the gaming industry. We're building a community where 
              players can discover new experiences, compete at the highest levels, and stay connected with the 
              games they love.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-purple-400">What We Offer</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Gamepad2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Game Database</h4>
                  <p className="text-slate-400">Comprehensive information about the hottest games across all genres</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Tournament Hub</h4>
                  <p className="text-slate-400">Discover competitive gaming events with massive prize pools</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Newspaper className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Latest News</h4>
                  <p className="text-slate-400">Stay updated with breaking news and game announcements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
