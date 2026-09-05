import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  const token = process.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.VITE_TELEGRAM_CHAT_ID;

  if (!supabaseUrl || !supabaseKey || !token || !chatId) {
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: students, error: stuError } = await supabase.from('students').select('*');
    if (stuError) throw stuError;

    const { data: records, error: recError } = await supabase.from('attendance').select('student_id').eq('date', today);
    if (recError) throw recError;

    const presentIds = records.map((r: any) => r.student_id);
    const missingStudents = students.filter((s: any) => !presentIds.includes(s.id));

    if (missingStudents.length === 0) {
      return res.status(200).json({ message: 'All students are present.' });
    }

    const missingCount = missingStudents.length;
    const namesList = missingStudents.map((s: any) => `- ${s.name_kh || s.name_en}`).join('\n');
    
    const text = `⚠️ [AUTO-REMINDER]\nសិស្សដែលមិនទាន់បានស្កែនវត្តមានថ្ងៃនេះ មានចំនួន ${missingCount} នាក់៖\n\n${namesList}\n\n⏳ សូមប្រញាប់ស្កែនវត្តមានជាប្រញាប់! ប្រព័ន្ធនឹងបិទក្នុងពេល ៣០នាទីទៀត!`;

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text })
    });

    if (!tgRes.ok) {
      throw new Error('Failed to send Telegram message');
    }

    return res.status(200).json({ success: true, notified: missingCount });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}