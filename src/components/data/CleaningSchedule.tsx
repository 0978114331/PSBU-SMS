import { useEffect, useState } from 'react';
import { CheckCircle2, ImagePlus, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type PersonKey = 'president' | 'viceOne' | 'viceTwo';
type Person = { name: string; photo: string };
type CleaningData = { title: string; room: string; logo: string; people: Record<PersonKey, Person>; days: { day: string; time: string; names: string }[] };

const days = ['ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
const defaultData: CleaningData = {
  title: 'វេនសម្អាតថ្នាក់',
  room: '',
  logo: '',
  people: { president: { name: '', photo: '' }, viceOne: { name: '', photo: '' }, viceTwo: { name: '', photo: '' } },
  days: days.map(day => ({ day, time: '07:00 - 07:30', names: '' }))
};

export function CleaningSchedule({ isAdmin }: { isAdmin: boolean }) {
  const [data, setData] = useState<CleaningData>(defaultData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('schedules').select('data_json').eq('type', 'cleaning_schedule').maybeSingle().then(({ data: row }) => {
      if (row?.data_json) setData(row.data_json as CleaningData);
    });
  }, []);

  function updatePerson(key: PersonKey, changes: Partial<Person>) {
    setData(current => ({ ...current, people: { ...current.people, [key]: { ...current.people[key], ...changes } } }));
  }

  async function uploadPhoto(key: PersonKey, file: File) {
    const extension = file.name.split('.').pop() || 'jpg';
    const path = `${crypto.randomUUID()}.${extension}`;
    const upload = await supabase.storage.from('cleaning-photos').upload(path, file, { upsert: true, contentType: file.type });
    if (upload.error) return;
    const { data: url } = supabase.storage.from('cleaning-photos').getPublicUrl(path);
    updatePerson(key, { photo: url.publicUrl });
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
    alert('Saved successfully!');
  }

  return (
    <section className="card shadow-sm border border-slate-200" id="cleaningPrintArea">
      <div className="text-center mb-5 relative">
        <label className={`inline-block mb-0 ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}>
           <img src={data.logo || "https://via.placeholder.com/120"} className="w-[80px] h-[80px] object-cover rounded-full border-2 border-primary mx-auto shadow-sm" alt="logo" />
           {isAdmin && <input type="file" accept="image/*" className="hidden" onChange={(e) => {
             const file = e.target.files?.[0];
             if(file) {
                const reader = new FileReader();
                reader.onload = (event) => setData({...data, logo: event.target?.result as string});
                reader.readAsDataURL(file);
             }
           }} />}
        </label>
        <input disabled={!isAdmin} className="w-full text-center text-[1.4rem] font-bold border-none outline-none text-primary bg-transparent mt-2 disabled:bg-transparent" placeholder="Title" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} />
        <input disabled={!isAdmin} className="w-full text-center text-[1.1rem] font-bold border-none outline-none text-[#e67e22] bg-transparent mt-1 disabled:bg-transparent" placeholder="Room" value={data.room} onChange={e => setData({ ...data, room: e.target.value })} />
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
         <div className="flex flex-col items-center mb-4">
            <label className="font-bold text-[#2c3e50] mb-2 text-[0.85rem]">ប្រធានថ្នាក់</label>
            <label className={`relative mb-2 ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}>
               <img src={data.people.president.photo || "https://via.placeholder.com/100"} className="w-[70px] h-[90px] object-cover rounded-md border-2 border-primary shadow-sm" alt="president" />
               {isAdmin && <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) uploadPhoto('president', f); }} />}
            </label>
            <input disabled={!isAdmin} className="w-[180px] text-center p-1 border-none bg-transparent rounded font-bold outline-none text-[#2d3436] disabled:bg-transparent" placeholder="Name" value={data.people.president.name} onChange={e => updatePerson('president', { name: e.target.value })} />
         </div>
         <div className="flex justify-center gap-4 flex-nowrap">
            <div className="flex flex-col items-center w-[48%]">
                <label className="font-bold text-[#2c3e50] mb-2 text-[0.85rem]">អនុប្រធានទី១</label>
                <label className={`relative mb-2 ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}>
                   <img src={data.people.viceOne.photo || "https://via.placeholder.com/100"} className="w-[70px] h-[90px] object-cover rounded-md border-2 border-primary shadow-sm" alt="vp1" />
                   {isAdmin && <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) uploadPhoto('viceOne', f); }} />}
                </label>
                <input disabled={!isAdmin} className="w-full text-center p-1 border-none bg-transparent rounded font-bold outline-none text-[#2d3436] disabled:bg-transparent" placeholder="Name" value={data.people.viceOne.name} onChange={e => updatePerson('viceOne', { name: e.target.value })} />
            </div>
            <div className="flex flex-col items-center w-[48%]">
                <label className="font-bold text-[#2c3e50] mb-2 text-[0.85rem]">អនុប្រធានទី២</label>
                <label className={`relative mb-2 ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}>
                   <img src={data.people.viceTwo.photo || "https://via.placeholder.com/100"} className="w-[70px] h-[90px] object-cover rounded-md border-2 border-primary shadow-sm" alt="vp2" />
                   {isAdmin && <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) uploadPhoto('viceTwo', f); }} />}
                </label>
                <input disabled={!isAdmin} className="w-full text-center p-1 border-none bg-transparent rounded font-bold outline-none text-[#2d3436] disabled:bg-transparent" placeholder="Name" value={data.people.viceTwo.name} onChange={e => updatePerson('viceTwo', { name: e.target.value })} />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
        {data.days.map((item, index) => (
          <div className="bg-white border border-primary rounded-lg overflow-hidden flex flex-col shadow-sm" key={item.day}>
            <div className="bg-primary p-1.5 border-b border-primary">
               <input disabled={!isAdmin} className="w-full text-center font-bold bg-transparent border-none text-white outline-none text-[1rem] disabled:bg-transparent" value={item.day} onChange={e => setData(current => ({ ...current, days: current.days.map((day, dayIndex) => dayIndex === index ? { ...day, day: e.target.value } : day) }))} />
            </div>
            <div className="bg-blue-50 p-1.5 border-b border-slate-300">
               <input disabled={!isAdmin} className="w-full text-center bg-transparent border-none text-blue-700 font-medium outline-none text-[0.85rem] disabled:bg-transparent" value={item.time} onChange={e => setData(current => ({ ...current, days: current.days.map((day, dayIndex) => dayIndex === index ? { ...day, time: e.target.value } : day) }))} />
            </div>
            <textarea disabled={!isAdmin} className="h-40 w-full resize-none p-3 text-center outline-none focus:bg-blue-50/30 overflow-y-auto leading-relaxed text-[0.9rem] bg-transparent disabled:bg-slate-50/50" placeholder="Names..." value={item.names} onChange={e => setData(current => ({ ...current, days: current.days.map((day, dayIndex) => dayIndex === index ? { ...day, names: e.target.value } : day) }))} />
          </div>
        ))}
      </div>

      {isAdmin && (
         <div className="mt-5">
            <button className="btn btn-success w-full justify-center py-3" disabled={saving} onClick={() => void save()}>
               <Save size={18} /> {saving ? 'Saving...' : 'Save Data'}
            </button>
         </div>
      )}
    </section>
  );
}