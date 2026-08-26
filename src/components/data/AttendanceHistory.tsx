import { ClipboardList, Search } from 'lucide-react';
import { useState } from 'react';
import type { Attendance } from '@/types';

export function AttendanceHistory({ records }: { records: Attendance[] }) {
  const [search, setSearch] = useState('');
  
  // ប្រើ (r as any) ដើម្បីកុំឱ្យលោត Error បន្ទាត់ក្រហម
  const filtered = records.filter(r => 
    (r.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (r.date || '').includes(search) || 
    ((r as any).stu_id || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
     <div className="card w-full">
       <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
         <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold"><ClipboardList className="text-primary" /> ទិន្នន័យវត្តមានសរុប</h2>
         <div className="flex items-center gap-2 rounded-xl bg-white p-2 border border-slate-200 shadow-sm w-full sm:w-auto">
            <Search size={16} className="text-slate-400" />
            <input className="bg-transparent outline-none text-sm w-full" placeholder="ស្វែងរកឈ្មោះ អត្តលេខ..." value={search} onChange={e => setSearch(e.target.value)} />
         </div>
       </div>
       
       <div className="rounded-xl border border-slate-200 overflow-hidden w-full bg-white">
         <div className="max-h-[500px] overflow-y-auto overflow-x-auto w-full">
           <table className="w-full min-w-[700px] text-xs sm:text-sm relative">
             <thead className="sticky top-0 z-20 shadow-sm">
               <tr className="bg-slate-100 text-left">
                 {/* ក្បាលតារាងគាំងស្ងៀម (Sticky Left) */}
                 <th className="p-2 sm:p-3 font-bold whitespace-nowrap sticky left-0 z-20 bg-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-200">ឈ្មោះសិស្ស និង ម៉ោង</th>
                 <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">ថ្ងៃខែ</th>
                 <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">ស្ថានភាព</th>
                 <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">អត្តលេខ</th>
                 <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">មុខវិជ្ជា</th>
                 <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">បន្ទប់ / វេន</th>
               </tr>
             </thead>
             <tbody>
               {filtered.length ? filtered.map((r) => (
                 <tr key={r.id} className="border-t hover:bg-slate-50 transition">
                   {/* ជួរឈរគាំងស្ងៀម (Sticky Left) */}
                   <td className="p-2 sm:p-3 font-bold text-primary whitespace-nowrap sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                     {r.name}
                     <span className="block text-slate-500 text-[10px] font-medium mt-0.5">ម៉ោង៖ {(r as any).time || '---'}</span>
                   </td>
                   <td className="p-2 sm:p-3 text-center whitespace-nowrap">{r.date}</td>
                   <td className="p-2 sm:p-3 text-center whitespace-nowrap">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${r.status === 'វត្តមាន' ? 'bg-green-100 text-green-700' : r.status === 'ច្បាប់' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                         {r.status}
                      </span>
                   </td>
                   <td className="p-2 sm:p-3 text-center whitespace-nowrap uppercase font-medium">{(r as any).stu_id || '---'}</td>
                   <td className="p-2 sm:p-3 text-center whitespace-nowrap">{(r as any).subject || '---'}</td>
                   <td className="p-2 sm:p-3 text-center whitespace-nowrap">{(r as any).room || '---'} / {(r as any).shift || '---'}</td>
                 </tr>
               )) : <tr><td colSpan={6} className="p-8 text-center text-slate-400">មិនមានទិន្នន័យ</td></tr>}
             </tbody>
           </table>
         </div>
       </div>
     </div>
  );
}