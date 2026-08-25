import { BarChart3, CalendarDays, ChevronDown, ClipboardList, Database, FileBadge, GraduationCap, LogOut, Menu, QrCode, UserCheck, Users, FileText } from 'lucide-react';
import type { Tab } from '@/types';

type NavItem = { id: Tab | 'leaves'; label: string; icon: typeof Users };

type NavbarProps = {
  activeTab: Tab | 'leaves';
  isAdmin: boolean;
  userLabel: string;
  role: string;
  mobileOpen: boolean;
  logoUrl?: string;
  onTabChange: (tab: Tab | 'leaves') => void;
  onScanner: () => void;
  onSignOut: () => void;
  onMobileToggle: () => void;
};

const primaryItems: NavItem[] = [
  { id: 'attendance', label: 'វត្តមាន', icon: UserCheck },
  { id: 'leaves', label: 'សុំច្បាប់', icon: FileText },
  { id: 'scores', label: 'ពិន្ទុ', icon: GraduationCap },
  { id: 'analytics', label: 'វិភាគ', icon: BarChart3 },
];

const warehouseItems: NavItem[] = [
  { id: 'warehouse_att', label: 'ទិន្នន័យវត្តមាន', icon: ClipboardList },
  { id: 'warehouse_score', label: 'លទ្ធផលពិន្ទុ', icon: GraduationCap },
  { id: 'schedule', label: 'កាលវិភាគរៀន', icon: CalendarDays },
  { id: 'cleaning', label: 'វេនសម្អាតថ្នាក់', icon: CalendarDays },
  { id: 'students', label: 'បញ្ជីឈ្មោះសិស្ស', icon: Users },
];

export function Navbar({ activeTab, isAdmin, userLabel, role, mobileOpen, logoUrl, onTabChange, onScanner, onSignOut, onMobileToggle }: NavbarProps) {
  return <>
    <header className="fixed top-0 z-40 flex w-full items-center justify-between bg-[#2c3e50] px-4 py-2.5 text-white shadow-lg">
      <div className="flex items-center gap-3">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded-full object-cover border-2 border-white bg-white" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary"><GraduationCap size={24} /></div>
        )}
        <b className="text-sm sm:text-base hidden sm:block">PSB University</b>
      </div>
      <div className="hidden items-center gap-2 lg:flex">
        {primaryItems.map(item => <NavButton key={item.id} item={item} active={activeTab === item.id} onClick={() => onTabChange(item.id)} />)}
        <WarehouseMenu activeTab={activeTab} onTabChange={onTabChange} />
        <button className="btn bg-[#bb8e26] text-white" onClick={() => onTabChange('cards' as any)}><FileBadge size={17} /> បង្កើតកាត</button>
        <button className="btn bg-secondary text-white" onClick={onScanner}><QrCode size={17} /> ស្កែនវត្តមាន</button>
        <UserProfile userLabel={userLabel} role={role} onSignOut={onSignOut} />
      </div>
      <div className="flex items-center gap-2 lg:hidden">
        <button className="btn bg-secondary px-3 py-2 text-white" onClick={onScanner}><QrCode size={18} /></button>
        <button onClick={onMobileToggle} className="rounded-lg p-2 bg-white/10 hover:bg-white/20 transition"><Menu size={22} /></button>
      </div>
    </header>
    {mobileOpen && <div className="fixed top-[60px] z-30 w-full bg-[#2c3e50] p-4 shadow-xl lg:hidden border-t border-white/10">
      {primaryItems.map(item => <MobileNavButton key={item.id} item={item} active={activeTab === item.id} onClick={() => onTabChange(item.id)} />)}
      <div className="mt-2 rounded-xl border border-white/15 bg-black/10 p-2">
        <div className="mb-2 flex items-center gap-2 px-2 text-sm font-bold text-blue-100"><Database size={17} /> ឃ្លាំងទិន្នន័យ</div>
        {warehouseItems.map(item => <MobileNavButton key={item.id} item={item} active={activeTab === item.id} onClick={() => onTabChange(item.id)} nested />)}
        <MobileNavButton item={{ id: 'cards' as any, label: 'បង្កើតកាត', icon: FileBadge }} active={activeTab === 'cards'} onClick={() => onTabChange('cards' as any)} nested />
      </div>
      <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/20 p-3 font-bold text-red-200 hover:bg-red-500/30 transition" onClick={onSignOut}><LogOut size={17} /> ចាកចេញ</button>
    </div>}
  </>;
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return <button className={`btn ${active ? 'bg-primary text-white' : 'bg-white/10 text-white'}`} onClick={onClick}><Icon size={17} />{item.label}</button>;
}

function MobileNavButton({ item, active, onClick, nested = false }: { item: NavItem; active: boolean; onClick: () => void; nested?: boolean }) {
  const Icon = item.icon;
  return <button className={`mb-2 flex w-full items-center gap-2 rounded-xl p-3.5 font-bold transition ${nested ? 'justify-start pl-3 text-sm' : 'justify-center'} ${active ? 'bg-primary text-white' : 'bg-white/5 text-white hover:bg-white/10'}`} onClick={onClick}><Icon size={18} />{item.label}</button>;
}

function WarehouseMenu({ activeTab, onTabChange }: { activeTab: Tab | 'leaves'; onTabChange: (tab: Tab | 'leaves') => void }) {
  return <div className="group relative">
    <button className={`btn ${warehouseItems.some(item => item.id === activeTab) ? 'bg-[#3b31c4] text-white' : 'bg-[#3b31c4] text-white'}`}><Database size={17} /> ឃ្លាំងទិន្នន័យ <ChevronDown size={15} /></button>
    <div className="invisible absolute right-0 top-full z-50 mt-2 w-60 translate-y-1 overflow-hidden rounded-xl bg-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      {warehouseItems.map(item => { const Icon = item.icon; return <button key={item.id} className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm font-bold text-dark transition hover:bg-primary/10 hover:text-primary" onClick={() => onTabChange(item.id)}><Icon size={17} />{item.label}</button>; })}
    </div>
  </div>;
}

function UserProfile({ userLabel, role, onSignOut }: { userLabel: string; role: string; onSignOut: () => void }) {
  return <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1"><div className="text-right text-xs"><b>{userLabel}</b><span className="ml-2 rounded bg-warning px-1.5 py-0.5 text-[10px] uppercase text-black">{role}</span></div><button onClick={onSignOut} className="hover:scale-110 transition-transform"><LogOut size={18} className="text-red-300" /></button></div>;
}