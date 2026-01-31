// ============================================
// TIRUMALA RESIDENCY HMS - TYPE DEFINITIONS
// ============================================

// Enums
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
export type PaymentStatus = 'PAID' | 'PAY_AT_HOTEL' | 'FAILED' | 'PENDING';
export type PaymentMethod = 'ONLINE' | 'CASH';
export type UserRole = 'admin' | 'staff';

// User entity
export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: Date;
}

// Room Type entity
export interface RoomType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  amenities: string[];
  images: string[];
}

// Room entity
export interface Room {
  id: string;
  number: string;
  typeId: string;
  type?: RoomType;
  status: RoomStatus;
}

// Guest entity
export interface Guest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  idProof?: string;
  city?: string;
}

// Booking entity
export interface Booking {
  id: string;
  bookingCode: string;
  guestId: string;
  guest?: Guest;
  roomId: string;
  room?: Room;
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
}

// Payment entity
export interface Payment {
  id: string;
  bookingId: string;
  booking?: Booking;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  status: 'CREATED' | 'PAID' | 'FAILED';
  method: PaymentMethod;
  createdAt: Date;
}

// Daily Report entity
export interface DailyReport {
  date: Date;
  totalBookings: number;
  totalCheckins: number;
  totalCheckouts: number;
  totalRevenueCash: number;
  totalRevenueOnline: number;
  occupancyRate: number;
}

// API Request/Response types
export interface AvailabilityRequest {
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
}

export interface AvailabilityResponse {
  roomTypes: (RoomType & { availableRooms: Room[]; totalPrice: number })[];
}

export interface CreateBookingRequest {
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
  guest: Omit<Guest, 'id'>;
  paymentMethod: 'ONLINE' | 'PAY_AT_HOTEL';
}

export interface CreateBookingResponse {
  booking: Booking;
  razorpayOrderId?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Dashboard stats
export interface DashboardStats {
  todayCheckins: Booking[];
  todayCheckouts: Booking[];
  currentOccupancy: number;
  totalRooms: number;
  todayRevenueCash: number;
  todayRevenueOnline: number;
  recentBookings: Booking[];
}

// Filters
export interface BookingFilters {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface ReportFilters {
  dateFrom: Date;
  dateTo: Date;
}
