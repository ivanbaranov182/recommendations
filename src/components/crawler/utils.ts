import { format, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export const generateUniqueString = (): string => uuidv4();

export const formatDate = (dateString: string): string => {
  return format(parseISO(dateString), 'yyyy-MM-dd HH:mm:SS');
};

export const addElement = (
  parentEl: HTMLElement | null,
  className: string,
  start = false,
  addPosition = false,
): HTMLElement | undefined => {
  const element = document.createElement('div');
  element.classList.add(className);
  if (addPosition) element.dataset.position = start ? 'start' : 'end';
  if (start) parentEl?.prepend(element);
  else parentEl?.appendChild(element);
  return element;
};
