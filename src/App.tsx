import { useEffect, useState } from 'react';
import { BarChart3, BookOpen, CalendarDays, Camera, CheckCircle2, ClipboardList, Eye, EyeOff, FileBadge, GraduationCap, Pencil, Plus, QrCode, Search, Trash2, UserCheck, Users, X, Save, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { AttendanceHistory } from '@/components/data/AttendanceHistory';
import { MasterStudentList } from '@/components/data/MasterStudentList';
import { ScoreResults } from '@/components/data/ScoreResults';
import { CleaningSchedule } from '@/components/data/CleaningSchedule';
import type { Attendance, Student, Tab } from '@/types';
import { statuses } from '@/types';

function App() {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-light text-primary font-bold">Loading...</div>;
  if (!user) return <AuthScreen />;
  return <Dashboard role={profile?.role ?? 'user'} />;
}

function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user'); const [code, setCode] = useState(''); const [show, setShow] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  
  async function submit() {
    setError(''); setBusy(true);
    const result = mode === 'login' ? await signIn(email, password) : await signUp(email, password, name, role, code);
    setBusy(false); if (result.error) setError(result.error.message); else if (mode === 'register') setMode('login');
  }
  
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center p-5" style={{ backgroundImage: "url('https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1600')" }}>
      <div className="absolute inset-0 bg-slate-950/60" />
      <section className="relative z-10 w-full max-w-[400px] rounded-[20px] border border-white/50 bg-white/90 p-7 text-center shadow-2xl backdrop-blur-md">
        <div className="mx-auto mb-5 flex h-28 w-28 animate-bot-pulse items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner"><GraduationCap size={72} strokeWidth={1.4} /></div>
        <h1 className="mb-5 text-2xl font-bold text-primary">School Management</h1>
        <div className="mb-5 flex border-b-2 border-slate-100">
          <button className={`flex-1 border-b-4 p-2 font-bold ${mode === 'login' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`} onClick={() => setMode('login')}>Login</button>
          <button className={`flex-1 border-b-4 p-2 font-bold ${mode === 'register' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`} onClick={() => setMode('register')}>Register</button>
        </div>
        {mode === 'register' && <input className="field mb-3" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />}
        <input className="field mb-3" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <div className="relative mb-3">
          <input className="field pr-11" type={show ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="absolute right-3 top-3 text-slate-500" onClick={() => setShow(!show)}>{show ? <EyeOff size={19} /> : <Eye size={19} />}</button>
        </div>
        {mode === 'register' && (
          <>
            <select className="field mb-3" value={role} onChange={e => setRole(e.target.value as 'user' | 'admin')}>
              <option value="user">User</option><option value="admin">Admin</option>
            </select>
            {role === 'admin' && <input className="field mb-3" type="password" placeholder="Admin Code" value={code} onChange={e => setCode(e.target.value)} />}
          </>
        )}
        {error && <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-danger">{error}</p>}
        <button className="btn btn-primary w-full py-3" disabled={busy} onClick={submit}>{busy ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}</button>
      </section>
    </main>
  );
}

function Dashboard({ role }: { role: 'admin' | 'user' }) {
  const { user, profile, signOut } = useAuth(); 
  const isAdmin = role === 'admin';
  const [tab, setTab] = useState<Tab>('attendance'); 
  const [menu, setMenu] = useState(false); 
  const [scanner, setScanner] = useState(false);
  const [students, setStudents] = useState<Student[]>([]); 
  const [attendance, setAttendance] = useState<Attendance[]>([]); 
  const [search, setSearch] = useState('');
  
  const [adminInfo, setAdminInfo] = useState({ teacher: '', room: '', subject: '', shift: 'វេនព្រឹក', time: '7:30-11:00', logo: '' });
  const today = new Date().toISOString().slice(0, 10);
  
  useEffect(() => {
    const saved = localStorage.getItem('sys_admin_info');
    if (saved) setAdminInfo(JSON.parse(saved));
    void refresh();
  }, []);

  const updateAdminInfo = (newInfo: any) => {
    setAdminInfo(newInfo);
    localStorage.setItem('sys_admin_info', JSON.stringify(newInfo));
  };
  
  async function refresh() { 
    const [{ data: st }, { data: att }] = await Promise.all([supabase.from('students').select('*').order('name'), supabase.from('attendance').select('*').order('created_at', { ascending: false })]); 
    setStudents((st ?? []) as Student[]); 
    setAttendance((att ?? []) as Attendance[]); 
  }
  
  const todayAttendance = attendance.filter(a => a.date === today); 
  const counts = { present: todayAttendance.filter(a => a.status === statuses[0]).length, leave: todayAttendance.filter(a => a.status === statuses[1]).length, absent: todayAttendance.filter(a => a.status === statuses[2]).length };
  
  return (
    <div className="min-h-screen bg-light pb-5">
      <Navbar activeTab={tab} isAdmin={isAdmin} userLabel={profile?.full_name || user?.email || ''} role={role} mobileOpen={menu} onTabChange={(nextTab) => { setTab(nextTab); setMenu(false); }} onScanner={() => setScanner(true)} onSignOut={() => void signOut()} onMobileToggle={() => setMenu(!menu)} />
      <div className="mx-auto max-w-[1200px] px-3 pt-24">
        <Banner />
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-gradient-to-br from-primary to-secondary p-4 text-center text-white sm:col-span-1 shadow-sm">
            <div className="text-3xl font-bold">{new Date().toLocaleTimeString('en-GB')}</div>
            <div className="text-sm">{new Date().toLocaleDateString('en-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <Stat title="វត្តមាន" value={counts.present} color="bg-success" icon={CheckCircle2} />
          <Stat title="ច្បាប់" value={counts.leave} color="bg-warning" icon={ClipboardList} />
          <Stat title="អវត្តមាន" value={counts.absent} color="bg-danger" icon={X} />
        </div>

        {isAdmin && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <input className="field flex-1" placeholder="Teacher Name..." value={adminInfo.teacher} onChange={e => updateAdminInfo({...adminInfo, teacher: e.target.value})} />
            <input className="field w-24" placeholder="Room" value={adminInfo.room} onChange={e => updateAdminInfo({...adminInfo, room: e.target.value})} />
            <input className="field flex-1" placeholder="Subject..." value={adminInfo.subject} onChange={e => updateAdminInfo({...adminInfo, subject: e.target.value})} />
            <select className="field w-32" value={adminInfo.shift} onChange={e => updateAdminInfo({...adminInfo, shift: e.target.value})}>
              <option>វេនព្រឹក</option><option>វេនរសៀល</option><option>វេនយប់</option>
            </select>
            <div className="flex gap-2 w-full md:w-auto">
              <input className="field flex-1" placeholder="Link Logo" value={adminInfo.logo} onChange={e => updateAdminInfo({...adminInfo, logo: e.target.value})} />
              <label className="btn btn-primary cursor-pointer"><Upload size={18} /><input type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload=(ev)=>updateAdminInfo({...adminInfo, logo: ev.target?.result as string}); r.readAsDataURL(f); } }} /></label>
            </div>
          </div>
        )}

        {!tab.startsWith('warehouse') && tab !== 'students' && tab !== 'cards' && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm border border-slate-200">
            <Search size={19} className="text-slate-400" />
            <input className="w-full outline-none" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}

        {tab === 'attendance' && <AttendancePanel students={students} records={todayAttendance.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || (a.stu_id ?? '').toLowerCase().includes(search.toLowerCase()))} isAdmin={isAdmin} refresh={refresh} adminInfo={adminInfo} setAdminInfo={updateAdminInfo} />}
        {tab === 'warehouse_att' && isAdmin && <AttendanceHistory records={attendance} />}
        {tab === 'students' && isAdmin && <MasterStudentList students={students} isAdmin={isAdmin} refresh={refresh} />}
        {tab === 'scores' && <ScoresPanel students={students} isAdmin={isAdmin} />}
        {tab === 'warehouse_score' && isAdmin && <ScoreResults students={students} />}
        {tab === 'analytics' && <Analytics counts={counts} totalStudents={students.length} />}
        {tab === 'schedule' && <SchedulePanel isAdmin={isAdmin} />}
        {tab === 'cleaning' && <CleaningSchedule isAdmin={isAdmin} />}
        {tab === 'cards' && isAdmin && <CardsPanel />}
      </div>
      {scanner && <Scanner onClose={() => setScanner(false)} students={students} refresh={refresh} />}
    </div>
  );
}

function Stat({ title, value, color, icon: Icon }: { title: string; value: number; color: string; icon: typeof CheckCircle2 }) { return <div className={`${color} rounded-xl p-4 text-center text-white shadow-sm`}><Icon className="mx-auto mb-1" size={20} /><div className="text-sm font-bold">{title}</div><div className="text-3xl font-bold">{value}</div></div>; }
function Banner() { return <div className="relative mb-5 h-36 overflow-hidden rounded-xl"><div className="absolute inset-0 flex w-max animate-slider-move gap-2">{['Angkor Wat temple', 'Cambodia university', 'Bayon temple', 'School campus', 'Angkor Wat temple'].map((label, i) => <div key={label + i} className="flex h-36 w-64 items-end rounded-xl bg-cover bg-center p-4 text-lg font-bold text-white shadow" style={{ backgroundImage: `linear-gradient(0deg,rgba(0,0,0,.65),transparent),url('https://images.pexels.com/photos/${[161853, 301926, 21014, 159844][i % 4]}?auto=compress&cs=tinysrgb&w=800')` }}>{label}</div>)}</div><div className="absolute inset-0 flex items-center justify-center"><div className="rounded-xl bg-white/85 px-5 py-2 text-center shadow-lg backdrop-blur-sm"><b className="text-primary">PSB University</b></div></div></div>; }

function AttendancePanel({ students, records, isAdmin, refresh, adminInfo, setAdminInfo }: any) { 
  const [name, setName] = useState(''); 
  const [status, setStatus] = useState<string>(statuses[0]); 
  const [saving, setSaving] = useState(false); 
  
  async function add() { 
    const student = students.find((s: any) => s.name === name); 
    if (!student) return; 
    setSaving(true); 
    await supabase.from('attendance').insert({ student_id: student.id, stu_id: student.stu_id, name: student.name, gender: student.gender, status, date: new Date().toISOString().slice(0, 10), time: new Date().toLocaleTimeString('en-GB') }); 
    setName(''); setSaving(false); await refresh(); 
  } 

  async function deleteRecord(id: string) {
    if(!window.confirm("Delete record?")) return;
    await supabase.from('attendance').delete().eq('id', id);
    await refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[.8fr_1.5fr]">
      <div className="card h-fit border border-slate-200 shadow-sm">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold"><Plus size={20} className="text-primary" /> ចុះវត្តមាន</h2>
        <select className="field mb-3 w-full" value={name} onChange={e => setName(e.target.value)} disabled={!isAdmin}>
          <option value="">-- Select Student --</option>
          {students.map((s: any) => <option key={s.id}>{s.name}</option>)}
        </select>
        <select className="field mb-4 w-full" value={status} onChange={e => setStatus(e.target.value as string)} disabled={!isAdmin}>
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        {isAdmin ? (
          <button className="btn btn-success w-full py-2.5" disabled={!name || saving} onClick={add}>
            <CheckCircle2 size={18} /> {saving ? 'Saving...' : 'Save'}
          </button>
        ) : (
          <div className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500 border border-slate-200">Use QR Scanner to record attendance.</div>
        )}
      </div>

      <div className="card p-6 border-4 border-slate-200 shadow-sm overflow-hidden" id="exportArea">
        <div className="text-center border-b-[3px] border-double border-primary pb-5 mb-6 relative">
          {adminInfo.logo && <img src={adminInfo.logo} className="w-[90px] h-[90px] object-cover mx-auto mb-3 rounded-full border border-primary shadow-sm" alt="Logo" />}
          <h1 className="text-primary text-2xl md:text-3xl font-bold my-2">របាយការណ៍វត្តមានសិស្សប្រចាំថ្ងៃ</h1>
          <p className="text-slate-500 text-sm md:text-base">ប្រព័ន្ធគ្រប់គ្រងវត្តមានស្វ័យប្រវត្តិ</p>
        </div>
        <div className="flex flex-col md:flex-row justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-sm">
          <div className="leading-loose">
            <div><strong>គ្រូបង្រៀន៖</strong> {adminInfo.teacher || '---'}</div>
            <div><strong>មុខវិជ្ជា៖</strong> {adminInfo.subject || '---'}</div>
            <div className="flex items-center gap-2">
              <strong>ម៉ោងសិក្សា៖</strong> 
              <input className="border border-dashed border-slate-400 bg-transparent text-primary font-bold px-1 w-24 outline-none disabled:border-transparent" value={adminInfo.time} onChange={e => setAdminInfo({...adminInfo, time: e.target.value})} disabled={!isAdmin} />
            </div>
          </div>
          <div className="leading-loose text-left md:text-right mt-3 md:mt-0">
            <div><strong>បន្ទប់សិក្សា៖</strong> {adminInfo.room || '---'}</div>
            <div><strong>វេនសិក្សា៖</strong> <span className="text-warning font-bold">{adminInfo.shift || '---'}</span></div>
            <div><strong>កាលបរិច្ឆេទ៖</strong> {new Date().toLocaleDateString('en-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary text-white text-left">
                <th className="p-3 font-bold">ឈ្មោះសិស្ស</th>
                <th className="p-3 font-bold text-center">ភេទ</th>
                <th className="p-3 font-bold text-center">ស្ថានភាព</th>
                {isAdmin && <th className="p-3 font-bold text-center no-print">សកម្មភាព</th>}
              </tr>
            </thead>
            <tbody>
              {records.length ? records.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-slate-50 transition">
                  <td className="p-3 font-medium">{r.name}<small className="block text-slate-400">Time: {r.time || '---'}</small></td>
                  <td className="p-3 text-center">{r.gender || '---'}</td>
                  <td className="p-3 text-center"><span className={`rounded-full px-3 py-1 text-xs font-bold ${r.status === statuses[0] ? 'bg-green-100 text-green-700' : r.status === statuses[1] ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span></td>
                  {isAdmin && (
                    <td className="p-3 text-center no-print">
                      <button className="text-danger hover:text-red-700" onClick={() => deleteRecord(r.id)}><Trash2 size={16} /></button>
                    </td>
                  )}
                </tr>
              )) : <tr><td colSpan={isAdmin ? 4 : 3} className="p-10 text-center text-slate-400">No data today</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ); 
}

function ScoresPanel({ students, isAdmin }: { students: Student[]; isAdmin: boolean }) { 
  const [subjects, setSubjects] = useState<string[]>(['C++', 'C#', 'Web', 'Database']); 
  const [newSub, setNewSub] = useState('');
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({}); 
  const [savingId, setSavingId] = useState('');

  useEffect(() => {
    const savedSubs = localStorage.getItem('sys_subjects');
    if (savedSubs) setSubjects(JSON.parse(savedSubs));
    loadScores();
  }, []);

  async function loadScores() {
    const { data } = await supabase.from('scores').select('*');
    if (data) {
        const loaded: Record<string, Record<string, number>> = {};
        data.forEach(r => { if (!loaded[r.student_id]) loaded[r.student_id] = {}; loaded[r.student_id][r.subject_name] = r.score; });
        setScores(loaded);
    }
  }

  const addSub = () => {
    if(!newSub.trim() || subjects.includes(newSub.trim())) return;
    const updated = [...subjects, newSub.trim()];
    setSubjects(updated); localStorage.setItem('sys_subjects', JSON.stringify(updated)); setNewSub('');
  };

  const removeSub = (sub: string) => {
    if(!window.confirm(`Delete ${sub}?`)) return;
    const updated = subjects.filter(s => s !== sub);
    setSubjects(updated); localStorage.setItem('sys_subjects', JSON.stringify(updated));
  };

  const updateScore = (studentId: string, sub: string, val: string) => {
    setScores(prev => ({ ...prev, [studentId]: { ...(prev[studentId] || {}), [sub]: Number(val) } }));
  };

  const saveScoreRow = async (studentId: string) => {
    setSavingId(studentId);
    const stuScores = scores[studentId] || {};
    for (const sub of subjects) {
        const val = stuScores[sub] || 0;
        await supabase.from('scores').delete().eq('student_id', studentId).eq('subject_name', sub);
        await supabase.from('scores').insert({ student_id: studentId, subject_name: sub, score: val });
    }
    setSavingId('');
    alert("Saved!");
  };

  return (
    <div className="card border border-slate-200 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold"><GraduationCap className="text-primary" /> លទ្ធផលពិន្ទុ</h2>
      </div>

      {isAdmin && (
        <div className="mb-4 flex flex-wrap items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <input className="field w-48" placeholder="Add Subject..." value={newSub} onChange={e => setNewSub(e.target.value)} />
          <button className="btn btn-primary" onClick={addSub}><Plus size={16}/> Add</button>
          <div className="flex gap-2 overflow-x-auto flex-1 items-center">
             {subjects.map(s => (
               <span key={s} className="bg-slate-200 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 whitespace-nowrap">
                 {s} <X size={14} className="cursor-pointer text-danger hover:scale-110" onClick={() => removeSub(s)} />
               </span>
             ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">ឈ្មោះសិស្ស</th>
              {subjects.map(s => <th className="p-3 text-center" key={s}>{s}</th>)}
              <th className="p-3 text-center">មធ្យមភាគ</th>
              {isAdmin && <th className="p-3 text-center">Action</th>}
            </tr>
          </thead>
          <tbody>
            {students.length ? students.map(s => {
              const stuScores = scores[s.id] || {};
              const total = subjects.reduce((sum, sub) => sum + (stuScores[sub] || 0), 0);
              const avg = subjects.length ? (total / subjects.length) : 0;
              return (
              <tr className="border-t hover:bg-slate-50 transition" key={s.id}>
                <td className="p-3 font-medium">{s.name}</td>
                {subjects.map(sub => (
                  <td key={sub} className="p-2 text-center">
                    <input disabled={!isAdmin} value={stuScores[sub] || ''} onChange={e => updateScore(s.id, sub, e.target.value)} className="w-16 rounded border border-slate-300 p-1.5 text-center disabled:bg-slate-100 disabled:border-transparent outline-none focus:border-[#7f8e3c] focus:ring-2 focus:ring-primary/20" type="number" min="0" max="100" placeholder="0" />
                  </td>
                ))}
                <td className="p-3 text-center font-bold text-secondary">{avg.toFixed(2)}</td>
                {isAdmin && (
                  <td className="p-3 text-center">
                     <button className="btn btn-success py-1.5 px-3" onClick={() => saveScoreRow(s.id)} disabled={savingId === s.id}>
                       <Save size={16} />
                     </button>
                  </td>
                )}
              </tr>
            )}) : <tr><td colSpan={subjects.length + 3} className="p-10 text-center text-slate-400">No students</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  ); 
}

function SchedulePanel({ isAdmin }: { isAdmin: boolean }) { 
  const days = ['ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ']; 
  const times = ['07:30 - 09:00', '09:30 - 11:00', '01:00 - 14:30', '14:45 - 16:15']; 
  const [scheduleData, setScheduleData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { const saved = localStorage.getItem('sys_schedule_config'); if (saved) setScheduleData(JSON.parse(saved)); }, []);

  async function saveSchedule() {
    setSaving(true); localStorage.setItem('sys_schedule_config', JSON.stringify(scheduleData));
    setTimeout(() => { setSaving(false); alert('Saved successfully!'); }, 500);
  }

  return (
    <div className="card shadow-sm border border-slate-200">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><CalendarDays className="text-primary" /> កាលវិភាគរៀន</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-[800px] w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-r bg-slate-50 p-3 text-center w-[120px]">ម៉ោង / ថ្ងៃ</th>
              {days.map(d => <th className="border-b border-r bg-slate-50 p-3 text-center" key={d}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {times.map((time, r) => (
              <tr key={time}>
                <td className="border-b border-r bg-[#43f0ed] p-3 font-bold text-center whitespace-nowrap text-dark">{time}</td>
                {days.map((day, c) => {
                  const cellKey = `sch_${r}_${c}`;
                  return (
                    <td className="border-b border-r p-1" key={cellKey}>
                      <textarea disabled={!isAdmin} value={scheduleData[cellKey] || ''} onChange={(e) => setScheduleData({...scheduleData, [cellKey]: e.target.value})} className="h-16 w-full resize-none rounded p-2 text-center outline-none disabled:bg-white text-sm font-medium border-2 border-transparent focus:border-[#7f8e3c] focus:bg-[#2f67a0] focus:text-white transition-colors" placeholder="មុខវិជ្ជា..." />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isAdmin && <button className="btn btn-success mt-4 py-2.5 px-5" disabled={saving} onClick={saveSchedule}><CheckCircle2 size={18} /> {saving ? 'Saving...' : 'Save Schedule'}</button>}
    </div>
  ); 
}

function CardsPanel() { 
  const [cardType, setCardType] = useState('student');
  const [form, setForm] = useState({ id: '', name: '', f1: '', f2: '', photo: '' });

  return (
    <div className="card-creator-container mx-auto p-0">
      <div className="card bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-5">
        <h3 className="text-primary font-bold text-lg mb-4 flex items-center gap-2"><FileBadge /> ជ្រើសរើសទម្រង់កាតដែលចង់បង្កើត</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className={`cursor-pointer border-2 rounded-xl p-4 text-center transition ${cardType === 'student' ? 'border-primary bg-blue-50 shadow-md' : 'border-slate-200 hover:border-primary hover:-translate-y-1'}`} onClick={() => {setCardType('student'); setForm({id:'',name:'',f1:'',f2:'',photo:''})}}>
            <div className="w-full h-[100px] rounded-lg mb-3 flex items-center justify-center text-white font-bold text-xs" style={{ background: 'linear-gradient(90deg, #2c3e50, #0984e3)' }}>STUDENT</div><h4 className="font-bold text-sm">កាតសិស្ស</h4>
          </div>
          <div className={`cursor-pointer border-2 rounded-xl p-4 text-center transition ${cardType === 'company' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-slate-200 hover:border-orange-500 hover:-translate-y-1'}`} onClick={() => {setCardType('company'); setForm({id:'',name:'',f1:'',f2:'',photo:''})}}>
            <div className="w-full h-[100px] rounded-lg mb-3 flex items-center justify-center text-orange-500 font-bold text-xs border-b-4 border-orange-500 bg-slate-800">COMPANY</div><h4 className="font-bold text-sm">កាតក្រុមហ៊ុន</h4>
          </div>
          <div className={`cursor-pointer border-2 rounded-xl p-4 text-center transition ${cardType === 'staff' ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-200 hover:border-emerald-500 hover:-translate-y-1'}`} onClick={() => {setCardType('staff'); setForm({id:'',name:'',f1:'',f2:'',photo:''})}}>
            <div className="w-full h-[100px] rounded-lg mb-3 flex items-center justify-center text-emerald-500 font-bold text-xs border-2 border-emerald-500 bg-white">STAFF</div><h4 className="font-bold text-sm">កាតបុគ្គលិក</h4>
          </div>
          <div className={`cursor-pointer border-2 rounded-xl p-4 text-center transition ${cardType === 'business' ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-slate-200 hover:border-amber-500 hover:-translate-y-1'}`} onClick={() => {setCardType('business'); setForm({id:'',name:'',f1:'',f2:'',photo:''})}}>
            <div className="w-full h-[100px] rounded-lg mb-3 flex items-center justify-center text-amber-500 font-bold text-xs border-l-4 border-amber-500 bg-slate-900">VIP BUSINESS</div><h4 className="font-bold text-sm">កាត VIP</h4>
          </div>
          <div className={`cursor-pointer border-2 rounded-xl p-4 text-center transition ${cardType === 'press' ? 'border-rose-500 bg-rose-50 shadow-md' : 'border-slate-200 hover:border-rose-500 hover:-translate-y-1'}`} onClick={() => {setCardType('press'); setForm({id:'',name:'',f1:'',f2:'',photo:''})}}>
            <div className="w-full h-[100px] rounded-lg mb-3 flex items-center justify-center text-rose-500 font-bold text-xs border-t-8 border-rose-500 bg-white shadow-inner">PRESS</div><h4 className="font-bold text-sm">កាតសារព័ត៌មាន</h4>
          </div>
          <div className={`cursor-pointer border-2 rounded-xl p-4 text-center transition ${cardType === 'library' ? 'border-green-500 bg-green-50 shadow-md' : 'border-slate-200 hover:border-green-500 hover:-translate-y-1'}`} onClick={() => {setCardType('library'); setForm({id:'',name:'',f1:'',f2:'',photo:''})}}>
            <div className="w-full h-[100px] rounded-lg mb-3 flex items-center justify-center text-green-800 font-bold text-xs border border-green-500 bg-gradient-to-br from-green-50 to-green-100">LIBRARY</div><h4 className="font-bold text-sm">កាតបណ្ណាល័យ</h4>
          </div>
        </div>

        <div className="p-5 border border-slate-200 rounded-xl bg-slate-50">
           <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
             <input className="field" placeholder="ID" value={form.id} onChange={e => setForm({...form, id: e.target.value})} />
             <input className="field" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
             <input className="field" placeholder="Field 1" value={form.f1} onChange={e => setForm({...form, f1: e.target.value})} />
             <input className="field" placeholder="Field 2" value={form.f2} onChange={e => setForm({...form, f2: e.target.value})} />
             <label className="btn btn-primary cursor-pointer h-full"><Upload size={18}/> Photo<input type="file" className="hidden" accept="image/*" onChange={(e)=>{const f=e.target.files?.[0]; if(f){const r=new FileReader(); r.onload=(ev)=>setForm({...form, photo: ev.target?.result as string}); r.readAsDataURL(f);}}} /></label>
           </div>
        </div>
      </div>

      <div className="card bg-white p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
         {cardType === 'student' && (
            <div className="student-card">
               <div className="card-header">STUDENT IDENTITY CARD</div>
               <div className="card-body">
                  <div className="photo-area">
                     <div className="photo-placeholder">{form.photo ? <img src={form.photo} /> : <UserCheck size={30} className="text-slate-300"/>}</div>
                     <p style={{fontSize:'9px', fontWeight:'bold', marginTop:'5px', color:'#0984e3'}}>ID: {form.id || '---'}</p>
                  </div>
                  <div className="info-area">
                     <h4>{form.name || 'Student Name'}</h4>
                     <p>Year: <b>{form.f1 || '---'}</b></p>
                     <p>Major: <b>{form.f2 || '---'}</b></p>
                     <div className="qr-right"><QrCode size={40} className="text-slate-400" /></div>
                  </div>
               </div>
               <div className="card-footer"></div>
            </div>
         )}
         {cardType === 'company' && (
            <div className="company-card-h">
               <div className="card-header"><span>CO. IDENTITY CARD</span><span style={{fontSize:'9px', color:'#64748b'}}>VIP MEMBER</span></div>
               <div className="card-body">
                  <div className="photo-placeholder">{form.photo ? <img src={form.photo} /> : <UserCheck size={30} className="text-slate-300"/>}</div>
                  <div className="info-area">
                     <h4>{form.name || 'Employee Name'}</h4>
                     <p>Dept: <b>{form.f1 || '---'}</b></p>
                     <p>Role: <b>{form.f2 || '---'}</b></p>
                     <p style={{fontSize:'9px', color:'#94a3b8', fontFamily:'monospace', marginTop:'3px'}}>ID: {form.id || '---'}</p>
                  </div>
                  <div className="qr-right"><QrCode size={40} className="text-slate-400" /></div>
               </div>
            </div>
         )}
         {cardType === 'staff' && (
            <div className="staff-card-v">
               <div className="card-top"><h5>KINGDOM OF CAMBODIA</h5><p>{form.f1 || 'Ministry/Unit'}</p></div>
               <div className="photo-placeholder">{form.photo ? <img src={form.photo} /> : <UserCheck size={40} className="text-slate-300"/>}</div>
               <div className="info-area">
                  <h4>{form.name || 'Staff Name'}</h4>
                  <p style={{fontWeight:'bold', color:'#00b894', fontSize:'12px'}}>{form.f2 || 'Officer'}</p>
                  <div className="card-id-tag">№: {form.id || '---'}</div>
                  <div style={{display:'block', textAlign:'center', marginTop:'5px'}}><div className="qr-bottom"><QrCode size={40} className="text-slate-400" /></div></div>
               </div>
            </div>
         )}
         {cardType === 'business' && (
            <div className="business-card-h">
               <div className="left-panel">
                  <div className="photo-placeholder">{form.photo ? <img src={form.photo} /> : <UserCheck size={30} className="text-slate-500"/>}</div>
                  <span>ID: {form.id || '---'}</span>
               </div>
               <div className="right-panel">
                  <div className="info-header"><h4>{form.name || 'Member Name'}</h4><p style={{color:'#f59e0b', fontSize:'9px'}}>{form.f1 || 'VIP GOLD MEMBER'}</p></div>
                  <div className="info-details"><p style={{color:'#9ca3af', fontSize:'9px', display:'flex', alignItems:'center', gap:'4px', marginBottom:'2px'}}><CalendarDays size={10}/> EXP: {form.f2 || '---'}</p><p style={{color:'#6b7280', fontSize:'8px', marginTop:'4px'}}>ACCESS ALL PRESTIGE LOUNGE</p></div>
                  <div className="qr-area"><QrCode size={40} className="text-slate-400" /></div>
               </div>
            </div>
         )}
         {cardType === 'press' && (
            <div className="press-card-v">
               <div className="card-header">PRESS</div>
               <div className="photo-placeholder">{form.photo ? <img src={form.photo} /> : <Camera size={40} className="text-slate-300"/>}</div>
               <div className="info-area">
                  <h4>{form.name || 'Reporter Name'}</h4><p>{form.f1 || 'REPORTER'}</p><span>AGENCY: <b>{form.f2 || 'News Channel'}</b></span><div style={{fontSize:'10px', marginTop:'5px', color:'#64748b'}}>ID: {form.id || '---'}</div>
               </div>
               <div className="qr-bottom"><QrCode size={40} className="text-slate-400" /></div>
            </div>
         )}
         {cardType === 'library' && (
            <div className="library-card-h">
               <div className="left-col">
                  <div><div className="lib-header">LIBRARY CARD</div><div className="info-area"><h4>{form.name || 'Reader Name'}</h4><p>TYPE: <b>{form.f1 || '---'}</b></p><p>JOINED: <b>{form.f2 || '---'}</b></p></div></div>
                  <div className="qr-area"><QrCode size={40} className="text-slate-400" /></div>
               </div>
               <div className="right-col">
                  <div className="photo-placeholder">{form.photo ? <img src={form.photo} /> : <BookOpen size={30} className="text-slate-300"/>}</div>
                  <div className="id-text">ID: {form.id || '---'}</div>
               </div>
            </div>
         )}
      </div>
    </div>
  ); 
}

function Scanner({ onClose, students, refresh }: { onClose: () => void; students: Student[]; refresh: () => Promise<void> }) { const [value, setValue] = useState(''); async function record() { const student = students.find(s => s.stu_id === value.trim()); if (!student) return; await supabase.from('attendance').insert({ student_id: student.id, stu_id: student.stu_id, name: student.name, gender: student.gender, status: statuses[0], date: new Date().toISOString().slice(0, 10), time: new Date().toLocaleTimeString('en-GB') }); await refresh(); setValue(''); } return <div className="fixed inset-0 z-[100] bg-black"><div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-black" /><div className="relative z-10 flex h-full flex-col items-center justify-center"><div className="relative h-64 w-64 rounded-xl shadow-[0_0_0_4000px_rgba(0,0,0,.65)]"><span className="absolute left-0 top-0 h-10 w-10 rounded-tl-xl border-l-4 border-t-4 border-white" /><span className="absolute right-0 top-0 h-10 w-10 rounded-tr-xl border-r-4 border-t-4 border-white" /><span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-xl border-b-4 border-l-4 border-white" /><span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-xl border-b-4 border-r-4 border-white" /><div className="absolute left-[5%] top-0 h-0.5 w-[90%] animate-scan-laser bg-green-400 shadow-[0_0_15px_#00ff00]" /></div><p className="mt-10 text-center text-white">Center QR Code inside frame</p><div className="mt-5 flex w-72 gap-2"><input className="rounded-lg bg-white px-3 py-2 text-sm outline-none" placeholder="Enter ID Manually" value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') void record(); }} /><button className="rounded-lg bg-success px-3 text-white" onClick={() => void record()}><CheckCircle2 size={18} /></button></div><button className="btn mt-6 border border-white/50 bg-white/15 text-white" onClick={onClose}><X size={18} /> Close Camera</button></div></div>; }

function Analytics({ counts, totalStudents }: { counts: { present: number; leave: number; absent: number }; totalStudents: number }) { const total = counts.present + counts.leave + counts.absent || 1; return <div className="grid gap-4 lg:grid-cols-2"><div className="card"><h2 className="mb-5 text-xl font-bold">វិភាគវត្តមានសិស្ស</h2><div className="mx-auto flex h-64 w-64 items-center justify-center rounded-full" style={{ background: `conic-gradient(#00b894 0 ${(counts.present / total) * 100}%, #f1c40f ${(counts.present / total) * 100}% ${((counts.present + counts.leave) / total) * 100}%, #d63031 ${((counts.present + counts.leave) / total) * 100}% 100%)` }}><div className="flex h-40 w-40 items-center justify-center rounded-full bg-white text-center"><div><b className="text-3xl">{total - 1}</b><small className="block text-slate-500">កំណត់ត្រា</small></div></div></div><div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm"><div className="text-success"><b>{counts.present}</b><span className="block text-slate-500">វត្តមាន</span></div><div className="text-yellow-600"><b>{counts.leave}</b><span className="block text-slate-500">ច្បាប់</span></div><div className="text-danger"><b>{counts.absent}</b><span className="block text-slate-500">អវត្តមាន</span></div></div></div><div className="card"><h2 className="mb-5 text-xl font-bold">ស្ថិតិទូទៅ</h2><div className="space-y-4"><div className="flex items-center justify-between rounded-xl bg-primary/10 p-4"><span>សិស្សសរុប</span><b className="text-2xl text-primary">{totalStudents}</b></div><div className="flex items-center justify-between rounded-xl bg-success/10 p-4"><span>អត្រាវត្តមាន</span><b className="text-2xl text-success">{Math.round((counts.present / total) * 100)}%</b></div><div className="flex items-center justify-between rounded-xl bg-secondary/10 p-4"><span>ថ្ងៃនេះ</span><b className="text-lg text-secondary">{new Date().toLocaleDateString('km-KH')}</b></div></div></div></div>; }

export default App;