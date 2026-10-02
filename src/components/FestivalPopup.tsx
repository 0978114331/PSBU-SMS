import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export function FestivalPopup() {
  const [phase, setPhase] = useState<'hidden' | 'splash' | 'festival' | 'closing'>('hidden');

  useEffect(() => {
    const hasShown = sessionStorage.getItem('appSplashScreenShown');
    if (!hasShown) {
      setPhase('splash');

      const splashTimer = setTimeout(() => {
        setPhase('festival');
      }, 2000);

      const autoCloseTimer = setTimeout(() => {
        closeSequence();
      }, 9000);

      return () => {
        clearTimeout(splashTimer);
        clearTimeout(autoCloseTimer);
      };
    }
  }, []);

  const closeSequence = () => {
    setPhase('closing');
    setTimeout(() => {
      setPhase('hidden');
      sessionStorage.setItem('appSplashScreenShown', 'true');
    }, 500);
  };

  if (phase === 'hidden') return null;

  return (
    <div className={`fixed inset-0 z-[9999] h-[100dvh] w-full overflow-hidden bg-white transition-opacity duration-500 ${phase === 'closing' ? 'opacity-0' : 'opacity-100'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
        .font-moul { font-family: 'Moul', serif; line-height: 1.6; padding-bottom: 0.1em; }
        .font-siemreap { font-family: 'Siemreap', sans-serif; }
        
        @keyframes float-up {
          0% { transform: translateY(20px) scale(0.5); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-80px) scale(1.2) rotate(15deg); opacity: 0; }
        }
        .celebration-sparkle {
          animation: float-up 2.5s ease-out forwards;
        }
      `}</style>

      <div className={`absolute inset-0 w-full h-full flex flex-col items-center justify-between transition-transform duration-700 ${phase === 'splash' ? 'scale-105 opacity-0' : 'scale-100 opacity-100'}`}>
        
        <div className="relative w-full">
           <img 
              id="top-festival-image"
              src="https://i.pinimg.com/736x/e3/96/fb/e396fb3d93f85bed9000835933557ab5.jpg" 
              alt="Festival Header" 
              className="w-full h-[38vh] sm:h-[48vh] object-cover opacity-95"
           />
           <div className="absolute inset-x-0 bottom-0 h-28 sm:h-36 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center w-full mt-2">
          <h3 className="font-moul text-[#cfa856] text-[16px] sm:text-[18px] drop-shadow-sm tracking-widest">
            អនុមោទនាពិធីបុណ្យ
          </h3>
          <h1 className="font-moul text-transparent bg-clip-text bg-gradient-to-b from-[#fcd372] via-[#d4a841] to-[#b38b36] text-[55px] sm:text-[65px] drop-shadow-md relative">
            ភ្ជុំបិណ្ឌ
            {phase === 'festival' && (
              <>
                <Sparkles className="absolute -top-4 -left-6 text-yellow-400 w-6 h-6 celebration-sparkle" style={{ animationDelay: '0.2s' }} />
                <Sparkles className="absolute top-2 -right-8 text-orange-400 w-8 h-8 celebration-sparkle" style={{ animationDelay: '0.5s' }} />
                <Sparkles className="absolute -bottom-2 -left-2 text-yellow-500 w-5 h-5 celebration-sparkle" style={{ animationDelay: '0.8s' }} />
              </>
            )}
          </h1>
        </div>

        <div className="relative z-10 w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-full overflow-hidden shadow-[0_8px_25px_rgba(212,168,65,0.3)] border-[4px] border-white my-4">
          <img 
            id="center-flag"
            src="https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg" 
            alt="Cambodia Flag" 
            className="w-full h-full object-cover" 
          />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full pb-6">
          <p className="font-serif italic font-bold tracking-widest text-[12px] sm:text-[13px] text-slate-400 mb-6 opacity-70">
            Proud of Cambodia Talents
          </p>
          
          <button 
            onClick={closeSequence}
            className="px-6 py-2 bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full font-siemreap transition-colors active:scale-95 text-[11px] sm:text-[12px] tracking-wide"
          >
            ចូលកម្មវិធី
          </button>
        </div>
      </div>

      <div className={`absolute inset-0 z-50 bg-white flex flex-col items-center justify-center transition-opacity duration-700 pointer-events-none ${phase === 'splash' ? 'opacity-100' : 'opacity-0'}`}>
        <img 
          id="app-logo"
          src="https://i.pinimg.com/originals/b7/21/67/b72167baec8ac73ac725f0fbb4947450.jpg" 
          alt="App Logo" 
          className="w-[180px] sm:w-[220px] h-auto object-contain"
        />
      </div>

    </div>
  );
}