import { Timer } from './Article/types';

export const getDate = (dateString: string): string => {
  const date = new Date(dateString);
  const tmp = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()}`;
  return tmp.replace(/(^|\D)(\d)(?!\d)/g, '$10$2');
};

export const getTime = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getHours()}:${date.getMinutes()}`;
};

export const getTotalTimerTime = (timer: Timer): number => {
  return (timer.total += timer.start ? new Date().getTime() - timer.start.getTime() : 0);
};
