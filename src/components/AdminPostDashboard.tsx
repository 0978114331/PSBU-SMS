import { useState, useEffect } from 'react';
import { Upload, Plus, Trash2, CheckCircle2, Pencil, Image as ImageIcon, X, Eye, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AdminPostDashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [form, setForm] = useState<{ id: string, title: string, description: string, image_urls: string[] }>({ id: '', title: '', description: '', image_urls: [] });
  const [saving, setSaving] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

  const [banners, setBanners] = useState<string[]>([]);
  const [tempBanner, setTempBanner] = useState('');
  const [savingBanner, setSavingBanner] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchBanners();
  }, []);

  async function fetchPosts() {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
  }

  async function fetchBanners() {
    const { data } = await supabase.from('schedules').select('data_json').eq('type', 'home_banners').maybeSingle();
    if (data?.data_json && Array.isArray(data.data_json)) {
      setBanners(data.data_json);
    }
  }

  async function savePost() {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = { title: form.title, description: form.description, image_urls: form.image_urls };
    
    if (form.id) {
      await supabase.from('posts').update(payload).eq('id', form.id);
    } else {
      await supabase.from('posts').insert([payload]);
    }
    
    setForm({ id: '', title: '', description: '', image_urls: [] });
    setSaving(false);
    fetchPosts();
  }

  function editPost(post: any) {
    setForm({ id: post.id, title: post.title, description: post.description || '', image_urls: post.image_urls || [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deletePost(id: string) {
    if (!window.confirm("តើអ្នកពិតជាចង់លុបមែនទេ?")) return;
    await supabase.from('posts').delete().eq('id', id);
    fetchPosts();
  }

  function addImageUrl() {
    if (tempUrl.trim() && !form.image_urls.includes(tempUrl.trim())) {
      setForm({ ...form, image_urls: [...form.image_urls, tempUrl.trim()] });
      setTempUrl('');
    }
  }

  function removeImage(index: number) {
    const newUrls = [...form.image_urls];
    newUrls.splice(index, 1);
    setForm({ ...form, image_urls: newUrls });
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setForm(prev => ({ ...prev, image_urls: [...prev.image_urls, result] }));
      };
      reader.readAsDataURL(file);
    });
  }

  async function saveBannersToDb(updatedBanners: string[]) {
    setSavingBanner(true);
    const { data } = await supabase.from('schedules').select('id').eq('type', 'home_banners').maybeSingle();
    if (data?.id) {
      await supabase.from('schedules').update({ data_json: updatedBanners }).eq('id', data.id);
    } else {
      await supabase.from('schedules').insert({ type: 'home_banners', data_json: updatedBanners });
    }
    setBanners(updatedBanners);
    setSavingBanner(false);
  }

  function addBanner() {
    if (tempBanner.trim() && !banners.includes(tempBanner.trim())) {
      const newBanners = [...banners, tempBanner.trim()];
      saveBannersToDb(newBanners);
      setTempBanner('');
    }
  }

  function removeBanner(index: number) {
    const newBanners = [...banners];
    newBanners.splice(index, 1);
    saveBannersToDb(newBanners);
  }

  function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      saveBannersToDb([...banners, result]);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[800px] mx-auto px-1 sm:px-0">
      
      {/* កំណត់ Banner ក្បាលលើ */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 w-full overflow-hidden box-border">
        <h2 className="mb-5 text-[15px] sm:text-lg font-bold flex items-center gap-2 text-primary"><ImageIcon size={18} /> កំណត់រូបភាព Banner ក្បាលលើ</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full mb-5">
           <input className="flex-1 w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-primary transition-colors" placeholder="ដាក់ Link រូបភាពទីនេះ..." value={tempBanner} onChange={e => setTempBanner(e.target.value)} onKeyDown={e => {if(e.key === 'Enter') addBanner()}} />
           <div className="flex gap-2 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none px-4 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-sm rounded-xl transition-colors" onClick={addBanner}>Add Link</button>
              <label className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-3 bg-primary text-white font-bold text-sm rounded-xl cursor-pointer transition-colors hover:bg-blue-700 ${savingBanner ? 'opacity-50 pointer-events-none' : ''}`}>
                {savingBanner ? 'Saving...' : <><Upload size={16} className="mr-1.5" /> Upload</>}
                <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} disabled={savingBanner} />
              </label>
           </div>
        </div>
        
        {banners.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
            {banners.map((url, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-video">
                <img src={url} className="w-full h-full object-cover" alt={`banner-${i}`} />
                <button className="absolute top-1.5 right-1.5 bg-rose-500 hover:bg-rose-600 text-white p-1.5 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-sm" onClick={() => removeBanner(i)}>
                   <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-6 text-[13px] bg-slate-50 rounded-xl border border-dashed border-slate-200">មិនទាន់មាន Banner ទេ</div>
        )}
      </div>

      {/* បង្កើត ឬកែប្រែព័ត៌មាន */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 w-full overflow-hidden box-border">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
          <h2 className="text-[15px] sm:text-lg font-bold flex items-center gap-2 text-primary"><Plus size={18} /> {form.id ? 'កែប្រែព័ត៌មាន (Edit)' : 'បង្កើតព័ត៌មានថ្មី (New Post)'}</h2>
          {form.id && <button className="text-slate-400 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 p-1.5 rounded-full transition-colors" onClick={() => setForm({ id: '', title: '', description: '', image_urls: [] })}><X size={16}/></button>}
        </div>
        
        <div className="flex flex-col gap-5 w-full">
          <label className="block w-full">
            <span className="text-[13px] font-bold text-slate-700 mb-2 block">ចំណងជើង (Title)</span>
            <input className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-primary transition-colors" placeholder="សរសេរចំណងជើង..." value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </label>
          
          <label className="block w-full">
            <span className="text-[13px] font-bold text-slate-700 mb-2 block">ខ្លឹមសារ (Description)</span>
            <textarea className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl min-h-[120px] resize-none text-sm leading-relaxed outline-none focus:border-primary transition-colors" placeholder="សរសេរខ្លឹមសារលម្អិតទីនេះ..." value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
          </label>
          
          <label className="block w-full">
            <span className="text-[13px] font-bold text-slate-700 mb-2 block">រូបភាព (Images) - ដាក់បានច្រើនសន្លឹក</span>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full mb-4">
               <input className="flex-1 w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-primary transition-colors" placeholder="Paste Link រូបភាពទីនេះ..." value={tempUrl} onChange={e => setTempUrl(e.target.value)} onKeyDown={e => {if(e.key === 'Enter') addImageUrl()}} />
               <div className="flex gap-2 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none px-4 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-sm rounded-xl transition-colors" onClick={addImageUrl}>Add Link</button>
                  <label className="flex-1 sm:flex-none flex items-center justify-center px-4 py-3 bg-primary text-white font-bold text-sm rounded-xl cursor-pointer transition-colors hover:bg-blue-700">
                    <Upload size={16} className="mr-1.5" /> Upload
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
                  </label>
               </div>
            </div>
            
            {form.image_urls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-[300px] overflow-y-auto w-full">
                {form.image_urls.map((url, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-square">
                    <img src={url} className="w-full h-full object-cover" alt={`preview-${i}`} />
                    <button className="absolute top-1.5 right-1.5 bg-rose-500 hover:bg-rose-600 text-white p-1.5 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-sm" onClick={() => removeImage(i)}>
                      <Trash2 size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-[10px] p-1.5 pt-4 text-center font-bold">{i + 1}</div>
                  </div>
                ))}
              </div>
            )}
          </label>
          
          <button className="w-full bg-[#1dd1a1] hover:bg-[#10ac84] text-white py-3.5 rounded-xl shadow-md shadow-[#1dd1a1]/30 text-[14px] font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.98] mt-2" disabled={saving || !form.title.trim()} onClick={savePost}>
            {saving ? 'កំពុងរក្សាទុក...' : <><CheckCircle2 size={18} /> {form.id ? 'រក្សាទុកការកែប្រែ' : 'បង្ហោះចូលផ្ទាំង Home'}</>}
          </button>
        </div>
      </div>

      {/* បញ្ជីព័ត៌មានដែលបានបង្ហោះ */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 w-full overflow-hidden box-border mb-[80px]">
        <h2 className="mb-5 text-[15px] sm:text-lg font-bold text-slate-800">ព័ត៌មានដែលបានបង្ហោះរួច</h2>
        <div className="flex flex-col gap-3 w-full">
          {posts.map(post => (
            <div key={post.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary/40 transition-colors w-full box-border">
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                {post.image_urls?.[0] ? (
                  <img src={post.image_urls[0]} alt="thumb" className="w-14 h-14 object-cover rounded-lg shrink-0 border border-slate-200 shadow-sm" />
                ) : (
                  <div className="w-14 h-14 bg-slate-200 rounded-lg flex items-center justify-center shrink-0 text-slate-400 shadow-sm"><ImageIcon size={20}/></div>
                )}
                <div className="min-w-0 pr-2">
                  <h4 className="font-bold text-[13px] sm:text-sm text-slate-800 truncate mb-1">{post.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                    <span className="truncate">{new Date(post.created_at).toLocaleDateString('en-GB')}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                    <span className="flex items-center gap-1 text-blue-500 shrink-0"><Eye size={12}/> {post.views}</span>
                    <span className="flex items-center gap-1 text-rose-500 shrink-0"><Heart size={12}/> {post.likes}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="p-2.5 text-blue-600 bg-blue-100/50 hover:bg-blue-100 rounded-lg active:scale-95 transition-transform" onClick={() => editPost(post)}><Pencil size={14}/></button>
                <button className="p-2.5 text-rose-600 bg-rose-100/50 hover:bg-rose-100 rounded-lg active:scale-95 transition-transform" onClick={() => deletePost(post.id)}><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <p className="text-center text-slate-400 py-6 text-[13px] bg-slate-50 rounded-xl border border-dashed border-slate-200">មិនទាន់មានព័ត៌មាននៅឡើយទេ</p>}
        </div>
      </div>
      
    </div>
  );
}