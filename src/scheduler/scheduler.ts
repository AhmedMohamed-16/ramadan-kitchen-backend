import cron from 'node-cron';
import { runDailyReportJob } from './dailyReport.job';

/**
 * تشغيل جميع المهام المجدولة
 */
export const startScheduler = () => {
  console.log('⏰ بدء تشغيل الـ Scheduler...\n');

  const schedule = '00 21 * * *'; // كل يوم الساعة 21:00
  cron.schedule(
    schedule,
    async () => {
      console.log('⏰ تم تفعيل مهمة التقرير اليومي');
      await runDailyReportJob();
    },
    { timezone: 'Africa/Cairo' }
  );

  console.log(`✅ تم جدولة التقرير اليومي: ${schedule}`);
  console.log('   تعمل كل يوم بتوقيت القاهرة\n');

  if (process.env.NODE_ENV === 'development') {
    cron.schedule(
      '31 3 * * *',
      async () => {
        console.log('🔧 [DEV] تم تفعيل مهمة اختبار');
        await runDailyReportJob();
      },
      { timezone: 'Africa/Cairo' }
    );
    console.log('🔧 تم تفعيل جدولة التطوير (01:13) يوميًا\n');
  }

  console.log('📅 Scheduler بدأ بنجاح\n');
};

export const stopScheduler = () => {
  console.log('⏰ إيقاف الـ Scheduler...');
  console.log('✅ Scheduler تم إيقافه');
};