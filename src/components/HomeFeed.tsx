import { useEffect, useState } from 'react';
import { Eye, Heart, X, Share2, ImageIcon, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const defaultBanners = [
  "https://i.ibb.co/nqpzhb09/Kc-hacker.png"
];

const formatKhmerDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const days = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
  const months = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

function PostCard({ post, onOpen, onLike, onShare, isLiked }: { post: any, onOpen: (p: any) => void, onLike: (e: any, id: string, likes: number) => void, onShare: (e: any, post: any) => void, isLiked: boolean }) {
  const images = post.image_urls || [];
  const count = images.length;

  return (
    <div onClick={() => onOpen(post)} className="bg-gradient-to-br from-white to-slate-50/80 rounded-[24px] overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)] border border-slate-100 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col h-full group">
      
      <div className="w-full h-[150px] sm:h-[190px] p-2.5 pb-0">
         <div className="w-full h-full relative overflow-hidden rounded-[18px] bg-slate-200 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]">
            {count === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={35} /></div>
            ) : count === 1 ? (
              <img src={images[0]} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" />
            ) : count === 2 ? (
              <div className="grid grid-cols-2 gap-1 w-full h-full">
                <img src={images[0]} alt="img1" className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" />
                <img src={images[1]} alt="img2" className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" />
              </div>
            ) : count === 3 ? (
              <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
                <img src={images[0]} alt="img1" className="w-full h-full object-cover row-span-2 transition-transform duration-700 ease-in-out group-hover:scale-105" />
                <img src={images[1]} alt="img2" className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" />
                <img src={images[2]} alt="img3" className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" />
              </div>
            ) : (
              <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
                <img src={images[0]} alt="img1" className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" />
                <img src={images[1]} alt="img2" className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" />
                <img src={images[2]} alt="img3" className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" />
                <div className="relative w-full h-full overflow-hidden">
                  <img src={images[3]} alt="img4" className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" />
                  {count > 4 && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-lg sm:text-xl transition-colors group-hover:bg-black/40">
                      +{count - 4}
                    </div>
                  )}
                </div>
              </div>
            )}
         </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        
        <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px] font-medium text-slate-400 mb-2.5">
          <Clock size={13} className="text-slate-300" /> 
          <span>{formatKhmerDate(post.created_at)}</span>
          <span className="flex items-center gap-1 ml-auto">
            <Eye size={13} /> {post.views}
          </span>
        </div>

        <h3 className="font-extrabold text-[14px] sm:text-[16px] mb-2 line-clamp-2 leading-snug text-slate-800">
          {post.title}
        </h3>
        
        <p className="text-slate-500 text-[11px] sm:text-[13px] mb-4 line-clamp-2 flex-1 leading-relaxed break-words overflow-hidden">{post.description}</p>
        
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
          <button 
            onClick={(e) => onLike(e, post.id, post.likes)} 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all active:scale-95 text-[11px] sm:text-xs font-bold ${isLiked ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-500'}`}
          >
            <Heart size={14} className={`transition-all ${isLiked ? "fill-rose-500 text-rose-500 scale-110" : "fill-transparent"}`} /> {post.likes}
          </button>
          
          <button onClick={(e) => onShare(e, post)} className="text-slate-400 hover:text-indigo-500 p-1.5 rounded-full hover:bg-indigo-50 transition-colors active:scale-90">
            <Share2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function HomeFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [adBanners, setAdBanners] = useState<string[]>(defaultBanners);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(JSON.parse(localStorage.getItem('liked_posts') || '[]')));

  useEffect(() => {
    fetchPosts();
    fetchBanners();

    const postSub = supabase.channel('posts-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
         setPosts(prev => [payload.new, ...prev]); 
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, payload => {
         setPosts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
         if (selectedPost && selectedPost.id === payload.new.id) setSelectedPost(payload.new);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, payload => {
         setPosts(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, (payload: any) => {
         if (payload.new && payload.new.type === 'home_banners') setAdBanners(payload.new.data_json || defaultBanners);
      }).subscribe();

    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (adBanners.length || 1));
    }, 4000);

    return () => { 
      supabase.removeChannel(postSub); 
      clearInterval(slideTimer);
    };
  }, [adBanners.length, selectedPost]);

  async function fetchPosts() {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
  }

  async function fetchBanners() {
    const { data } = await supabase.from('schedules').select('data_json').eq('type', 'home_banners').maybeSingle();
    if (data?.data_json && Array.isArray(data.data_json) && data.data_json.length > 0) {
      setAdBanners(data.data_json);
    }
  }

  async function handleLike(e: React.MouseEvent, id: string, currentLikes: number) {
    e.stopPropagation();
    
    const isAlreadyLiked = likedPosts.has(id);
    const newLiked = new Set(likedPosts);
    let newLikesCount = currentLikes;

    if (isAlreadyLiked) {
      newLiked.delete(id);
      newLikesCount = Math.max(0, currentLikes - 1);
    } else {
      newLiked.add(id);
      newLikesCount = currentLikes + 1;
    }

    setLikedPosts(newLiked);
    localStorage.setItem('liked_posts', JSON.stringify(Array.from(newLiked)));

    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: newLikesCount } : p));
    if (selectedPost && selectedPost.id === id) setSelectedPost({ ...selectedPost, likes: newLikesCount });
    
    await supabase.from('posts').update({ likes: newLikesCount }).eq('id', id);
  }

  async function handleShare(e: React.MouseEvent, post: any) {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: post.title, text: post.description, url: window.location.href }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link Copied to clipboard!");
    }
  }

  async function openPost(post: any) {
    const newViews = post.views + 1;
    setSelectedPost({ ...post, views: newViews });
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, views: newViews } : p));
    await supabase.from('posts').update({ views: newViews }).eq('id', post.id);
  }

  return (
    <div className="w-full mx-auto pb-6 px-1">
      
      <div className="relative w-full h-[160px] sm:h-[280px] rounded-[24px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.15)] bg-slate-900 border border-slate-200">
        {adBanners.map((img, i) => (
          <img key={i} src={img} className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 transform ${i === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`} alt={`banner-${i}`} />
        ))}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
          {adBanners.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-primary w-6' : 'bg-white/50 w-2'}`}></div>
          ))}
        </div>
      </div>

      <div className="text-center my-6 sm:my-8 relative">
         <h2 className="text-[18px] sm:text-[22px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 tracking-wide uppercase relative z-10">
           ព័ត៌មានទូទៅ
         </h2>
         <div className="w-12 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mt-2 shadow-sm"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        {posts.slice(0, visibleCount).map((post) => (
          <PostCard key={post.id} post={post} onOpen={openPost} onLike={handleLike} onShare={handleShare} isLiked={likedPosts.has(post.id)} />
        ))}
      </div>
      
      {posts.length === 0 && <div className="text-center text-slate-400 py-10 font-bold bg-white rounded-2xl border border-dashed border-slate-300 mx-1 mt-4 shadow-sm">មិនទាន់មានព័ត៌មានថ្មីៗទេ</div>}

      <div className="mt-8 flex justify-center items-center gap-3 w-full">
        {visibleCount < posts.length && (
          <button 
            onClick={() => setVisibleCount(prev => prev + 6)} 
            className="btn bg-white border border-primary text-primary hover:bg-primary/10 px-6 py-2.5 rounded-full shadow-sm font-bold active:scale-95 transition-all text-sm"
          >
            មើលបន្ថែម (See More)
          </button>
        )}
        {visibleCount > 6 && (
          <button 
            onClick={() => {
              setVisibleCount(6);
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }} 
            className="btn bg-slate-50 border border-slate-300 text-slate-600 hover:bg-slate-100 px-6 py-2.5 rounded-full shadow-sm font-bold active:scale-95 transition-all text-sm"
          >
            បង្រួញវិញ (See Less)
          </button>
        )}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md overflow-y-auto" onClick={() => setSelectedPost(null)}>
          <div className="min-h-screen py-8 px-2 sm:px-4 flex items-center justify-center">
            <div className="bg-white rounded-[24px] sm:rounded-3xl w-full max-w-[700px] shadow-2xl relative animate-fade-in flex flex-col max-h-[92vh] overflow-hidden" onClick={e => e.stopPropagation()}>
              
              <button className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-black/50 hover:bg-rose-500 text-white p-2 rounded-full backdrop-blur-md transition-colors shadow-lg" onClick={() => setSelectedPost(null)}>
                <X size={18} />
              </button>
              
              <div className="w-full flex-shrink-0 bg-slate-100 max-h-[45vh] overflow-y-auto hide-scrollbar relative rounded-t-[24px] sm:rounded-t-3xl">
                {selectedPost.image_urls && selectedPost.image_urls.length > 0 ? (
                  selectedPost.image_urls.map((img: string, i: number) => (
                    <img key={i} src={img} alt={`img-${i}`} className="w-full h-auto object-cover border-b border-white block" />
                  ))
                ) : (
                  <div className="w-full h-[250px] flex items-center justify-center text-slate-300"><ImageIcon size={50} /></div>
                )}
              </div>

              <div className="p-5 sm:p-8 overflow-y-auto flex-1 bg-white relative">
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400 mb-3">
                  <Clock size={14} className="text-slate-300" /> 
                  <span>{formatKhmerDate(selectedPost.created_at)}</span>
                </div>
                
                <h1 className="text-lg sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 mb-3 leading-snug break-words">{selectedPost.title}</h1>
                <p className="text-slate-600 leading-[1.8] text-[13px] sm:text-[15px] whitespace-pre-wrap break-words overflow-wrap-anywhere mb-6">{selectedPost.description}</p>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-t border-slate-100 pt-4 mt-auto shrink-0 bg-white sticky bottom-0">
                  <button 
                    onClick={(e) => handleLike(e, selectedPost.id, selectedPost.likes)} 
                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl font-bold transition-all active:scale-95 text-[13px] sm:text-base border ${likedPosts.has(selectedPost.id) ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-white text-rose-600 hover:bg-rose-50 border-rose-100/50'}`}
                  >
                    <Heart size={18} className={`transition-all ${likedPosts.has(selectedPost.id) ? "fill-rose-500 scale-110" : "fill-transparent"}`} /> 
                    {likedPosts.has(selectedPost.id) ? 'Liked' : 'Like'} ({selectedPost.likes})
                  </button>
                  <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-slate-50 text-slate-500 py-2.5 sm:py-3 rounded-xl font-bold border border-slate-200 text-[13px] sm:text-base">
                    <Eye size={18} className="text-slate-400" /> {selectedPost.views} Views
                  </div>
                  <button onClick={(e) => handleShare(e, selectedPost)} className="w-[50px] sm:w-[60px] flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 py-2.5 sm:py-3 rounded-xl transition-all active:scale-95 border border-blue-100/50">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}