import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind CSS 클래스를 조건부로 병합하는 유틸리티 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
