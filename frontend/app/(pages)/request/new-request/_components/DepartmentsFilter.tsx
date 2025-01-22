interface DepartmentsFilterProps {
  searchTerm: string;
  onSearchTermChange: (searchTerm: string) => void;
  placeholder: string;
}

const DepartmentsFilter = ({
  searchTerm,
  onSearchTermChange,
  placeholder,
}: DepartmentsFilterProps) => {
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => onSearchTermChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-2 border rounded"
    />
  );
};

export default DepartmentsFilter;
