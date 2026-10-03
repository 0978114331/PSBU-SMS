import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function FestivalPopup() {
  const [phase, setPhase] = useState<'hidden' | 'festival' | 'closing'>(() => {
    const hasShown = sessionStorage.getItem('appSplashScreenShown');
    return hasShown ? 'hidden' : 'festival';
  });
  const [popupData, setPopupData] = useState<any>(null);

  useEffect(() => {
    if (phase === 'hidden') return;

    const fetchPopupData = async () => {
      const { data } = await supabase.from('schedules').select('data_json').eq('type', 'school_info').maybeSingle();
      if (data?.data_json) {
        if (data.data_json.festivalEnable === false) {
          setPhase('hidden');
          return;
        }
        setPopupData(data.data_json);
      } else {
        setPopupData({});
      }
    };

    fetchPopupData();

    const autoCloseTimer = setTimeout(() => {
      closeSequence();
    }, 4000);

    return () => {
      clearTimeout(autoCloseTimer);
    };
  }, [phase]);

  const closeSequence = () => {
    setPhase('closing');
    setTimeout(() => {
      setPhase('hidden');
      sessionStorage.setItem('appSplashScreenShown', 'true');
    }, 500);
  };

  if (phase === 'hidden') return null;

  if (!popupData) {
    return <div className="fixed inset-0 z-[9999] bg-white h-[100dvh] w-full"></div>;
  }

  const topImg = popupData.festivalTopImg || "https://i.pinimg.com/736x/e3/96/fb/e396fb3d93f85bed9000835933557ab5.jpg";
  const centerImg = popupData.festivalCenterImg || "https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg";
  const subTitle = popupData.festivalSub || "អនុមោទនាពិធីបុណ្យ";
  const mainTitle = popupData.festivalTitle || "ភ្ជុំបិណ្ឌ";
  const titleColor = popupData.festivalColor || "#d4a841";

  return (
    <div className={`fixed inset-0 z-[9999] h-[100dvh] w-full overflow-hidden bg-white transition-all duration-500 ease-in-out ${phase === 'closing' ? 'opacity-0 blur-sm scale-105 pointer-events-none' : 'opacity-100 blur-0 scale-100'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
        .font-moul { font-family: 'Moul', serif; line-height: 1.6; padding-bottom: 0.1em; }
        .font-siemreap { font-family: 'Siemreap', sans-serif; }
        
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
              src={topImg} 
              alt="Festival Header" 
              className="w-full h-[38vh] sm:h-[48vh] object-cover opacity-95"
           />
           <div className="absolute inset-x-0 bottom-0 h-32 sm:h-40 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center w-full mt-1">
          <h3 className="font-moul text-[15px] sm:text-[17px] drop-shadow-sm tracking-widest" style={{ color: titleColor }}>
            {subTitle}
          </h3>
          <h1 className="font-moul text-[50px] sm:text-[60px] drop-shadow-md relative" style={{ color: titleColor }}>
            {mainTitle}
          </h1>
        </div>

        <div className="relative z-10 w-[95px] h-[95px] sm:w-[110px] sm:h-[110px] rounded-full overflow-hidden shadow-[0_8px_25px_rgba(0,0,0,0.15)] border-[3px] border-white my-4">
          <img 
            src={centerImg} 
            alt="Center Logo" 
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