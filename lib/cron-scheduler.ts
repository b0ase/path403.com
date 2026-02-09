/**
 * Cron Scheduler Utilities
 *
 * Parses cron expressions and calculates next run times.
 * Uses cron-parser for accurate scheduling.
 */

import * as parser from 'cron-parser';

/**
 * Calculate the next run time from a cron expression
 * @param cronExpression Standard cron expression (5 or 6 fields)
 * @param fromDate Optional date to calculate from (defaults to now)
 * @returns Next run Date or null if invalid expression
 */
export function calculateNextRun(
  cronExpression: string,
  fromDate?: Date
): Date | null {
  try {
    const interval = parser.parseExpression(cronExpression, {
      currentDate: fromDate || new Date(),
      tz: 'UTC',
    });

    return interval.next().toDate();
  } catch (error) {
    console.error(`[CronScheduler] Invalid cron expression: ${cronExpression}`, error);
    return null;
  }
}

/**
 * Validate a cron expression
 * @param cronExpression Standard cron expression
 * @returns true if valid, false otherwise
 */
export function isValidCronExpression(cronExpression: string): boolean {
  try {
    parser.parseExpression(cronExpression);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get human-readable description of a cron schedule
 * @param cronExpression Standard cron expression
 * @returns Human-readable description
 */
export function describeCronExpression(cronExpression: string): string {
  const commonPatterns: Record<string, string> = {
    '* * * * *': 'Every minute',
    '*/5 * * * *': 'Every 5 minutes',
    '*/15 * * * *': 'Every 15 minutes',
    '*/30 * * * *': 'Every 30 minutes',
    '0 * * * *': 'Every hour',
    '0 */2 * * *': 'Every 2 hours',
    '0 */4 * * *': 'Every 4 hours',
    '0 */6 * * *': 'Every 6 hours',
    '0 */12 * * *': 'Every 12 hours',
    '0 0 * * *': 'Every day at midnight',
    '0 9 * * *': 'Every day at 9 AM',
    '0 9 * * 1-5': 'Every weekday at 9 AM',
    '0 9 * * 1': 'Every Monday at 9 AM',
    '0 0 * * 0': 'Every Sunday at midnight',
    '0 0 1 * *': 'First day of every month',
    '0 0 1 1 *': 'First day of the year',
  };

  if (commonPatterns[cronExpression]) {
    return commonPatterns[cronExpression];
  }

  // Parse and describe
  try {
    const parts = cronExpression.split(' ');
    if (parts.length < 5) {
      return 'Invalid cron expression';
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    let description = '';

    // Minute
    if (minute === '*') {
      description += 'Every minute';
    } else if (minute.startsWith('*/')) {
      description += `Every ${minute.slice(2)} minutes`;
    } else {
      description += `At minute ${minute}`;
    }

    // Hour
    if (hour !== '*') {
      if (hour.startsWith('*/')) {
        description = `Every ${hour.slice(2)} hours`;
      } else {
        const hourNum = parseInt(hour, 10);
        const period = hourNum >= 12 ? 'PM' : 'AM';
        const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
        description = `At ${displayHour}:${minute.padStart(2, '0')} ${period}`;
      }
    }

    // Day of week
    if (dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      if (dayOfWeek.includes('-')) {
        const [start, end] = dayOfWeek.split('-').map(Number);
        description += `, ${days[start]} to ${days[end]}`;
      } else if (dayOfWeek.includes(',')) {
        const dayNums = dayOfWeek.split(',').map(Number);
        description += `, on ${dayNums.map(d => days[d]).join(', ')}`;
      } else {
        description += `, every ${days[parseInt(dayOfWeek, 10)]}`;
      }
    }

    // Day of month
    if (dayOfMonth !== '*') {
      description += `, on day ${dayOfMonth}`;
    }

    // Month
    if (month !== '*') {
      const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      description += `, in ${months[parseInt(month, 10)]}`;
    }

    return description || cronExpression;
  } catch {
    return cronExpression;
  }
}

/**
 * Get the next N run times for a cron expression
 * @param cronExpression Standard cron expression
 * @param count Number of future runs to calculate
 * @returns Array of future run Dates
 */
export function getNextRuns(cronExpression: string, count: number = 5): Date[] {
  try {
    const interval = parser.parseExpression(cronExpression, {
      currentDate: new Date(),
      tz: 'UTC',
    });

    const runs: Date[] = [];
    for (let i = 0; i < count; i++) {
      runs.push(interval.next().toDate());
    }

    return runs;
  } catch (error) {
    console.error(`[CronScheduler] Error getting next runs: ${cronExpression}`, error);
    return [];
  }
}

/**
 * Common cron presets for task scheduling
 */
export const CRON_PRESETS = {
  everyMinute: '* * * * *',
  every5Minutes: '*/5 * * * *',
  every15Minutes: '*/15 * * * *',
  every30Minutes: '*/30 * * * *',
  everyHour: '0 * * * *',
  every2Hours: '0 */2 * * *',
  every4Hours: '0 */4 * * *',
  every6Hours: '0 */6 * * *',
  every12Hours: '0 */12 * * *',
  dailyMidnight: '0 0 * * *',
  daily9AM: '0 9 * * *',
  daily6PM: '0 18 * * *',
  weekdays9AM: '0 9 * * 1-5',
  weekends9AM: '0 9 * * 0,6',
  monday9AM: '0 9 * * 1',
  sunday9AM: '0 9 * * 0',
  firstOfMonth: '0 0 1 * *',
  firstOfYear: '0 0 1 1 *',
} as const;

export type CronPreset = keyof typeof CRON_PRESETS;

/**
 * Get cron expression from preset
 */
export function getPresetCron(preset: CronPreset): string {
  return CRON_PRESETS[preset];
}
