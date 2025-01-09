import type { InferGetServerSidePropsType, GetServerSideProps } from "next";

type Repo = {
  name: string;
  stargazers_count: number;
};

export interface ChangedStatus {
  id: number;
  is_accepted: boolean;
}


export const getServerSideProps = async () => {
  // Fetch data from external API
  const res = await fetch("https://api.github.com/repos/vercel/next.js");
  const repo: Repo = await res.json();
  // Pass data to the page via props
  return repo;
};

// /lib/fetchDepartments.ts
export async function getDepartments() {
  const res = await fetch("http://localhost:8000/departments", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch departments");
  }

  return res.json();
}

export async function getEmployees() {
  const res = await fetch("http://localhost:8000/employees", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }

  return res.json();
}

export async function getMealTypes() {
  const res = await fetch("http://localhost:8000/meal-types", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }

  return res.json();
}

export async function getRequests() {
  const res = await fetch("http://localhost:8000/requests", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }

  return res.json();
}


export async function updateRequestLines(changedStatuses: ChangedStatus[]): Promise<string> {
  if (changedStatuses.length === 0) {
    throw new Error("No changes to update.");
  }

  const response = await fetch("http://localhost:8000/update-request-lines", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(changedStatuses),
  });

  if (!response.ok) {
    throw new Error("Failed to save changes.");
  }

  const result = await response.json();
  return result.message;
}
