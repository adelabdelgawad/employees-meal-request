import { useState, useCallback } from "react";
import {
  getRequestLineById,
} from "@/app/actions/request-requests";


const useRequestLineState = (id: number | undefined) => {
  const [data, setData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [changedStatus, setChangedStatus] = useState<
    { id: number; is_accepted: boolean }[]
  >([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch request line data by ID and set the data and originalData state.
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getRequestLineById(id!);
      setData(result);
      setOriginalData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  /**
   * Update the changed status of a specific request line.
   * @param lineId The ID of the request line.
   * @param checked The new acceptance status.
   */
  const updateChangedStatus = (lineId: number, checked: boolean) => {
    setData((prevData) =>
      prevData.map((line) =>
        line.id === lineId ? { ...line, is_accepted: checked } : line
      )
    );

    const originalLine = originalData.find((line) => line.id === lineId);
    if (!originalLine) return;

    setChangedStatus((prevChanged) => {
      if (originalLine.is_accepted !== checked) {
        const existingChange = prevChanged.find((item) => item.id === lineId);
        if (existingChange) {
          return prevChanged.map((item) =>
            item.id === lineId ? { id: lineId, is_accepted: checked } : item
          );
        } else {
          return [...prevChanged, { id: lineId, is_accepted: checked }];
        }
      } else {
        return prevChanged.filter((item) => item.id !== lineId);
      }
    });
  };

  /**
   * Reset the changedStatus state.
   */
  const resetChangedStatus = () => setChangedStatus([]);

  return {
    data,
    changedStatus,
    loading,
    fetchData,
    updateChangedStatus,
    resetChangedStatus,
  };
};

export default useRequestLineState;
