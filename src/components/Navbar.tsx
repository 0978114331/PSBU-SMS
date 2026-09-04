import { BarChart3, CalendarDays, ChevronDown, ClipboardList, Database, FileBadge, GraduationCap, LogOut, Menu, QrCode, UserCheck, Users, FileText, Home, Info, ImagePlus } from 'lucide-react';

type NavItem = { id: string; label: string; icon: any };

type NavbarProps = {
  activeTab: string;
  isAdmin: boolean;
  userLabel: string;
  role: string;
  mobileOpen: boolean;
  logoUrl?: string;
  schoolName?: string;
  onTabChange: (tab: string) => void;
  onScanner: () => void;
  onSignOut: () => void;
  onMobileToggle: () => void;
};

const primaryItems: NavItem[] = [
  { id: 'Home', label: 'ផ្ទះ', icon: Home },
  { id: 'attendance', label: 'វត្តមាន', icon: UserCheck },
  { id: 'leaves', label: 'សុំច្បាប់', icon: FileText },
  { id: 'about', label: 'អំពី', icon: Info },
];

export function Navbar({ activeTab, isAdmin, userLabel, role, mobileOpen, logoUrl, schoolName, onTabChange, onScanner, onSignOut, onMobileToggle }: NavbarProps) {
  
  const warehouseItems: NavItem[] = [
    { id: 'scores', label: 'ពិន្ទុសិស្ស', icon: GraduationCap },
    { id: 'analytics', label: 'វិភាគទិន្នន័យ', icon: BarChart3 },
    { id: 'warehouse_att', label: 'ទិន្នន័យវត្តមាន', icon: ClipboardList },
    { id: 'warehouse_score', label: 'លទ្ធផលពិន្ទុ', icon: GraduationCap },
    { id: 'schedule', label: 'កាលវិភាគរៀន', icon: CalendarDays },
    { id: 'cleaning', label: 'វេនសម្អាតថ្នាក់', icon: CalendarDays },
    { id: 'students', label: 'បញ្ជីឈ្មោះសិស្ស', icon: Users },
    { id: 'cards', label: 'កាតសិស្ស-បុគ្គលិក', icon: FileBadge }
  ];

  if (isAdmin) {
      warehouseItems.unshift(
        { id: 'admin_posts' as any, label: 'បង្ហោះលើ Home', icon: ImagePlus },
        { id: 'settings' as any, label: 'ការកំណត់ (Settings)', icon: Database }
      );
    }

  const isMenuTabActive = warehouseItems.some(item => item.id === activeTab);

  return <>
    <header className="fixed top-0 z-40 flex w-full items-center justify-between bg-[#2c3e50] px-4 py-3 sm:py-2.5 text-white shadow-md">
      <div className="flex items-center gap-3">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-white/20 bg-white shadow-sm" />
        ) : (
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-primary overflow-hidden border border-white/20">
             <img src="https://i.ibb.co/JjdQf0hK/ce2e43f3-9d48-4d71-86a6-dd1ac3d77c49.png" alt="My Logo" className="w-full h-full object-cover" />
          </div>
        )}
        <b className="text-sm sm:text-base font-bold tracking-wide hidden min-[360px]:block"> {schoolName || 'School MS'}</b>      
      </div>
      
      <div className="hidden items-center gap-3 lg:flex">
        {primaryItems.map(item => <NavButton key={item.id} item={item} active={activeTab === item.id} onClick={() => onTabChange(item.id)} />)}
        
        <div className="group relative">
          <button className={`btn !min-h-[38px] !py-1.5 ${isMenuTabActive ? 'bg-[#3b31c4] text-white shadow-md shadow-[#3b31c4]/20' : 'bg-[#3b31c4] text-white hover:brightness-110'}`}><Database size={16} /> ម៉ឺនុយទិន្នន័យ <ChevronDown size={14} /></button>
          <div className="invisible absolute right-0 top-full z-50 mt-2 w-56 translate-y-2 overflow-hidden rounded-xl bg-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 border border-slate-100">
            {warehouseItems.map(item => { const Icon = item.icon; return <button key={item.id} className="flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3.5 text-left text-[13px] font-bold text-slate-700 transition hover:bg-primary/5 hover:text-primary" onClick={() => onTabChange(item.id)}><Icon size={16} className="text-slate-400" />{item.label}</button>; })}
          </div>
        </div>
        
        <button className="btn bg-secondary text-white !min-h-[38px] !py-1.5 shadow-md shadow-secondary/30 ml-2" onClick={onScanner}>
           <QrCode size={16} /> ស្កែនវត្តមាន
        </button>
      </div>

      <div className="flex items-center gap-4 lg:hidden">
        <button className="relative flex items-center justify-center bg-gradient-to-r from-secondary to-primary rounded-xl p-2 shadow-lg shadow-primary/30 active:scale-95 transition-transform" onClick={onScanner}>
           <QrCode size={20} className="text-white" />
        </button>
      </div>
    </header>

    <nav className="fixed bottom-0 left-0 w-full z-40 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:hidden flex justify-between items-center px-1 pb-[env(safe-area-inset-bottom)] h-[65px]">
       <BottomNavItem icon={Home} label="ផ្ទះ" active={activeTab === 'home'} onClick={() => { onTabChange('home'); if(mobileOpen) onMobileToggle(); }} />
       <BottomNavItem icon={UserCheck} label="វត្តមាន" active={activeTab === 'attendance'} onClick={() => { onTabChange('attendance'); if(mobileOpen) onMobileToggle(); }} />
       
       <div className="flex-1 flex justify-center relative -top-6">
         <button onClick={onMobileToggle} className={`flex items-center justify-center w-[60px] h-[60px] rounded-full text-white shadow-xl transition-transform active:scale-95 border-[4px] border-light ${mobileOpen || isMenuTabActive ? 'bg-secondary shadow-secondary/40' : 'bg-primary shadow-primary/40'}`}>
           <Menu size={28} />
         </button>
       </div>

       <BottomNavItem icon={FileText} label="សុំច្បាប់" active={activeTab === 'leaves'} onClick={() => { onTabChange('leaves'); if(mobileOpen) onMobileToggle(); }} />
       <BottomNavItem icon={Info} label="អំពីយើង" active={activeTab === 'about'} onClick={() => { onTabChange('about'); if(mobileOpen) onMobileToggle(); }} />
    </nav>

    {mobileOpen && (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden" onClick={onMobileToggle}>
        <div className="absolute bottom-0 left-0 w-full bg-[#1e293b] rounded-t-3xl p-5 pb-8 shadow-2xl transition-transform transform translate-y-0" onClick={e => e.stopPropagation()}>
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 cursor-pointer" onClick={onMobileToggle}></div>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
             {warehouseItems.map(item => (
                <MoreMenuButton key={item.id} icon={item.icon} label={item.label} active={activeTab === item.id} onClick={() => { onTabChange(item.id); onMobileToggle(); }} />
             ))}
          </div>
          
          <div className="border-t border-white/10 pt-6 mt-2">
             <div className="flex flex-col items-center justify-center mb-5">
                <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-2 border border-primary/30">
                   <UserCheck size={32} />
                </div>
                <span className="text-white font-bold tracking-wide">{userLabel}</span>
                <span className="text-warning text-[10px] uppercase font-bold mt-1 px-2.5 py-0.5 bg-warning/10 rounded-full border border-warning/20">{role}</span>
             </div>
             
             <button className="mx-auto flex w-full max-w-[250px] items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-8 py-3 font-bold text-red-400 hover:bg-red-500/20 transition active:scale-95" onClick={onSignOut}>
                <LogOut size={18} /> ចាកចេញពីប្រព័ន្ធ
             </button>
          </div>
        </div>
      </div>
    )}
  </>;
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return <button className={`btn !min-h-[38px] !py-1.5 ${active ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white/10 text-white hover:bg-white/20'}`} onClick={onClick}><Icon size={16} />{item.label}</button>;
}

function BottomNavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex-1 flex flex-col items-center justify-center py-2 gap-1 active:scale-95 transition-transform bg-transparent border-none outline-none">
      <div className={`relative p-1.5 rounded-full transition-colors duration-300 ${active ? 'bg-primary/10 text-primary' : 'text-slate-400'}`}>
         <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      </div>
      <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${active ? 'text-primary' : 'text-slate-400'}`}>{label}</span>
    </button>
  );
}

function MoreMenuButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl transition-all active:scale-[0.98] border ${active ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'}`}>
      <Icon size={20} className={active ? 'text-white' : 'text-slate-400'} />
      <span className="text-[10px] sm:text-[12px] font-bold text-center leading-tight">{label}</span>
    </button>
  );
}