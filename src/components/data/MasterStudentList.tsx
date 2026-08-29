import { useState } from 'react';
import { Search, Plus, Trash2, Pencil, CheckCircle2, X, GraduationCap, ShieldAlert, ShieldCheck, Printer } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function MasterStudentList({ students, isAdmin, allowEdit, refresh, adminInfo, setAdminInfo }: any) {
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<{ id: string; stu_id: string; name: string; gender: string; dob: string; phone: string }>({ id: '', stu_id: '', name: '', gender: 'Male', dob: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const canEdit = isAdmin || allowEdit;
  const filtered = students.filter((s: any) => 
    (s.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (s.stu_id || '').toLowerCase().includes(search.toLowerCase())
  );

  async function saveStudent() {
    if (!form.name.trim() || !form.stu_id.trim()) return;
    setSaving(true);
    
    if (form.id) {
      await supabase.from('students').update({ stu_id: form.stu_id, name: form.name, gender: form.gender, dob: form.dob, phone: form.phone }).eq('id', form.id);
    } else {
      await supabase.from('students').insert([{ stu_id: form.stu_id, name: form.name, gender: form.gender, dob: form.dob, phone: form.phone }]);
    }
    
    if(refresh) refresh();
    setForm({ id: '', stu_id: '', name: '', gender: 'Male', dob: '', phone: '' });
    setSaving(false);
  }

  function edit(s: any) {
    setForm({ 
      id: s.id || '', 
      stu_id: s.stu_id || '', 
      name: s.name || '', 
      gender: s.gender || 'Male',
      dob: s.dob || '',
      phone: s.phone || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteStudent(id: string | null | undefined) {
    if(!id || !window.confirm("តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?")) return;
    await supabase.from('students').delete().eq('id', id);
    if(refresh) refresh();
  }

  async function toggleQRBlock(stu_id: string | null | undefined) {
    if (!isAdmin || !stu_id) return;
    
    const currentBlocked = adminInfo?.blockedQRStudents || [];
    const isBlocked = currentBlocked.includes(stu_id);
    
    let newBlocked;
    if (isBlocked) {
       newBlocked = currentBlocked.filter((id: string) => id !== stu_id);
    } else {
       newBlocked = [...currentBlocked, stu_id];
    }

    const newAdminInfo = { ...adminInfo, blockedQRStudents: newBlocked };
    if(setAdminInfo) setAdminInfo(newAdminInfo);

    const { data } = await supabase.from('schedules').select('id').eq('type', 'school_info').maybeSingle();
    if (data?.id) {
      await supabase.from('schedules').update({ data_json: newAdminInfo }).eq('id', data.id);
    }
  }

  const printList = () => {
    document.body.classList.add('print-students');
    window.print();
    setTimeout(() => document.body.classList.remove('print-students'), 500);
  };

  return (
    <div className="card w-full relative" id="studentListArea">
      <style>{`
        @media print {
          body.print-students * { visibility: hidden; background: white; }
          body.print-students #studentListArea, body.print-students #studentListArea * { visibility: visible; }
          body.print-students #studentListArea { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; padding: 20px; margin: 0; }
          body.print-students .no-print { display: none !important; }
        }
      `}</style>
      
      <div className="flex flex-wrap items-center justify-between mb-5 gap-3 no-print">
        <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-slate-800"><GraduationCap className="text-primary" /> បញ្ជីឈ្មោះសិស្ស ({students.length})</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
           <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl w-full sm:w-[250px]">
              <Search size={16} className="text-slate-400" />
              <input className="bg-transparent outline-none w-full text-sm" placeholder="ស្វែងរកអត្តលេខ ឬឈ្មោះ..." value={search} onChange={e => setSearch(e.target.value)} />
           </div>
           <button className="btn bg-[#2c3e50] text-white p-2 sm:px-3 sm:py-1.5 rounded-xl shadow-md transition hover:-translate-y-0.5" onClick={printList} title="បោះពុម្ព PDF"><Printer size={18}/></button>
        </div>
      </div>

      <div className="hidden print:block mb-4 text-center">
         <h1 className="text-xl font-bold text-slate-800 mb-1">បញ្ជីឈ្មោះសិស្សសរុប</h1>
         <p className="text-sm text-slate-500">ចំនួនសរុប៖ {students.length} នាក់ | កាលបរិច្ឆេទ៖ {new Date().toLocaleDateString('en-GB')}</p>
      </div>

      {canEdit && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-[1fr_1.5fr_1fr_1fr_1.5fr_auto] gap-3 no-print">
          <input className="field bg-white" placeholder="អត្តលេខ (ID)" value={form.stu_id} onChange={e => setForm({...form, stu_id: e.target.value})} />
          <input className="field bg-white" placeholder="ឈ្មោះសិស្ស" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <select className="field bg-white" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
            <option value="Male">ប្រុស (Male)</option>
            <option value="Female">ស្រី (Female)</option>
          </select>
          <input type="date" className="field bg-white" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} title="ថ្ងៃខែឆ្នាំកំណើត" />
          <input className="field bg-white" placeholder="លេខទូរស័ព្ទ" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          
          <div className="flex gap-2">
            {form.id && <button className="btn bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => setForm({ id: '', stu_id: '', name: '', gender: 'Male', dob: '', phone: '' })}><X size={16}/></button>}
            <button className="btn btn-primary" disabled={saving || !form.name || !form.stu_id} onClick={saveStudent}>
               {saving ? '...' : (form.id ? 'រក្សាទុក' : 'បន្ថែម')}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 overflow-hidden w-full">
        <div className="max-h-[500px] overflow-y-auto w-full print:max-h-none print:overflow-visible">
          <table className="w-full min-w-[800px] text-xs sm:text-sm">
            <thead className="sticky top-0 z-10 bg-slate-100 shadow-sm print:shadow-none">
              <tr>
                <th className="p-3 text-center w-[60px]">ល.រ</th>
                <th className="p-3 text-left">អត្តលេខ</th>
                <th className="p-3 text-left">ឈ្មោះសិស្ស</th>
                <th className="p-3 text-center">ភេទ</th>
                <th className="p-3 text-center">ថ្ងៃខែឆ្នាំកំណើត</th>
                <th className="p-3 text-center">លេខទូរស័ព្ទ</th>
                {isAdmin && <th className="p-3 text-center no-print">សិទ្ធិស្កែន QR</th>}
                {canEdit && <th className="p-3 text-center no-print">សកម្មភាព</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((s: any, index: number) => {
                const isBlocked = s.stu_id ? adminInfo?.blockedQRStudents?.includes(s.stu_id) : false;
                return (
                <tr className="border-t hover:bg-slate-50 transition print:break-inside-avoid" key={s.id || index}>
                  <td className="p-3 text-center font-bold text-slate-400">{index + 1}</td>
                  <td className="p-3 font-bold text-slate-600">{s.stu_id || '---'}</td>
                  <td className="p-3 font-bold text-primary">{s.name || '---'}</td>
                  <td className="p-3 text-center">{s.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}</td>
                  <td className="p-3 text-center text-slate-600">{s.dob || '---'}</td>
                  <td className="p-3 text-center text-slate-600">{s.phone || '---'}</td>
                  
                  {isAdmin && (
                    <td className="p-3 text-center no-print">
                       <button 
                         onClick={() => toggleQRBlock(s.stu_id)}
                         className={`flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isBlocked ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'}`}
                       >
                         {isBlocked ? <><ShieldAlert size={14} /> បានបិទ</> : <><ShieldCheck size={14} /> អនុញ្ញាត</>}
                       </button>
                    </td>
                  )}

                  {canEdit && (
                    <td className="p-3 text-center no-print">
                      <button className="text-blue-500 hover:bg-blue-100 p-1.5 rounded mr-1" onClick={() => edit(s)}><Pencil size={14}/></button>
                      <button className="text-danger hover:bg-rose-100 p-1.5 rounded" onClick={() => deleteStudent(s.id)}><Trash2 size={14}/></button>
                    </td>
                  )}
                </tr>
              ) }) : <tr><td colSpan={isAdmin ? 8 : 7} className="p-8 text-center text-slate-400">មិនមានទិន្នន័យសិស្សទេ</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}