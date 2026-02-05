// ============================================
// API SERVICE LAYER FOR TIRUMALA RESIDENCY HMS
// Replace mock implementations with actual FastAPI calls
// ============================================

import {
  RoomType,
  Room,
  Booking,
  Guest,
  DailyReport,
  User,
  AvailabilityRequest,
  AvailabilityResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  LoginRequest,
  LoginResponse,
  DashboardStats,
  BookingFilters,
  ReportFilters,
  RoomStatus,
  BookingStatus,
} from '@/types';
import {
  mockRoomTypes,
  mockRooms,
  mockBookings,
  mockGuests,
  mockDailyReports,
  mockUsers,
  generateBookingCode,
  calculateNights,
  getRoomWithType,
  getBookingWithDetails,
} from './mockData';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local state for mutations (simulating database)
let rooms = [...mockRooms];
let bookings = [...mockBookings];
let guests = [...mockGuests];

// ============================================
// AUTH API
// ============================================

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    await delay(500);
    // Mock authentication - replace with actual API call
    const user = mockUsers.find(u => u.username === data.username);
    if (user && data.password === 'admin123') {
      return {
        token: 'mock-jwt-token-' + Date.now(),
        user,
      };
    }
    throw new Error('Invalid credentials');
  },

  me: async (): Promise<User> => {
    await delay(200);
    // Return current user from token - replace with actual API call
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Not authenticated');
    return mockUsers[0];
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('auth_token');
  },
};

// ============================================
// ROOMS API
// ============================================

export const roomsApi = {
  getRoomTypes: async (): Promise<RoomType[]> => {
    await delay(300);
    return mockRoomTypes;
  },

  getRooms: async (): Promise<(Room & { type: RoomType })[]> => {
    await delay(300);
    return rooms.map(getRoomWithType);
  },

  updateRoomStatus: async (roomId: string, status: RoomStatus): Promise<Room> => {
    await delay(300);
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    if (roomIndex === -1) throw new Error('Room not found');
    rooms[roomIndex] = { ...rooms[roomIndex], status };
    return getRoomWithType(rooms[roomIndex]);
  },

  createRoom: async (data: Omit<Room, 'id'>): Promise<Room> => {
    await delay(300);
    const newRoom: Room = {
      ...data,
      id: 'r-' + Date.now(),
    };
    rooms.push(newRoom);
    return getRoomWithType(newRoom);
  },

  deleteRoom: async (roomId: string): Promise<void> => {
    await delay(300);
    rooms = rooms.filter(r => r.id !== roomId);
  },
};

// ============================================
// AVAILABILITY API
// ============================================

export const availabilityApi = {
  checkAvailability: async (data: AvailabilityRequest): Promise<AvailabilityResponse> => {
    await delay(400);
    const { checkIn, checkOut, guestsCount } = data;
    const nights = calculateNights(checkIn, checkOut);

    // Filter room types by capacity
    const eligibleTypes = mockRoomTypes.filter(rt => rt.capacity >= guestsCount);

    // Check room availability using overlap logic
    const availableByType = eligibleTypes.map(roomType => {
      const roomsOfType = rooms.filter(r => r.typeId === roomType.id);
      
      const availableRooms = roomsOfType.filter(room => {
        // Room must be AVAILABLE status
        if (room.status !== 'AVAILABLE') return false;
        
        // Check for booking overlaps
        const hasOverlap = bookings.some(booking => {
          if (booking.roomId !== room.id) return false;
          if (booking.status === 'CANCELLED' || booking.status === 'CHECKED_OUT') return false;
          
          const existingCheckIn = new Date(booking.checkIn);
          const existingCheckOut = new Date(booking.checkOut);
          const newCheckIn = new Date(checkIn);
          const newCheckOut = new Date(checkOut);
          
          // Overlap: existing.check_in < new.check_out AND existing.check_out > new.check_in
          return existingCheckIn < newCheckOut && existingCheckOut > newCheckIn;
        });
        
        return !hasOverlap;
      });

      return {
        ...roomType,
        availableRooms: availableRooms.map(getRoomWithType),
        totalPrice: roomType.basePrice * nights,
      };
    });

    return {
      roomTypes: availableByType.filter(rt => rt.availableRooms.length > 0),
    };
  },
};

// ============================================
// BOOKINGS API
// ============================================

export const bookingsApi = {
  createBooking: async (data: CreateBookingRequest): Promise<CreateBookingResponse> => {
    await delay(500);
    
    // Create guest
    const newGuest: Guest = {
      id: 'g-' + Date.now(),
      ...data.guest,
    };
    guests.push(newGuest);

    // Get room and calculate price
    const room = rooms.find(r => r.id === data.roomId);
    if (!room) throw new Error('Room not found');
    const roomType = mockRoomTypes.find(rt => rt.id === room.typeId)!;
    const nights = calculateNights(data.checkIn, data.checkOut);
    const totalAmount = roomType.basePrice * nights;

    // Create booking
    const newBooking: Booking = {
      id: 'b-' + Date.now(),
      bookingCode: generateBookingCode(),
      guestId: newGuest.id,
      roomId: data.roomId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guestsCount: data.guestsCount,
      totalAmount,
      status: data.paymentMethod === 'PAY_AT_HOTEL' ? 'CONFIRMED' : 'RESERVED',
      paymentStatus: data.paymentMethod === 'PAY_AT_HOTEL' ? 'PAY_AT_HOTEL' : 'PENDING',
      createdAt: new Date(),
      bookingType: 'RESERVATION',
      dailyRate: roomType.basePrice,
    };
    bookings.push(newBooking);

    // For online payment, would create Razorpay order here
    const result: CreateBookingResponse = { booking: newBooking };
    if (data.paymentMethod === 'ONLINE') {
      result.razorpayOrderId = 'order_' + Date.now();
    }

    return result;
  },

  getBookingByCode: async (code: string): Promise<Booking & { guest: Guest; room: Room }> => {
    await delay(300);
    const booking = bookings.find(b => b.bookingCode === code);
    if (!booking) throw new Error('Booking not found');
    return getBookingWithDetails(booking);
  },

  getBookings: async (filters?: BookingFilters): Promise<(Booking & { guest: Guest; room: Room })[]> => {
    await delay(300);
    let filtered = [...bookings];

    if (filters?.status) {
      filtered = filtered.filter(b => b.status === filters.status);
    }
    if (filters?.paymentStatus) {
      filtered = filtered.filter(b => b.paymentStatus === filters.paymentStatus);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(b => {
        const guest = guests.find(g => g.id === b.guestId);
        return (
          b.bookingCode.toLowerCase().includes(search) ||
          guest?.name.toLowerCase().includes(search) ||
          guest?.phone.includes(search)
        );
      });
    }

    return filtered
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(getBookingWithDetails);
  },

  updateBookingStatus: async (bookingId: string, status: BookingStatus): Promise<Booking> => {
    await delay(300);
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) throw new Error('Booking not found');
    
    bookings[bookingIndex] = { ...bookings[bookingIndex], status };
    
    // Update room status based on booking status
    const booking = bookings[bookingIndex];
    const roomIndex = rooms.findIndex(r => r.id === booking.roomId);
    
    if (status === 'CHECKED_IN') {
      rooms[roomIndex] = { ...rooms[roomIndex], status: 'OCCUPIED' };
    } else if (status === 'CHECKED_OUT') {
      rooms[roomIndex] = { ...rooms[roomIndex], status: 'CLEANING' };
    }
    
    return getBookingWithDetails(bookings[bookingIndex]);
  },

  cancelBooking: async (bookingId: string): Promise<Booking> => {
    await delay(300);
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) throw new Error('Booking not found');
    
    const booking = bookings[bookingIndex];
    if (booking.status === 'CHECKED_IN') {
      throw new Error('Cannot cancel a checked-in booking');
    }
    
    bookings[bookingIndex] = { ...bookings[bookingIndex], status: 'CANCELLED' };
    return getBookingWithDetails(bookings[bookingIndex]);
  },
};

// ============================================
// DASHBOARD API
// ============================================

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    await delay(400);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const allBookings = bookings.map(getBookingWithDetails);
    
    const todayCheckins = allBookings.filter(b => {
      const checkIn = new Date(b.checkIn);
      checkIn.setHours(0, 0, 0, 0);
      return checkIn.getTime() === today.getTime() && b.status !== 'CANCELLED';
    });

    const todayCheckouts = allBookings.filter(b => {
      const checkOut = new Date(b.checkOut);
      checkOut.setHours(0, 0, 0, 0);
      return checkOut.getTime() === today.getTime() && b.status !== 'CANCELLED';
    });

    const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
    const totalRooms = rooms.length;

    // Calculate today's revenue
    const todayBookings = allBookings.filter(b => {
      const created = new Date(b.createdAt);
      created.setHours(0, 0, 0, 0);
      return created.getTime() === today.getTime();
    });

    const todayRevenueCash = todayBookings
      .filter(b => b.paymentStatus === 'PAY_AT_HOTEL')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const todayRevenueOnline = todayBookings
      .filter(b => b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    return {
      todayCheckins,
      todayCheckouts,
      currentOccupancy: occupiedRooms,
      totalRooms,
      todayRevenueCash,
      todayRevenueOnline,
      todayRevenueUPI: 0,
      todayRevenueCard: 0,
      inHouseGuests: allBookings.filter(b => b.status === 'IN_HOUSE' || b.status === 'CHECKED_IN'),
      pendingArrivals: allBookings.filter(b => {
        const checkIn = new Date(b.checkIn);
        checkIn.setHours(0, 0, 0, 0);
        return checkIn < today && (b.status === 'CONFIRMED' || b.status === 'RESERVED');
      }),
      overdueCheckouts: allBookings.filter(b => {
        const checkOut = new Date(b.checkOut);
        checkOut.setHours(0, 0, 0, 0);
        return checkOut < today && (b.status === 'IN_HOUSE' || b.status === 'CHECKED_IN');
      }),
      unpaidCount: allBookings.filter(b => b.paymentStatus === 'PAY_AT_HOTEL' || b.paymentStatus === 'PENDING').length,
      unpaidAmount: allBookings
        .filter(b => b.paymentStatus === 'PAY_AT_HOTEL' || b.paymentStatus === 'PENDING')
        .reduce((sum, b) => sum + b.totalAmount, 0),
      recentBookings: allBookings.slice(0, 5),
    };
  },
};

// ============================================
// REPORTS API
// ============================================

export const reportsApi = {
  getDailyReport: async (date: Date): Promise<DailyReport | null> => {
    await delay(300);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return mockDailyReports.find(r => {
      const reportDate = new Date(r.date);
      reportDate.setHours(0, 0, 0, 0);
      return reportDate.getTime() === targetDate.getTime();
    }) || null;
  },

  getReportSummary: async (filters: ReportFilters): Promise<{
    reports: DailyReport[];
    totals: {
      totalBookings: number;
      totalCheckins: number;
      totalCheckouts: number;
      totalRevenue: number;
      avgOccupancy: number;
    };
  }> => {
    await delay(400);
    const { dateFrom, dateTo } = filters;
    
    const filtered = mockDailyReports.filter(r => {
      const reportDate = new Date(r.date);
      return reportDate >= dateFrom && reportDate <= dateTo;
    });

    const totals = {
      totalBookings: filtered.reduce((sum, r) => sum + r.totalBookings, 0),
      totalCheckins: filtered.reduce((sum, r) => sum + r.totalCheckins, 0),
      totalCheckouts: filtered.reduce((sum, r) => sum + r.totalCheckouts, 0),
      totalRevenue: filtered.reduce((sum, r) => sum + r.totalRevenueCash + r.totalRevenueOnline, 0),
      avgOccupancy: filtered.length > 0
        ? filtered.reduce((sum, r) => sum + r.occupancyRate, 0) / filtered.length
        : 0,
    };

    return { reports: filtered, totals };
  },
};
