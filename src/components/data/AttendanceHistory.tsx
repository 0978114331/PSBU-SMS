import { ClipboardList, Search, Trash2, Pencil, Calendar, CheckSquare, X, Printer } from 'lucide-react';
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

  const filtered = (records || []).filter(r => {
    const matchSearch = (r.name || '').toLowerCase().includes(search.toLowerCase()) || 
                        ((r as any).stu_id || '').toLowerCase().includes(search.toLowerCase());
    const matchDate = filterDate ? r.date === filterDate : true;
    return matchSearch && matchDate;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(filtered.map(r => r.id));
    else setSelectedIds([]);
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!isAdmin || !refresh) return;
    if (!window.confirm(`Delete ${selectedIds.length} records?`)) return;
    
    const { error } = await supabase.from('attendance').delete().in('id', selectedIds);
    if (!error) {
       setSelectedIds([]);
       await refresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin || !refresh) return;
    if (!window.confirm("Delete this record?")) return;
    await supabase.from('attendance').delete().eq('id', id);
    await refresh();
  };

  const handleEdit = async (r: any) => {
    if (!isAdmin || !refresh) return;
    const newName = window.prompt("Edit Name:", r.name);
    if (newName === null) return;
    const newStatus = window.prompt(`Edit Status:`, r.status);
    if (newStatus === null) return;

    if (newName.trim() !== "") {
      await supabase.from('attendance').update({ name: newName.trim(), status: newStatus }).eq('id', r.id);
      await refresh();
    }
  };

  const printPDF = () => {
    window.print();
  };

  const checkboxWidth = 44;

  return (
     <div className="card w-full">
       <style>{`
         @media print {
           body * { visibility: hidden; background: white; }
           #history-print-area, #history-print-area * { visibility: visible; }
           #history-print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
           .no-print { display: none !important; }
           * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
         }
       `}</style>

       <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 no-print">
         <div className="flex items-center gap-3 w-full sm:w-auto">
            <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold"><ClipboardList className="text-primary" /> ទិន្នន័យវត្តមានសរុប</h2>
            <button className="btn bg-[#2c3e50] text-white !py-1.5 !px-3 text-xs shadow-sm ml-auto sm:ml-0" onClick={printPDF}><Printer size={14} /> Save PDF</button>
         </div>
         
         <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 rounded-xl bg-white p-2 border border-slate-200 shadow-sm w-full sm:w-auto transition-colors focus-within:border-primary/50 relative">
               <Calendar size={16} className="text-slate-400 shrink-0 ml-1" />
               <input type="date" className="bg-transparent outline-none text-sm w-full sm:w-[130px] font-medium" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
               {filterDate ? (
                 <button type="button" className="absolute right-2 flex items-center justify-center" onClick={() => setFilterDate('')}>
                   <X size={14} className="cursor-pointer text-slate-400 hover:text-danger" />
                 </button>
               ) : null}
            </div>
            
            <div className="flex items-center gap-2 rounded-xl bg-white p-2 border border-slate-200 shadow-sm w-full sm:w-auto transition-colors focus-within:border-primary/50">
               <Search size={16} className="text-slate-400 shrink-0 ml-1" />
               <input className="bg-transparent outline-none text-sm w-full sm:w-[200px]" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
         </div>
       </div>

       {isAdmin && selectedIds.length > 0 && (
         <div className="mb-4 flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 p-3 px-4 shadow-sm animate-fade-in no-print">
            <div className="flex items-center gap-2 text-rose-700">
               <CheckSquare size={18} />
               <span className="font-bold text-sm">Selected {selectedIds.length}</span>
            </div>
            <button className="btn bg-rose-600 text-white !py-1.5 !px-4 text-xs shadow-md" onClick={handleBulkDelete}>
               <Trash2 size={16} /> Delete All
            </button>
         </div>
       )}
       
       <div className="rounded-xl border border-slate-200 overflow-hidden w-full bg-white" id="history-print-area">
         <h2 className="hidden print:block text-center text-xl font-bold mb-4">ទិន្នន័យវត្តមានសរុប</h2>
         <div className="max-h-[500px] overflow-y-auto overflow-x-auto w-full print:max-h-none print:overflow-visible">
           <table className="w-full min-w-[750px] text-xs sm:text-sm relative border-collapse print:min-w-full">
             <thead className="sticky top-0 z-30 shadow-sm print:static">
               <tr className="bg-slate-100 text-left">
                 {isAdmin && (
                   <th className="p-2 sm:p-3 sticky left-0 z-40 bg-slate-100 border-r border-slate-200 text-center no-print" style={{ width: checkboxWidth, minWidth: checkboxWidth }}>
                     <input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" checked={filtered.length > 0 && selectedIds.length === filtered.length} onChange={handleSelectAll} />
                   </th>
                 )}
                 <th className="p-2 sm:p-3 font-bold whitespace-nowrap sticky z-30 bg-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-200 print:static" style={{ left: isAdmin ? checkboxWidth : 0 }}>ឈ្មោះសិស្ស និង ម៉ោង</th>
                 <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">ថ្ងៃខែ</th>
                 <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">ស្ថានភាព</th>
                 <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">អត្តលេខ</th>
                 <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">មុខវិជ្ជា</th>
                 <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">បន្ទប់ / វេន</th>
                 {isAdmin && <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap no-print">Action</th>}
               </tr>
             </thead>
             <tbody>
               {filtered.length ? filtered.map((r) => (
                 <tr key={r.id} className={`border-t transition ${selectedIds.includes(r.id) ? 'bg-rose-50/50' : 'hover:bg-slate-50'}`}>
                   {isAdmin && (
                     <td className={`p-2 sm:p-3 sticky left-0 z-20 border-r border-slate-100 text-center no-print ${selectedIds.includes(r.id) ? 'bg-rose-50' : 'bg-white'}`} style={{ width: checkboxWidth, minWidth: checkboxWidth }}>
                       <input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" checked={selectedIds.includes(r.id)} onChange={() => handleSelect(r.id)} />
                     </td>
                   )}
                   <td className={`p-2 sm:p-3 font-bold text-primary whitespace-nowrap sticky z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100 print:static print:text-black ${selectedIds.includes(r.id) ? 'bg-rose-50' : 'bg-white'}`} style={{ left: isAdmin ? checkboxWidth : 0 }}>
                     {r.name}
                     <span className="block text-slate-500 text-[10px] font-medium mt-0.5">Time: {(r as any).time || '---'}</span>
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
                     <td className="p-2 sm:p-3 text-center whitespace-nowrap no-print">
                       <button className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded active:scale-95 transition-transform mr-1" onClick={() => handleEdit(r)}><Pencil size={16} /></button>
                       <button className="text-danger hover:text-red-700 hover:bg-red-50 p-1.5 rounded active:scale-95 transition-transform" onClick={() => handleDelete(r.id)}><Trash2 size={16} /></button>
                     </td>
                   )}
                 </tr>
               )) : <tr><td colSpan={isAdmin ? 8 : 6} className="p-10 text-center text-slate-400">No data found</td></tr>}
             </tbody>
           </table>
         </div>
       </div>
     </div>
  );
}