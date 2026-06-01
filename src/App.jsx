import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MatchSimulator from './components/MatchSimulator';

function App() {
  return (
    <div className="bg-slate-950 min-h-screen text-white selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <HeroSection />
      <MatchSimulator />
    </div>
  );
}

export default App;