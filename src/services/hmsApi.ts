 // ============================================
 // HMS API - Operations-Ready API Layer
 // Uses localStorage-backed store for persistence
 // ============================================
 
 import {
   RoomType,
   Room,
   Booking,
   Guest,
   Folio,
   FolioLineItem,
   Payment,
   AuditLog,
   DashboardStats,
   BookingFilters,
   BookingStatus,
   RoomStatus,
   CreateStayRequest,
   AddPaymentRequest,
   AddLineItemRequest,
   BalanceSummary,
   LineItemType,
   AuditAction,
 } from '@/types';
 import { store } from './store';
 import { mockRoomTypes } from './mockData';
 
 // Simulated API delay
 const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
 
 // Helper: Get room with type info
 function getRoomWithType(room: Room): Room & { type: RoomType } {
   const type = mockRoomTypes.find(rt => rt.id === room.typeId)!;
   return { ...room, type };
 }
 
 // Helper: Get booking with full details
 function getBookingWithDetails(booking: Booking): Booking & { guest: Guest; room: Room & { type: RoomType } } {
   const guests = store.getGuests();
   const rooms = store.getRooms();
   const guest = guests.find(g => g.id === booking.guestId)!;
   const room = getRoomWithType(rooms.find(r => r.id === booking.roomId)!);
   return { ...booking, guest, room };
 }
 
 // Helper: Generate booking code
 function generateBookingCode(): string {
   const year = new Date().getFullYear();
   const seq = store.incrementBookingSequence();
   return `HMS-${year}-${String(seq).padStart(6, '0')}`;
 }
 
 // Helper: Calculate nights
 function calculateNights(checkIn: Date, checkOut: Date): number {
   const diffTime = Math.abs(new Date(checkOut).getTime() - new Date(checkIn).getTime());
   return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 }
 
 // ============================================
 // FRONT DESK API
 // ============================================
 
 export const frontDeskApi = {
   // Get operational dashboard stats
   getDashboardStats: async (): Promise<DashboardStats> => {
     await delay(200);
     const today = new Date();
     today.setHours(0, 0, 0, 0);
     const tomorrow = new Date(today);
     tomorrow.setDate(tomorrow.getDate() + 1);
 
     const allBookings = store.getBookings().map(getBookingWithDetails);
     const rooms = store.getRooms();
     const payments = store.getPayments();
 
     // Today's check-ins (scheduled for today)
     const todayCheckins = allBookings.filter(b => {
       const checkIn = new Date(b.checkIn);
       checkIn.setHours(0, 0, 0, 0);
       return checkIn.getTime() === today.getTime() && 
         b.status !== 'CANCELLED' && b.status !== 'NO_SHOW';
     });
 
     // Today's check-outs (scheduled for today)
     const todayCheckouts = allBookings.filter(b => {
       const checkOut = new Date(b.checkOut);
       checkOut.setHours(0, 0, 0, 0);
       return checkOut.getTime() === today.getTime() && 
         b.status !== 'CANCELLED' && b.status !== 'NO_SHOW';
     });
 
     // In-house guests (currently staying)
     const inHouseGuests = allBookings.filter(b => 
       b.status === 'IN_HOUSE' || b.status === 'CHECKED_IN'
     );
 
     // Pending arrivals (past check-in date, not checked in)
     const pendingArrivals = allBookings.filter(b => {
       const checkIn = new Date(b.checkIn);
       checkIn.setHours(0, 0, 0, 0);
       return checkIn < today && 
         (b.status === 'CONFIRMED' || b.status === 'RESERVED');
     });
 
     // Overdue checkouts (past checkout date, still in house)
     const overdueCheckouts = allBookings.filter(b => {
       const checkOut = new Date(b.checkOut);
       checkOut.setHours(0, 0, 0, 0);
       return checkOut < today && 
         (b.status === 'IN_HOUSE' || b.status === 'CHECKED_IN');
     });
 
     // Calculate unpaid amounts
     const folios = store.getFolios();
     let unpaidCount = 0;
     let unpaidAmount = 0;
     
     inHouseGuests.forEach(booking => {
       const folio = folios.find(f => f.bookingId === booking.id);
       const bookingPayments = payments.filter(p => p.bookingId === booking.id);
       const totalPaid = bookingPayments.reduce((sum, p) => sum + p.amount, 0);
       const balance = (folio?.grandTotal || booking.totalAmount) - totalPaid;
       if (balance > 0) {
         unpaidCount++;
         unpaidAmount += balance;
       }
     });
 
     // Today's revenue by method
     const todayPayments = payments.filter(p => {
       const created = new Date(p.createdAt);
       created.setHours(0, 0, 0, 0);
       return created.getTime() === today.getTime();
     });
 
     const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
 
     return {
       todayCheckins,
       todayCheckouts,
       inHouseGuests,
       pendingArrivals,
       overdueCheckouts,
       currentOccupancy: occupiedRooms,
       totalRooms: rooms.length,
       todayRevenueCash: todayPayments.filter(p => p.method === 'CASH').reduce((s, p) => s + p.amount, 0),
       todayRevenueOnline: todayPayments.filter(p => p.method === 'ONLINE').reduce((s, p) => s + p.amount, 0),
       todayRevenueUPI: todayPayments.filter(p => p.method === 'UPI').reduce((s, p) => s + p.amount, 0),
       todayRevenueCard: todayPayments.filter(p => p.method === 'CARD').reduce((s, p) => s + p.amount, 0),
       unpaidCount,
       unpaidAmount,
       recentBookings: allBookings.slice(0, 10),
     };
   },
 
   // Create walk-in or reservation
   createStay: async (data: CreateStayRequest): Promise<Booking> => {
     await delay(300);
     
     // Create or find guest
     const guest = store.addGuest(data.guest);
     
     const nights = calculateNights(data.checkIn, data.checkOut);
     const totalAmount = data.dailyRate * nights;
     
     // Create booking
     const booking: Booking = {
       id: 'b-' + Date.now(),
       bookingCode: generateBookingCode(),
       guestId: guest.id,
       roomId: data.roomId,
       checkIn: data.checkIn,
       checkOut: data.checkOut,
       guestsCount: data.guestsCount,
       totalAmount,
       status: data.bookingType === 'WALK_IN' ? 'CONFIRMED' : 'RESERVED',
       paymentStatus: 'PENDING',
       createdAt: new Date(),
       bookingType: data.bookingType,
       dailyRate: data.dailyRate,
       notes: data.notes,
     };
     
     store.addBooking(booking);
     
     // Create folio
     const folio: Folio = {
       id: 'f-' + booking.id,
       bookingId: booking.id,
       lineItems: [{
         id: 'li-' + booking.id + '-1',
         folioId: 'f-' + booking.id,
         type: 'ROOM_CHARGE',
         description: `Room Charges (${nights} night${nights > 1 ? 's' : ''})`,
         quantity: nights,
         unitPrice: data.dailyRate,
         total: totalAmount,
         date: data.checkIn,
       }],
       subtotal: totalAmount,
       discountAmount: 0,
       discountPercent: 0,
       taxAmount: 0,
       taxPercent: 0,
       grandTotal: totalAmount,
       createdAt: new Date(),
       updatedAt: new Date(),
     };
     
     store.addFolio(folio);
     
     // Add audit log
     store.addAuditLog({
       action: 'BOOKING_CREATED',
       entityType: 'booking',
       entityId: booking.id,
       description: `${data.bookingType === 'WALK_IN' ? 'Walk-in' : 'Reservation'} created for ${guest.name}`,
       createdBy: 'admin',
     });
     
     return getBookingWithDetails(booking);
   },
 
   // Check in guest
   checkIn: async (bookingId: string, backdated: boolean = false, reason?: string): Promise<Booking> => {
     await delay(200);
     
     const booking = store.getBookings().find(b => b.id === bookingId);
     if (!booking) throw new Error('Booking not found');
     
     // Update booking status
     store.updateBooking(bookingId, { status: 'IN_HOUSE' });
     
     // Update room status to occupied
     store.updateRoom(booking.roomId, { status: 'OCCUPIED' });
     
     // Add audit log
     store.addAuditLog({
       action: backdated ? 'BACKDATED_CHECK_IN' : 'CHECK_IN',
       entityType: 'booking',
       entityId: bookingId,
       description: `Guest checked in${backdated ? ' (backdated)' : ''}`,
       reason: reason,
       createdBy: 'admin',
     });
     
     return getBookingWithDetails(store.getBookings().find(b => b.id === bookingId)!);
   },
 
   // Check out guest
   checkOut: async (bookingId: string, backdated: boolean = false, reason?: string): Promise<Booking> => {
     await delay(200);
     
     const booking = store.getBookings().find(b => b.id === bookingId);
     if (!booking) throw new Error('Booking not found');
     
     // Update booking status
     store.updateBooking(bookingId, { status: 'CHECKED_OUT' });
     
     // Update room status to cleaning
     store.updateRoom(booking.roomId, { status: 'CLEANING' });
     
     // Update payment status based on balance
     const folio = store.getFolioByBookingId(bookingId);
     const payments = store.getPaymentsByBookingId(bookingId);
     const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
     const balance = (folio?.grandTotal || booking.totalAmount) - totalPaid;
     
     if (balance <= 0) {
       store.updateBooking(bookingId, { paymentStatus: 'PAID' });
     }
     
     // Add audit log
     store.addAuditLog({
       action: backdated ? 'BACKDATED_CHECK_OUT' : 'CHECK_OUT',
       entityType: 'booking',
       entityId: bookingId,
       description: `Guest checked out${backdated ? ' (backdated)' : ''}`,
       reason: reason,
       createdBy: 'admin',
     });
     
     return getBookingWithDetails(store.getBookings().find(b => b.id === bookingId)!);
   },
 
   // Mark no-show
   markNoShow: async (bookingId: string): Promise<Booking> => {
     await delay(200);
     
     store.updateBooking(bookingId, { status: 'NO_SHOW' });
     
     store.addAuditLog({
       action: 'NO_SHOW_MARKED',
       entityType: 'booking',
       entityId: bookingId,
       description: 'Guest marked as no-show',
       createdBy: 'admin',
     });
     
     return getBookingWithDetails(store.getBookings().find(b => b.id === bookingId)!);
   },
 
   // Cancel booking
   cancelBooking: async (bookingId: string, reason: string): Promise<Booking> => {
     await delay(200);
     
     const booking = store.getBookings().find(b => b.id === bookingId);
     if (!booking) throw new Error('Booking not found');
     
     if (booking.status === 'IN_HOUSE' || booking.status === 'CHECKED_IN') {
       throw new Error('Cannot cancel a checked-in booking. Please check out first.');
     }
     
     store.updateBooking(bookingId, { status: 'CANCELLED' });
     
     store.addAuditLog({
       action: 'BOOKING_CANCELLED',
       entityType: 'booking',
       entityId: bookingId,
       description: 'Booking cancelled',
       reason: reason,
       createdBy: 'admin',
     });
     
     return getBookingWithDetails(store.getBookings().find(b => b.id === bookingId)!);
   },
 
   // Update booking details
   updateBooking: async (bookingId: string, updates: Partial<Booking>, reason?: string): Promise<Booking> => {
     await delay(200);
     
     const booking = store.getBookings().find(b => b.id === bookingId);
     if (!booking) throw new Error('Booking not found');
     
     const oldRoom = booking.roomId;
     
     store.updateBooking(bookingId, updates);
     
     // If room changed, update room statuses
     if (updates.roomId && updates.roomId !== oldRoom && booking.status === 'IN_HOUSE') {
       store.updateRoom(oldRoom, { status: 'CLEANING' });
       store.updateRoom(updates.roomId, { status: 'OCCUPIED' });
       
       store.addAuditLog({
         action: 'ROOM_CHANGED',
         entityType: 'booking',
         entityId: bookingId,
         description: `Room changed`,
         previousValue: oldRoom,
         newValue: updates.roomId,
         reason: reason,
         createdBy: 'admin',
       });
     } else {
       store.addAuditLog({
         action: 'BOOKING_UPDATED',
         entityType: 'booking',
         entityId: bookingId,
         description: 'Booking details updated',
         reason: reason,
         createdBy: 'admin',
       });
     }
     
     return getBookingWithDetails(store.getBookings().find(b => b.id === bookingId)!);
   },
 };
 
 // ============================================
 // FOLIO & BILLING API
 // ============================================
 
 export const folioApi = {
   // Get folio for booking
   getFolio: async (bookingId: string): Promise<Folio | null> => {
     await delay(100);
     return store.getFolioByBookingId(bookingId) || null;
   },
 
   // Add line item
   addLineItem: async (data: AddLineItemRequest): Promise<Folio> => {
     await delay(200);
     
     const item = {
       type: data.type,
       description: data.description,
       quantity: data.quantity,
       unitPrice: data.unitPrice,
       total: data.quantity * data.unitPrice,
       date: new Date(),
     };
     
     const folio = store.addLineItem(data.folioId, item);
     
     // Update booking total
     const booking = store.getBookings().find(b => b.id === folio.bookingId);
     if (booking) {
       store.updateBooking(booking.id, { totalAmount: folio.grandTotal });
     }
     
     store.addAuditLog({
       action: 'FOLIO_UPDATED',
       entityType: 'folio',
       entityId: data.folioId,
       description: `Added ${data.type}: ${data.description}`,
       createdBy: 'admin',
     });
     
     return folio;
   },
 
   // Remove line item
   removeLineItem: async (folioId: string, lineItemId: string): Promise<Folio> => {
     await delay(200);
     
     const folio = store.removeLineItem(folioId, lineItemId);
     
     // Update booking total
     const booking = store.getBookings().find(b => b.id === folio.bookingId);
     if (booking) {
       store.updateBooking(booking.id, { totalAmount: folio.grandTotal });
     }
     
     return folio;
   },
 
   // Apply discount
   applyDiscount: async (folioId: string, amount: number, percent: number): Promise<Folio> => {
     await delay(200);
     
     const folio = store.applyDiscount(folioId, amount, percent);
     
     // Update booking total
     const booking = store.getBookings().find(b => b.id === folio.bookingId);
     if (booking) {
       store.updateBooking(booking.id, { totalAmount: folio.grandTotal });
     }
     
     store.addAuditLog({
       action: 'FOLIO_UPDATED',
       entityType: 'folio',
       entityId: folioId,
       description: `Discount applied: ₹${amount} + ${percent}%`,
       createdBy: 'admin',
     });
     
     return folio;
   },
 
   // Get balance summary
   getBalanceSummary: async (bookingId: string): Promise<BalanceSummary> => {
     await delay(100);
     
     const folio = store.getFolioByBookingId(bookingId);
     const payments = store.getPaymentsByBookingId(bookingId);
     const booking = store.getBookings().find(b => b.id === bookingId);
     
     const totalBilled = folio?.grandTotal || booking?.totalAmount || 0;
     const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
     
     return {
       totalBilled,
       totalPaid,
       balanceDue: totalBilled - totalPaid,
     };
   },
 };
 
 // ============================================
 // PAYMENTS API
 // ============================================
 
 export const paymentsApi = {
   // Get payments for booking
   getPayments: async (bookingId: string): Promise<Payment[]> => {
     await delay(100);
     return store.getPaymentsByBookingId(bookingId);
   },
 
   // Add payment
   addPayment: async (data: AddPaymentRequest): Promise<Payment> => {
     await delay(200);
     
     const payment = store.addPayment({
       folioId: data.folioId,
       bookingId: data.bookingId,
       amount: data.amount,
       method: data.method,
       reference: data.reference,
       notes: data.notes,
       createdBy: 'admin',
     });
     
     // Check if fully paid
     const folio = store.getFolios().find(f => f.id === data.folioId);
     const allPayments = store.getPaymentsByBookingId(data.bookingId);
     const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
     const booking = store.getBookings().find(b => b.id === data.bookingId);
     
     if (booking && totalPaid >= (folio?.grandTotal || booking.totalAmount)) {
       store.updateBooking(data.bookingId, { paymentStatus: 'PAID' });
     }
     
     store.addAuditLog({
       action: 'PAYMENT_ADDED',
       entityType: 'payment',
       entityId: payment.id,
       description: `Payment received: ₹${data.amount} via ${data.method}`,
       createdBy: 'admin',
     });
     
     return payment;
   },
 
   // Edit payment
   updatePayment: async (paymentId: string, updates: Partial<Payment>, reason: string): Promise<Payment> => {
     await delay(200);
     
     const oldPayment = store.getPayments().find(p => p.id === paymentId);
     const payment = store.updatePayment(paymentId, updates);
     
     store.addAuditLog({
       action: 'PAYMENT_EDITED',
       entityType: 'payment',
       entityId: paymentId,
       description: `Payment edited`,
       previousValue: JSON.stringify(oldPayment),
       newValue: JSON.stringify(payment),
       reason: reason,
       createdBy: 'admin',
     });
     
     return payment;
   },
 
   // Delete payment
   deletePayment: async (paymentId: string, reason: string): Promise<void> => {
     await delay(200);
     
     const payment = store.getPayments().find(p => p.id === paymentId);
     if (!payment) throw new Error('Payment not found');
     
     store.addAuditLog({
       action: 'PAYMENT_DELETED',
       entityType: 'payment',
       entityId: paymentId,
       description: `Payment deleted: ₹${payment.amount}`,
       reason: reason,
       createdBy: 'admin',
     });
     
     store.deletePayment(paymentId);
     
     // Update booking payment status
     const booking = store.getBookings().find(b => b.id === payment.bookingId);
     if (booking) {
       store.updateBooking(booking.id, { paymentStatus: 'PAY_AT_HOTEL' });
     }
   },
 };
 
 // ============================================
 // ROOMS API
 // ============================================
 
 export const roomsApiV2 = {
   getRoomTypes: async (): Promise<RoomType[]> => {
     await delay(100);
     return store.getRoomTypes();
   },
 
   getRooms: async (): Promise<(Room & { type: RoomType })[]> => {
     await delay(100);
     return store.getRooms().map(getRoomWithType);
   },
 
   getAvailableRooms: async (checkIn: Date, checkOut: Date): Promise<(Room & { type: RoomType })[]> => {
     await delay(200);
     const rooms = store.getRooms();
     const bookings = store.getBookings();
     
     return rooms.filter(room => {
       if (room.status === 'MAINTENANCE') return false;
       
       // Check for booking overlaps
       const hasOverlap = bookings.some(booking => {
         if (booking.roomId !== room.id) return false;
         if (booking.status === 'CANCELLED' || booking.status === 'CHECKED_OUT' || booking.status === 'NO_SHOW') return false;
         
         const existingCheckIn = new Date(booking.checkIn);
         const existingCheckOut = new Date(booking.checkOut);
         const newCheckIn = new Date(checkIn);
         const newCheckOut = new Date(checkOut);
         
         return existingCheckIn < newCheckOut && existingCheckOut > newCheckIn;
       });
       
       return !hasOverlap;
     }).map(getRoomWithType);
   },
 
   updateRoomStatus: async (roomId: string, status: RoomStatus): Promise<Room> => {
     await delay(200);
     return getRoomWithType(store.updateRoom(roomId, { status }));
   },
 };
 
 // ============================================
 // BOOKINGS API (List & Filter)
 // ============================================
 
 export const bookingsApiV2 = {
   getBookings: async (filters?: BookingFilters): Promise<(Booking & { guest: Guest; room: Room & { type: RoomType } })[]> => {
     await delay(200);
     let bookings = store.getBookings();
     
     if (filters?.status) {
       bookings = bookings.filter(b => b.status === filters.status);
     }
     if (filters?.paymentStatus) {
       bookings = bookings.filter(b => b.paymentStatus === filters.paymentStatus);
     }
     if (filters?.search) {
       const search = filters.search.toLowerCase();
       const guests = store.getGuests();
       bookings = bookings.filter(b => {
         const guest = guests.find(g => g.id === b.guestId);
         return (
           b.bookingCode.toLowerCase().includes(search) ||
           guest?.name.toLowerCase().includes(search) ||
           guest?.phone.includes(search)
         );
       });
     }
     if (filters?.dateFrom) {
       bookings = bookings.filter(b => new Date(b.checkIn) >= new Date(filters.dateFrom!));
     }
     if (filters?.dateTo) {
       bookings = bookings.filter(b => new Date(b.checkIn) <= new Date(filters.dateTo!));
     }
     
     return bookings
       .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
       .map(getBookingWithDetails);
   },
 
   getBookingById: async (id: string): Promise<Booking & { guest: Guest; room: Room & { type: RoomType } }> => {
     await delay(100);
     const booking = store.getBookings().find(b => b.id === id);
     if (!booking) throw new Error('Booking not found');
     return getBookingWithDetails(booking);
   },
 
   getBookingByCode: async (code: string): Promise<Booking & { guest: Guest; room: Room & { type: RoomType } }> => {
     await delay(100);
     const booking = store.getBookings().find(b => b.bookingCode === code);
     if (!booking) throw new Error('Booking not found');
     return getBookingWithDetails(booking);
   },
 };
 
 // ============================================
 // AUDIT LOG API
 // ============================================
 
 export const auditApi = {
   getLogs: async (entityId?: string): Promise<AuditLog[]> => {
     await delay(100);
     const logs = store.getAuditLogs();
     if (entityId) {
       return logs.filter(l => l.entityId === entityId);
     }
     return logs;
   },
 };
 
 // ============================================
 // REPORTS API
 // ============================================
 
 export const reportsApiV2 = {
   getArrivalsReport: async (date: Date): Promise<(Booking & { guest: Guest; room: Room & { type: RoomType } })[]> => {
     await delay(200);
     const targetDate = new Date(date);
     targetDate.setHours(0, 0, 0, 0);
     
     return store.getBookings()
       .filter(b => {
         const checkIn = new Date(b.checkIn);
         checkIn.setHours(0, 0, 0, 0);
         return checkIn.getTime() === targetDate.getTime() && 
           b.status !== 'CANCELLED' && b.status !== 'NO_SHOW';
       })
       .map(getBookingWithDetails);
   },
 
   getDeparturesReport: async (date: Date): Promise<(Booking & { guest: Guest; room: Room & { type: RoomType } })[]> => {
     await delay(200);
     const targetDate = new Date(date);
     targetDate.setHours(0, 0, 0, 0);
     
     return store.getBookings()
       .filter(b => {
         const checkOut = new Date(b.checkOut);
         checkOut.setHours(0, 0, 0, 0);
         return checkOut.getTime() === targetDate.getTime() && 
           b.status !== 'CANCELLED' && b.status !== 'NO_SHOW';
       })
       .map(getBookingWithDetails);
   },
 
   getRevenueReport: async (dateFrom: Date, dateTo: Date): Promise<{
     totalCash: number;
     totalUPI: number;
     totalCard: number;
     totalOnline: number;
     grandTotal: number;
     payments: Payment[];
   }> => {
     await delay(200);
     
     const payments = store.getPayments().filter(p => {
       const created = new Date(p.createdAt);
       return created >= dateFrom && created <= dateTo;
     });
     
     return {
       totalCash: payments.filter(p => p.method === 'CASH').reduce((s, p) => s + p.amount, 0),
       totalUPI: payments.filter(p => p.method === 'UPI').reduce((s, p) => s + p.amount, 0),
       totalCard: payments.filter(p => p.method === 'CARD').reduce((s, p) => s + p.amount, 0),
       totalOnline: payments.filter(p => p.method === 'ONLINE').reduce((s, p) => s + p.amount, 0),
       grandTotal: payments.reduce((s, p) => s + p.amount, 0),
       payments,
     };
   },
 
   getOutstandingReport: async (): Promise<{
     bookings: (Booking & { guest: Guest; room: Room & { type: RoomType }; balance: number })[];
     totalOutstanding: number;
   }> => {
     await delay(200);
     
     const bookings = store.getBookings();
     const folios = store.getFolios();
     const payments = store.getPayments();
     
     const outstanding = bookings
       .filter(b => b.status === 'IN_HOUSE' || b.status === 'CHECKED_IN')
       .map(b => {
         const folio = folios.find(f => f.bookingId === b.id);
         const bookingPayments = payments.filter(p => p.bookingId === b.id);
         const totalPaid = bookingPayments.reduce((sum, p) => sum + p.amount, 0);
         const balance = (folio?.grandTotal || b.totalAmount) - totalPaid;
         return { ...getBookingWithDetails(b), balance };
       })
       .filter(b => b.balance > 0);
     
     return {
       bookings: outstanding,
       totalOutstanding: outstanding.reduce((sum, b) => sum + b.balance, 0),
     };
   },
 
   getOccupancyReport: async (date: Date): Promise<{
     totalRooms: number;
     occupiedRooms: number;
     availableRooms: number;
     cleaningRooms: number;
     maintenanceRooms: number;
     occupancyRate: number;
   }> => {
     await delay(200);
     
     const rooms = store.getRooms();
     const occupied = rooms.filter(r => r.status === 'OCCUPIED').length;
     const available = rooms.filter(r => r.status === 'AVAILABLE').length;
     const cleaning = rooms.filter(r => r.status === 'CLEANING').length;
     const maintenance = rooms.filter(r => r.status === 'MAINTENANCE').length;
     
     return {
       totalRooms: rooms.length,
       occupiedRooms: occupied,
       availableRooms: available,
       cleaningRooms: cleaning,
       maintenanceRooms: maintenance,
       occupancyRate: Math.round((occupied / rooms.length) * 100),
     };
   },
 };