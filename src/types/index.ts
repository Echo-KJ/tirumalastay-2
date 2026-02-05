// ============================================
// TIRUMALA RESIDENCY HMS - TYPE DEFINITIONS
// ============================================

// Enums
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';
export type BookingStatus = 'RESERVED' | 'CONFIRMED' | 'CHECKED_IN' | 'IN_HOUSE' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';
export type PaymentStatus = 'PAID' | 'PAY_AT_HOTEL' | 'FAILED' | 'PENDING';
export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'ONLINE';
export type UserRole = 'admin' | 'staff';
export type BookingType = 'RESERVATION' | 'WALK_IN';

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
  address?: string;
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
  bookingType: BookingType;
  dailyRate: number;
  notes?: string;
}

// Folio / Invoice entity
export interface Folio {
  id: string;
  bookingId: string;
  lineItems: FolioLineItem[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  taxAmount: number;
  taxPercent: number;
  grandTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

// Line item types
export type LineItemType = 'ROOM_CHARGE' | 'EXTRA_BED' | 'FOOD' | 'LAUNDRY' | 'MISC' | 'DISCOUNT';

export interface FolioLineItem {
  id: string;
  folioId: string;
  type: LineItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  date: Date;
}

// Payment entity (separate from booking)
export interface Payment {
  id: string;
  folioId: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: Date;
  createdBy?: string;
}

// Audit log for tracking changes
export type AuditAction = 
  | 'BOOKING_CREATED' 
  | 'BOOKING_UPDATED' 
  | 'BOOKING_CANCELLED'
  | 'CHECK_IN' 
  | 'CHECK_OUT' 
  | 'BACKDATED_CHECK_IN'
  | 'BACKDATED_CHECK_OUT'
  | 'ROOM_CHANGED'
  | 'PAYMENT_ADDED'
  | 'PAYMENT_EDITED'
  | 'PAYMENT_DELETED'
  | 'FOLIO_UPDATED'
  | 'NO_SHOW_MARKED';

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: 'booking' | 'payment' | 'room' | 'folio';
  entityId: string;
  description: string;
  reason?: string;
  previousValue?: string;
  newValue?: string;
  createdAt: Date;
  createdBy: string;
}

// Daily Report entity
export interface DailyReport {
  date: Date;
  totalBookings: number;
  totalCheckins: number;
  totalCheckouts: number;
  totalRevenueCash: number;
  totalRevenueOnline: number;
  totalRevenueCard: number;
  totalRevenueUPI: number;
  occupancyRate: number;
  outstandingBalance: number;
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
  inHouseGuests: Booking[];
  pendingArrivals: Booking[]; // Past date, not checked in
  overdueCheckouts: Booking[]; // Past checkout date, still in house
  currentOccupancy: number;
  totalRooms: number;
  todayRevenueCash: number;
  todayRevenueOnline: number;
  todayRevenueUPI: number;
  todayRevenueCard: number;
  unpaidCount: number;
  unpaidAmount: number;
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
  reportType?: 'arrivals' | 'departures' | 'occupancy' | 'revenue' | 'outstanding';
}

// Create/Edit booking request
export interface CreateStayRequest {
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
  guest: Omit<Guest, 'id'>;
  bookingType: BookingType;
  dailyRate: number;
  notes?: string;
}

// Add payment request
export interface AddPaymentRequest {
  folioId: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

// Add line item request
export interface AddLineItemRequest {
  folioId: string;
  type: LineItemType;
  description: string;
  quantity: number;
  unitPrice: number;
}

// Balance summary
export interface BalanceSummary {
  totalBilled: number;
  totalPaid: number;
  balanceDue: number;
}
