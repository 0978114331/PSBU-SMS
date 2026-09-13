import { useState, useEffect } from 'react';
import { BookMarked, Search, Clock, X, DownloadCloud, ExternalLink, Eye, Share2, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function LibraryPanel() {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  const [banners, setBanners] = useState<string[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // កំណត់ចំនួនសៀវភៅបង្ហាញដំបូង
  const INITIAL_COUNT = 10;
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  useEffect(() => {
    fetchLibraryItems();
    fetchBanners();
    
    const sub = supabase.channel('library-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, payload => {
        if (payload.new && (payload.new as any).type === 'library_items') {
          setItems((payload.new as any).data_json || []);
        }
        if (payload.new && (payload.new as any).type === 'library_banner') {
          const data = (payload.new as any).data_json;
          setBanners(data && Array.isArray(data) ? data : []);
        }
      }).subscribe();
      
    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // ពេលស្វែងរកសៀវភៅ ត្រូវឱ្យវាត្រឡប់មកបង្ហាញត្រឹម ១០ សៀវភៅវិញដំបូង
  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [search]);

  async function fetchLibraryItems() {
    const { data } = await supabase.from('schedules').select('data_json').eq('type', 'library_items').maybeSingle();
    if (data?.data_json && Array.isArray(data.data_json)) {
      setItems(data.data_json);
    }
  }

  async function fetchBanners() {
    const { data } = await supabase.from('schedules').select('data_json').eq('type', 'library_banner').maybeSingle();
    if (data?.data_json && Array.isArray(data.data_json)) {
      setBanners(data.data_json);
    }
  }

  const incrementStat = async (id: string, field: 'views' | 'downloads') => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: (item[field] || 0) + 1 } : item));
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem((prev: any) => ({ ...prev, [field]: (prev[field] || 0) + 1 }));
    }

    const { data } = await supabase.from('schedules').select('data_json, id').eq('type', 'library_items').maybeSingle();
    if (data?.data_json) {
      const updatedItems = (data.data_json as any[]).map(item => 
        item.id === id ? { ...item, [field]: (item[field] || 0) + 1 } : item
      );
      await supabase.from('schedules').update({ data_json: updatedItems }).eq('id', data.id);
    }
  };

  const handleOpenModal = (item: any) => {
    setSelectedItem(item);
    incrementStat(item.id, 'views');
  };

  const handleShare = async (item: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description || 'E-Library Document',
          url: item.file_url,
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      navigator.clipboard.writeText(item.file_url);
      alert('Copied to clipboard');
    }
  };

  const filteredItems = items.filter(item => item.title.toLowerCase().includes(search.toLowerCase()) || (item.description && item.description.toLowerCase().includes(search.toLowerCase())));
  
  // កាត់យកតែចំនួនដែលចង់បង្ហាញ
  const displayedItems = filteredItems.slice(0, visibleCount);

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    // z-[45] បាំង Logo ក្បាលលើ តែ bottom-[65px] ទុកចន្លោះឱ្យ Footer ខាងក្រោមលេចឡើង
    <div 
      className="fixed top-0 left-0 right-0 bottom-[65px] z-[45] overflow-y-auto overflow-x-hidden bg-[#020817] text-slate-200 animated-gradient-bg"
      onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 20)}
    >
      <style>{`
        @keyframes customGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-gradient-bg {
          background: linear-gradient(-45deg, #020617, #0f172a, #1e3a8a, #0b132b);
          background-size: 400% 400%;
          animation: customGradient 15s ease infinite;
        }
      `}</style>

      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-blue-900/20 via-[#020817] to-[#020817] pointer-events-none z-0"></div>

      <div className={`sticky top-0 z-30 transition-all duration-300 ease-in-out ${isScrolled ? 'bg-[#020817]/95 backdrop-blur-xl border-b border-slate-800 shadow-2xl pt-3 pb-3 px-3' : 'bg-transparent pt-4 pb-2 px-4'}`}>
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          
          <div className="w-full h-[130px] sm:h-[180px] rounded-2xl relative overflow-hidden shadow-lg border border-slate-800 bg-slate-900">
            {banners.length > 0 ? (
              banners.map((url, idx) => (
                <img 
                  key={idx} 
                  src={url} 
                  alt={`Banner ${idx}`} 
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === currentBannerIndex ? 'opacity-100' : 'opacity-0'}`} 
                />
              ))
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                <ImageIcon size={36} className="opacity-50" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-[#020817]/40 to-transparent"></div>
            
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white z-20">
              <h2 className="text-xl sm:text-3xl font-extrabold flex items-center gap-2.5 drop-shadow-2xl">
                <BookMarked size={28} className="text-blue-500" /> 
                បណ្ណាល័យ <span className="hidden sm:inline ml-1 text-slate-300 font-bold">(E-Library)</span>
              </h2>
            </div>

            {banners.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-1.5 z-20">
                {banners.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentBannerIndex ? 'w-6 bg-blue-500' : 'w-2 bg-white/40'}`} />
                ))}
              </div>
            )}
          </div>

          <div className="relative w-full max-w-2xl mx-auto z-20">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input 
              className="w-full bg-slate-900 border border-slate-700 pl-12 pr-4 py-3.5 rounded-xl text-sm sm:text-base font-bold text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all" 
              placeholder="ស្វែងរកសៀវភៅ ឬឯកសារ..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
          {displayedItems.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full active:scale-[0.98] group" onClick={() => handleOpenModal(item)}>
              <div className="aspect-[4/3] bg-slate-950 relative overflow-hidden">
                {item.cover_url ? (
                  <img src={item.cover_url} className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100" alt="cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700"><BookMarked size={40} strokeWidth={1} /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-slate-300 text-[11px] font-bold">
                  <span className="flex items-center gap-1.5"><Eye size={14} className="text-blue-400"/> {item.views || 0}</span>
                  <span className="flex items-center gap-1.5"><DownloadCloud size={14} className="text-emerald-400"/> {item.downloads || 0}</span>
                </div>
              </div>
              
              <div className="p-3.5 sm:p-4 flex flex-col flex-1 bg-slate-900">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 mb-2.5 font-bold uppercase tracking-wider">
                  <Clock size={12} className="text-blue-500" />
                  <span>{formatDate(item.created_at)}</span>
                </div>
                <h3 className="font-bold text-[13px] sm:text-[14px] text-slate-100 line-clamp-2 leading-snug mb-1.5 group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-[12px] text-slate-400 line-clamp-2 leading-relaxed mt-auto">
                  {item.description || 'មិនមានការពណ៌នា...'}
                </p>
                
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
                  <a 
                    href={item.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={(e) => { e.stopPropagation(); incrementStat(item.id, 'views'); }} 
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-[11px] sm:text-xs font-bold transition-colors border border-blue-500/20"
                  >
                    <ExternalLink size={14} /> បើកអាន
                  </a>
                  <a 
                    href={item.file_url} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={(e) => { e.stopPropagation(); incrementStat(item.id, 'downloads'); }} 
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-600 text-white hover:bg-blue-500 rounded-lg text-[11px] sm:text-xs font-bold transition-colors shadow-sm"
                  >
                    <DownloadCloud size={14} /> ទាញយក
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* មុខងារ See more និង Show Less */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 rounded-3xl border border-dashed border-slate-800 shadow-sm mt-4">
            <BookMarked size={56} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-200 mb-1">មិនមានឯកសារទេ</h3>
            <p className="text-sm text-slate-500">សៀវភៅ ឬឯកសារដែលអ្នកស្វែងរកមិនមានក្នុងប្រព័ន្ធឡើយ</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-center gap-4 mt-8 pb-8">
            {visibleCount < filteredItems.length && (
              <button 
                onClick={() => setVisibleCount(prev => prev + 10)} 
                className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 py-2.5 px-6 rounded-xl text-[13px] font-bold transition-all active:scale-95"
              >
                <ChevronDown size={18} />(See more)
              </button>
            )}
            {visibleCount > INITIAL_COUNT && (
              <button 
                onClick={() => setVisibleCount(INITIAL_COUNT)} 
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 py-2.5 px-6 rounded-xl text-[13px] font-bold transition-all active:scale-95"
              >
                <ChevronUp size={18} />(Show less)
              </button>
            )}
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-[28px] w-full max-w-[500px] h-auto max-h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-black animate-fade-in relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-black/80 transition-colors active:scale-95" onClick={() => setSelectedItem(null)}><X size={18}/></button>
            
            <div className="relative aspect-video sm:aspect-[4/3] bg-slate-950 shrink-0">
              {selectedItem.cover_url ? (
                <img src={selectedItem.cover_url} className="w-full h-full object-cover opacity-80" alt="cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700"><BookMarked size={60} strokeWidth={1} /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between text-white">
                 <div className="flex items-center gap-5">
                   <span className="flex items-center gap-2 text-sm font-bold drop-shadow-md"><Eye size={18} className="text-blue-400"/> {selectedItem.views || 0} ទស្សនា</span>
                   <span className="flex items-center gap-2 text-sm font-bold drop-shadow-md"><DownloadCloud size={18} className="text-emerald-400"/> {selectedItem.downloads || 0} ទាញយក</span>
                 </div>
              </div>
            </div>
            
            <div className="flex flex-col flex-1 p-6 bg-slate-900 overflow-hidden text-slate-200">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                  <Clock size={14} /> {formatDate(selectedItem.created_at)}
                </div>
                <button onClick={() => handleShare(selectedItem)} className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors active:scale-95">
                  <Share2 size={14}/> ចែករំលែក
                </button>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-black text-white mb-3 leading-snug shrink-0">{selectedItem.title}</h2>
              
              <div className="text-slate-400 whitespace-pre-wrap leading-relaxed text-[14px] overflow-y-auto pr-2 mb-6 max-h-[30vh]" style={{scrollbarWidth: 'thin'}}>
                {selectedItem.description?.trim() ? selectedItem.description : 'មិនមានការពណ៌នាបន្ថែមទេ...'}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 shrink-0 pt-4 border-t border-slate-800 mt-auto">
                <a href={selectedItem.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white py-3.5 rounded-xl text-[14px] font-bold transition-colors">
                  <ExternalLink size={18} /> បើកអាន
                </a>
                <a href={selectedItem.file_url} target="_blank" rel="noopener noreferrer" download onClick={() => incrementStat(selectedItem.id, 'downloads')} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl text-[14px] font-bold transition-colors shadow-lg shadow-blue-900/50 active:scale-[0.98]">
                  <DownloadCloud size={18} /> ទាញយក
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}