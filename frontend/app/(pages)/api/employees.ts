export const fetchDepartments = async () => {
  const response = await fetch("http://localhost:8000/employees");
  if (!response.ok) {
    throw new Error("Failed to fetch departments");
  }
  return response.json();
};
