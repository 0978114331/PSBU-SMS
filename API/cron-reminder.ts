import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // Log API execution start
  console.log("⚡ [API] Cron Job started executing!");

  // Retrieve Environment Variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  const token = process.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.VITE_TELEGRAM_CHAT_ID;

  if (!supabaseUrl || !supabaseKey || !token || !chatId) {
    console.error("❌ [API] Missing environment variables!");
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 [API] Checking attendance data for: ${today}`);

    // Fetch all students
    const { data: students, error: stuError } = await supabase.from('students').select('*');
    if (stuError) throw stuError;
    console.log(`👥 [API] Total students found: ${students?.length || 0}`);

    // Fetch today's attendance records
    const { data: records, error: recError } = await supabase.from('attendance').select('student_id').eq('date', today);
    if (recError) throw recError;
    console.log(`✅ [API] Present/Leave records found: ${records?.length || 0}`);

    // Find missing students
    const presentIds = records.map((r: any) => r.student_id);
    const missingStudents = students.filter((s: any) => !presentIds.includes(s.id));

    if (missingStudents.length === 0) {
      console.log("🎉 [API] All students have attendance records!");
      // Return success response to browser
      return res.status(200).send("<h1>Success: All students are present or have submitted leave!</h1>");
    }

    const missingCount = missingStudents.length;
    // Map missing student names
    const namesList = missingStudents.map((s: any) => `- ${s.name_kh || s.name_en || s.name || 'Unknown'}`).join('\n');
    
    // Telegram message body
    const text = `⚠️ [AUTO-REMINDER]\nសិស្សដែលមិនទាន់បានស្កែនវត្តមានថ្ងៃនេះ មានចំនួន ${missingCount} នាក់៖\n\n${namesList}\n\n⏳ សូមប្រញាប់ស្កែនវត្តមានជាប្រញាប់! ប្រព័ន្ធនឹងបិទក្នុងពេល ៣០នាទីទៀត!`;

    // Send message to Telegram
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text })
    });

    if (!tgRes.ok) {
      throw new Error('Failed to connect to Telegram API');
    }

    console.log("🚀 [API] Telegram message sent successfully!");
    
    // Return success response to browser
    return res.status(200).send(`<h1>Success: Reminder sent to Telegram for ${missingCount} students!</h1>`);

  } catch (error: any) {
    console.error("❌ [API] Error occurred:", error.message);
    return res.status(500).json({ error: error.message });
  }
}