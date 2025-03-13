// app/actions.js
"use server";

import axiosInstance from "../axiosInstance";




export async function fetchReportDetails(
  query: string = "",
  page: number = 1,
  startDate?: string,
  endDate?: string,
  updateAttendance: boolean = false,
  download: boolean = false
) {
  try {
    const res = await axiosInstance.get("/report/details", {
      params: {
        query,
        page,
        ...(startDate && { start_time: startDate }), // Only include if defined
        ...(endDate && { end_time: endDate }), // Only include if defined
        update_attendance: updateAttendance,
        download
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching report details:", error);
  }
}
