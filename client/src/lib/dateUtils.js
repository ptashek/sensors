import { subMinutes, subHours, subDays, format } from 'date-fns';

export const getPastDate = (amount, unit, startFrom = new Date()) => {
  switch (unit) {
    default:
      throw new Error(`Unsupported date unit: ${unit}`);

    case 'minutes':
      return subMinutes(startFrom, amount);

    case 'hours':
      return subHours(startFrom, amount);

    case 'days':
      return subDays(startFrom, amount);
  }
};

export const formatDate = (date) => {
  return format(date, 'dd/MM/yyyy HH:mm');
};

export const getReferenceDate = () => {
  const referenceDate = new Date();
  referenceDate.setMilliseconds(0);
  referenceDate.setSeconds(0);

  return referenceDate;
}