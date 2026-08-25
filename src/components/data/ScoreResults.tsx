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
    <section className="card">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold"><Trophy className="text-secondary" /> តារាងចំណាត់ថ្នាក់ និងនិទ្ទេសសរុប</h2>
        </div>
        <span className="rounded-full bg-secondary/10 px-3 py-1 text-sm font-bold text-secondary">{ranking.length} នាក់</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="p-3">ចំណាត់ថ្នាក់</th>
              <th className="p-3">ឈ្មោះ</th>
              {subjects.map(subject => <th className="p-3 text-center" key={subject}>{subject}</th>)}
              <th className="p-3 text-center">មធ្យមភាគ</th>
              <th className="p-3 text-center">និទ្ទេស</th>
              <th className="p-3 text-center">លទ្ធផល</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map(({ student, values, average }, index) => (
              <tr className={`border-t transition hover:bg-primary/5 ${index === 0 && average > 0 ? 'bg-yellow-50' : ''}`} key={student.id}>
                <td className="p-3 font-bold">{index === 0 && average > 0 ? <Medal className="text-yellow-500" size={18} /> : index + 1}</td>
                <td className="p-3 font-medium">{student.name}</td>
                {values.map((value, valueIndex) => <td className="p-3 text-center" key={`${student.id}-${valueIndex}`}>{value}</td>)}
                <td className="p-3 text-center font-bold text-secondary">{average.toFixed(2)}</td>
                <td className="p-3 text-center font-bold text-primary">{gradeFor(average)}</td>
                <td className={`p-3 text-center font-bold ${average >= 50 ? 'text-success' : 'text-danger'}`}>{average >= 50 ? 'ជាប់' : 'ធ្លាក់'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}