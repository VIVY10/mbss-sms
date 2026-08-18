const { CronJob } = require('cron');

const {
  deleteOrphanedParents
} = require('../services/guardianCleanupService.js');

const guardianCleanupJob = new CronJob(
  '59 23 28-31 * *',
  async () => {
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    if (tomorrow.getDate() === 1) {
      try {
        await deleteOrphanedParents();
      } catch (error) {
        console.error(
          'Guardian cleanup job failed:',
          error
        );
      }
    }
  },
  null,
  true,
  'Africa/Lusaka'
);

module.exports = {
  guardianCleanupJob
};