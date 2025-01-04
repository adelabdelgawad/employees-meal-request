import DepartmentColumn from "@/components/pages/request/new-request/DepartmentColumn";
import EmployeeColumn from "@/components/pages/request/new-request/EmployeeColumn";
import SelectedEmployeesColumn from "@/components/pages/request/new-request/SelectedEmployeesColumn";
import SubmitRequestButton from "@/components/pages/request/new-request/SubmitRequestButton";

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
