/**
 * apiClient — מופע Axios מרכזי לשימוש בכל קבצי ה-services בצד הלקוח.
 * כולל baseURL מהסביבה, withCredentials, ו-interceptor אחיד לנירמול שגיאות מהשרת.
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — אחיד לטיפול בשגיאות מהשרת
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'שגיאה לא צפויה';
    return Promise.reject(new Error(message));
  }
);
