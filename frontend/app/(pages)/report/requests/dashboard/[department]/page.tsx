import { notFound } from "next/navigation";

const fetchSalesDetails = async (department) => {
  // Simulate fetching data from an API
  const salesData = {
    hr: { sales: 10000, employees: 25 },
    finance: { sales: 12000, employees: 20 },
    engineering: { sales: 15000, employees: 30 },
    marketing: { sales: 9000, employees: 15 },
  };

  return salesData[department] || null;
};

const DepartmentDetails = async ({ params }) => {
  const { department } = params;
  const details = await fetchSalesDetails(department);

  if (!details) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">{department.toUpperCase()} Department Details</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>
          <strong>Sales:</strong> ${details.sales}
        </p>
        <p>
          <strong>Employees:</strong> {details.employees}
        </p>
      </div>
    </div>
  );
};

export default DepartmentDetails;
