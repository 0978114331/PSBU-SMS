import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export function FestivalPopup() {
  const [phase, setPhase] = useState<'hidden' | 'festival' | 'closing'>('hidden');

  useEffect(() => {
    const hasShown = sessionStorage.getItem('appSplashScreenShown');
    if (!hasShown) {
      setPhase('festival');

      const autoCloseTimer = setTimeout(() => {
        closeSequence();
      }, 4000);

      return () => {
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
    <div className={`fixed inset-0 z-[9999] h-[100dvh] w-full overflow-hidden bg-white transition-all duration-500 ease-in-out ${phase === 'closing' ? 'opacity-0 blur-sm scale-105' : 'opacity-100 blur-0 scale-100'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
        .font-moul { font-family: 'Moul', serif; line-height: 1.6; padding-bottom: 0.1em; }
        .font-siemreap { font-family: 'Siemreap', sans-serif; }
        
        @keyframes float-up {
          0% { transform: translateY(15px) scale(0.5); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-70px) scale(1.1) rotate(15deg); opacity: 0; }
        }
        .celebration-sparkle {
          animation: float-up 2s ease-out forwards;
        }

        @keyframes smooth-appear {
          0% { opacity: 0; transform: scale(1.03) translateY(10px); filter: blur(3px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        .content-appear {
          animation: smooth-appear 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>

      <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-between content-appear">
        
        <div className="relative w-full">
           <img 
              id="top-festival-image"
              src="https://i.pinimg.com/736x/e3/96/fb/e396fb3d93f85bed9000835933557ab5.jpg" 
              alt="Festival Header" 
              className="w-full h-[38vh] sm:h-[48vh] object-cover opacity-95"
           />
           <div className="absolute inset-x-0 bottom-0 h-32 sm:h-40 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center w-full mt-1">
          <h3 className="font-moul text-[#cfa856] text-[15px] sm:text-[17px] drop-shadow-sm tracking-widest">
            អនុមោទនាពិធីបុណ្យ
          </h3>
          <h1 className="font-moul text-transparent bg-clip-text bg-gradient-to-b from-[#fcd372] via-[#d4a841] to-[#b38b36] text-[50px] sm:text-[60px] drop-shadow-md relative">
            ភ្ជុំបិណ្ឌ
            {phase === 'festival' && (
              <>
                <Sparkles className="absolute -top-3 -left-5 text-yellow-400 w-5 h-5 celebration-sparkle" style={{ animationDelay: '0.2s' }} />
                <Sparkles className="absolute top-2 -right-6 text-orange-400 w-7 h-7 celebration-sparkle" style={{ animationDelay: '0.4s' }} />
                <Sparkles className="absolute -bottom-1 -left-2 text-yellow-500 w-4 h-4 celebration-sparkle" style={{ animationDelay: '0.6s' }} />
              </>
            )}
          </h1>
        </div>

        <div className="relative z-10 w-[95px] h-[95px] sm:w-[110px] sm:h-[110px] rounded-full overflow-hidden shadow-[0_8px_25px_rgba(212,168,65,0.25)] border-[3px] border-white my-4">
          <img 
            id="center-flag"
            src="https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg" 
            alt="Cambodia Flag" 
            className="w-full h-full object-cover" 
          />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full pb-8">
          <p className="font-serif italic font-bold tracking-widest text-[11px] sm:text-[12px] text-slate-400 mb-5 opacity-70">
            Proud of Cambodia Talents
          </p>
          
          <button 
            onClick={closeSequence}
            className="px-5 py-2 bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full font-siemreap transition-all active:scale-95 text-[10px] sm:text-[11px] tracking-wide shadow-sm"
          >
            ចូលកម្មវិធី
          </button>
        </div>
      </div>
    </div>
  );
}