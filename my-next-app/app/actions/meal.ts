// lib/services/request-history.ts
"use server"
import axiosInstance from '@/lib/axiosInstance';
import { cookies } from 'next/headers';

export async function getMeals(): Promise<Meal[]> {
  try {
    // Extract the session cookie from the cookie store
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    // Set the Authorization header if the session cookie exists
    if (sessionCookie) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${sessionCookie}`;
    } else {
      // Remove the Authorization header if no session cookie is present
      delete axiosInstance.defaults.headers.common['Authorization'];
    }

    // Pass the params object to axiosInstance.
    const response = await axiosInstance.get('/meal');
    const data =  response.data;
    return data.map((meal: MealResponse) => ({
      ...meal,
      schedules: meal.meal_schedules ?? [],
    }));
  } catch (error: unknown) {
    console.error('Error fetching requests:', error);
    throw new Error('Failed to fetch requests');
  }
}


/**
 * Fetches the schedules for a specific meal from the backend API.
 *
 * @param {number} mealId - The ID of the meal whose schedules are to be fetched.
 * @returns {Promise<Schedule[]>} A promise that resolves to an array of Schedule objects.
 * @throws {Error} If the API request fails.
 */
export async function getMealSchedules(mealId: number): Promise<Schedule[]> {
  try {
    // Extract the session cookie from the cookie store
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    // Set the Authorization header if the session cookie exists
    if (sessionCookie) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${sessionCookie}`;
    } else {
      // Remove the Authorization header if no session cookie is present
      delete axiosInstance.defaults.headers.common['Authorization'];
    }

    // Make a GET request to the `/meals/{mealId}/schedules` endpoint
    const response = await axiosInstance.get(`/meals/${mealId}/schedules`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching schedules for meal ${mealId}:`, error);
    throw new Error(`Failed to fetch schedules for meal ${mealId}`);
  }
}

/**
 * Updates the schedules for a specific meal with added and removed schedules.
 *
 * @param {number} mealId - The ID of the meal to update.
 * @param {{ added: Schedule[]; removed: Schedule[] }} schedules - Object containing arrays of added and removed schedules.
 * @returns {Promise<void>} A promise that resolves when the update is successful.
 * @throws {Error} If the API request fails.
 */
export async function updateMealSchedules(
  mealId: number,
  schedules: { added: Schedule[]; removed: Schedule[] }
): Promise<void> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (sessionCookie) {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${sessionCookie}`;
    } else {
      delete axiosInstance.defaults.headers.common["Authorization"];
    }

    await axiosInstance.put(`/meals/${mealId}/schedules`, schedules);
  } catch (error) {
    console.error(`Error updating schedules for meal ${mealId}:`, error);
    throw new Error(`Failed to update schedules for meal ${mealId}`);
  }
}

/**
 * Updates the activation status of a specific meal.
 *
 * @param {number} mealId - The ID of the meal to update.
 * @param {boolean} isActive - The new activation status for the meal.
 * @returns {Promise<void>} A promise that resolves when the update is successful.
 * @throws {Error} If the API request fails.
 */
export async function updateMealActivation(mealId: number, isActive: boolean): Promise<void> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (sessionCookie) {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${sessionCookie}`;
    } else {
      delete axiosInstance.defaults.headers.common["Authorization"];
    }

    await axiosInstance.put(`/meals/${mealId}/activation`, { is_active: isActive });
  } catch (error) {
    console.log(error)
    console.error(`Error updating activation for meal ${mealId}:`, error);
    throw new Error(
      `Failed to update activation for meal ${mealId}`
    );
  }
}