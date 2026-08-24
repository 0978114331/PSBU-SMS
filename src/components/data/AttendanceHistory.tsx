import { useMemo, useState } from 'react';
import { CalendarDays, ClipboardList, RotateCcw } from 'lucide-react';
import type { Attendance } from '@/types';

type Props = { records: Attendance[] };

export function AttendanceHistory({ records }: Props) {
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => records.filter(record => (!date || record.date === date) && (status === 'all' || record.status === status) && record.name.toLowerCase().includes(query.toLowerCase())), [date, query, records, status]);

  return <section className="card">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-xl font-bold text-dark"><ClipboardList className="text-primary" /> ទិន្នន័យវត្តមាន</h2><p className="mt-1 text-sm text-slate-500">ប្រវត្តិកត់ត្រាវត្តមានទាំងអស់</p></div><span className="rounded-full bg-success/10 px-3 py-1 text-sm font-bold text-success">{filtered.length} កំណត់ត្រា</span></div>
    <div className="mb-5 grid gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-[1fr_1fr_1.5fr_auto]"><label className="relative"><CalendarDays className="absolute left-3 top-3 text-slate-400" size={18} /><input className="field pl-10" type="date" value={date} onChange={e => setDate(e.target.value)} /></label><select className="field" value={status} onChange={e => setStatus(e.target.value)}><option value="all">ស្ថានភាពទាំងអស់</option><option>វត្តមាន</option><option>ច្បាប់</option><option>អវត្តមាន</option></select><input className="field" placeholder="ស្វែងរកឈ្មោះសិស្ស" value={query} onChange={e => setQuery(e.target.value)} /><button className="btn bg-slate-600 text-white" onClick={() => { setDate(''); setStatus('all'); setQuery(''); }}><RotateCcw size={17} /> សម្អាត</button></div>
    <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[700px] text-sm"><thead><tr className="bg-slate-50 text-left"><th className="p-3">កាលបរិច្ឆេទ</th><th className="p-3">ម៉ោង</th><th className="p-3">ឈ្មោះសិស្ស</th><th className="p-3">ភេទ</th><th className="p-3">វេន</th><th className="p-3">ស្ថានភាពវត្តមាន</th></tr></thead><tbody>{filtered.length ? filtered.map(record => <tr className="border-t transition hover:bg-primary/5" key={record.id}><td className="p-3">{record.date}</td><td className="p-3 text-slate-500">{record.time || '---'}</td><td className="p-3 font-medium">{record.name}<small className="block text-slate-400">{record.stu_id || '---'}</small></td><td className="p-3">{record.gender || '---'}</td><td className="p-3">{record.shift || '---'}</td><td className="p-3"><StatusBadge status={record.status} /></td></tr>) : <tr><td className="p-10 text-center text-slate-400" colSpan={6}>មិនមានទិន្នន័យត្រូវនឹងការស្វែងរក</td></tr>}</tbody></table></div>
  </section>;
}

function StatusBadge({ status }: { status: string }) { const styles = status === 'វត្តមាន' ? 'bg-green-100 text-green-700' : status === 'ច្បាប់' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'; return <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles}`}>{status}</span>; }
