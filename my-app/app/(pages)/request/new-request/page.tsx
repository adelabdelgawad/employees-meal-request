import SubmitRequestButton from "./_components/SubmitRequest";
import DepartmentColumn from "./DepartmentColumn";
import EmployeeColumn from "./EmployeeColumn";
import SelectedEmployeesColumn from "./SelectedEmployeesColumn";

export default function Page() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 px-12 py-4">
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden mb-4">
        {/* Department Column */}
        <div className="flex flex-col h-full overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700">Departments</h2>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <DepartmentColumn />
          </div>
        </div>

        {/* Employee Column */}
        <div className="flex flex-col h-full overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700">Employees</h2>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <EmployeeColumn />
          </div>
        </div>

        {/* Selected Employees Column */}
        <div className="flex flex-col h-full overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700">
              Selected Employees
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <SelectedEmployeesColumn />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 py-4 px-6">
        <SubmitRequestButton />
      </div>
    </div>
  );
}
