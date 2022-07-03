import { Timer } from './types';

export const convertTimerToString = (timer: Timer) => {
  let string = '';

  const types = ['hours', 'minutes', 'seconds'];

  types.forEach((type) => {
    if (timer[type]) {
      if (type !== 'hours') {
        string += ' ';
      }
      string += `${timer[type]} ${timer[type] > 1 ? type : type.substring(0, type.length - 1)}`;
    }
  });

  return string;
};

export const timerIsEmpty = (timer: Timer) =>
  !timer || (timer.hours === 0 && timer.minutes === 0 && timer.seconds === 0);
