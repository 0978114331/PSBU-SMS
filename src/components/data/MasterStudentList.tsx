import { useState } from 'react';
import { Pencil, Plus, Save, Trash2, X, Printer } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Student } from '@/types';

type StudentForm = Omit<Student, 'id'>;
const emptyForm: StudentForm = { stu_id: '', name: '', gender: 'ប្រុស', dob: '', pob: '', note: '' };

type Props = { students: Student[]; isAdmin: boolean; allowEdit?: boolean; refresh: () => Promise<void> };

export function MasterStudentList({ students, isAdmin, allowEdit, refresh }: Props) {
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canEdit = isAdmin || allowEdit;

  async function saveStudent() {
    if (!(form.stu_id ?? '').trim() || !form.name.trim()) { setError('Error'); return; }
    setSaving(true); setError('');
    const result = editingId
      ? await supabase.from('students').update(form).eq('id', editingId)
      : await supabase.from('students').insert(form);
    setSaving(false);
    if (result.error) { setError('Error'); return; }
    setForm(emptyForm); setEditingId(null); await refresh();
  }

  function editStudent(student: Student) {
    setEditingId(student.id);
    setForm({ stu_id: student.stu_id ?? '', name: student.name, gender: student.gender ?? 'ប្រុស', dob: student.dob ?? '', pob: student.pob ?? '', note: student.note ?? '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteStudent(id: string) {
    if (!window.confirm('Delete?')) return;
    await supabase.from('students').delete().eq('id', id);
    await refresh();
  }

  const printPDF = () => {
    window.print();
  };

  return (
    <section className="card w-full">
      <style>{`
        @media print {
          body * { visibility: hidden; background: white; }
          #student-print-area, #student-print-area * { visibility: visible; }
          #student-print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
      
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-dark">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">☷</span> បញ្ជីឈ្មោះសិស្សសរុប
          </h2>
        </div>
        <div className="flex items-center gap-2">
           <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">{students.length}</span>
           <button className="btn bg-[#2c3e50] text-white !py-1.5 !px-3 text-xs shadow-sm" onClick={printPDF}>
             <Printer size={14} /> Save PDF
           </button>
        </div>
      </div>
      
      {canEdit && (
        <div className="mb-6 rounded-xl border border-primary/10 bg-slate-50 p-4 no-print">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-dark">{editingId ? 'Edit Student' : 'បន្ថែមសិស្សថ្មី'}</h3>
            {editingId && <button className="text-sm text-slate-500 hover:text-danger" onClick={() => { setEditingId(null); setForm(emptyForm); }}><X size={17} /></button>}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <input className="field" placeholder="អត្តលេខ ID" value={form.stu_id ?? ''} onChange={e => setForm({ ...form, stu_id: e.target.value })} />
            <input className="field" placeholder="គោត្តនាម-នាម" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <select className="field" value={form.gender ?? ''} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option>ប្រុស</option><option>ស្រី</option>
            </select>
            <input className="field" type="date" value={form.dob ?? ''} onChange={e => setForm({ ...form, dob: e.target.value })} />
            <input className="field" placeholder="មកពីរាជធានី/ខេត្ត" value={form.pob ?? ''} onChange={e => setForm({ ...form, pob: e.target.value })} />
            <input className="field" placeholder="ផ្សេងៗ" value={form.note ?? ''} onChange={e => setForm({ ...form, note: e.target.value })} />
            <button className="btn btn-primary md:col-span-3" disabled={saving} onClick={() => void saveStudent()}>
              {editingId ? <Save size={17} /> : <Plus size={17} />}
              {editingId ? 'Save Changes' : 'បន្ថែមឈ្មោះសិស្សិ'}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        </div>
      )}
      
      <div className="rounded-xl border border-slate-200 overflow-hidden" id="student-print-area">
        <h2 className="hidden print:block text-center text-xl font-bold mb-4">បញ្ជីឈ្មោះសិស្សសរុប</h2>
        <div className="max-h-[400px] overflow-y-auto overflow-x-auto w-full print:max-h-none print:overflow-visible">
          <table className="w-full min-w-[800px] text-sm relative print:min-w-full">
            <thead className="sticky top-0 z-10 shadow-sm print:static">
              <tr className="bg-slate-100 text-left">
                <th className="p-3">ល.រ</th>
                <th className="p-3">អត្តលេខ (ID)</th>
                <th className="p-3">គោត្តនាម-នាម</th>
                <th className="p-3">ភេទ</th>
                <th className="p-3">ថ្ងៃខែឆ្នាំកំណើត</th>
                <th className="p-3">មកពី</th>
                <th className="p-3">ផ្សេងៗ</th>
                {canEdit && <th className="p-3 text-center no-print">សកម្មភាព</th>}
              </tr>
            </thead>
            <tbody>
              {students.length ? students.map((student, index) => (
                <tr key={student.id} className="border-t transition hover:bg-primary/5">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-bold text-primary">{student.stu_id || '---'}</td>
                  <td className="p-3 font-medium">{student.name}</td>
                  <td className="p-3">{student.gender || '---'}</td>
                  <td className="p-3">{student.dob || '---'}</td>
                  <td className="p-3">{student.pob || '---'}</td>
                  <td className="max-w-40 truncate p-3 text-slate-500 print:whitespace-normal print:max-w-none">{student.note || '---'}</td>
                  {canEdit && (
                    <td className="p-3 no-print">
                      <div className="flex justify-center gap-2">
                        <button className="rounded-lg p-2 text-primary hover:bg-primary/10" onClick={() => editStudent(student)}><Pencil size={17} /></button>
                        {isAdmin && <button className="rounded-lg p-2 text-danger hover:bg-red-50" onClick={() => void deleteStudent(student.id)}><Trash2 size={17} /></button>}
                      </div>
                    </td>
                  )}
                </tr>
              )) : (
                <tr><td className="p-10 text-center text-slate-400" colSpan={canEdit ? 8 : 7}>No Data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}