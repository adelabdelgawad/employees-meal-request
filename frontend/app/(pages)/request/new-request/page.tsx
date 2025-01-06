import DepartmentColumn from "@/app/(pages)/request/new-request/_components/DepartmentColumn";
import EmployeeColumn from "@/app/(pages)/request/new-request/_components/EmployeeColumn";
import SelectedEmployeesColumn from "@/app/(pages)/request/new-request/_components/SelectedEmployeesColumn";
import SubmitRequestButton from "@/app/(pages)/request/new-request/_components/SubmitRequestButton";

export default function Page() {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden">
        {/* Department Column */}
        <div className="flex flex-col h-full overflow-hidden bg-white rounded-lg shadow">
          <DepartmentColumn />
        </div>

        {/* Employee Column */}
        <div className="flex flex-col h-full overflow-hidden bg-white rounded-lg shadow">
          <EmployeeColumn />
        </div>

        {/* Selected Employees Column */}
        <div className="flex flex-col h-full overflow-hidden bg-white rounded-lg shadow">
          <SelectedEmployeesColumn />
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-white border-t shadow-md ">
        <SubmitRequestButton />
      </div>
    </div>
  );
}
