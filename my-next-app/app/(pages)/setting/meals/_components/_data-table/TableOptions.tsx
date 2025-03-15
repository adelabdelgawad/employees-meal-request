import React from 'react';
import ComboBoxFilter from './ComboBoxFilter';

interface TableOptionsProps {
  rolesFilter: string[];
  setRolesFilter: (values: string[]) => void;
  rolesOptions: { value: string; count: number }[]; // Required prop
}

export default function TableOptions({
  rolesFilter,
  setRolesFilter,
  rolesOptions,
}: TableOptionsProps) {

  return (
    <>
      {/* Top Section: Search and Filters */}
      <div className="flex items-center justify-between mb-4">
        {/* Left Section: Search and Filters */}
        <div className="flex items-center gap-4">
          
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
