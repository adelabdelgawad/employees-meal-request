import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Search, Printer } from 'lucide-react';
import DataTable from './_components/DataTable';
import DataTableBar from './_components/DataTableBar';

const Toolbar: React.FC = () => {
  return (
    <div className="flex flex-col">
      <div>
        <DataTableBar />
      </div>
      <div>
        <DataTable />
      </div>
    </div>
  );
};

export default Toolbar;
