/** טיפוסים עבור ה-Dashboard - משותף לקליינט ולשרת */

export interface TodaysOrdersCountResponse {
  todaysOrdersCount: number;
}

export interface DashboardStats {
  todaysOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
}
