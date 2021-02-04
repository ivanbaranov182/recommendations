import { format, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { Article, ArticleStatistic } from './types';

export const msToSec = (ms: number): number => Math.round(ms / 1000);

export const generateUniqueString = (): string => uuidv4();

export const formatDate = (dateString: string): string => {
  return format(parseISO(dateString), 'yyyy-MM-dd HH:mm:SS');
};

export const addElement = (parentEl: HTMLElement | null, className: string, start = false): HTMLElement | undefined => {
  const element = document.createElement('div');
  element.classList.add(className);
  if (start) parentEl?.prepend(element);
  else parentEl?.appendChild(element);
  return element;
};

export const objectToFormData = (data: Article | ArticleStatistic): FormData =>
  Object.keys(data).reduce((formData, key) => {
    formData.append(key, (data as Article | ArticleStatistic)[key]);
    return formData;
  }, new FormData());
