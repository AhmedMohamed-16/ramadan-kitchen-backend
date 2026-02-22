// dailyReport.job.ts
import * as reportsService from '../modules/reports/reports.service';
import * as exportsService from '../modules/exports/exports.service';
import { sendEmail } from '../shared/utils/email.utils';
import { formatDate } from '../shared/utils/dateHelpers';

export const runDailyReportJob = async () => {
  const startTime = Date.now();

  try {
    console.log('🚀 بدء تشغيل مهمة التقرير اليومي...');

    const today = new Date();
    const date = formatDate(today);

    console.log(`📅 إنشاء التقرير بتاريخ: ${date}`);

    // ✅ استخدم buffer مباشرة - بدون حفظ ملف على السيرفر
    const workbook = await exportsService.exportDailyReport(date);
    const buffer = await workbook.xlsx.writeBuffer();

    // جلب ملخص التقرير للإيميل
    const reportData = await reportsService.getDailyReport(date);

    // إرسال الإيميل مع الـ buffer
    await sendEmail({
      to: process.env.REPORT_EMAIL as string,
      subject: `التقرير اليومي - ${date}`,
      html: `
        <!DOCTYPE html>
        <html dir="rtl">
        <head><meta charset="UTF-8" /></head>
        <body style="font-family: Arial; text-align: right;">
          <h2>📊 التقرير اليومي</h2>
          <p>مرفق التقرير اليومي بتاريخ <strong>${date}</strong></p>
          <h3>ملخص التقرير</h3>
          <ul>
            <li>إجمالي التبرعات: ${reportData.financial.totalDonations}</li>
            <li>إجمالي المصروفات: ${reportData.financial.totalExpenses}</li>
            <li>إجمالي الوجبات الموزعة: ${reportData.distribution.totalMealsServed}</li>
          </ul>
          <p>نسأل الله أن يتقبل من الجميع 🤲</p>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `daily-report-${date}.xlsx`,
          content: Buffer.from(buffer), // ✅ buffer مباشرة بدون path
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
           contentDisposition: 'attachment',
        },
      ],
    });

    const duration = Date.now() - startTime;
    console.log(`✅ تم إرسال التقرير خلال ${duration}ms`);

    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في التقرير اليومي:', error);
    return { success: false };
  }
};