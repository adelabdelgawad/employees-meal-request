'use client';

import React, { ChangeEvent } from 'react';

/**
 * Props for the FilterComponent.
 */
interface FilterProps {
  /** The current search string. */
  search: string;

  /**
   * Setter for the search string state.
   * Provided by the parent (EmployeeColumn) so
   * we can lift the state up.
   */
  setSearch: React.Dispatch<React.SetStateAction<string>>;

  /** Placeholder text for the search input. */
  placeholder?: string;
}

/**
 * FilterComponent
 *
 * A simple input for capturing user search text.
 * It delegates all actual filtering to the parent.
 */
export default function FilterComponent({
  search,
  setSearch,
  placeholder = 'Search...',
}: FilterProps) {
  /**
   * Handles changes to the input, updating the parent's `search` state.
   * @param {ChangeEvent<HTMLInputElement>} e - The change event for the input field
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded-md
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
