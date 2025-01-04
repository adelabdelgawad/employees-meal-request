// /lib/utils.ts
export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
