import React from 'react';
import SearchInput from '@/components/data-table/SearchInput';
import ComboBoxFilter from './ComboBoxFilter';

interface TableOptionsProps {
  data: User[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  rolesFilter: string[];
  setRolesFilter: (values: string[]) => void;
  rolesOptions: { value: string; count: number }[]; // Required prop
}

export default function TableOptions({
  data,
  searchQuery,
  setSearchQuery,
  rolesFilter,
  setRolesFilter,
  rolesOptions,
}: TableOptionsProps) {
  // Dynamically filter out the "status_id" field from columns
  const columns = Object.keys(data[0] || {}).filter((key) => key !== 'id');

  // Dynamically filter out "status_id" from data
  const filteredData = data.map(({ id, ...rest }) => rest);

  return (
    <>
      {/* Top Section: Search and Filters */}
      <div className="flex items-center justify-between mb-4">
        {/* Left Section: Search and Filters */}
        <div className="flex items-center gap-4">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by requester..."
          />

          <ComboBoxFilter
            options={rolesOptions} // ✅ Correct prop name
            placeholder="Role"
            selectedValues={rolesFilter}
            onChange={setRolesFilter}
          />
        </div>
      </div>
    </>
  );
}
