import { fromUnixTime, subMinutes, subHours, subDays, getUnixTime, parseISO } from 'date-fns';
import { utcToZonedTime, format } from 'date-fns-tz';

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

export const formatTimestamp = (timestamp, formatString = 'yyyy/MM/dd HH:mm z') => {
  const utcDate = fromUnixTime(timestamp);
  const zonedDate = utcToZonedTime(utcTS, timeZone);
  return formatDate(zonedDate, formatString);
};

export const percentile = (values, p) => {
  /*
    Highcharts provides numeric-only values, 
    unless the hasNulls property is set to true
  */
  let numValues;
  if (values.hasNulls) {
    numValues = values.filter((value) => value !== null);
  } else {
    numValues = values;
  }

  if (numValues.length === 0) {
    return null;
  }

  const pIndex = Math.ceil(p * 0.01 * numValues.length) - 1;
  return numValues.sort()[pIndex];
};
