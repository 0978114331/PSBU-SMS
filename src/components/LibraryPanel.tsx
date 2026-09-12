import { useState, useEffect } from 'react';
import { BookMarked, Search, Clock, X, DownloadCloud, ExternalLink, Eye, Share2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function LibraryPanel() {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  const [banners, setBanners] = useState<string[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

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
    return () => { supabase.removeChannel(sub); };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

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

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="w-full min-h-[100vh] pb-20 relative overflow-hidden animated-gradient-bg">
      <style>{`
        @keyframes customGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-gradient-bg {
          background: linear-gradient(-45deg, #e0f2fe, #f3e8ff, #ede9fe, #f0fdf4);
          background-size: 400% 400%;
          animation: customGradient 15s ease infinite;
        }
      `}</style>

      <div className="sticky top-0 z-10 bg-white/60 backdrop-blur-xl border-b border-white/40 px-4 pt-4 pb-5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-5">
          <div className="w-full h-[140px] sm:h-[220px] rounded-2xl relative overflow-hidden shadow-md border border-white/50 bg-slate-200">
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
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                <ImageIcon size={40} className="mb-2 opacity-50" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white z-20">
              <h2 className="text-xl sm:text-3xl font-extrabold flex items-center gap-2.5 drop-shadow-lg">
                <BookMarked size={28} className="text-blue-400" /> បណ្ណាល័យ (E-Library)
              </h2>
            </div>

            {banners.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-1.5 z-20">
                {banners.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentBannerIndex ? 'w-6 bg-blue-400' : 'w-2 bg-white/50'}`} />
                ))}
              </div>
            )}
          </div>

          <div className="relative w-full max-w-2xl mx-auto">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
              className="w-full bg-white/80 backdrop-blur-sm border border-white pl-12 pr-4 py-3.5 rounded-xl text-sm sm:text-base font-bold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm" 
              placeholder="ស្វែងរកសៀវភៅ ឬឯកសារ..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full active:scale-[0.98] group" onClick={() => handleOpenModal(item)}>
              <div className="aspect-[4/3] bg-slate-900 relative overflow-hidden">
                {item.cover_url ? (
                  <img src={item.cover_url} className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110" alt="cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400"><BookMarked size={40} strokeWidth={1} /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
                  <span className="flex items-center gap-1.5"><Eye size={14}/> {item.views || 0}</span>
                  <span className="flex items-center gap-1.5"><DownloadCloud size={14}/> {item.downloads || 0}</span>
                </div>
              </div>
              
              <div className="p-3.5 sm:p-4 flex flex-col flex-1">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 mb-2.5 font-bold uppercase tracking-wider">
                  <Clock size={12} />
                  <span>{formatDate(item.created_at)}</span>
                </div>
                <h3 className="font-bold text-[13px] sm:text-[14px] text-slate-800 line-clamp-2 leading-snug mb-1.5 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-[12px] text-slate-500 line-clamp-2 leading-relaxed mt-auto">
                  {item.description || 'មិនមានការពណ៌នា...'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20 bg-white/50 backdrop-blur-md rounded-3xl border border-dashed border-slate-300 shadow-sm mt-4">
            <BookMarked size={56} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">មិនមានឯកសារទេ</h3>
            <p className="text-sm text-slate-500">សៀវភៅ ឬឯកសារដែលអ្នកស្វែងរកមិនមានក្នុងប្រព័ន្ធឡើយ</p>
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-[28px] w-full max-w-[500px] h-auto max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 z-10 bg-black/40 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-black/60 transition-colors active:scale-95" onClick={() => setSelectedItem(null)}><X size={18}/></button>
            
            <div className="relative aspect-video sm:aspect-[4/3] bg-slate-900 shrink-0">
              {selectedItem.cover_url ? (
                <img src={selectedItem.cover_url} className="w-full h-full object-cover opacity-90" alt="cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400"><BookMarked size={60} strokeWidth={1} /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              
              <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between text-white">
                 <div className="flex items-center gap-5">
                   <span className="flex items-center gap-2 text-sm font-bold shadow-sm"><Eye size={18}/> {selectedItem.views || 0}</span>
                   <span className="flex items-center gap-2 text-sm font-bold shadow-sm"><DownloadCloud size={18}/> {selectedItem.downloads || 0}</span>
                 </div>
              </div>
            </div>
            
            <div className="flex flex-col flex-1 p-6 bg-white overflow-hidden">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                  <Clock size={14} /> {formatDate(selectedItem.created_at)}
                </div>
                <button onClick={() => handleShare(selectedItem)} className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors active:scale-95">
                  <Share2 size={14}/> ចែករំលែក
                </button>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-3 leading-snug shrink-0">{selectedItem.title}</h2>
              
              <div className="text-slate-600 whitespace-pre-wrap leading-relaxed text-[14px] overflow-y-auto pr-2 mb-6 max-h-[30vh]" style={{scrollbarWidth: 'thin'}}>
                {selectedItem.description?.trim() ? selectedItem.description : 'មិនមានការពណ៌នាបន្ថែមទេ...'}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 shrink-0 pt-4 border-t border-slate-100 mt-auto">
                <a href={selectedItem.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-3.5 rounded-xl text-[14px] font-bold transition-colors">
                  <ExternalLink size={18} /> បើកអាន
                </a>
                <a href={selectedItem.file_url} target="_blank" rel="noopener noreferrer" download onClick={() => incrementStat(selectedItem.id, 'downloads')} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-[14px] font-bold transition-colors shadow-md shadow-blue-600/30 active:scale-[0.98]">
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