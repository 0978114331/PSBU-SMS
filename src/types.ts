export type Tab =
  | 'attendance'
  | 'scores'
  | 'analytics'
  | 'students'
  | 'schedule'
  | 'cleaning'
  | 'cards'
  | 'warehouse_att'
  | 'warehouse_score';

export type Student = {
  id: string;
  stu_id: string | null;
  name: string;
  gender: string | null;
  dob: string | null;
  pob: string | null;
  note: string | null;
};

export type Attendance = {
  id: string;
  student_id: string | null;
  name: string;
  gender: string | null;
  status: string;
  date: string;
  time: string | null;
  stu_id: string | null;
  shift: string | null;
};

export type Score = {
  id: string;
  student_id: string;
  subject_name: string;
  score: number;
};

export type CustomCard = {
  id: string;
  template: string;
  card_id: string;
  name: string;
  field1: string | null;
  field2: string | null;
  photo: string | null;
};

export const statuses = ['វត្តមាន', 'ច្បាប់', 'អវត្តមាន'] as const;

export const subjects = ['C++', 'C#', 'Web', 'Database'] as const;

export function gradeFor(avg: number): string {
  if (avg >= 90) return 'A';
  if (avg >= 80) return 'B';
  if (avg >= 70) return 'C';
  if (avg >= 60) return 'D';
  if (avg >= 50) return 'E';
  return 'F';
}
