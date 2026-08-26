import { useEffect, useMemo, useState } from 'react';
import { Medal, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Score, Student } from '@/types';
import { gradeFor } from '@/types';

type Props = { students: Student[] };

export function ScoreResults({ students }: Props) {
  const [scores, setScores] = useState<Score[]>([]);
  const [subjects, setSubjects] = useState<string[]>(['C++', 'C#', 'Web', 'Database']);

  useEffect(() => { 
    supabase.from('scores').select('*').then(({ data }) => setScores((data ?? []) as Score[])); 
    supabase.from('schedules').select('data_json').eq('type', 'subjects').maybeSingle().then(({ data }) => {
      if (data?.data_json && Array.isArray(data.data_json)) setSubjects(data.data_json);
    });
  }, []);
  
  const ranking = useMemo(() => students.map(student => { 
    const values = subjects.map(subject => Number(scores.find(score => score.student_id === student.id && score.subject_name === subject)?.score ?? 0)); 
    const average = values.reduce((sum, value) => sum + value, 0) / (values.length || 1); 
    return { student, values, average }; 
  }).sort((a, b) => b.average - a.average), [scores, students, subjects]);

  return (
    <section className="card w-full">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold"><Trophy className="text-secondary" /> តារាងចំណាត់ថ្នាក់ និងនិទ្ទេសសរុប</h2>
        </div>
        <span className="rounded-full bg-secondary/10 px-3 py-1 text-sm font-bold text-secondary">{ranking.length} នាក់</span>
      </div>
      
      <div className="rounded-xl border border-slate-200 overflow-hidden w-full bg-white">
        {/* បន្ថែម Scroll កម្ពស់ និងទទឹង */}
        <div className="max-h-[500px] overflow-y-auto overflow-x-auto w-full">
          <table className="w-full min-w-[800px] text-xs sm:text-sm relative border-collapse">
            <thead className="sticky top-0 z-20 shadow-sm">
              <tr className="bg-slate-100 text-left">
                {/* បិទក្បាលតារាង ចំណាត់ថ្នាក់ និង ឈ្មោះ (Sticky) */}
                <th className="p-2 sm:p-3 sticky left-0 z-30 bg-slate-100 w-[60px] sm:w-[80px] text-center border-r border-slate-200">ចំណាត់ថ្នាក់</th>
                <th className="p-2 sm:p-3 sticky left-[60px] sm:left-[80px] z-30 bg-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap border-r border-slate-200">ឈ្មោះ</th>
                
                {subjects.map(subject => <th className="p-2 sm:p-3 text-center whitespace-nowrap bg-slate-100" key={subject}>{subject}</th>)}
                
                <th className="p-2 sm:p-3 text-center whitespace-nowrap bg-slate-100">មធ្យមភាគ</th>
                <th className="p-2 sm:p-3 text-center whitespace-nowrap bg-slate-100">និទ្ទេស</th>
                <th className="p-2 sm:p-3 text-center whitespace-nowrap bg-slate-100">លទ្ធផល</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map(({ student, values, average }, index) => {
                const isTop = index === 0 && average > 0;
                const rowBg = isTop ? 'bg-yellow-50/50' : 'bg-white';
                const stickyBg = isTop ? 'bg-yellow-50' : 'bg-white';
                
                return (
                <tr className={`border-t transition hover:bg-slate-50 ${rowBg}`} key={student.id}>
                  {/* បិទជួរឈរ ចំណាត់ថ្នាក់ និង ឈ្មោះ (Sticky) */}
                  <td className={`p-2 sm:p-3 font-bold sticky left-0 z-10 w-[60px] sm:w-[80px] text-center border-r border-slate-100 ${stickyBg}`}>
                     {isTop ? <Medal className="text-yellow-500 mx-auto" size={18} /> : index + 1}
                  </td>
                  <td className={`p-2 sm:p-3 font-medium sticky left-[60px] sm:left-[80px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] whitespace-nowrap border-r border-slate-100 ${stickyBg}`}>
                     {student.name}
                  </td>
                  
                  {values.map((value, valueIndex) => <td className="p-2 sm:p-3 text-center font-medium text-slate-700" key={`${student.id}-${valueIndex}`}>{value}</td>)}
                  
                  <td className="p-2 sm:p-3 text-center font-bold text-secondary">{average.toFixed(2)}</td>
                  <td className="p-2 sm:p-3 text-center font-bold text-primary">{gradeFor(average)}</td>
                  <td className={`p-2 sm:p-3 text-center font-bold ${average >= 50 ? 'text-success' : 'text-danger'}`}>{average >= 50 ? 'ជាប់' : 'ធ្លាក់'}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}