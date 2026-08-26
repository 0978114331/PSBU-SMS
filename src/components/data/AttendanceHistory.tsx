import { ClipboardList, Search, Trash2, Pencil, Calendar, CheckSquare, X } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Attendance } from '@/types';

type Props = { 
  records: Attendance[]; 
  isAdmin?: boolean; 
  refresh?: () => Promise<void>;
};

export function AttendanceHistory({ records, isAdmin, refresh }: Props) {
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // មុខងារច្រោះទិន្នន័យ (តាមឈ្មោះ/អត្តលេខ និងតាមថ្ងៃខែ)
  const filtered = (records || []).filter(r => {
    const matchSearch = (r.name || '').toLowerCase().includes(search.toLowerCase()) || 
                        ((r as any).stu_id || '').toLowerCase().includes(search.toLowerCase());
    const matchDate = filterDate ? r.date === filterDate : true;
    return matchSearch && matchDate;
  });

  // មុខងារជ្រើសរើស Checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(filtered.map(r => r.id));
    else setSelectedIds([]);
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // មុខងារលុបច្រើននាក់ (Bulk Delete)
  const handleBulkDelete = async () => {
    if (!isAdmin || !refresh) return;
    if (!window.confirm(`តើអ្នកពិតជាចង់លុបទិន្នន័យចំនួន ${selectedIds.length} នេះមែនទេ?`)) return;
    
    const { error } = await supabase.from('attendance').delete().in('id', selectedIds);
    if (!error) {
       setSelectedIds([]);
       await refresh();
    } else {
       alert("បរាជ័យក្នុងការលុប៖ " + error.message);
    }
  };

  // មុខងារលុបតែម្នាក់ (Single Delete)
  const handleDelete = async (id: string) => {
    if (!isAdmin || !refresh) return;
    if (!window.confirm("តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?")) return;
    await supabase.from('attendance').delete().eq('id', id);
    await refresh();
  };

  // មុខងារកែប្រែ (Edit)
  const handleEdit = async (r: any) => {
    if (!isAdmin || !refresh) return;
    const newName = window.prompt("កែប្រែឈ្មោះសិស្ស:", r.name);
    if (newName === null) return;
    const newStatus = window.prompt(`កែប្រែស្ថានភាព (វត្តមាន, ច្បាប់, អវត្តមាន):`, r.status);
    if (newStatus === null) return;

    if (newName.trim() !== "") {
      await supabase.from('attendance').update({ name: newName.trim(), status: newStatus }).eq('id', r.id);
      await refresh();
    }
  };

  const checkboxWidth = 44;

  return (
     <div className="card w-full">
       <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
         <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold"><ClipboardList className="text-primary" /> ទិន្នន័យវត្តមានសរុប</h2>
         
         <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 rounded-xl bg-white p-2 border border-slate-200 shadow-sm w-full sm:w-auto transition-colors focus-within:border-primary/50 relative">
               <Calendar size={16} className="text-slate-400 shrink-0 ml-1" />
               <input type="date" className="bg-transparent outline-none text-sm w-full sm:w-[130px] font-medium" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
               
               {/* ដំណោះស្រាយ Error បន្ទាត់ក្រហមដោយប្រើ button រុំពីក្រៅ X */}
               {filterDate ? (
                 <button type="button" className="absolute right-2 flex items-center justify-center" title="លុបថ្ងៃខែចេញ" onClick={() => setFilterDate('')}>
                   <X size={14} className="cursor-pointer text-slate-400 hover:text-danger" />
                 </button>
               ) : null}
            </div>
            
            <div className="flex items-center gap-2 rounded-xl bg-white p-2 border border-slate-200 shadow-sm w-full sm:w-auto transition-colors focus-within:border-primary/50">
               <Search size={16} className="text-slate-400 shrink-0 ml-1" />
               <input className="bg-transparent outline-none text-sm w-full sm:w-[200px]" placeholder="ស្វែងរកឈ្មោះ អត្តលេខ..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
         </div>
       </div>

       {isAdmin && selectedIds.length > 0 && (
         <div className="mb-4 flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 p-3 px-4 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 text-rose-700">
               <CheckSquare size={18} />
               <span className="font-bold text-sm">បានជ្រើសរើស {selectedIds.length} កំណត់ត្រា</span>
            </div>
            <button className="btn bg-rose-600 text-white !py-1.5 !px-4 text-xs shadow-md" onClick={handleBulkDelete}>
               <Trash2 size={16} /> លុបទាំងអស់
            </button>
         </div>
       )}
       
       <div className="rounded-xl border border-slate-200 overflow-hidden w-full bg-white">
         <div className="max-h-[500px] overflow-y-auto overflow-x-auto w-full">
           <table className="w-full min-w-[750px] text-xs sm:text-sm relative border-collapse">
             <thead className="sticky top-0 z-30 shadow-sm">
               <tr className="bg-slate-100 text-left">
                 
                 {isAdmin && (
                   <th className="p-2 sm:p-3 sticky left-0 z-40 bg-slate-100 border-r border-slate-200 text-center" style={{ width: checkboxWidth, minWidth: checkboxWidth }}>
                     <input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" checked={filtered.length > 0 && selectedIds.length === filtered.length} onChange={handleSelectAll} title="ជ្រើសរើសទាំងអស់" />
                   </th>
                 )}

                 <th className="p-2 sm:p-3 font-bold whitespace-nowrap sticky z-30 bg-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-200" style={{ left: isAdmin ? checkboxWidth : 0 }}>ឈ្មោះសិស្ស និង ម៉ោង</th>
                 
                 <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">ថ្ងៃខែ</th>
                 <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">ស្ថានភាព</th>
                 <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">អត្តលេខ</th>
                 <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">មុខវិជ្ជា</th>
                 <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">បន្ទប់ / វេន</th>
                 
                 {isAdmin && <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">សកម្មភាព</th>}
               </tr>
             </thead>
             <tbody>
               {filtered.length ? filtered.map((r) => (
                 <tr key={r.id} className={`border-t transition ${selectedIds.includes(r.id) ? 'bg-rose-50/50' : 'hover:bg-slate-50'}`}>
                   
                   {isAdmin && (
                     <td className={`p-2 sm:p-3 sticky left-0 z-20 border-r border-slate-100 text-center ${selectedIds.includes(r.id) ? 'bg-rose-50' : 'bg-white'}`} style={{ width: checkboxWidth, minWidth: checkboxWidth }}>
                       <input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" checked={selectedIds.includes(r.id)} onChange={() => handleSelect(r.id)} />
                     </td>
                   )}

                   <td className={`p-2 sm:p-3 font-bold text-primary whitespace-nowrap sticky z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100 ${selectedIds.includes(r.id) ? 'bg-rose-50' : 'bg-white'}`} style={{ left: isAdmin ? checkboxWidth : 0 }}>
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
                   
                   {isAdmin && (
                     <td className="p-2 sm:p-3 text-center whitespace-nowrap">
                       <button className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded active:scale-95 transition-transform mr-1" onClick={() => handleEdit(r)} title="កែប្រែ"><Pencil size={16} /></button>
                       <button className="text-danger hover:text-red-700 hover:bg-red-50 p-1.5 rounded active:scale-95 transition-transform" onClick={() => handleDelete(r.id)} title="លុប"><Trash2 size={16} /></button>
                     </td>
                   )}
                 </tr>
               )) : <tr><td colSpan={isAdmin ? 8 : 6} className="p-10 text-center text-slate-400">មិនមានទិន្នន័យសម្រាប់ស្វែងរកនេះទេ</td></tr>}
             </tbody>
           </table>
         </div>
       </div>
     </div>
  );
}