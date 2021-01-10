// @flow
import { fromUnixTime, subMinutes, subHours, subDays, getUnixTime } from 'date-fns';
import { utcToZonedTime, format } from 'date-fns-tz';

type LookbackUnit = 'days' | 'hours' | 'minutes';

type LookbackOptions = {
  startFrom?: Date,
  asDate?: boolean,
};

type getPastTimestampFunc = (number, LookbackUnit, LookbackOptions) => Date | number;
type formatTimestampFunc = (number, formatString?: string) => string;

export const timeZone: string = 'Europe/Dublin';

export const getPastTimestamp: getPastTimestampFunc = (
  lookbackSize,
  lookbackUnit,
  options = { startFrom: new Date(), asDate: false },
) => {
  const timestamp: Date = options?.startFrom || new Date();
  let result: Date | number;

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

export const formatTimestamp: formatTimestampFunc = (
  timestamp,
  formatString = 'yyyy/MM/dd HH:mm z',
) => {
  const utcTS = fromUnixTime(timestamp);
  const zonedTS = utcToZonedTime(utcTS, timeZone);
  return format(zonedTS, formatString, { timeZone });
};
