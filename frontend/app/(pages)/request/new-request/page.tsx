import DepartmentColumn from "@/components/pages/request/new-request/DepartmentColumn";
import EmployeeColumn from "@/components/pages/request/new-request/EmployeeColumn";
import SelectedEmployeesColumn from "@/components/pages/request/new-request/SelectedEmployeesColumn";
import SubmitRequestButton from "@/components/pages/request/new-request/SubmitRequestButton";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content (columns) */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 h-full overflow-hidden">
          <DepartmentColumn />
        </div>
        <div className="flex-1 h-full overflow-hidden">
          <EmployeeColumn />
        </div>
        <div className="flex-1 h-full overflow-hidden">
          <SelectedEmployeesColumn />
        </div>
      </div>

      {/* Submit Button */}
      <div className="h-[80px]  bg-white">
        <SubmitRequestButton />
      </div>
    </div>
  );
}
