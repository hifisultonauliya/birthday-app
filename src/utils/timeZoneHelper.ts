import moment from 'moment-timezone';

export const getLocalTime = (birthday: Date, location: string) => {
  return moment.tz(birthday, location);
};

export const getNext9AM = (localTime: moment.Moment) => {
  const next9AM = localTime.clone().hour(9).minute(0).second(0).millisecond(0);
  if (localTime.isAfter(next9AM)) {
    next9AM.add(1, 'day');
  }
  return next9AM;
};
