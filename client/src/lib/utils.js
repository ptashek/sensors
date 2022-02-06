import { fromUnixTime, subMinutes, subHours, subDays, getUnixTime } from 'date-fns';
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

export const formatTimestamp = (timestamp, formatString = 'yyyy/MM/dd HH:mm z') => {
  const utcTS = fromUnixTime(timestamp);
  const zonedTS = utcToZonedTime(utcTS, timeZone);
  return format(zonedTS, formatString, { timeZone });
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
