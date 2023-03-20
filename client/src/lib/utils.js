import { subMinutes, subHours, subDays, getUnixTime } from 'date-fns';
import { format } from 'date-fns-tz';

const timeZone = 'Europe/Dublin';

export const getPastTimestamp = (
  lookbackSize,
  lookbackUnit,
  options = { startFrom: new Date(), asDate: false },
) => {
  const timestamp = options?.startFrom || new Date();
  let result;

  switch (lookbackUnit) {
    default:
    case 'minutes':
      result = subMinutes(timestamp, lookbackSize);
      break;

    case 'hours':
      result = subHours(timestamp, lookbackSize);
      break;

    case 'days':
      result = subDays(timestamp, lookbackSize);
      break;
  }

  if (options?.asDate) {
    return result;
  }
  return getUnixTime(result);
};

export const formatDate = (date, formatString = 'yyyy/MM/dd HH:mm z') => {
  return format(date, formatString, { timeZone });
};
