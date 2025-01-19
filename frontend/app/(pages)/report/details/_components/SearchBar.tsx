'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function SearchBar({ placeholder }: { placeholder: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleSearch() {
    const params = new URLSearchParams(
      searchParams ? searchParams.toString() : '',
    );
    if (searchTerm) {
      params.set('query', searchTerm);
    } else {
      params.delete('query');
    }
    params.set('page', '1'); // Reset the page to 1 when a new search is performed
    replace(`${pathname}?${params.toString()}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  return (
    <div className="relative flex flex-1 flex-shrink-0 items-center">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        id="search"
        type="text"
        className="block w-full rounded-lg border border-neutral-300 bg-white py-2 pl-10 pr-4 text-sm text-neutral-700 placeholder-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Search"
      />
      <Search
        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400 peer-focus:text-blue-500"
        aria-hidden="true"
      />
    </div>
  );
}
