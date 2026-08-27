import { useEffect, useState, useRef, useMemo } from 'react';
import { BarChart3, BookOpen, CalendarDays, Camera, CheckCircle2, ClipboardList, Eye, EyeOff, FileBadge, GraduationCap, Pencil, Plus, QrCode, Search, Trash2, UserCheck, Users, X, Save, Upload, Download, Printer, Filter, RefreshCw, MapPin, Image as ImageIcon, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { AttendanceHistory } from '@/components/data/AttendanceHistory';
import { MasterStudentList } from '@/components/data/MasterStudentList';
import { ScoreResults } from '@/components/data/ScoreResults';
import type { Attendance, Student, Tab } from '@/types';
import { statuses } from '@/types';
import html2canvas from 'html2canvas';
import { Html5Qrcode } from 'html5-qrcode';

function App() {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-light text-primary font-bold">Loading...</div>;
  if (!user) return <AuthScreen />;
  return <Dashboard role={profile?.role ?? 'user'} />;
}

function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user'); 
  const [code, setCode] = useState(''); 
  const [show, setShow] = useState(false); 
  const [error, setError] = useState(''); 
  const [busy, setBusy] = useState(false);
  
  async function submit() {
    setError(''); setBusy(true);
    const result = mode === 'login' ? await signIn(email, password) : await signUp(email, password, name, role, code);
    setBusy(false); 
    if (result.error) setError(result.error.message); 
    else if (mode === 'register') setMode('login');
  }

  async function handleGoogleLogin() {
    setError(''); setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
    if (error) setError(error.message);
    setBusy(false);
  }
  
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-cover bg-center p-4 sm:p-5 font-sans antialiased" style={{ backgroundImage: "url('https://i.ibb.co/nqpzhb09/Kc-hacker.png')" }}>
      
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-blue-900/80 backdrop-blur-[2px]" />
      
      <section className="relative z-10 w-full max-w-[420px] rounded-[24px] border border-white/30 bg-white/80 p-6 sm:p-8 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl mx-auto transition-all duration-300">
        
        <div className="mx-auto mb-6 flex h-20 w-20 sm:h-24 sm:w-24 animate-bot-pulse items-center justify-center rounded-full bg-gradient-to-tr from-blue-600/10 to-indigo-500/20 text-blue-600 shadow-[inset_0_4px_20px_rgba(0,0,0,0.05)] border border-white/60">
          <GraduationCap size={48} strokeWidth={1.5} className="drop-shadow-sm" />
        </div>
        
        <h1 className="mb-6 text-2xl sm:text-[28px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">
          School MS
        </h1>
        
        <div className="mb-6 flex rounded-xl bg-slate-200/50 p-1.5 shadow-inner">
          <button className={`flex-1 rounded-lg py-2.5 text-[13px] sm:text-sm font-bold transition-all duration-300 ${mode === 'login' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setMode('login')}>ចូលប្រើប្រាស់</button>
          <button className={`flex-1 rounded-lg py-2.5 text-[13px] sm:text-sm font-bold transition-all duration-300 ${mode === 'register' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setMode('register')}>ចុះឈ្មោះ</button>
        </div>

        {mode === 'register' && (
          <div className="relative mb-4">
            <input className="field w-full !bg-white/70 !border-white/50 focus:!bg-white focus:!border-blue-400 focus:!ring-4 focus:!ring-blue-500/10 transition-all shadow-sm text-[13px] sm:text-sm py-3 px-4 rounded-xl outline-none" placeholder="ឈ្មោះពេញ (Full Name)" value={name} onChange={e => setName(e.target.value)} />
          </div>
        )}
        
        <div className="relative mb-4">
          <input className="field w-full !bg-white/70 !border-white/50 focus:!bg-white focus:!border-blue-400 focus:!ring-4 focus:!ring-blue-500/10 transition-all shadow-sm text-[13px] sm:text-sm py-3 px-4 rounded-xl outline-none" type="email" placeholder="អ៊ីមែល (Email)" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        
        <div className="relative mb-4">
          <input className="field w-full pr-12 !bg-white/70 !border-white/50 focus:!bg-white focus:!border-blue-400 focus:!ring-4 focus:!ring-blue-500/10 transition-all shadow-sm text-[13px] sm:text-sm py-3 px-4 rounded-xl outline-none" type={show ? 'text' : 'password'} placeholder="ពាក្យសម្ងាត់ (Password)" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="absolute right-4 top-3.5 text-slate-400 hover:text-blue-600 transition-colors" onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>

        {mode === 'register' && (
          <>
            <div className="relative mb-4">
              <select className="field w-full !bg-white/70 !border-white/50 focus:!bg-white focus:!border-blue-400 focus:!ring-4 focus:!ring-blue-500/10 transition-all shadow-sm text-[13px] sm:text-sm py-3 px-4 rounded-xl outline-none text-slate-600 font-medium" value={role} onChange={e => setRole(e.target.value as 'user' | 'admin')}>
                <option value="user">អ្នកប្រើប្រាស់ទូទៅ (User)</option>
                <option value="admin">អ្នកគ្រប់គ្រង (Admin)</option>
              </select>
            </div>
            {role === 'admin' && (
              <div className="relative mb-4 animate-fade-in">
                <input className="field w-full !bg-white/70 !border-white/50 focus:!bg-white focus:!border-blue-400 focus:!ring-4 focus:!ring-blue-500/10 transition-all shadow-sm text-[13px] sm:text-sm py-3 px-4 rounded-xl outline-none" type="password" placeholder="លេខកូដសម្ងាត់ (Admin Code)" value={code} onChange={e => setCode(e.target.value)} />
              </div>
            )}
          </>
        )}

        {error && <p className="mb-4 rounded-xl bg-rose-50/80 border border-rose-100 p-3 text-[12px] sm:text-[13px] text-rose-600 font-medium">{error}</p>}
        
        <button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 mb-5 shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] text-[14px]" disabled={busy} onClick={submit}>
          {busy ? 'កំពុងដំណើរការ...' : mode === 'login' ? 'ចូលប្រើប្រាស់ (Login)' : 'ចុះឈ្មោះ (Register)'}
        </button>

        <div className="relative flex items-center py-2 mb-5 opacity-70">
          <div className="flex-grow border-t border-slate-300"></div>
          <span className="flex-shrink-0 mx-4 text-slate-500 text-[11px] sm:text-xs font-bold uppercase tracking-wider">ឬបន្តជាមួយ</span>
          <div className="flex-grow border-t border-slate-300"></div>
        </div>

        <button className="w-full rounded-xl py-3 flex items-center justify-center gap-3 border border-slate-200 bg-white/90 text-slate-700 hover:bg-white hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]" disabled={busy} onClick={handleGoogleLogin}>
          <svg className="w-5 h-5 drop-shadow-sm" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="font-bold text-[13px] sm:text-[14px] tracking-wide">Continue with Google</span>
        </button>

      </section>
    </main>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <>
      <div className="text-[1.8rem] sm:text-[2rem] md:text-3xl font-bold leading-tight">{time.toLocaleTimeString('en-GB')}</div>
      <div className="text-xs sm:text-sm font-medium opacity-90">{time.toLocaleDateString('en-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
    </>
  );
}

function Dashboard({ role }: { role: 'admin' | 'user' }) {
  const { user, profile, signOut } = useAuth(); 
  const isAdmin = role === 'admin';
  const [tab, setTab] = useState<Tab | 'leaves'>('attendance'); 
  const [menu, setMenu] = useState(false); 
  const [scanner, setScanner] = useState(false);
  const [students, setStudents] = useState<Student[]>([]); 
  const [attendance, setAttendance] = useState<Attendance[]>([]); 
  const [search, setSearch] = useState('');
  
  const [adminInfo, setAdminInfo] = useState({ 
    teacher: '', room: '', subject: '', shift: 'វេនព្រឹក', time: '7:30-11:00', logo: '', mapUrl: 'https://www.google.com/maps?q=Preah+Sihamoniraja+Buddhist+University&output=embed', bgUrls: '', 
    allowManual: false, allowStudentEdit: false, allowLeaveManualName: false, allowCardCreation: false 
  });

  const [tempLogo, setTempLogo] = useState('');
  const [tempBg, setTempBg] = useState('');
  const [tempMap, setTempMap] = useState('');

  const [initialConfigLoad, setInitialConfigLoad] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  useEffect(() => {
    supabase.from('schedules').select('data_json').eq('type', 'school_info').maybeSingle().then(({data}) => {
      if (data?.data_json) {
        setAdminInfo({ ...adminInfo, ...(data.data_json as any) });
      }
      setInitialConfigLoad(false);
    });
    void refresh();
  }, []);

  async function saveAdminConfig() {
    setSavingConfig(true);
    
    const payload = { ...adminInfo };
    if (tempLogo.trim()) payload.logo = tempLogo.trim();
    if (tempBg.trim()) payload.bgUrls = tempBg.trim();
    if (tempMap.trim()) payload.mapUrl = tempMap.trim();

    const { data } = await supabase.from('schedules').select('id').eq('type', 'school_info').maybeSingle();
    if (data?.id) {
      await supabase.from('schedules').update({ data_json: payload }).eq('id', data.id);
    } else {
      await supabase.from('schedules').insert({ type: 'school_info', data_json: payload });
    }
    
    setAdminInfo(payload);
    setTempLogo('');
    setTempBg('');
    setTempMap('');
    setSavingConfig(false);
  }
  
  async function refresh() { 
    const [{ data: st }, { data: att }] = await Promise.all([supabase.from('students').select('*').order('name'), supabase.from('attendance').select('*').order('created_at', { ascending: false })]); 
    setStudents((st ?? []) as Student[]); 
    setAttendance((att ?? []) as Attendance[]); 
  }
  
  const processedToday = useMemo(() => {
    const unique: Attendance[] = [];
    const seen = new Set();
    const todayAtt = attendance.filter(a => a.date === today).sort((a,b) => new Date((b as any).created_at).getTime() - new Date((a as any).created_at).getTime());
    for (const r of todayAtt) {
        const key = r.student_id || r.name;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(r);
        }
    }
    return unique;
  }, [attendance, today]);

  useEffect(() => {
    if (!isAdmin || processedToday.length === 0 || students.length === 0) return;
    
    const earliest = processedToday.reduce((min, curr) => new Date((curr as any).created_at).getTime() < new Date((min as any).created_at).getTime() ? curr : min);
    
    const earliestTime = new Date((earliest as any).created_at).getTime();
    const twoHours = 2 * 60 * 60 * 1000;
    const waitTime = (earliestTime + twoHours) - Date.now();

    const triggerAutoAbsent = async () => {
        const scannedIds = processedToday.map(r => r.student_id).filter(Boolean);
        const absents = students.filter(s => !scannedIds.includes(s.id));
        if (absents.length > 0) {
            const payloads = absents.map(s => ({
                student_id: s.id,
                stu_id: s.stu_id,
                name: s.name,
                gender: s.gender,
                status: 'អវត្តមាន',
                date: today,
                time: new Date().toLocaleTimeString('en-GB'),
                shift: adminInfo.shift || '',
                room: adminInfo.room || '',
                teacher: adminInfo.teacher || '',
                subject: adminInfo.subject || ''
            }));
            await supabase.from('attendance').insert(payloads);
            refresh();
        }
    };

    if (waitTime <= 0) {
        triggerAutoAbsent();
    } else {
        const t = setTimeout(triggerAutoAbsent, waitTime);
        return () => clearTimeout(t);
    }
  }, [processedToday.length, students.length, isAdmin, adminInfo, today]);

  const counts = { present: processedToday.filter(a => a.status === statuses[0]).length, leave: processedToday.filter(a => a.status === statuses[1]).length, absent: processedToday.filter(a => a.status === statuses[2]).length };
  
  return (
    <div className="min-h-screen w-full bg-light pb-24 lg:pb-5 overflow-x-hidden">
      <Navbar activeTab={tab} isAdmin={isAdmin} userLabel={profile?.full_name || user?.email || ''} role={role} mobileOpen={menu} logoUrl={adminInfo.logo} onTabChange={(nextTab) => { setTab(nextTab); setMenu(false); }} onScanner={() => setScanner(true)} onSignOut={() => void signOut()} onMobileToggle={() => setMenu(!menu)} />
      <div className="mx-auto max-w-[1200px] w-full px-2 sm:px-3 pt-20 sm:pt-24 overflow-x-hidden">
        
        <Banner mapUrl={adminInfo.mapUrl} bgUrls={adminInfo.bgUrls} />
        
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 w-full">
          <div className="col-span-2 md:col-span-1 rounded-xl bg-gradient-to-br from-primary to-secondary p-3 sm:p-4 text-center text-white shadow-sm flex flex-col justify-center min-h-[100px]">
            <LiveClock />
          </div>
          <div className="col-span-2 md:col-span-3 grid grid-cols-3 gap-2 sm:gap-3">
            <Stat title="វត្តមាន" value={counts.present} color="bg-success" icon={CheckCircle2} />
            <Stat title="ច្បាប់" value={counts.leave} color="bg-warning" icon={ClipboardList} />
            <Stat title="អវត្តមាន" value={counts.absent} color="bg-danger" icon={X} />
          </div>
        </div>

        {isAdmin && (
          <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 rounded-xl bg-white p-3 sm:p-4 shadow-sm border border-slate-200 w-full">
            <input className="field" placeholder="Teacher Name..." value={adminInfo.teacher} onChange={e => setAdminInfo({...adminInfo, teacher: e.target.value})} />
            <input className="field" placeholder="Room" value={adminInfo.room} onChange={e => setAdminInfo({...adminInfo, room: e.target.value})} />
            <input className="field" placeholder="Subject..." value={adminInfo.subject} onChange={e => setAdminInfo({...adminInfo, subject: e.target.value})} />
            <select className="field" value={adminInfo.shift} onChange={e => setAdminInfo({...adminInfo, shift: e.target.value})}>
              <option>វេនព្រឹក</option><option>វេនរសៀល</option><option>វេនយប់</option>
            </select>
            <div className="col-span-2 md:col-span-4 grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_1.5fr] gap-2 sm:gap-3 items-start">
               <div className="relative w-full">
                 <MapPin className="absolute left-3 top-2.5 sm:top-3 text-slate-400" size={16} />
                 <input className="field pl-9" placeholder="Google Maps Embed Link..." value={tempMap} onChange={e => setTempMap(e.target.value)} />
               </div>
               <div className="relative w-full">
                 <ImageIcon className="absolute left-3 top-2.5 sm:top-3 text-slate-400" size={16} />
                 <input className="field pl-9" placeholder="Background Link (,)" value={tempBg} onChange={e => setTempBg(e.target.value)} />
               </div>
               <div className="flex flex-col gap-2 w-full">
                 <div className="flex gap-2 w-full">
                   <input className="field flex-1" placeholder="Logo Link" value={tempLogo} onChange={e => setTempLogo(e.target.value)} />
                   <label className="btn btn-primary cursor-pointer px-3 sm:px-4 shrink-0"><Upload size={16} /><input type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload=(ev)=>setTempLogo(ev.target?.result as string); r.readAsDataURL(f); } }} /></label>
                 </div>
                 <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1 items-center">
                   <label className="flex items-center gap-2 text-[12px] sm:text-[13px] font-bold text-slate-700 cursor-pointer w-max pl-1">
                     <input type="checkbox" className="w-4 h-4 accent-primary" checked={adminInfo.allowManual || false} onChange={e => setAdminInfo({...adminInfo, allowManual: e.target.checked})} />
                     User ចុះវត្តមានដោយដៃ
                   </label>
                   <label className="flex items-center gap-2 text-[12px] sm:text-[13px] font-bold text-slate-700 cursor-pointer w-max pl-1">
                     <input type="checkbox" className="w-4 h-4 accent-primary" checked={adminInfo.allowStudentEdit || false} onChange={e => setAdminInfo({...adminInfo, allowStudentEdit: e.target.checked})} />
                     User កែបញ្ជីសិស្ស
                   </label>
                   <label className="flex items-center gap-2 text-[12px] sm:text-[13px] font-bold text-slate-700 cursor-pointer w-max pl-1">
                     <input type="checkbox" className="w-4 h-4 accent-primary" checked={adminInfo.allowLeaveManualName || false} onChange={e => setAdminInfo({...adminInfo, allowLeaveManualName: e.target.checked})} />
                     User វាយឈ្មោះសុំច្បាប់
                   </label>
                   <label className="flex items-center gap-2 text-[12px] sm:text-[13px] font-bold text-slate-700 cursor-pointer w-max pl-1">
                     <input type="checkbox" className="w-4 h-4 accent-primary" checked={adminInfo.allowCardCreation || false} onChange={e => setAdminInfo({...adminInfo, allowCardCreation: e.target.checked})} />
                     User បង្កើតកាត
                   </label>
                   <button className="btn btn-success !py-1 !px-3 text-xs ml-auto shadow-sm" disabled={savingConfig} onClick={saveAdminConfig}>
                     <Save size={14} /> {savingConfig ? '...' : 'Save Config'}
                   </button>
                 </div>
               </div>
            </div>
          </div>
        )}

        {!tab.startsWith('warehouse') && tab !== 'students' && tab !== 'cards' && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-white p-2 sm:p-2.5 shadow-sm border border-slate-200 w-full">
            <Search size={18} className="text-slate-400 shrink-0 ml-2" />
            <input className="w-full bg-transparent outline-none text-sm sm:text-[0.95rem] px-2 py-1" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}

        <div className="w-full overflow-x-hidden">
          {tab === 'attendance' && <AttendancePanel students={students} records={processedToday.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || (a.stu_id ?? '').toLowerCase().includes(search.toLowerCase()))} isAdmin={isAdmin} refresh={refresh} adminInfo={adminInfo} today={today} />}
          {tab === 'leaves' && <LeaveRequestPanel students={students} records={attendance} isAdmin={isAdmin} refresh={refresh} adminInfo={adminInfo} today={today} />}
          {tab === 'warehouse_att' && <AttendanceHistory records={attendance} isAdmin={isAdmin} refresh={refresh} />}
          {tab === 'students' && <MasterStudentList students={students} isAdmin={isAdmin} allowEdit={adminInfo.allowStudentEdit} refresh={refresh} />}
          {tab === 'scores' && <ScoresPanel students={students} isAdmin={isAdmin} />}
          {tab === 'warehouse_score' && <ScoreResults students={students} />}
          {tab === 'analytics' && <Analytics counts={counts} totalStudents={students.length} />}
          {tab === 'schedule' && <SchedulePanel isAdmin={isAdmin} />}
          {tab === 'cleaning' && <CleaningSchedule isAdmin={isAdmin} />}
          {tab === 'cards' && <CardsPanel isAdmin={isAdmin} adminInfo={adminInfo} />}
        </div>
      </div>
      {scanner && <Scanner onClose={() => setScanner(false)} students={students} refresh={refresh} adminInfo={adminInfo} today={today} />}
    </div>
  );
}

function Stat({ title, value, color, icon: Icon }: { title: string; value: number; color: string; icon: typeof CheckCircle2 }) { 
  return <div className={`${color} rounded-xl p-3 sm:p-4 text-center text-white shadow-sm flex flex-col justify-center min-h-[90px] sm:min-h-[100px] w-full`}><Icon className="mx-auto mb-1 opacity-90" size={18} /><div className="text-[10px] sm:text-xs font-bold leading-tight uppercase tracking-wide opacity-90">{title}</div><div className="text-2xl sm:text-3xl font-bold">{value}</div></div>; 
}

function Banner({ mapUrl, bgUrls }: { mapUrl?: string; bgUrls?: string }) { 
  const defaults = ["https://i.ibb.co/nqpzhb09/Kc-hacker.png"];
  const images = (bgUrls || "").split(',').map(s => s.trim()).filter(Boolean);
  if (images.length === 0) images.push(...defaults);

  return (
    <div className="relative mb-5 h-[140px] sm:h-[200px] w-full overflow-hidden rounded-xl bg-slate-900 shadow-sm border border-slate-200">
      <div className="absolute inset-0 flex w-max animate-bg-slide h-full">
        {[...images, ...images, ...images, ...images].map((img, i) => (
          <img key={i} src={img} className="w-[100vw] sm:w-[800px] h-full object-cover opacity-50 border-r border-white/10" alt="bg" />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-0">
        <div className="pointer-events-auto w-[90%] sm:w-[80%] md:w-[60%] lg:w-[55%] h-full flex justify-center items-center">
          <iframe 
            src={mapUrl || "https://www.google.com/maps?q=Preah+Sihamoniraja+Buddhist+University&output=embed"} 
            className="w-full h-full max-w-[500px] max-h-[120px] sm:max-h-[180px] rounded-xl border-2 border-white/20 shadow-lg bg-white" 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  ); 
}

function AttendancePanel({ students, records, isAdmin, refresh, adminInfo, today }: any) { 
  const [name, setName] = useState(''); 
  const [status, setStatus] = useState<string>(statuses[0]); 
  const [saving, setSaving] = useState(false); 
  const [totalStudents, setTotalStudents] = useState(0);
  
  const canManualEntry = isAdmin || adminInfo.allowManual;

  async function add() { 
    if (!name.trim()) return;
    setSaving(true); 
    const student = students.find((s: any) => s.name === name.trim()); 
    const finalName = student ? student.name : name.trim();
    const finalId = student ? student.stu_id : "";
    const finalGender = student ? student.gender : "ប្រុស";

    if (student?.id) {
       await supabase.from('attendance').delete().eq('student_id', student.id).eq('date', today);
    }

    await supabase.from('attendance').insert({ 
      student_id: student?.id || null, 
      stu_id: finalId, 
      name: finalName, 
      gender: finalGender, 
      status, 
      date: today, 
      time: new Date().toLocaleTimeString('en-GB'),
      shift: adminInfo.shift || '',
      room: adminInfo.room || '',
      teacher: adminInfo.teacher || '',
      subject: adminInfo.subject || ''
    }); 
    setName(''); setSaving(false); await refresh(); 
  } 

  async function autoMarkAbsent() {
    setSaving(true);
    const scannedIds = records.map((r: any) => r.student_id).filter(Boolean);
    const absents = students.filter((s: any) => !scannedIds.includes(s.id));
    
    if (absents.length === 0) {
      setSaving(false); return;
    }
    
    const payloads = absents.map((s: any) => ({
      student_id: s.id, 
      stu_id: s.stu_id, 
      name: s.name, 
      gender: s.gender, 
      status: 'អវត្តមាន', 
      date: today, 
      time: new Date().toLocaleTimeString('en-GB'),
      shift: adminInfo.shift || '',
      room: adminInfo.room || '',
      teacher: adminInfo.teacher || '',
      subject: adminInfo.subject || ''
    }));

    await supabase.from('attendance').insert(payloads);
    await refresh();
    setSaving(false);
  }

  async function editRecord(r: any) {
    const newName = window.prompt("Edit Name:", r.name);
    if (newName === null) return;
    const newStatus = window.prompt(`Edit Status (${statuses.join(', ')}):`, r.status);
    if (newStatus === null) return;

    if (newName.trim() !== "") {
      await supabase.from('attendance').update({ name: newName.trim(), status: newStatus }).eq('id', r.id);
      await refresh();
    }
  }

  async function deleteRecord(id: string) {
    if(!window.confirm("តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?")) return;
    await supabase.from('attendance').delete().eq('id', id);
    await refresh();
  }

  async function deleteAll() {
    if(!window.confirm("តើអ្នកពិតជាចង់លុបទិន្នន័យវត្តមានថ្ងៃនេះ ទាំងអស់មែនទេ? ទង្វើនេះមិនអាចត្រឡប់វិញបានទេ។")) return;
    
    const ids = records.map((r: any) => r.id);
    if (ids.length > 0) {
       await supabase.from('attendance').delete().in('id', ids);
    }
    await refresh();
  }

  const downloadPDF = () => {
    document.body.classList.add('print-attendance');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-attendance');
    }, 500);
  };

  return (
    <div className="grid gap-3 lg:gap-4 lg:grid-cols-[.8fr_1.5fr] w-full">
      
      {canManualEntry && (
        <div className="card h-fit w-full">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Plus size={20} className="text-primary" /> ចុះវត្តមាន</h2>
          
          <input 
            list="student-list" 
            className="field mb-3 w-full" 
            placeholder="-- Select or type name --" 
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
          <datalist id="student-list">
            {students.map((s: any) => <option key={s.id} value={s.name} />)}
          </datalist>

          <select className="field mb-4 w-full" value={status} onChange={e => setStatus(e.target.value as string)}>
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <button className="btn btn-success w-full" disabled={!name || saving} onClick={add}>
              <CheckCircle2 size={16} /> {saving ? '...' : 'Save'}
            </button>
            {isAdmin && (
              <button className="btn bg-[#ff9f43] text-white w-full shadow-md shadow-[#ff9f43]/20" disabled={saving} onClick={autoMarkAbsent}>
                <Users size={16} /> Auto Absent
              </button>
            )}
          </div>
        </div>
      )}

      <div className={`w-full ${!canManualEntry ? 'lg:col-span-2' : ''}`}>
        <div className="card p-3 sm:p-5 bg-white w-full overflow-hidden" id="exportArea">
          <div className="text-center border-b-[3px] border-double border-primary pb-3 sm:pb-4 mb-4 sm:mb-5 relative w-full">
            {adminInfo.logo && <img src={adminInfo.logo} className="w-[50px] h-[50px] sm:w-[70px] sm:h-[70px] object-cover mx-auto mb-2 rounded-full shadow-sm border border-primary" alt="Logo" />}
            <h1 className="text-primary text-lg sm:text-2xl font-bold my-1 w-full truncate px-2">របាយការណ៍វត្តមានសិស្សប្រចាំថ្ងៃ</h1>
            <p className="text-slate-500 text-[10px] sm:text-sm w-full truncate px-2">ប្រព័ន្ធគ្រប់គ្រងវត្តមានស្វ័យប្រវត្តិ</p>
          </div>
          
          <div className="flex flex-row justify-between bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 mb-4 text-[10px] sm:text-sm w-full gap-2 overflow-hidden">
            <div className="flex flex-col gap-y-1.5 flex-1 min-w-0">
              <div className="flex items-center w-full"><strong className="w-[60px] sm:w-[85px] shrink-0 text-slate-700">គ្រូបង្រៀន៖</strong> <span className="text-slate-600 font-medium truncate">{adminInfo.teacher || '---'}</span></div>
              <div className="flex items-center w-full"><strong className="w-[60px] sm:w-[85px] shrink-0 text-slate-700">មុខវិជ្ជា៖</strong> <span className="text-slate-600 font-medium truncate">{adminInfo.subject || '---'}</span></div>
              <div className="flex items-center w-full"><strong className="w-[60px] sm:w-[85px] shrink-0 text-slate-700">ម៉ោងសិក្សា៖</strong> <span className="text-primary font-bold truncate">{adminInfo.time || '---'}</span></div>
            </div>
            <div className="flex flex-col gap-y-1.5 flex-1 min-w-0 items-end text-right">
              <div className="flex items-center justify-end w-full"><strong className="text-slate-700 mr-1.5 shrink-0">បន្ទប់៖</strong> <span className="text-slate-600 font-medium truncate">{adminInfo.room || '---'}</span></div>
              <div className="flex items-center justify-end w-full"><strong className="text-slate-700 mr-1.5 shrink-0">វេន៖</strong> <span className="text-warning font-bold truncate">{adminInfo.shift || '---'}</span></div>
              <div className="flex items-center justify-end w-full"><strong className="text-slate-700 mr-1.5 shrink-0">កាលបរិច្ឆេទ៖</strong> <span className="text-slate-600 font-medium truncate">{new Date().toLocaleDateString('en-GB')}</span></div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 w-full overflow-hidden">
            <div id="tableContainer" className="max-h-[350px] sm:max-h-[400px] overflow-y-auto w-full overflow-x-auto">
              {/* តារាងត្រូវបានបកមកជាទម្រង់ស្តង់ដារ Responsive ១០០% */}
              <table className="w-full text-[11px] sm:text-sm min-w-[300px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-primary text-white text-left">
                    <th className="p-2 sm:p-3 font-bold text-center show-on-print" style={{width: '60px'}}>ល.រ</th>
                    <th className="p-2 sm:p-3 font-bold whitespace-nowrap">ឈ្មោះសិស្ស</th>
                    <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap show-on-print">ម៉ោងស្គេនចូល</th>
                    <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">ភេទ</th>
                    <th className="p-2 sm:p-3 font-bold text-center whitespace-nowrap">ស្ថានភាព</th>
                    {isAdmin && <th className="p-2 sm:p-3 font-bold text-center no-print">សកម្មភាព</th>}
                  </tr>
                </thead>
                <tbody>
                  {records.length ? records.map((r: any, index: number) => (
                    <tr key={r.id} className="border-b hover:bg-slate-50 transition">
                      <td className="p-2 sm:p-3 font-bold text-slate-500 text-center show-on-print">{index + 1}</td>
                      <td className="p-2 sm:p-3 font-medium whitespace-nowrap">
                        {r.name}
                        <small className="block text-slate-400 mt-0.5 hide-on-print">Time: {r.time || '---'}</small>
                      </td>
                      <td className="p-2 sm:p-3 text-center font-medium show-on-print">{r.time || '---'}</td>
                      <td className="p-2 sm:p-3 text-center whitespace-nowrap">{r.gender || '---'}</td>
                      <td className="p-2 sm:p-3 text-center whitespace-nowrap"><span className={`rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[11px] font-bold inline-block ${r.status === statuses[0] ? 'bg-green-100 text-green-700' : r.status === statuses[1] ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span></td>
                      {isAdmin && (
                        <td className="p-2 sm:p-3 text-center no-print whitespace-nowrap">
                          <button className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 mr-1" onClick={() => editRecord(r)}><Pencil size={14} /></button>
                          <button className="text-danger hover:text-red-700 p-1 rounded hover:bg-red-50" onClick={() => deleteRecord(r.id)}><Trash2 size={14} /></button>
                        </td>
                      )}
                    </tr>
                  )) : <tr><td colSpan={isAdmin ? 5 : 4} className="p-6 text-center text-slate-400">មិនមានទិន្នន័យសម្រាប់ថ្ងៃនេះទេ</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 sm:mt-5 flex flex-wrap justify-center gap-2 border-t-2 border-primary pt-3 sm:pt-4 w-full">
            <div className="flex-1 min-w-[70px] sm:min-w-[100px] bg-blue-50 text-blue-700 p-2 sm:p-2.5 rounded-xl text-center font-bold text-[10px] sm:text-xs shadow-sm">ស.សរុប: {totalStudents}</div>
            <div className="flex-1 min-w-[70px] sm:min-w-[100px] bg-green-50 text-green-700 p-2 sm:p-2.5 rounded-xl text-center font-bold text-[10px] sm:text-xs shadow-sm">វត្តមាន: {records.filter((r:any)=>r.status==='វត្តមាន').length}</div>
            <div className="flex-1 min-w-[70px] sm:min-w-[100px] bg-yellow-50 text-yellow-700 p-2 sm:p-2.5 rounded-xl text-center font-bold text-[10px] sm:text-xs shadow-sm">ច្បាប់: {records.filter((r:any)=>r.status==='ច្បាប់').length}</div>
            <div className="flex-1 min-w-[70px] sm:min-w-[100px] bg-red-50 text-red-700 p-2 sm:p-2.5 rounded-xl text-center font-bold text-[10px] sm:text-xs shadow-sm">អវត្តមាន: {records.filter((r:any)=>r.status==='អវត្តមាន').length}</div>
          </div>
        </div>
        
        <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 items-center justify-center w-full">
           <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-full sm:w-auto justify-center">
              <label className="font-bold text-xs sm:text-sm text-slate-700">សិស្សសរុប៖</label>
              <input type="number" className="field !w-16 !py-1 text-center text-xs" value={totalStudents} onChange={e => setTotalStudents(Number(e.target.value))} disabled={!isAdmin} />
           </div>
           <div className="flex w-full sm:w-auto gap-2">
             {isAdmin && <button className="btn bg-danger text-white flex-1 sm:flex-none" onClick={deleteAll}><Trash2 size={16} /> លុបទាំងអស់</button>}
             <button className="btn bg-[#2c3e50] text-white flex-1 sm:flex-none shadow-md shadow-[#2c3e50]/20" onClick={downloadPDF}><Printer size={16} /> Print PDF</button>
           </div>
        </div>
      </div>
    </div>
  ); 
}

function LeaveRequestPanel({ students, records, isAdmin, refresh, adminInfo, today }: any) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reason, setReason] = useState('');
  const [photo, setPhoto] = useState('');
  const [saving, setSaving] = useState(false);
  const [viewDate, setViewDate] = useState(today);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [viewLetter, setViewLetter] = useState<any>(null);

  const leaveRecords = records.filter((r: any) => r.status === 'ច្បាប់' && r.date === viewDate);
  const canManualName = isAdmin || adminInfo.allowLeaveManualName;

  async function submitLeave() {
    if (!name.trim() || !startDate || !endDate) return;
    setSaving(true);
    
    const student = students.find((s: any) => s.name === name.trim());
    const finalName = student ? student.name : name.trim();
    const finalId = student ? student.stu_id : "";
    const finalGender = student ? student.gender : "ប្រុស";

    if (editingId) {
      const { error } = await supabase.from('attendance').update({
        student_id: student?.id || null,
        stu_id: finalId,
        name: finalName,
        gender: finalGender,
        date: startDate,
        reason: reason || 'គ្មានការបញ្ជាក់',
        photo: photo || ''
      }).eq('id', editingId);

      if (error) {
        alert("Error: " + error.message);
      } else {
        setEditingId(null);
        setName(''); setReason(''); setPhoto(''); setStartDate(today); setEndDate(today);
        await refresh();
      }
      setSaving(false);
      return;
    }

    const dates = [];
    let curr = new Date(startDate);
    const end = new Date(endDate);
    while (curr <= end) {
      dates.push(curr.toISOString().slice(0, 10));
      curr.setDate(curr.getDate() + 1);
    }

    for (const d of dates) {
      if (student?.id) {
         await supabase.from('attendance').delete().eq('student_id', student.id).eq('date', d);
      }
    }

    const dateText = startDate === endDate ? '' : ` (ពី ${startDate} ដល់ ${endDate})`;
    const fullReason = `${reason || 'គ្មានការបញ្ជាក់'}${dateText}`;

    const payloads = dates.map(d => ({
      student_id: student?.id || null,
      stu_id: finalId,
      name: finalName,
      gender: finalGender,
      status: 'ច្បាប់',
      date: d,
      time: new Date().toLocaleTimeString('en-GB'),
      shift: adminInfo.shift || '',
      room: adminInfo.room || '',
      teacher: adminInfo.teacher || '',
      subject: adminInfo.subject || '',
      reason: fullReason,
      photo: photo || ''
    }));

    const { error } = await supabase.from('attendance').insert(payloads);

    if (error) {
       alert("Error: " + error.message);
    } else {
       setName(''); setReason(''); setPhoto(''); setStartDate(today); setEndDate(today);
       await refresh();
    }
    setSaving(false);
  }

  function editLeave(r: any) {
    setName(r.name);
    setStartDate(r.date);
    setEndDate(r.date);
    setReason(r.reason);
    setPhoto(r.photo || '');
    setEditingId(r.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteLeave(id: string) {
    if(!window.confirm("តើអ្នកពិតជាចង់លុបច្បាប់នេះមែនទេ?")) return;
    await supabase.from('attendance').delete().eq('id', id);
    await refresh();
  }

  const printLetter = () => {
    window.print();
  };

  const studentDetail = viewLetter ? students.find((s: any) => s.id === viewLetter.student_id || s.name === viewLetter.name) : null;
  
  const formatDateKH = (dateStr: string) => {
    if(!dateStr) return { day: '...', month: '...', year: '...' };
    const d = new Date(dateStr);
    return {
      day: d.getDate().toString().padStart(2, '0'),
      month: (d.getMonth() + 1).toString().padStart(2, '0'),
      year: d.getFullYear().toString()
    };
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_2fr] w-full relative">
      
      {/* ផ្ទាំង Popup លិខិតសុំច្បាប់ផ្លូវការ */}
      {viewLetter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 p-2 sm:p-4 backdrop-blur-sm print:bg-transparent print:p-0">
          
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
            .font-moul { font-family: 'Moul', serif; }
            .font-siemreap { font-family: 'Siemreap', sans-serif; }
            @media print {
              body * { visibility: hidden; background: white; }
              #print-letter-section, #print-letter-section * { visibility: visible; }
              #print-letter-section { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; padding: 20px; background: white; }
              .hide-on-print { display: none !important; }
            }
          `}</style>

          <div id="print-letter-section" className="bg-white rounded-xl w-full max-w-[700px] max-h-[95vh] overflow-y-auto p-5 sm:p-10 relative shadow-2xl font-siemreap text-slate-800 text-[12px] sm:text-[14px] print:max-h-none print:shadow-none">
            
            <div className="sticky top-0 right-0 flex justify-end gap-2 mb-2 hide-on-print z-10">
              <button className="btn btn-primary !py-1.5 !px-3 shadow-md" onClick={printLetter}>
                <Printer size={16}/> បោះពុម្ព
              </button>
              <button className="btn bg-rose-100 text-rose-600 hover:bg-rose-200 !py-1.5 !px-2" onClick={() => setViewLetter(null)}>
                <X size={18}/>
              </button>
            </div>

            {/* ក្បាលលិខិត (Logo ឆ្វេង និង ព្រះរាជាណាចក្រកណ្តាល) */}
            <div className="relative flex justify-center items-start w-full mb-4 pt-2">
              <div className="absolute left-0 top-0 flex flex-col items-center w-max">
                 {adminInfo.logo && <img src={adminInfo.logo} alt="Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain mb-1 drop-shadow-sm" />}
                 <span className="font-moul text-[8px] sm:text-[10px] text-blue-900 text-center leading-tight">PSB University<br/></span>
              </div>
              
              <div className="flex flex-col items-center text-center">
                 <span className="font-moul text-[12px] sm:text-[16px] text-blue-900 leading-none">ព្រះរាជាណាចក្រកម្ពុជា</span>
                 <span className="font-moul text-[12px] sm:text-[16px] mt-2 text-blue-900 leading-none">ជាតិ សាសនា ព្រះមហាក្សត្រ</span>
                 <div className="w-14 sm:w-20 h-[2px] bg-blue-900 mt-2"></div>
              </div>
            </div>

            {/* ចំណងជើងលិខិត */}
            <div className="text-center mb-6 mt-10 sm:mt-12">
               <h1 className="font-moul text-[14px] sm:text-lg text-blue-900 tracking-wide">លិខិតសុំអនុញ្ញាតច្បាប់</h1>
            </div>

            {/* ខ្លឹមសារលិខិត */}
            <div className="px-1 sm:px-4">
               <div className="mb-4">
                  <span className="font-extrabold mr-2">សូមគោរពជូន៖</span> លោកគ្រូ អ្នកគ្រូ និងគណៈគ្រប់គ្រងសាលាជាទីគោរព
               </div>
               
               {/* ជួរទី១៖ ឈ្មោះ ភេទ អត្តលេខ (ស្ថិតក្នុង១ជួររហូត) */}
               <div className="mb-4 flex items-end justify-between w-full text-[10px] sm:text-[14px]">
                 <span className="font-bold whitespace-nowrap">ខ្ញុំបាទ/នាងខ្ញុំ៖</span> 
                 <span className="font-moul text-blue-800 border-b border-dotted border-slate-400 px-1 sm:px-2 pb-0.5 mx-1 flex-1 text-center whitespace-nowrap overflow-hidden text-ellipsis">{viewLetter.name}</span>
                 <span className="font-bold whitespace-nowrap">ភេទ៖</span> 
                 <span className="font-bold text-blue-800 border-b border-dotted border-slate-400 px-1 sm:px-2 pb-0.5 mx-1 text-center whitespace-nowrap">{viewLetter.gender || studentDetail?.gender || '...'}</span>
                 <span className="font-bold whitespace-nowrap">អត្តលេខ៖</span> 
                 <span className="font-bold uppercase text-blue-800 border-b border-dotted border-slate-400 px-1 sm:px-2 pb-0.5 ml-1 text-center whitespace-nowrap">{viewLetter.stu_id || studentDetail?.stu_id || '......'}</span>
               </div>

               {/* ជួរទី២៖ មុខវិជ្ជា បន្ទប់ វេន (ស្ថិតក្នុង១ជួររហូត) */}
               <div className="mb-5 flex items-end justify-between w-full text-[10px] sm:text-[14px]">
                 <span className="font-bold whitespace-nowrap">មុខវិជ្ជា៖</span> 
                 <span className="font-bold text-blue-800 border-b border-dotted border-slate-400 px-1 sm:px-2 pb-0.5 mx-1 flex-1 text-center whitespace-nowrap overflow-hidden text-ellipsis">{viewLetter.subject || adminInfo.subject || '...................'}</span>
                 <span className="font-bold whitespace-nowrap">បន្ទប់៖</span> 
                 <span className="font-bold text-blue-800 border-b border-dotted border-slate-400 px-1 sm:px-2 pb-0.5 mx-1 text-center whitespace-nowrap">{viewLetter.room || adminInfo.room || '......'}</span>
                 <span className="font-bold whitespace-nowrap">វេន៖</span> 
                 <span className="font-bold text-blue-800 border-b border-dotted border-slate-400 px-1 sm:px-2 pb-0.5 ml-1 text-center whitespace-nowrap">{viewLetter.shift || adminInfo.shift || '......'}</span>
               </div>

               <p className="indent-8 text-justify mb-2 leading-[2] sm:leading-[2.2]">
                  ខ្ញុំបាទ/នាងខ្ញុំ មានធុរៈចាំបាច់ផ្ទាល់ខ្លួន / ដោយមានមូលហេតុជាក់លាក់ដូចជា៖ 
                  <span className="font-bold text-blue-800 border-b border-dotted border-slate-400 px-2 mx-1">« {viewLetter.reason} »</span>។
               </p>
               <p className="indent-8 text-justify mb-8 leading-[2] sm:leading-[2.2]">
                  សេចក្តីដូចបានជម្រាប់ជូនក្នុងកម្មវត្ថុ និងមូលហេតុ សូមលោកគ្រូ អ្នកគ្រូ និងគណៈគ្រប់គ្រងសាលា មេត្តាអនុញ្ញាតច្បាប់ឈប់សម្រាកដល់ខ្ញុំបាទ/នាងខ្ញុំ តាមការស្នើសុំខាងលើ ដោយក្ដីអនុគ្រោះផងចុះ។
               </p>
            </div>

            {/* កន្ទុយលិខិត និង ហត្ថលេខា */}
            <div className="flex flex-row justify-between mt-8 px-1 sm:px-4 text-[9px] sm:text-[12px]">
               <div className="text-center w-[45%] flex flex-col items-center">
                  <span className="font-moul text-[9px] sm:text-[11px] text-blue-900 mb-1">បានឃើញ និងឯកភាព</span>
                  <span className="mb-14">នាយកសាលា / គ្រូបន្ទុកថ្នាក់</span>
                  <div className="border-t border-slate-400 border-dashed pt-1 w-[80%] text-slate-500">ហត្ថលេខា និងឈ្មោះ</div>
               </div>
               <div className="text-center w-[55%] flex flex-col items-center">
                  <span className="mb-2 italic">រាជធានីភ្នំពេញ, ថ្ងៃទី {formatDateKH(viewLetter.date).day} ខែ {formatDateKH(viewLetter.date).month} ឆ្នាំ {formatDateKH(viewLetter.date).year}</span>
                  <span className="font-moul text-[9px] sm:text-[11px] text-blue-900 mb-14">ស្នាមមេដៃសាមីខ្លួន</span>
                  <div className="border-t border-slate-400 border-dashed pt-1 w-[70%] text-slate-500">ឈ្មោះសិស្ស</div>
               </div>
            </div>

         </div>
        </div>
      )}

      {/* Form បញ្ចូលទិន្នន័យ */}
      <div className="card w-full max-w-full overflow-hidden h-fit">
        <div className="flex justify-between items-center mb-4">
           <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800"><FileText size={20} className="text-warning shrink-0" /> <span className="truncate">{editingId ? 'កែប្រែការសុំច្បាប់' : 'ទម្រង់សុំច្បាប់'}</span></h2>
           {editingId && <button className="text-slate-400 hover:text-danger" onClick={() => {setEditingId(null); setName(''); setReason(''); setPhoto(''); setStartDate(today); setEndDate(today);}}><X size={18}/></button>}
        </div>
        
        <label className="block mb-3">
          <span className="text-sm font-bold text-slate-700 mb-1.5 block">ឈ្មោះសិស្ស៖</span>
          {canManualName ? (
            <>
              <input list="leave-student-list" className="field w-full text-sm" placeholder="ជ្រើសរើស ឬ វាយឈ្មោះ..." value={name} onChange={e => setName(e.target.value)} />
              <datalist id="leave-student-list">{students.map((s: any) => <option key={s.id} value={s.name} />)}</datalist>
            </>
          ) : (
            <select className="field w-full text-sm" value={name} onChange={e => setName(e.target.value)}>
              <option value="">-- ជ្រើសរើសឈ្មោះសិស្ស --</option>
              {students.map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          )}
        </label>

        <label className="block mb-3">
          <span className="text-sm font-bold text-slate-700 mb-1.5 block">សុំច្បាប់ (ពីថ្ងៃទី - ដល់ថ្ងៃទី)៖</span>
          <div className="flex items-center gap-2">
             <input type="date" className="field w-full text-sm !px-2" value={startDate} onChange={e => setStartDate(e.target.value)} />
             {!editingId && (
               <>
                 <span className="font-bold text-slate-400">-</span>
                 <input type="date" className="field w-full text-sm !px-2" value={endDate} onChange={e => setEndDate(e.target.value)} />
               </>
             )}
          </div>
        </label>

        <label className="block mb-3">
          <span className="text-sm font-bold text-slate-700 mb-1.5 block">មូលហេតុនៃការឈប់៖</span>
          <textarea className="field w-full min-h-[80px] text-sm resize-none" placeholder="..." value={reason} onChange={e => setReason(e.target.value)}></textarea>
        </label>

        <label className="block mb-4">
          <span className="text-sm font-bold text-slate-700 mb-1.5 block">ភស្តុតាង (បើមាន)៖</span>
          <div className="flex items-center gap-2 w-full">
            <label className="btn border border-slate-300 bg-white text-slate-700 cursor-pointer w-full text-sm py-2.5 flex-1 shrink-0"><Camera size={18}/> <span className="truncate">{photo ? 'ប្តូររូបភាព' : 'ភ្ជាប់រូបភាព / ថតរូប'}</span><input type="file" className="hidden" accept="image/*" onChange={(e)=>{const f=e.target.files?.[0]; if(f){const r=new FileReader(); r.onload=(ev)=>setPhoto(ev.target?.result as string); r.readAsDataURL(f);}}} /></label>
          </div>
          {photo && <img src={photo} className="mt-3 w-full max-h-[160px] object-contain rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm" alt="Evidence" />}
        </label>
        
        <button className="btn btn-warning w-full py-3 text-sm sm:text-base shadow-md" disabled={!name || saving} onClick={submitLeave}>
          <CheckCircle2 size={18} /> <span className="truncate">{saving ? '...' : (editingId ? 'រក្សាទុកការកែប្រែ' : 'បញ្ជូនពាក្យសុំច្បាប់')}</span>
        </button>
      </div>

      {/* តារាងបញ្ជីអ្នកសុំច្បាប់ */}
      <div className="card w-full max-w-full overflow-hidden h-fit">
         <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
           <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-800">
             <ClipboardList size={20} className="text-primary shrink-0" /> 
             <span className="truncate">បញ្ជីសុំច្បាប់</span>
           </h2>
           <div className="flex items-center gap-2">
             <input type="date" className="field !py-1.5 !px-2 text-sm w-[130px] font-medium" value={viewDate} onChange={e => setViewDate(e.target.value)} />
             <span className="bg-warning/20 text-yellow-700 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0">{leaveRecords.length} នាក់</span>
           </div>
         </div>
         <div className="w-full overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs sm:text-sm min-w-[500px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left">ឈ្មោះសិស្ស</th>
                <th className="p-3 text-center">ម៉ោង</th>
                <th className="p-3 text-left">មូលហេតុ</th>
                <th className="p-3 text-center">ភស្តុតាង</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {leaveRecords.length ? leaveRecords.map((r: any) => (
                <tr className="border-t hover:bg-slate-50 transition" key={r.id}>
                  <td className="p-3 font-bold whitespace-nowrap">{r.name}</td>
                  <td className="p-3 text-center text-primary font-medium whitespace-nowrap">{r.time}</td>
                  <td className="p-3 text-slate-600 max-w-[200px] truncate">{r.reason || '---'}</td>
                  <td className="p-3 text-center">
                    {r.photo ? <a href={r.photo} target="_blank" rel="noreferrer" className="inline-block"><img src={r.photo} className="w-8 h-8 object-cover rounded shadow-sm border border-slate-200 hover:scale-150 transition-transform" alt="img"/></a> : <span className="text-slate-400">គ្មាន</span>}
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                     <button className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded active:scale-95 transition-transform mr-1" onClick={() => setViewLetter(r)} title="មើលលិខិតសុំច្បាប់"><Eye size={16} /></button>
                     <button className="text-blue-500 hover:bg-blue-50 p-1.5 rounded active:scale-95 transition-transform mr-1" onClick={() => editLeave(r)}><Pencil size={16} /></button>
                     {isAdmin && <button className="text-danger hover:bg-red-50 p-1.5 rounded active:scale-95 transition-transform" onClick={() => deleteLeave(r.id)}><Trash2 size={16} /></button>}
                  </td>
                </tr>
              )) : <tr><td colSpan={5} className="p-8 text-center text-slate-400">មិនមានសិស្សសុំច្បាប់ទេសម្រាប់ថ្ងៃនេះ</td></tr>}
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
    supabase.from('schedules').select('data_json').eq('type', 'subjects').maybeSingle().then(({data}) => {
      if (data?.data_json && Array.isArray(data.data_json)) {
        setSubjects(data.data_json);
      }
    });
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

  async function saveSubjectsToDB(updatedSubjects: string[]) {
    const { data } = await supabase.from('schedules').select('id').eq('type', 'subjects').maybeSingle();
    if (data?.id) {
      await supabase.from('schedules').update({ data_json: updatedSubjects }).eq('id', data.id);
    } else {
      await supabase.from('schedules').insert({ type: 'subjects', data_json: updatedSubjects });
    }
  }

  const addSub = async () => {
    if(!newSub.trim() || subjects.includes(newSub.trim())) return;
    const updated = [...subjects, newSub.trim()];
    setSubjects(updated); 
    setNewSub('');
    await saveSubjectsToDB(updated);
  };

  const removeSub = async (sub: string) => {
    const updated = subjects.filter(s => s !== sub);
    setSubjects(updated);
    await saveSubjectsToDB(updated);
  };

  const updateScore = (studentId: string, sub: string, val: string) => {
    setScores(prev => ({ ...prev, [studentId]: { ...(prev[studentId] || {}), [sub]: Number(val) } }));
  };

  // ប្តូរទៅជាការ Save លឿនបំផុត (Bulk Upsert/Insert) កាត់បន្ថយការទាក់
  const saveScoreRow = async (studentId: string) => {
    setSavingId(studentId);
    const stuScores = scores[studentId] || {};
    
    // លុបពិន្ទុចាស់របស់សិស្សនេះចោលមុនសិន (១ Request គត់)
    await supabase.from('scores').delete().eq('student_id', studentId);
    
    // បង្កើតទម្រង់ទិន្នន័យដើម្បីបញ្ចូលថ្មី
    const payloads = subjects.map(sub => ({ 
       student_id: studentId, 
       subject_name: sub, 
       score: stuScores[sub] || 0 
    }));
    
    // បញ្ចូលពិន្ទុថ្មីទាំងអស់ក្នុងពេលតែមួយ (១ Request គត់)
    await supabase.from('scores').insert(payloads);
    
    setSavingId('');
  };

  return (
    <div className="card w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold"><GraduationCap className="text-primary" /> បញ្ចូលលទ្ធផលពិន្ទុ</h2>
      </div>

      {isAdmin && (
        <div className="mb-4 flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <input className="field w-full sm:w-40" placeholder="បញ្ចូលមុខវិជ្ជាថ្មី..." value={newSub} onChange={e => setNewSub(e.target.value)} />
          <button className="btn btn-primary w-full sm:w-auto" onClick={addSub}><Plus size={16}/> បន្ថែម</button>
          <div className="flex gap-2 overflow-x-auto flex-1 items-center w-full pb-1">
             {subjects.map(s => (
               <span key={s} className="bg-white border border-slate-200 shadow-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0">
                 {s} <X size={12} className="cursor-pointer text-danger hover:scale-125 transition-transform" onClick={() => removeSub(s)} />
               </span>
             ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 overflow-hidden w-full">
        <div className="max-h-[400px] overflow-y-auto overflow-x-auto w-full">
          <table className="w-full min-w-[500px] text-xs sm:text-sm relative">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-slate-100">
                <th className="p-2 sm:p-3 text-left whitespace-nowrap sticky left-0 z-10 bg-slate-100">ឈ្មោះសិស្ស</th>
                {subjects.map(s => <th className="p-2 sm:p-3 text-center whitespace-nowrap" key={s}>{s}</th>)}
                <th className="p-2 sm:p-3 text-center whitespace-nowrap">មធ្យមភាគ</th>
                {isAdmin && <th className="p-2 sm:p-3 text-center whitespace-nowrap">Action</th>}
              </tr>
            </thead>
            <tbody>
              {students.length ? students.map(s => {
                const stuScores = scores[s.id] || {};
                const total = subjects.reduce((sum, sub) => sum + (stuScores[sub] || 0), 0);
                const avg = subjects.length ? (total / subjects.length) : 0;
                return (
                <tr className="border-t hover:bg-slate-50 transition" key={s.id}>
                  <td className="p-2 sm:p-3 font-medium whitespace-nowrap bg-white sticky left-0 z-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">{s.name}</td>
                  {subjects.map(sub => (
                    <td key={sub} className="p-1 sm:p-2 text-center">
                      <input disabled={!isAdmin} value={stuScores[sub] || ''} onChange={e => updateScore(s.id, sub, e.target.value)} className="w-12 sm:w-16 rounded border border-slate-300 p-1 sm:p-1.5 text-center disabled:bg-slate-100 disabled:border-transparent outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm" type="number" min="0" max="100" placeholder="0" />
                    </td>
                  ))}
                  <td className="p-2 sm:p-3 text-center font-bold text-secondary whitespace-nowrap">{avg.toFixed(2)}</td>
                  {isAdmin && (
                    <td className="p-2 sm:p-3 text-center">
                       <button className="btn btn-success !px-2 !py-1" onClick={() => saveScoreRow(s.id)} disabled={savingId === s.id}>
                         <Save size={14} />
                       </button>
                    </td>
                  )}
                </tr>
              )}) : <tr><td colSpan={subjects.length + 3} className="p-8 text-center text-slate-400">មិនទាន់មានសិស្សទេ</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ); 
}

function CardsPanel({ isAdmin, adminInfo }: any) { 
  const [cardType, setCardType] = useState('student');
  const [form, setForm] = useState({ id: '', name: '', f1: '', f2: '', photo: '' });
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('student');

  const canCreateCard = isAdmin || adminInfo?.allowCardCreation;

  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    const { data } = await supabase.from('custom_cards').select('*').order('created_at', { ascending: false });
    if (data) {
      const mapped = data.map(c => ({
        id: c.card_id,
        name: c.name,
        f1: c.field1,
        f2: c.field2,
        photo: c.photo,
        template: c.template,
        dbId: c.id
      }));
      setSavedCards(mapped);
    }
  }

  async function saveCard() {
    if(!form.id || !form.name) return;
    const payload = {
      card_id: form.id,
      name: form.name,
      field1: form.f1,
      field2: form.f2,
      photo: form.photo,
      template: cardType
    };

    if (editingId) {
      await supabase.from('custom_cards').update(payload).eq('id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('custom_cards').insert(payload);
    }
    setForm({ id: '', name: '', f1: '', f2: '', photo: '' });
    await fetchCards();
  }

  function editCard(card: any) {
    if(!canCreateCard) return;
    setCardType(card.template);
    setFilterType(card.template);
    setForm({ id: card.id, name: card.name, f1: card.f1, f2: card.f2, photo: card.photo });
    setEditingId(card.dbId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteCard(dbId: string) {
    if(!canCreateCard) return;
    if(!window.confirm("Delete this card?")) return;
    await supabase.from('custom_cards').delete().eq('id', dbId);
    await fetchCards();
  }

  const printCards = () => {
    const printArea = document.getElementById('cardsPrintArea');
    const rootEl = document.getElementById('root') || document.body.firstElementChild as HTMLElement;
    
    if (!printArea || !rootEl) {
      window.print();
      return;
    }
    
    const printContainer = document.createElement('div');
    printContainer.id = 'temp-print-container';
    printContainer.innerHTML = printArea.innerHTML;
    document.body.appendChild(printContainer);
    
    const originalDisplay = rootEl.style.display;
    rootEl.style.display = 'none';
    
    window.print();
    
    rootEl.style.display = originalDisplay;
    document.body.removeChild(printContainer);
  };

  const downloadCard = (dbId: string, cardName: string) => {
    const el = document.getElementById(`card-${dbId}`);
    if(!el) return;
    html2canvas(el, { scale: 3, useCORS: true, backgroundColor: null }).then(canvas => {
      const link = document.createElement('a');
      link.download = `ID_Card_${cardName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  const RenderCard = ({ cardData, isPreview = false }: { cardData: any, isPreview?: boolean }) => {
    const cType = cardData.template || cardType;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${cardData.id || '000'}`;
    
    if (cType === 'student') return (
      <div className="student-card" id={isPreview ? undefined : `card-${cardData.dbId}`}>
         <div className="card-header">STUDENT IDENTITY CARD</div>
         <div className="card-body">
            <div className="photo-area">
               <div className="photo-placeholder">{cardData.photo ? <img src={cardData.photo} alt="Profile" /> : <UserCheck size={30} className="text-slate-300"/>}</div>
               <p style={{fontSize:'9px', fontWeight:'bold', marginTop:'5px', color:'#0984e3'}}>ID: {cardData.id || '---'}</p>
            </div>
            <div className="info-area">
               <h4>{cardData.name || 'Student Name'}</h4>
               <p>Year: <b>{cardData.f1 || '---'}</b></p>
               <p>Major: <b>{cardData.f2 || '---'}</b></p>
               <div className="qr-right"><img src={qrUrl} alt="QR" className="w-[85px] h-[85px] object-contain" /></div>
            </div>
         </div>
         <div className="card-footer"></div>
      </div>
    );
    if (cType === 'company') return (
      <div className="company-card-h" id={isPreview ? undefined : `card-${cardData.dbId}`}>
         <div className="card-header"><span>CO. IDENTITY CARD</span><span style={{fontSize:'9px', color:'#64748b'}}>VIP MEMBER</span></div>
         <div className="card-body">
            <div className="photo-placeholder">{cardData.photo ? <img src={cardData.photo} alt="Profile" /> : <UserCheck size={30} className="text-slate-300"/>}</div>
            <div className="info-area">
               <h4>{cardData.name || 'Employee Name'}</h4>
               <p>Dept: <b>{cardData.f1 || '---'}</b></p>
               <p>Role: <b>{cardData.f2 || '---'}</b></p>
               <p style={{fontSize:'9px', color:'#94a3b8', fontFamily:'monospace', marginTop:'3px'}}>ID: {cardData.id || '---'}</p>
            </div>
            <div className="qr-right"><img src={qrUrl} alt="QR" className="w-[85px] h-[85px] object-contain" /></div>
         </div>
      </div>
    );
    if (cType === 'staff') return (
      <div className="staff-card-v" id={isPreview ? undefined : `card-${cardData.dbId}`}>
         <div className="card-top"><h5>KINGDOM OF CAMBODIA</h5><p>{cardData.f1 || 'Ministry/Unit'}</p></div>
         <div className="photo-placeholder">{cardData.photo ? <img src={cardData.photo} alt="Profile" /> : <UserCheck size={40} className="text-slate-300"/>}</div>
         <div className="info-area">
            <h4>{cardData.name || 'Staff Name'}</h4>
            <p style={{fontWeight:'bold', color:'#00b894', fontSize:'12px'}}>{cardData.f2 || 'Officer'}</p>
            <div className="card-id-tag">№: {cardData.id || '---'}</div>
            <div style={{display:'block', textAlign:'center', marginTop:'5px'}}><div className="qr-bottom"><img src={qrUrl} alt="QR" className="w-[85px] h-[85px] object-contain" /></div></div>
         </div>
      </div>
    );
    if (cType === 'business') return (
      <div className="business-card-h" id={isPreview ? undefined : `card-${cardData.dbId}`}>
         <div className="left-panel">
            <div className="photo-placeholder">{cardData.photo ? <img src={cardData.photo} alt="Profile" /> : <UserCheck size={30} className="text-slate-500"/>}</div>
            <span>ID: {cardData.id || '---'}</span>
         </div>
         <div className="right-panel">
            <div className="info-header"><h4>{cardData.name || 'Member Name'}</h4><p style={{color:'#f59e0b', fontSize:'9px'}}>{cardData.f1 || 'VIP GOLD MEMBER'}</p></div>
            <div className="info-details"><p style={{color:'#9ca3af', fontSize:'9px', display:'flex', alignItems:'center', gap:'4px', marginBottom:'2px'}}><CalendarDays size={10}/> EXP: {cardData.f2 || '---'}</p><p style={{color:'#6b7280', fontSize:'8px', marginTop:'4px'}}>ACCESS ALL PRESTIGE LOUNGE</p></div>
            <div className="qr-area"><img src={qrUrl} alt="QR" className="w-[85px] h-[85px] object-contain" /></div>
         </div>
      </div>
    );
    if (cType === 'press') return (
      <div className="press-card-v" id={isPreview ? undefined : `card-${cardData.dbId}`}>
         <div className="card-header">PRESS</div>
         <div className="photo-placeholder">{cardData.photo ? <img src={cardData.photo} alt="Profile" /> : <Camera size={40} className="text-slate-300"/>}</div>
         <div className="info-area">
            <h4>{cardData.name || 'Reporter Name'}</h4><p>{cardData.f1 || 'REPORTER'}</p><span>AGENCY: <b>{cardData.f2 || 'News Channel'}</b></span><div style={{fontSize:'10px', marginTop:'5px', color:'#64748b'}}>ID: {cardData.id || '---'}</div>
         </div>
         <div className="qr-bottom"><img src={qrUrl} alt="QR" className="w-[85px] h-[85px] object-contain" /></div>
      </div>
    );
    if (cType === 'library') return (
      <div className="library-card-h" id={isPreview ? undefined : `card-${cardData.dbId}`}>
         <div className="left-col">
            <div><div className="lib-header">LIBRARY CARD</div><div className="info-area"><h4>{cardData.name || 'Reader Name'}</h4><p>TYPE: <b>{cardData.f1 || '---'}</b></p><p>JOINED: <b>{cardData.f2 || '---'}</b></p></div></div>
            <div className="qr-area"><img src={qrUrl} alt="QR" className="w-[85px] h-[85px] object-contain" /></div>
         </div>
         <div className="right-col">
            <div className="photo-placeholder">{cardData.photo ? <img src={cardData.photo} alt="Profile" /> : <BookOpen size={30} className="text-slate-300"/>}</div>
            <div className="id-text">ID: {cardData.id || '---'}</div>
         </div>
      </div>
    );
    return null;
  };

  return (
    <div className="card-creator-container mx-auto p-0 w-full relative">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          
          .no-print { display: none !important; }
          
          * { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            color-adjust: exact !important;
          }
          
          #temp-print-container { 
            display: flex !important; 
            flex-wrap: wrap !important;
            justify-content: space-evenly !important;
            align-content: flex-start !important;
            gap: 15px 0 !important;
            width: 100% !important;
            background: white !important;
          }
          
          #temp-print-container .print-card-item {
            width: max-content !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 15px !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
          }

          #temp-print-container .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      {canCreateCard && (
        <div className="card mb-4 w-full no-print">
          <h3 className="text-primary font-bold text-base sm:text-lg mb-3 flex items-center gap-2"><FileBadge /> ជ្រើសរើសទម្រង់កាតដែលចង់បង្កើត</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-4">
            <div className={`cursor-pointer border-2 rounded-xl p-2 sm:p-3 text-center transition ${cardType === 'student' ? 'border-primary bg-blue-50 shadow-md' : 'border-slate-200 hover:border-primary hover:-translate-y-1'}`} onClick={() => {setCardType('student'); setFilterType('student'); setForm({id:'',name:'',f1:'',f2:'',photo:''}); setEditingId(null);}}>
              <div className="w-full h-[50px] sm:h-[60px] rounded-lg mb-2 flex items-center justify-center text-white font-bold text-[9px] sm:text-[10px]" style={{ background: 'linear-gradient(90deg, #2c3e50, #0984e3)' }}>STUDENT</div><h4 className="font-bold text-[11px] sm:text-xs">កាតសិស្ស</h4>
            </div>
            <div className={`cursor-pointer border-2 rounded-xl p-2 sm:p-3 text-center transition ${cardType === 'company' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-slate-200 hover:border-orange-500 hover:-translate-y-1'}`} onClick={() => {setCardType('company'); setFilterType('company'); setForm({id:'',name:'',f1:'',f2:'',photo:''}); setEditingId(null);}}>
              <div className="w-full h-[50px] sm:h-[60px] rounded-lg mb-2 flex items-center justify-center text-orange-500 font-bold text-[9px] sm:text-[10px] border-b-4 border-orange-500 bg-slate-800">COMPANY</div><h4 className="font-bold text-[11px] sm:text-xs">ក្រុមហ៊ុន</h4>
            </div>
            <div className={`cursor-pointer border-2 rounded-xl p-2 sm:p-3 text-center transition ${cardType === 'staff' ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-200 hover:border-emerald-500 hover:-translate-y-1'}`} onClick={() => {setCardType('staff'); setFilterType('staff'); setForm({id:'',name:'',f1:'',f2:'',photo:''}); setEditingId(null);}}>
              <div className="w-full h-[50px] sm:h-[60px] rounded-lg mb-2 flex items-center justify-center text-emerald-500 font-bold text-[9px] sm:text-[10px] border-2 border-emerald-500 bg-white">STAFF</div><h4 className="font-bold text-[11px] sm:text-xs">បុគ្គលិក</h4>
            </div>
            <div className={`cursor-pointer border-2 rounded-xl p-2 sm:p-3 text-center transition ${cardType === 'business' ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-slate-200 hover:border-amber-500 hover:-translate-y-1'}`} onClick={() => {setCardType('business'); setFilterType('business'); setForm({id:'',name:'',f1:'',f2:'',photo:''}); setEditingId(null);}}>
              <div className="w-full h-[50px] sm:h-[60px] rounded-lg mb-2 flex items-center justify-center text-amber-500 font-bold text-[9px] sm:text-[10px] border-l-4 border-amber-500 bg-slate-900">BUSINESS</div><h4 className="font-bold text-[11px] sm:text-xs">កាត VIP</h4>
            </div>
            <div className={`cursor-pointer border-2 rounded-xl p-2 sm:p-3 text-center transition ${cardType === 'press' ? 'border-rose-500 bg-rose-50 shadow-md' : 'border-slate-200 hover:border-rose-500 hover:-translate-y-1'}`} onClick={() => {setCardType('press'); setFilterType('press'); setForm({id:'',name:'',f1:'',f2:'',photo:''}); setEditingId(null);}}>
              <div className="w-full h-[50px] sm:h-[60px] rounded-lg mb-2 flex items-center justify-center text-rose-500 font-bold text-[9px] sm:text-[10px] border-t-8 border-rose-500 bg-white shadow-inner">PRESS</div><h4 className="font-bold text-[11px] sm:text-xs">អ្នកកាសែត</h4>
            </div>
            <div className={`cursor-pointer border-2 rounded-xl p-2 sm:p-3 text-center transition ${cardType === 'library' ? 'border-green-500 bg-green-50 shadow-md' : 'border-slate-200 hover:border-green-500 hover:-translate-y-1'}`} onClick={() => {setCardType('library'); setFilterType('library'); setForm({id:'',name:'',f1:'',f2:'',photo:''}); setEditingId(null);}}>
              <div className="w-full h-[50px] sm:h-[60px] rounded-lg mb-2 flex items-center justify-center text-green-800 font-bold text-[9px] sm:text-[10px] border border-green-500 bg-gradient-to-br from-green-50 to-green-100">LIBRARY</div><h4 className="font-bold text-[11px] sm:text-xs">បណ្ណាល័យ</h4>
            </div>
          </div>
          
          <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 shadow-sm w-full">
             <h3 className="font-bold text-primary mb-3 flex items-center gap-2 text-sm sm:text-base"><GraduationCap size={18} /> បញ្ចូលព័ត៌មានកាត</h3>
             <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1.5fr_1.5fr_auto] gap-2">
               <input className="field" placeholder="អត្តលេខ ID" value={form.id} onChange={e => setForm({...form, id: e.target.value})} />
               <input className="field" placeholder="គោត្តនាម-នាម" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
               <input className="field" placeholder={cardType==='student'?'ឆ្នាំសិក្សា':cardType==='company'?'Dept':'Role'} value={form.f1} onChange={e => setForm({...form, f1: e.target.value})} />
               <input className="field" placeholder={cardType==='student'?'ជំនាញ':cardType==='library'?'Date':'Other'} value={form.f2} onChange={e => setForm({...form, f2: e.target.value})} />
               <label className="btn border border-slate-300 bg-white text-slate-700 cursor-pointer w-full sm:w-auto"><Upload size={16}/>រូបភាព<input type="file" className="hidden" accept="image/*" onChange={(e)=>{const f=e.target.files?.[0]; if(f){const r=new FileReader(); r.onload=(ev)=>setForm({...form, photo: ev.target?.result as string}); r.readAsDataURL(f);}}} /></label>
             </div>
             <div className="flex flex-col sm:flex-row justify-end gap-2 mt-3 w-full">
               <button className="btn bg-slate-200 text-slate-700 w-full sm:w-auto hover:bg-slate-300" onClick={() => { setForm({id:'',name:'',f1:'',f2:'',photo:''}); setEditingId(null); }}>បោះបង់</button>
               <button className="btn btn-primary w-full sm:w-auto" onClick={saveCard}>{editingId ? 'Save Edit' : 'រក្សាទុកកាត'}</button>
             </div>
          </div>
        </div>
      )}

      <div className="card min-h-[400px] w-full">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 pb-3 border-b border-slate-200 gap-3 w-full no-print">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
               <FileBadge className="text-primary shrink-0" size={20} />
               <select className="field w-full sm:w-40 !py-1.5 !px-2 font-bold bg-white text-sm" value={filterType} onChange={e => setFilterType(e.target.value)}>
                 <option value="student">សិស្ស-និស្សិត</option>
                 <option value="company">ក្រុមហ៊ុន-អាជីវកម្ម</option>
                 <option value="staff">បុគ្គលិក</option>
                 <option value="business">សមាជិក VIP</option>
                 <option value="press">អ្នកសារព័ត៌មាន</option>
                 <option value="library">បណ្ណាល័យ</option>
               </select>
               <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-xs font-bold shrink-0">{savedCards.filter(c => c.template === filterType).length}</span>
            </div>
            <button className="btn btn-primary w-full sm:w-auto !py-2" onClick={printCards}><Printer size={16} /> បោះពុម្ពកាត (A4)</button>
         </div>
         
         <div className="w-full pb-4">
           <div className="w-full flex flex-wrap gap-5 justify-center sm:justify-start" id="cardsPrintArea">
              {canCreateCard && (form.id || form.name) && (
                <div className="print-card-item relative opacity-60 no-print">
                  <div className="absolute -top-3 -right-3 z-10 bg-warning text-black text-[9px] font-bold px-2 py-1 rounded-full shadow-md">PREVIEW</div>
                  <RenderCard cardData={form} isPreview={true} />
                </div>
              )}
              
              {savedCards.filter(c => c.template === filterType).map((card) => (
                <div key={card.dbId} className="print-card-item relative group hover:-translate-y-1 transition-transform p-1.5 bg-white rounded-xl shadow-md border border-slate-200 w-max mx-auto sm:mx-0">
                   <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity no-print">
                      <button className="bg-emerald-500 text-white p-1.5 rounded-full shadow hover:bg-emerald-600 active:scale-95 transition-all" onClick={() => downloadCard(card.dbId, card.name)}><Download size={14}/></button>
                      {canCreateCard && (
                        <>
                          <button className="bg-blue-500 text-white p-1.5 rounded-full shadow hover:bg-blue-600 active:scale-95 transition-all" onClick={() => editCard(card)}><Pencil size={14}/></button>
                          <button className="bg-rose-500 text-white p-1.5 rounded-full shadow hover:bg-rose-600 active:scale-95 transition-all" onClick={() => deleteCard(card.dbId)}><Trash2 size={14}/></button>
                        </>
                      )}
                   </div>
                   <RenderCard cardData={card} />
                </div>
              ))}
           </div>
         </div>
      </div>
    </div>
  ); 
}

function Scanner({ onClose, students, refresh, adminInfo, today }: { onClose: () => void; students: Student[]; refresh: () => Promise<void>; adminInfo: any; today: string }) { 
  const [value, setValue] = useState(''); 
  const [message, setMessage] = useState<{text: string, type: 'success'|'error'} | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  
  useEffect(() => {
    const initScanner = async () => {
      if (!document.getElementById("reader")) return;
      const html5QrcodeScanner = new Html5Qrcode("reader");
      scannerRef.current = html5QrcodeScanner;
      try {
        await html5QrcodeScanner.start(
          { facingMode: "environment" }, 
          { fps: 10, qrbox: { width: 250, height: 250 } }, 
          (decodedText) => {
            setValue(decodedText);
            recordText(decodedText);
          }, 
          undefined
        );
      } catch (err) {
        console.error(err);
      }
    };
    initScanner();

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  async function recordText(val: string) {
    if (processingRef.current) return;
    processingRef.current = true;
    
    const student = students.find(s => s.stu_id === val.trim()); 
    if (!student) {
      setMessage({ text: "មិនស្គាល់អត្តលេខនេះទេ", type: 'error' });
      setTimeout(() => { setMessage(null); processingRef.current = false; }, 2500);
      return;
    }

    const { data: existing } = await supabase.from('attendance')
      .select('id, status, created_at')
      .eq('student_id', student.id)
      .eq('date', today)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existing && existing.length > 0) {
       if (existing[0].status === statuses[0]) {
          setMessage({ text: "ស្កែនរួចរាល់ហើយ", type: 'error' });
          setValue('');
          setTimeout(() => { setMessage(null); processingRef.current = false; }, 2500);
          return;
       } else {
          await supabase.from('attendance').update({ status: statuses[0], time: new Date().toLocaleTimeString('en-GB') }).eq('id', existing[0].id);
          await refresh(); 
          setValue('');
          setMessage({ text: "ស្កែនជោគជ័យ", type: 'success' });
          setTimeout(() => { onClose(); }, 1500);
          return;
       }
    }
    
    if (scannerRef.current && scannerRef.current.isScanning) {
      try { scannerRef.current.pause(true); } catch(e){}
    }

    await supabase.from('attendance').insert({ 
      student_id: student.id, 
      stu_id: student.stu_id, 
      name: student.name, 
      gender: student.gender, 
      status: statuses[0], 
      date: today, 
      time: new Date().toLocaleTimeString('en-GB'),
      shift: adminInfo.shift || '',
      room: adminInfo.room || '',
      teacher: adminInfo.teacher || '',
      subject: adminInfo.subject || ''
    }); 
    await refresh(); 
    setValue('');
    
    setMessage({ text: "ស្កែនជោគជ័យ", type: 'success' });
    setTimeout(() => {
      onClose();
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-black" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center p-4">
        
        {message && (
          <div className={`absolute top-10 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-lg animate-fade-in z-50 flex items-center gap-2 ${message.type === 'success' ? 'bg-success' : 'bg-danger'}`}>
            {message.type === 'success' ? <CheckCircle2 size={18}/> : <X size={18}/>}
            {message.text}
          </div>
        )}

        <div className="relative h-64 w-64 rounded-2xl shadow-[0_0_0_4000px_rgba(0,0,0,.75)] overflow-hidden bg-black/50">
          <span className="absolute left-0 top-0 h-12 w-12 rounded-tl-2xl border-l-4 border-t-4 border-white z-20 pointer-events-none" />
          <span className="absolute right-0 top-0 h-12 w-12 rounded-tr-2xl border-r-4 border-t-4 border-white z-20 pointer-events-none" />
          <span className="absolute bottom-0 left-0 h-12 w-12 rounded-bl-2xl border-b-4 border-l-4 border-white z-20 pointer-events-none" />
          <span className="absolute bottom-0 right-0 h-12 w-12 rounded-br-2xl border-b-4 border-r-4 border-white z-20 pointer-events-none" />
          <div id="reader" className="w-full h-full object-cover relative z-10"></div>
          <div className="absolute left-[5%] top-0 h-0.5 w-[90%] animate-scan-laser bg-green-400 shadow-[0_0_15px_#00ff00] z-20 pointer-events-none" />
        </div>
        
        <p className="mt-8 text-center text-slate-300 text-sm font-medium tracking-wide">ដាក់កូដ QR ឱ្យចំកណ្តាល</p>
        
        <div className="mt-5 flex w-full max-w-[280px] gap-2">
          <input className="field !bg-white/10 !border-white/20 !text-white placeholder:text-slate-400 !py-2" placeholder="បញ្ចូល ID ដោយដៃ" value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') void recordText(value); }} />
          <button className="btn bg-success text-white px-3" onClick={() => void recordText(value)}><CheckCircle2 size={18} /></button>
        </div>
        
        <button className="btn mt-6 border border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md px-5 py-2.5 text-sm" onClick={onClose}><X size={16} /> បិទកាំមេរ៉ា</button>
      </div>
    </div>
  ); 
}

function SchedulePanel({ isAdmin }: { isAdmin: boolean }) { 
  const days = ['ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ']; 
  const defaultTimes = ['07:30 - 09:00', '09:30 - 11:00', '01:00 - 14:30', '14:45 - 16:15']; 
  const [scheduleData, setScheduleData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { 
    supabase.from('schedules').select('data_json').eq('type', 'class_schedule').maybeSingle().then(({data}) => {
      if(data?.data_json) setScheduleData(data.data_json as Record<string, string>);
    }); 
  }, []);

  async function saveSchedule() {
    setSaving(true); 
    const { data } = await supabase.from('schedules').select('id').eq('type', 'class_schedule').maybeSingle();
    if (data?.id) {
      await supabase.from('schedules').update({ data_json: scheduleData }).eq('id', data.id);
    } else {
      await supabase.from('schedules').insert({ type: 'class_schedule', data_json: scheduleData });
    }
    setSaving(false); 
  }

  const getRowTime = (r: number) => scheduleData[`rowTime_${r}`] !== undefined ? scheduleData[`rowTime_${r}`] : defaultTimes[r];

  return (
    <div className="card shadow-sm border border-slate-200 w-full">
      <h2 className="mb-4 flex items-center gap-2 text-lg sm:text-xl font-bold"><CalendarDays className="text-primary" /> កាលវិភាគរៀន</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 w-full">
        <table className="min-w-[700px] w-full border-collapse text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="border-b border-r bg-slate-50 p-2 sm:p-3 text-center w-[120px] sm:w-[140px]">ម៉ោង / ថ្ងៃ</th>
              {days.map(d => <th className="border-b border-r bg-slate-50 p-2 sm:p-3 text-center" key={d}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {[0,1,2,3].map((r) => (
              <tr key={r}>
                <td className="border-b border-r bg-[#43f0ed] p-1 font-bold text-center whitespace-nowrap text-dark">
                  <input disabled={!isAdmin} className="w-full text-center bg-transparent border-none outline-none text-dark font-bold disabled:opacity-100 p-1 rounded hover:bg-white/50 focus:bg-white transition-colors" value={getRowTime(r)} onChange={e => setScheduleData({...scheduleData, [`rowTime_${r}`]: e.target.value})} />
                </td>
                {days.map((day, c) => {
                  const cellKey = `sch_${r}_${c}`;
                  return (
                    <td className="border-b border-r p-1" key={cellKey}>
                      <textarea disabled={!isAdmin} value={scheduleData[cellKey] || ''} onChange={(e) => setScheduleData({...scheduleData, [cellKey]: e.target.value})} className="h-12 sm:h-16 w-full resize-none rounded-lg p-1.5 sm:p-2 text-center outline-none disabled:bg-transparent text-xs sm:text-sm font-medium border-2 border-transparent focus:border-[#7f8e3c] focus:bg-[#2f67a0] focus:text-white transition-colors" placeholder="..." />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isAdmin && <button className="btn btn-success mt-4" disabled={saving} onClick={saveSchedule}><CheckCircle2 size={16} /> {saving ? 'Saving...' : 'Save Schedule'}</button>}
    </div>
  ); 
}

function CleaningSchedule({ isAdmin }: { isAdmin: boolean }) {
  const days = ['ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
  const defaultData = {
    title: 'វេនសម្អាតថ្នាក់', room: '', logo: '',
    people: { president: { name: '', photo: '' }, viceOne: { name: '', photo: '' }, viceTwo: { name: '', photo: '' } },
    days: days.map(day => ({ day, time: '07:00 - 07:30', names: '' }))
  };

  const [data, setData] = useState<any>(defaultData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('schedules').select('data_json').eq('type', 'cleaning_schedule').maybeSingle().then(({ data: row }) => {
      if (row?.data_json) setData(row.data_json);
    });
  }, []);

  function updatePerson(key: string, changes: any) {
    setData((current: any) => ({ ...current, people: { ...current.people, [key]: { ...current.people[key], ...changes } } }));
  }

  async function save() {
    setSaving(true);
    const existing = await supabase.from('schedules').select('id').eq('type', 'cleaning_schedule').maybeSingle();
    if (existing.data?.id) {
      await supabase.from('schedules').update({ data_json: data }).eq('id', existing.data.id);
    } else {
      await supabase.from('schedules').insert({ type: 'cleaning_schedule', data_json: data });
    }
    setSaving(false);
  }

  const promptImage = (currentUrl: string, callback: (url: string) => void) => {
    if(!isAdmin) return;
    const url = window.prompt("បញ្ចូល Link រូបភាព (Image URL):", currentUrl);
    if(url) callback(url);
  };

  return (
    <section className="card shadow-sm border border-slate-200">
      <div className="text-center mb-5 relative">
        <img src={data.logo || "https://via.placeholder.com/120"} className={`w-[80px] h-[80px] object-cover rounded-full border-2 border-primary mx-auto shadow-sm ${isAdmin ? 'cursor-pointer hover:opacity-80' : ''}`} alt="logo" onClick={() => promptImage(data.logo, (url) => setData({...data, logo: url}))} />
        <input disabled={!isAdmin} className="w-full text-center text-[1.4rem] font-bold border-none outline-none text-primary bg-transparent mt-2 disabled:bg-transparent" placeholder="..." value={data.title} onChange={e => setData({ ...data, title: e.target.value })} />
        <input disabled={!isAdmin} className="w-full text-center text-[1.1rem] font-bold border-none outline-none text-[#e67e22] bg-transparent mt-1 disabled:bg-transparent" placeholder="..." value={data.room} onChange={e => setData({ ...data, room: e.target.value })} />
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
         <div className="flex flex-col items-center mb-4">
            <label className="font-bold text-[#2c3e50] mb-2 text-[0.85rem]">ប្រធានថ្នាក់</label>
            <img src={data.people.president.photo || "https://via.placeholder.com/100"} className={`w-[70px] h-[90px] object-cover rounded-md border-2 border-primary shadow-sm mb-2 ${isAdmin ? 'cursor-pointer hover:opacity-80' : ''}`} alt="president" onClick={() => promptImage(data.people.president.photo, (url) => updatePerson('president', {photo: url}))} />
            <input disabled={!isAdmin} className="w-[180px] text-center p-1 border-none bg-transparent rounded font-bold outline-none text-[#2d3436] disabled:bg-transparent" placeholder="..." value={data.people.president.name} onChange={e => updatePerson('president', { name: e.target.value })} />
         </div>
         <div className="flex justify-center gap-4 flex-nowrap">
            <div className="flex flex-col items-center w-[48%]">
                <label className="font-bold text-[#2c3e50] mb-2 text-[0.85rem]">អនុប្រធានទី១</label>
                <img src={data.people.viceOne.photo || "https://via.placeholder.com/100"} className={`w-[70px] h-[90px] object-cover rounded-md border-2 border-primary shadow-sm mb-2 ${isAdmin ? 'cursor-pointer hover:opacity-80' : ''}`} alt="vp1" onClick={() => promptImage(data.people.viceOne.photo, (url) => updatePerson('viceOne', {photo: url}))} />
                <input disabled={!isAdmin} className="w-full text-center p-1 border-none bg-transparent rounded font-bold outline-none text-[#2d3436] disabled:bg-transparent" placeholder="..." value={data.people.viceOne.name} onChange={e => updatePerson('viceOne', { name: e.target.value })} />
            </div>
            <div className="flex flex-col items-center w-[48%]">
                <label className="font-bold text-[#2c3e50] mb-2 text-[0.85rem]">អនុប្រធានទី២</label>
                <img src={data.people.viceTwo.photo || "https://via.placeholder.com/100"} className={`w-[70px] h-[90px] object-cover rounded-md border-2 border-primary shadow-sm mb-2 ${isAdmin ? 'cursor-pointer hover:opacity-80' : ''}`} alt="vp2" onClick={() => promptImage(data.people.viceTwo.photo, (url) => updatePerson('viceTwo', {photo: url}))} />
                <input disabled={!isAdmin} className="w-full text-center p-1 border-none bg-transparent rounded font-bold outline-none text-[#2d3436] disabled:bg-transparent" placeholder="..." value={data.people.viceTwo.name} onChange={e => updatePerson('viceTwo', { name: e.target.value })} />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
        {data.days.map((item: any, index: number) => (
          <div className="bg-white border border-primary rounded-lg overflow-hidden flex flex-col shadow-sm" key={item.day}>
            <div className="bg-primary p-1.5 border-b border-primary">
               <input disabled={!isAdmin} className="w-full text-center font-bold bg-transparent border-none text-white outline-none text-[1rem] disabled:bg-transparent" value={item.day} onChange={e => setData((current: any) => ({ ...current, days: current.days.map((day: any, dayIndex: number) => dayIndex === index ? { ...day, day: e.target.value } : day) }))} />
            </div>
            <div className="bg-blue-50 p-1.5 border-b border-slate-300">
               <input disabled={!isAdmin} className="w-full text-center bg-transparent border-none text-blue-700 font-medium outline-none text-[0.85rem] disabled:bg-transparent" value={item.time} onChange={e => setData((current: any) => ({ ...current, days: current.days.map((day: any, dayIndex: number) => dayIndex === index ? { ...day, time: e.target.value } : day) }))} />
            </div>
            <textarea disabled={!isAdmin} className="h-40 w-full resize-none p-3 text-center outline-none focus:bg-blue-50/30 overflow-y-auto leading-relaxed text-[0.9rem] bg-transparent disabled:bg-slate-50/50" placeholder="..." value={item.names} onChange={e => setData((current: any) => ({ ...current, days: current.days.map((day: any, dayIndex: number) => dayIndex === index ? { ...day, names: e.target.value } : day) }))} />
          </div>
        ))}
      </div>

      {isAdmin && <button className="btn btn-success mt-5 w-full" disabled={saving} onClick={save}><CheckCircle2 size={16}/> {saving ? 'Saving...' : 'Save Data'}</button>}
    </section>
  );
}

function Analytics({ counts, totalStudents }: { counts: { present: number; leave: number; absent: number }; totalStudents: number }) { 
  const total = counts.present + counts.leave + counts.absent || 1; 
  return (
    <div className="grid gap-3 lg:gap-4 lg:grid-cols-2">
      <div className="card w-full">
        <h2 className="mb-4 text-lg font-bold">វិភាគវត្តមានសិស្ស</h2>
        <div className="mx-auto flex h-48 w-48 sm:h-56 sm:w-56 items-center justify-center rounded-full shadow-inner" style={{ background: `conic-gradient(#00b894 0 ${(counts.present / total) * 100}%, #f1c40f ${(counts.present / total) * 100}% ${((counts.present + counts.leave) / total) * 100}%, #d63031 ${((counts.present + counts.leave) / total) * 100}% 100%)` }}>
          <div className="flex h-32 w-32 sm:h-36 sm:w-36 items-center justify-center rounded-full bg-white text-center shadow-md">
            <div>
              <b className="text-2xl sm:text-3xl">{total === 1 && counts.present === 0 && counts.leave === 0 && counts.absent === 0 ? 0 : total}</b>
              <small className="block text-slate-500 text-[10px] sm:text-xs">កំណត់ត្រា</small>
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
          <div className="text-success bg-success/10 rounded-xl p-2 sm:p-3"><b>{counts.present}</b><span className="block text-slate-600 mt-0.5 sm:mt-1">វត្តមាន</span></div>
          <div className="text-yellow-600 bg-warning/10 rounded-xl p-2 sm:p-3"><b>{counts.leave}</b><span className="block text-slate-600 mt-0.5 sm:mt-1">ច្បាប់</span></div>
          <div className="text-danger bg-danger/10 rounded-xl p-2 sm:p-3"><b>{counts.absent}</b><span className="block text-slate-600 mt-0.5 sm:mt-1">អវត្តមាន</span></div>
        </div>
      </div>
      <div className="card w-full">
        <h2 className="mb-4 text-lg font-bold">ស្ថិតិទូទៅ</h2>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-primary/10 p-3 sm:p-4 border border-primary/20"><span className="text-sm sm:text-base">សិស្សសរុប</span><b className="text-xl sm:text-2xl text-primary">{totalStudents}</b></div>
          <div className="flex items-center justify-between rounded-xl bg-success/10 p-3 sm:p-4 border border-success/20"><span className="text-sm sm:text-base">អត្រាវត្តមាន</span><b className="text-xl sm:text-2xl text-success">{Math.round((counts.present / total) * 100)}%</b></div>
          <div className="flex items-center justify-between rounded-xl bg-slate-100 p-3 sm:p-4 border border-slate-200"><span className="text-sm sm:text-base">ថ្ងៃនេះ</span><b className="text-base sm:text-lg text-slate-700">{new Date().toLocaleDateString('en-CA')}</b></div>
        </div>
      </div>
    </div>
  ); 
}

export default App;