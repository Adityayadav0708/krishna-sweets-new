/**
 * Date Range Helper for Krishna Sweets Analytics
 * Computes exact start and end timestamps in Indian Standard Time (IST / UTC+5:30)
 * along with corresponding previous equivalent comparison period.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function getNowIST() {
  const nowUtc = new Date();
  return new Date(nowUtc.getTime() + IST_OFFSET_MS);
}

export function toUtcDateFromIST(year, monthIndex, day, hours = 0, minutes = 0, seconds = 0, ms = 0) {
  // Construct UTC timestamp representing given IST wall-clock time
  const utcMillis = Date.UTC(year, monthIndex, day, hours, minutes, seconds, ms) - IST_OFFSET_MS;
  return new Date(utcMillis);
}

export function parsePeriodDates(period = 'this_month', customStart, customEnd) {
  const istNow = getNowIST();
  const curYear = istNow.getUTCFullYear();
  const curMonth = istNow.getUTCMonth(); // 0-indexed
  const curDay = istNow.getUTCDate();

  let start;
  let end;
  let prevStart;
  let prevEnd;
  let periodLabel = period;

  switch (period) {
    case 'today': {
      start = toUtcDateFromIST(curYear, curMonth, curDay, 0, 0, 0, 0);
      end = toUtcDateFromIST(curYear, curMonth, curDay, 23, 59, 59, 999);
      prevStart = toUtcDateFromIST(curYear, curMonth, curDay - 1, 0, 0, 0, 0);
      prevEnd = toUtcDateFromIST(curYear, curMonth, curDay - 1, 23, 59, 59, 999);
      periodLabel = "Today";
      break;
    }
    case 'yesterday': {
      start = toUtcDateFromIST(curYear, curMonth, curDay - 1, 0, 0, 0, 0);
      end = toUtcDateFromIST(curYear, curMonth, curDay - 1, 23, 59, 59, 999);
      prevStart = toUtcDateFromIST(curYear, curMonth, curDay - 2, 0, 0, 0, 0);
      prevEnd = toUtcDateFromIST(curYear, curMonth, curDay - 2, 23, 59, 59, 999);
      periodLabel = "Yesterday";
      break;
    }
    case '7d': {
      start = toUtcDateFromIST(curYear, curMonth, curDay - 6, 0, 0, 0, 0);
      end = toUtcDateFromIST(curYear, curMonth, curDay, 23, 59, 59, 999);
      prevStart = toUtcDateFromIST(curYear, curMonth, curDay - 13, 0, 0, 0, 0);
      prevEnd = toUtcDateFromIST(curYear, curMonth, curDay - 7, 23, 59, 59, 999);
      periodLabel = "Last 7 Days";
      break;
    }
    case '30d': {
      start = toUtcDateFromIST(curYear, curMonth, curDay - 29, 0, 0, 0, 0);
      end = toUtcDateFromIST(curYear, curMonth, curDay, 23, 59, 59, 999);
      prevStart = toUtcDateFromIST(curYear, curMonth, curDay - 59, 0, 0, 0, 0);
      prevEnd = toUtcDateFromIST(curYear, curMonth, curDay - 30, 23, 59, 59, 999);
      periodLabel = "Last 30 Days";
      break;
    }
    case 'this_month': {
      start = toUtcDateFromIST(curYear, curMonth, 1, 0, 0, 0, 0);
      end = toUtcDateFromIST(curYear, curMonth + 1, 0, 23, 59, 59, 999);
      prevStart = toUtcDateFromIST(curYear, curMonth - 1, 1, 0, 0, 0, 0);
      prevEnd = toUtcDateFromIST(curYear, curMonth, 0, 23, 59, 59, 999);
      periodLabel = "This Month";
      break;
    }
    case 'last_month': {
      start = toUtcDateFromIST(curYear, curMonth - 1, 1, 0, 0, 0, 0);
      end = toUtcDateFromIST(curYear, curMonth, 0, 23, 59, 59, 999);
      prevStart = toUtcDateFromIST(curYear, curMonth - 2, 1, 0, 0, 0, 0);
      prevEnd = toUtcDateFromIST(curYear, curMonth - 1, 0, 23, 59, 59, 999);
      periodLabel = "Previous Month";
      break;
    }
    case 'this_year': {
      start = toUtcDateFromIST(curYear, 0, 1, 0, 0, 0, 0);
      end = toUtcDateFromIST(curYear, 11, 31, 23, 59, 59, 999);
      prevStart = toUtcDateFromIST(curYear - 1, 0, 1, 0, 0, 0, 0);
      prevEnd = toUtcDateFromIST(curYear - 1, 11, 31, 23, 59, 59, 999);
      periodLabel = `This Calendar Year (${curYear})`;
      break;
    }
    case 'last_year': {
      start = toUtcDateFromIST(curYear - 1, 0, 1, 0, 0, 0, 0);
      end = toUtcDateFromIST(curYear - 1, 11, 31, 23, 59, 59, 999);
      prevStart = toUtcDateFromIST(curYear - 2, 0, 1, 0, 0, 0, 0);
      prevEnd = toUtcDateFromIST(curYear - 2, 11, 31, 23, 59, 59, 999);
      periodLabel = `Previous Calendar Year (${curYear - 1})`;
      break;
    }
    case 'this_fy': {
      // Indian Financial Year: April 1 to March 31
      const fyStartYear = curMonth >= 3 ? curYear : curYear - 1;
      start = toUtcDateFromIST(fyStartYear, 3, 1, 0, 0, 0, 0);
      end = toUtcDateFromIST(fyStartYear + 1, 2, 31, 23, 59, 59, 999);
      prevStart = toUtcDateFromIST(fyStartYear - 1, 3, 1, 0, 0, 0, 0);
      prevEnd = toUtcDateFromIST(fyStartYear, 2, 31, 23, 59, 59, 999);
      periodLabel = `This Financial Year (FY ${fyStartYear}-${String(fyStartYear + 1).slice(-2)})`;
      break;
    }
    case 'last_fy': {
      const fyStartYear = (curMonth >= 3 ? curYear : curYear - 1) - 1;
      start = toUtcDateFromIST(fyStartYear, 3, 1, 0, 0, 0, 0);
      end = toUtcDateFromIST(fyStartYear + 1, 2, 31, 23, 59, 59, 999);
      prevStart = toUtcDateFromIST(fyStartYear - 1, 3, 1, 0, 0, 0, 0);
      prevEnd = toUtcDateFromIST(fyStartYear, 2, 31, 23, 59, 59, 999);
      periodLabel = `Previous Financial Year (FY ${fyStartYear}-${String(fyStartYear + 1).slice(-2)})`;
      break;
    }
    case 'custom': {
      const s = new Date(customStart);
      const e = new Date(customEnd);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) {
        throw new Error("Invalid custom date range. Please provide valid startDate and endDate.");
      }
      start = new Date(s.setHours(0, 0, 0, 0));
      end = new Date(e.setHours(23, 59, 59, 999));
      const durationMs = end.getTime() - start.getTime();
      prevEnd = new Date(start.getTime() - 1);
      prevStart = new Date(prevEnd.getTime() - durationMs);
      periodLabel = "Custom Range";
      break;
    }
    default: {
      start = toUtcDateFromIST(curYear, curMonth, 1, 0, 0, 0, 0);
      end = toUtcDateFromIST(curYear, curMonth + 1, 0, 23, 59, 59, 999);
      prevStart = toUtcDateFromIST(curYear, curMonth - 1, 1, 0, 0, 0, 0);
      prevEnd = toUtcDateFromIST(curYear, curMonth, 0, 23, 59, 59, 999);
      periodLabel = "This Month";
    }
  }

  return { start, end, prevStart, prevEnd, periodLabel };
}

export function calculatePercentageChange(current = 0, previous = 0) {
  if (previous === 0) {
    if (current === 0) return { changePercent: 0, direction: 'neutral' };
    return { changePercent: 100, direction: 'up', isNew: true };
  }
  const diff = current - previous;
  const pct = Math.round((diff / previous) * 1000) / 10;
  return {
    changePercent: Math.abs(pct),
    direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral',
    rawChange: pct,
  };
}
