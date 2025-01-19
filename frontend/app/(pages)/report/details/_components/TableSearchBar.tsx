'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input'; // Assuming ShadCN's Input component is imported here

export default function TableSearchBar({
  placeholder,
}: {
  placeholder: string;
}) {
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
    <div className="flex items-center gap-2 border rounded px-3 py-1">
      <Search className="w-4 h-4 text-gray-500" />

      <Input
        id="search"
        type="text"
        className="border-none outline-none text-sm focus:ring-0 focus:border-transparent"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Search"
      />
    </div>
  );
}
