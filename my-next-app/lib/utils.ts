import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function debounce<Args extends unknown[], Return>(
  func: (...args: Args) => Return,
  wait: number
): (...args: Args) => Promise<Return> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Args): Promise<Return> => {
    return new Promise((resolve) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        const result = func(...args);
        resolve(result);
      }, wait);
    });
  };
}

