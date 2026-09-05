// src/lib/telegram.ts

export async function sendTelegramReport(data: {
  dateStr: string;
  teacher: string;
  subject: string;
  shift: string;
  room: string;
  totalStu: number;
  presentStu: number;
  leaveStu: number;
  absentStu: number;
}) {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { success: false, message: "មិនទាន់បានកំណត់ Token ឬ Chat ID ក្នុង File .env ទេ!" };
  }

  // Format Telegram message body
  const text = `ជម្រាបសួរលោកគ្រូ/អ្នកគ្រូ🙏\n*សូមជូនវត្តមានដូចខាងក្រោម៖
+កាលបរិច្ឆេទ: ${data.dateStr}
(ជំនាន់ទី២០ ឆ្នាំទី២ ឆមាសទី០២)
+បង្រៀនដោយលោកគ្រូ : ${data.teacher}
+មុខវិជ្ជា: ${data.subject}
+សិក្សាថ្នាក់ផ្ទាល់ វេន: ${data.shift}
.បន្ទប់លេខ : ${data.room}
.និស្សិតសរុប :  ${data.totalStu} អង្គ / នាក់
.និស្សិតវត្តមាន  : ${data.presentStu} អង្គ/ នាក់
.និស្សិតសុំច្បាប់ :  ${data.leaveStu} អង្គ/នាក់
.និស្សិតអវត្តមាន : ${data.absentStu} អង្គ/នាក់

សេចក្តីដូចមានជូនវត្តមានអវត្តមានខាងលើសូមលោកគ្រូ/អ្នកគ្រូមេត្តាគោរពជូនជ្រាបសូមអគុណ!🙏`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text: text,
        // Inline keyboard configuration with user web link
        reply_markup: {
          inline_keyboard: [
            // First row of buttons
            [
              { text: "📝 សុំច្បាប់", url: "https://psbu-sms.vercel.app" },
              { text: "📊 ឆែកវត្តមាន", url: "https://psbu-sms.vercel.app" }
            ],
            // Second row of buttons
            [
              { text: "📅 កាលវិភាគរៀន", url: "https://psbu-sms.vercel.app" },
              { text: "🌐 ចូលទៅកាន់ប្រព័ន្ធ", url: "https://psbu-sms.vercel.app" }
            ]
          ]
        }
      })
    });
    
    if (res.ok) {
      return { success: true, message: "ផ្ញើរបាយការណ៍ទៅកាន់ Telegram ជោគជ័យ!" };
    } else {
      return { success: false, message: "បរាជ័យក្នុងការផ្ញើ! សូមពិនិត្យ Token និង Chat ID ក្នុង .env ម្តងទៀត។" };
    }
  } catch (error) {
    return { success: false, message: "មានបញ្ហាក្នុងការតភ្ជាប់ទៅកាន់ Telegram!" };
  }
}