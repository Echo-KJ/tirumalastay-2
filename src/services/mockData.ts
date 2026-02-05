// ============================================
// MOCK DATA FOR TIRUMALA RESIDENCY HMS
// This simulates backend data - replace with actual API calls
// ============================================

import { RoomType, Room, Booking, Guest, DailyReport, User } from '@/types';

// Import room images
import room1 from '@/assets/rooms/room-1.jpg';
import room2 from '@/assets/rooms/room-2.avif';
import room3 from '@/assets/rooms/room-3.avif';
import room4 from '@/assets/rooms/room-4.avif';
import room5 from '@/assets/rooms/room-5.avif';
import room6 from '@/assets/rooms/room-6.avif';
import room7 from '@/assets/rooms/room-7.avif';
import room8 from '@/assets/rooms/room-8.avif';
import room9 from '@/assets/rooms/room-9.avif';

// Room Types
export const mockRoomTypes: RoomType[] = [
  {
    id: 'rt-1',
    name: 'Standard Room',
    description: 'Comfortable room with essential amenities, perfect for solo travelers or couples. Features AC, TV, and attached bathroom.',
    basePrice: 1200,
    capacity: 2,
    amenities: ['AC', 'TV', 'Wi-Fi', 'Attached Bathroom', 'Room Service', 'Daily Housekeeping'],
    images: [room1, room2],
  },
  {
    id: 'rt-2',
    name: 'Deluxe Room',
    description: 'Spacious room with premium furnishings and additional amenities. Ideal for families or guests seeking extra comfort.',
    basePrice: 1800,
    capacity: 3,
    amenities: ['AC', 'Smart TV', 'Wi-Fi', 'Attached Bathroom', 'Mini Fridge', 'Room Service', 'Daily Housekeeping', 'Wardrobe'],
    images: [room3, room4, room5],
  },
  {
    id: 'rt-3',
    name: 'Family Suite',
    description: 'Large suite with separate living area, perfect for families. Includes extra beds and family-friendly amenities.',
    basePrice: 2500,
    capacity: 4,
    amenities: ['AC', 'Smart TV', 'Wi-Fi', 'Attached Bathroom', 'Mini Fridge', 'Room Service', 'Daily Housekeeping', 'Wardrobe', 'Sofa Set', 'Extra Beds'],
    images: [room6, room7],
  },
  {
    id: 'rt-4',
    name: 'Premium Suite',
    description: 'Our finest accommodation with luxury amenities, panoramic views, and personalized service for an unforgettable stay.',
    basePrice: 3500,
    capacity: 2,
    amenities: ['AC', 'Smart TV', 'Wi-Fi', 'Attached Bathroom', 'Mini Fridge', 'Room Service', 'Daily Housekeeping', 'Wardrobe', 'Sofa Set', 'Work Desk', 'Premium Toiletries', 'Complimentary Breakfast'],
    images: [room8, room9],
  },
];

// Rooms
export const mockRooms: Room[] = [
  // Standard Rooms
  { id: 'r-101', number: '101', typeId: 'rt-1', status: 'AVAILABLE' },
  { id: 'r-102', number: '102', typeId: 'rt-1', status: 'OCCUPIED' },
  { id: 'r-103', number: '103', typeId: 'rt-1', status: 'AVAILABLE' },
  { id: 'r-104', number: '104', typeId: 'rt-1', status: 'CLEANING' },
  // Deluxe Rooms
  { id: 'r-201', number: '201', typeId: 'rt-2', status: 'AVAILABLE' },
  { id: 'r-202', number: '202', typeId: 'rt-2', status: 'OCCUPIED' },
  { id: 'r-203', number: '203', typeId: 'rt-2', status: 'AVAILABLE' },
  // Family Suites
  { id: 'r-301', number: '301', typeId: 'rt-3', status: 'AVAILABLE' },
  { id: 'r-302', number: '302', typeId: 'rt-3', status: 'MAINTENANCE' },
  // Premium Suites
  { id: 'r-401', number: '401', typeId: 'rt-4', status: 'AVAILABLE' },
  { id: 'r-402', number: '402', typeId: 'rt-4', status: 'OCCUPIED' },
];

// Sample guests
export const mockGuests: Guest[] = [
  { id: 'g-1', name: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh@email.com', city: 'Hyderabad' },
  { id: 'g-2', name: 'Priya Sharma', phone: '9123456780', email: 'priya.s@email.com', city: 'Chennai' },
  { id: 'g-3', name: 'Amit Patel', phone: '9988776655', city: 'Vijayawada' },
  { id: 'g-4', name: 'Sunita Reddy', phone: '9876012345', email: 'sunita.r@email.com', city: 'Tirupati' },
];

// Sample bookings
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfter = new Date(today);
dayAfter.setDate(dayAfter.getDate() + 2);

export const mockBookings: Booking[] = [
  {
    id: 'b-1',
    bookingCode: 'HMS-2026-000001',
    guestId: 'g-1',
    roomId: 'r-102',
    checkIn: yesterday,
    checkOut: tomorrow,
    guestsCount: 2,
    totalAmount: 2400,
    status: 'IN_HOUSE',
    paymentStatus: 'PAID',
    createdAt: new Date(yesterday.getTime() - 86400000),
    bookingType: 'RESERVATION',
    dailyRate: 1200,
  },
  {
    id: 'b-2',
    bookingCode: 'HMS-2026-000002',
    guestId: 'g-2',
    roomId: 'r-202',
    checkIn: today,
    checkOut: dayAfter,
    guestsCount: 3,
    totalAmount: 3600,
    status: 'IN_HOUSE',
    paymentStatus: 'PAY_AT_HOTEL',
    createdAt: yesterday,
    bookingType: 'WALK_IN',
    dailyRate: 1800,
  },
  {
    id: 'b-3',
    bookingCode: 'HMS-2026-000003',
    guestId: 'g-3',
    roomId: 'r-402',
    checkIn: today,
    checkOut: tomorrow,
    guestsCount: 2,
    totalAmount: 3500,
    status: 'IN_HOUSE',
    paymentStatus: 'PAID',
    createdAt: yesterday,
    bookingType: 'RESERVATION',
    dailyRate: 3500,
  },
  {
    id: 'b-4',
    bookingCode: 'HMS-2026-000004',
    guestId: 'g-4',
    roomId: 'r-201',
    checkIn: tomorrow,
    checkOut: dayAfter,
    guestsCount: 2,
    totalAmount: 1800,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    createdAt: today,
    bookingType: 'RESERVATION',
    dailyRate: 1800,
  },
];

// Admin user
export const mockUsers: User[] = [
  { id: 'u-1', username: 'admin', role: 'admin', createdAt: new Date('2024-01-01') },
  { id: 'u-2', username: 'frontdesk', role: 'staff', createdAt: new Date('2024-01-15') },
];

// Daily reports
export const mockDailyReports: DailyReport[] = [
  {
    date: yesterday,
    totalBookings: 5,
    totalCheckins: 3,
    totalCheckouts: 2,
    totalRevenueCash: 5400,
    totalRevenueOnline: 8200,
    totalRevenueCard: 2000,
    totalRevenueUPI: 3500,
    occupancyRate: 64,
    outstandingBalance: 3600,
  },
  {
    date: today,
    totalBookings: 3,
    totalCheckins: 2,
    totalCheckouts: 1,
    totalRevenueCash: 3600,
    totalRevenueOnline: 5300,
    totalRevenueCard: 1800,
    totalRevenueUPI: 2200,
    occupancyRate: 55,
    outstandingBalance: 3600,
  },
];

// Booking code generator
let bookingSequence = 5;
export function generateBookingCode(): string {
  const year = new Date().getFullYear();
  const sequence = String(bookingSequence++).padStart(6, '0');
  return `HMS-${year}-${sequence}`;
}

// Calculate nights between dates
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get room with type info
export function getRoomWithType(room: Room): Room & { type: RoomType } {
  const type = mockRoomTypes.find(rt => rt.id === room.typeId)!;
  return { ...room, type };
}

// Get booking with guest and room info
export function getBookingWithDetails(booking: Booking): Booking & { guest: Guest; room: Room & { type: RoomType } } {
  const guest = mockGuests.find(g => g.id === booking.guestId)!;
  const room = getRoomWithType(mockRooms.find(r => r.id === booking.roomId)!);
  return { ...booking, guest, room };
}
