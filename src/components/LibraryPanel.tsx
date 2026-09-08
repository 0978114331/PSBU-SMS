import { useState, useEffect } from 'react';
import { BookMarked, Search, Clock, X, FileText, DownloadCloud, ExternalLink, Eye, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function LibraryPanel() {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    fetchLibraryItems();
    const libSub = supabase.channel('library-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, payload => {
        if (payload.new && (payload.new as any).type === 'library_items') {
          setItems((payload.new as any).data_json || []);
        }
      }).subscribe();
    return () => { supabase.removeChannel(libSub); };
  }, []);

  async function fetchLibraryItems() {
    const { data } = await supabase.from('schedules').select('data_json').eq('type', 'library_items').maybeSingle();
    if (data?.data_json && Array.isArray(data.data_json)) {
      setItems(data.data_json);
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
          text: item.description || 'ឯកសារបណ្ណាល័យ',
          url: item.file_url,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      navigator.clipboard.writeText(item.file_url);
      alert('បានចម្លងតំណភ្ជាប់! (Copied to clipboard)');
    }
  };

  const filteredItems = items.filter(item => item.title.toLowerCase().includes(search.toLowerCase()) || (item.description && item.description.toLowerCase().includes(search.toLowerCase())));

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="w-full animate-fade-in pb-20 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
            <BookMarked size={24} /> បណ្ណាល័យ (E-Library)
          </h2>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-sm outline-none focus:border-primary transition-colors" 
            placeholder="ស្វែងរកសៀវភៅ..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full active:scale-[0.98]" onClick={() => handleOpenModal(item)}>
            <div className="aspect-[4/3] bg-slate-900 relative overflow-hidden">
              {item.cover_url ? (
                <img src={item.cover_url} className="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-105" alt="cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400"><BookMarked size={40} strokeWidth={1} /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
              
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px] font-bold">
                <span className="flex items-center gap-1"><Eye size={12}/> {item.views || 0}</span>
                <span className="flex items-center gap-1"><DownloadCloud size={12}/> {item.downloads || 0}</span>
              </div>
            </div>
            
            <div className="p-3 flex flex-col flex-1 bg-white">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 mb-2 font-medium">
                <Clock size={12} />
                <span>{formatDate(item.created_at)}</span>
              </div>
              <h3 className="font-bold text-[13px] sm:text-[14px] text-slate-800 line-clamp-2 leading-snug mb-1.5">
                {item.title}
              </h3>
              <p className="text-[11px] sm:text-[12px] text-slate-500 line-clamp-2 leading-relaxed">
                {item.description || 'មិនមានការពណ៌នា...'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
           <BookMarked size={48} className="mx-auto text-slate-300 mb-3" />
           <p className="text-sm text-slate-500 mt-1">មិនទាន់មានឯកសារនៅឡើយទេ</p>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-[24px] w-full max-w-[500px] h-auto max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 z-10 bg-black/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/50 transition" onClick={() => setSelectedItem(null)}><X size={18}/></button>
            
            <div className="relative aspect-video sm:aspect-[4/3] bg-slate-900 shrink-0">
              {selectedItem.cover_url ? (
                <img src={selectedItem.cover_url} className="w-full h-full object-cover opacity-90" alt="cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400"><BookMarked size={60} strokeWidth={1} /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
              
              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-white">
                 <div className="flex items-center gap-4">
                   <span className="flex items-center gap-1.5 text-sm font-bold shadow-sm"><Eye size={16}/> {selectedItem.views || 0} ទស្សនា</span>
                   <span className="flex items-center gap-1.5 text-sm font-bold shadow-sm"><DownloadCloud size={16}/> {selectedItem.downloads || 0} ទាញយក</span>
                 </div>
              </div>
            </div>
            
            <div className="flex flex-col flex-1 p-5 sm:p-6 bg-white overflow-hidden">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Clock size={14} /> {formatDate(selectedItem.created_at)}
                </div>
                
                {/* SHARE BUTTON */}
                <button onClick={() => handleShare(selectedItem)} className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors active:scale-95">
                  <Share2 size={14}/> ចែករំលែក
                </button>
              </div>
              
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 leading-snug shrink-0">{selectedItem.title}</h2>
              
              {/* DESCRIPTION SECTION (Fixed layout to allow scrolling) */}
              <div className="text-slate-600 whitespace-pre-wrap leading-relaxed text-[13.5px] sm:text-[14px] overflow-y-auto pr-2 mb-4 max-h-[30vh]" style={{scrollbarWidth: 'thin'}}>
                {selectedItem.description?.trim() ? selectedItem.description : 'មិនមានការពណ៌នាបន្ថែមទេ...'}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 shrink-0 pt-3 border-t border-slate-100 mt-auto">
                <a href={selectedItem.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-3 rounded-xl text-[14px] font-bold transition-colors">
                  <ExternalLink size={18} /> បើកអាន
                </a>
                <a href={selectedItem.file_url} target="_blank" rel="noopener noreferrer" download onClick={() => incrementStat(selectedItem.id, 'downloads')} className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white py-3 rounded-xl text-[14px] font-bold transition-colors shadow-md shadow-primary/30 active:scale-[0.98]">
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