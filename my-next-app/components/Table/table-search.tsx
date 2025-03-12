'use client';

import { useDebouncedCallback } from 'use-debounce';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

interface TableSearchProps {
  placeholder: string;
}

/**
 * Updates the URL query string as the user types, debouncing input updates.
 *
 * @param {TableSearchProps} props - Component props.
 * @returns {JSX.Element} The search input component.
 */
export default function TableSearch({ placeholder }: TableSearchProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const debouncedHandleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    // Reset to page 1 on new search.
    params.set('page', '1');
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <Input
        id="search"
        placeholder={placeholder}
        defaultValue={searchParams?.get('query') ?? ''}
        onChange={(e) => debouncedHandleSearch(e.target.value)}
        className="pl-10" // extra left padding for the icon
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
    </div>
  );
}
