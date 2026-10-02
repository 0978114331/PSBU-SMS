// File: src/components/FestivalPopup.tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function FestivalPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasShown = sessionStorage.getItem('pchumBenPopupShown');
    if (!hasShown) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('pchumBenPopupShown', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" onClick={handleClose}>
      <div 
        className="relative w-full max-w-[400px] rounded-[24px] overflow-hidden shadow-2xl shadow-orange-500/20 bg-white transform transition-all scale-100 animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 bg-black/40 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/60 transition-colors active:scale-95"
        >
          <X size={18} />
        </button>

        <div className="relative aspect-[4/3] w-full overflow-hidden flex flex-col items-center justify-center bg-slate-900">
          <img 
            src="https://images.unsplash.com/photo-1600181516264-3ea80702d5a3?auto=format&fit=crop&q=80" 
            alt="Pchum Ben Festival"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#7f1d1d] via-[#7f1d1d]/60 to-transparent"></div>
          
          <div className="absolute bottom-6 left-0 right-0 text-center px-5">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-500 drop-shadow-lg mb-2">
              អបអរសាទរ ពិធីបុណ្យភ្ជុំបិណ្ឌ
            </h2>
            <p className="text-orange-100 text-[13px] font-medium tracking-wide">
              សូមអនុមោទនាបុណ្យ និងជូនពរជួបតែសេចក្តីសុខ
            </p>
          </div>
        </div>

        <div className="p-6 bg-white text-center">
          <p className="text-slate-600 text-[14px] leading-relaxed mb-6 font-medium">
            ក្នុងឱកាសពិធីបុណ្យភ្ជុំបិណ្ឌប្រពៃណីជាតិខ្មែរ សូមជូនពរដល់លោកគ្រូ អ្នកគ្រូ សិស្សានុសិស្ស និងមាតាបិតាទាំងអស់ ជួបប្រទះតែពុទ្ធពរទាំង ៤ ប្រការ កុំបីឃ្លៀងឃ្លាតឡើយ។
          </p>
          <button 
            onClick={handleClose}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all active:scale-95"
          >
            សូមអរគុណ
          </button>
        </div>
      </div>
    </div>
  );
}