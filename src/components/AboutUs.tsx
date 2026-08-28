import { GraduationCap, MapPin, Phone, Mail, Globe, ShieldCheck, Zap, Users, Code, Github, Facebook, Link as LinkIcon } from 'lucide-react';

export function AboutUs({ adminInfo }: { adminInfo: any }) {
  return (
    <div className="w-full max-w-[800px] mx-auto px-2 sm:px-4 pb-12 animate-fade-in">
      
      {/* ផ្នែកក្បាល (Header Section) */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center mb-6 relative overflow-hidden mt-2">
        <div className="absolute top-0 left-0 w-full h-28 sm:h-36 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600"></div>
        <div className="relative z-10 px-6 pb-8 pt-16 sm:pt-20">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto bg-white rounded-full flex items-center justify-center text-primary mb-5 border-[5px] border-white shadow-xl overflow-hidden">
            {adminInfo?.logo ? (
              <img src={adminInfo.logo} className="w-full h-full object-cover" alt="School Logo" />
            ) : (
              <GraduationCap size={48} className="text-blue-600" />
            )}
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 mb-3 tracking-wide leading-relaxed">
            ប្រព័ន្ធគ្រប់គ្រងសាលារៀនវៃឆ្លាត
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto text-[13px] sm:text-[15px] leading-relaxed">
            កម្មវិធីនេះត្រូវបានបង្កើតឡើងដើម្បីសម្រួលដល់ការគ្រប់គ្រងវត្តមាន ពិន្ទុ កាលវិភាគ និងការទំនាក់ទំនងរវាងសាលារៀន និងសិស្សានុសិស្សប្រកបដោយប្រសិទ្ធភាពខ្ពស់។
          </p>
        </div>
      </div>

      {/* ផ្នែកប្រវត្តិអ្នកអភិវឌ្ឍន៍ (Developer Profile - តាមគំរូរូបភាព) */}
      <div className="bg-white rounded-[24px] p-5 sm:p-8 shadow-sm border border-slate-100 mb-6 text-left hover:shadow-md transition-shadow">
        <div className="flex gap-4 sm:gap-6 mb-5">
           {/* ស៊ុមរូបភាពពណ៌លឿង */}
           <div className="w-[100px] h-[130px] sm:w-[130px] sm:h-[160px] shrink-0 bg-[#fdf3c6] rounded-2xl overflow-hidden border-[3px] border-[#f1c40f] p-1 shadow-sm">
              {adminInfo?.devPhoto ? (
                 <img src={adminInfo.devPhoto} className="w-full h-full object-cover rounded-xl" alt="Developer" />
              ) : (
                 <div className="w-full h-full bg-white rounded-xl flex items-center justify-center text-slate-300"><Code size={40} /></div>
              )}
           </div>
           {/* ឈ្មោះ និងតួនាទី */}
           <div className="flex flex-col justify-center pt-2 sm:pt-4">
              <h2 className="text-lg sm:text-2xl font-black text-slate-800 mb-1" style={{ fontFamily: "'Moul', serif" }}>
                {adminInfo?.devName || 'ឈ្មោះអ្នកអភិវឌ្ឍន៍'}
              </h2>
              <p className="text-blue-600 text-[13px] sm:text-base font-bold bg-blue-50 px-3 py-1 w-max rounded-lg mt-1">
                {adminInfo?.devTitle || 'Software Developer'}
              </p>
           </div>
        </div>
        {/* អត្ថបទពណ៌នា */}
        <p className="text-slate-600 leading-[2.2] text-[13px] sm:text-[15px] whitespace-pre-wrap text-justify">
          {adminInfo?.devDescription || 'សូមបញ្ចូលអត្ថបទរៀបរាប់អំពីអ្នកនៅទីនេះ តាមរយៈផ្ទាំង Settings របស់ Admin...'}
        </p>
      </div>

      {/* ផ្នែកចំណុចខ្លាំង (Features Highlights) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-8">
        <div className="bg-white p-5 sm:p-6 rounded-[20px] shadow-sm border border-slate-100 text-center hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
            <Zap size={24} />
          </div>
          <h3 className="font-extrabold text-slate-800 mb-2 text-[14px] sm:text-[16px]">លឿនរហ័ស</h3>
          <p className="text-slate-500 text-[12px] sm:text-[13px] leading-relaxed">ទិន្នន័យលោតភ្លាមៗ (Real-time 100%) ដោយមិនចាំបាច់ Refresh ឡើយ។</p>
        </div>
        
        <div className="bg-white p-5 sm:p-6 rounded-[20px] shadow-sm border border-slate-100 text-center hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-extrabold text-slate-800 mb-2 text-[14px] sm:text-[16px]">សុវត្ថិភាព</h3>
          <p className="text-slate-500 text-[12px] sm:text-[13px] leading-relaxed">រក្សាទុកទិន្នន័យនៅលើ Cloud យ៉ាងមានសុវត្ថិភាព មិនព្រួយបារម្ភរឿងបាត់បង់ឯកសារ។</p>
        </div>
        
        <div className="bg-white p-5 sm:p-6 rounded-[20px] shadow-sm border border-slate-100 text-center hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <h3 className="font-extrabold text-slate-800 mb-2 text-[14px] sm:text-[16px]">ងាយស្រួលប្រើ</h3>
          <p className="text-slate-500 text-[12px] sm:text-[13px] leading-relaxed">រចនាឡើងយ៉ាងសាមញ្ញ ស្រស់ស្អាត (UI/UX) និងងាយស្រួលយល់សម្រាប់អ្នកប្រើប្រាស់គ្រប់វ័យ។</p>
        </div>
      </div>

      {/* ផ្នែកព័ត៌មានទំនាក់ទំនង (Contact Links) */}
      <div className="bg-white rounded-[24px] p-5 sm:p-8 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <h2 className="text-[16px] sm:text-lg font-extrabold text-slate-800 mb-5 sm:mb-6 flex items-center gap-2.5 relative z-10">
          <Globe className="text-primary" size={22} /> ព័ត៌មានទំនាក់ទំនង
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
          {/* Phone */}
          <a href={`tel:${adminInfo?.contactPhone}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-colors group">
            <div className="w-11 h-11 rounded-xl bg-white text-emerald-500 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform"><Phone size={20} /></div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">ទូរស័ព្ទ (Phone)</h4>
              <p className="text-[13px] sm:text-[14px] font-bold text-slate-700 truncate">{adminInfo?.contactPhone || 'មិនមានទិន្នន័យ'}</p>
            </div>
          </a>
          
          {/* Email */}
          <a href={`mailto:${adminInfo?.contactEmail}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 transition-colors group">
            <div className="w-11 h-11 rounded-xl bg-white text-rose-500 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform"><Mail size={20} /></div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">អ៊ីមែល (Email)</h4>
              <p className="text-[13px] sm:text-[14px] font-bold text-slate-700 truncate">{adminInfo?.contactEmail || 'មិនមានទិន្នន័យ'}</p>
            </div>
          </a>

          {/* Facebook */}
          <a href={adminInfo?.contactFacebook} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-colors group">
            <div className="w-11 h-11 rounded-xl bg-white text-blue-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform"><Facebook size={20} /></div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Facebook</h4>
              <p className="text-[13px] sm:text-[14px] font-bold text-slate-700 truncate">{adminInfo?.contactFacebook ? 'ចុចទីនេះដើម្បីចូលទៅកាន់ Page' : 'មិនមានទិន្នន័យ'}</p>
            </div>
          </a>

          {/* Github */}
          <a href={adminInfo?.contactGithub} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-300 transition-colors group">
            <div className="w-11 h-11 rounded-xl bg-white text-slate-800 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform"><Github size={20} /></div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Github</h4>
              <p className="text-[13px] sm:text-[14px] font-bold text-slate-700 truncate">{adminInfo?.contactGithub ? 'ចុចទីនេះដើម្បីមើលកូដ' : 'មិនមានទិន្នន័យ'}</p>
            </div>
          </a>

          {/* Portfolio */}
          <a href={adminInfo?.contactPortfolio} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-colors md:col-span-2 group">
            <div className="w-11 h-11 rounded-xl bg-white text-indigo-500 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform"><LinkIcon size={20} /></div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Portfolio (គេហទំព័រផ្ទាល់ខ្លួន)</h4>
              <p className="text-[13px] sm:text-[14px] font-bold text-slate-700 truncate">{adminInfo?.contactPortfolio || 'មិនមានទិន្នន័យ'}</p>
            </div>
          </a>
        </div>
      </div>

      {/* ផ្នែករក្សាសិទ្ធិ */}
      <div className="text-center text-slate-400 text-sm mt-4 flex flex-col items-center justify-center gap-2.5">
        <Code size={22} className="text-slate-300" />
        <p className="font-bold text-[12px] sm:text-[13px]">រក្សាសិទ្ធិគ្រប់យ៉ាង &copy; {new Date().getFullYear()} ដោយ School MS.</p>
        <p className="text-[11px] sm:text-[12px] text-slate-400/80">រចនា និងអភិវឌ្ឍដោយក្តីស្រលាញ់ ❤️</p>
      </div>
      
    </div>
  );
}