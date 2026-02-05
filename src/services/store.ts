 // ============================================
 // LOCAL STORAGE PERSISTENCE LAYER
 // Provides persistent state across page reloads
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
   DailyReport,
   User,
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
 } from './mockData';
 
 const STORAGE_KEYS = {
   ROOMS: 'hms_rooms',
   BOOKINGS: 'hms_bookings',
   GUESTS: 'hms_guests',
   FOLIOS: 'hms_folios',
   PAYMENTS: 'hms_payments',
   AUDIT_LOGS: 'hms_audit_logs',
   BOOKING_SEQUENCE: 'hms_booking_sequence',
   INITIALIZED: 'hms_initialized',
 };
 
 // Parse dates in JSON
 function reviveDates(key: string, value: any): any {
   if (typeof value === 'string') {
     const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
     if (dateRegex.test(value)) {
       return new Date(value);
     }
   }
   return value;
 }
 
 // Load from localStorage with fallback
 function load<T>(key: string, fallback: T): T {
   try {
     const stored = localStorage.getItem(key);
     if (stored) {
       return JSON.parse(stored, reviveDates);
     }
   } catch (e) {
     console.error(`Failed to load ${key}:`, e);
   }
   return fallback;
 }
 
 // Save to localStorage
 function save<T>(key: string, data: T): void {
   try {
     localStorage.setItem(key, JSON.stringify(data));
   } catch (e) {
     console.error(`Failed to save ${key}:`, e);
   }
 }
 
 // Initialize store with mock data if not already done
 function initializeStore(): void {
   const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
   if (!initialized) {
     save(STORAGE_KEYS.ROOMS, mockRooms);
     save(STORAGE_KEYS.BOOKINGS, mockBookings);
     save(STORAGE_KEYS.GUESTS, mockGuests);
     save(STORAGE_KEYS.FOLIOS, createInitialFolios());
     save(STORAGE_KEYS.PAYMENTS, createInitialPayments());
     save(STORAGE_KEYS.AUDIT_LOGS, []);
     save(STORAGE_KEYS.BOOKING_SEQUENCE, 5);
     localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
   }
 }
 
 // Create initial folios for existing bookings
 function createInitialFolios(): Folio[] {
   return mockBookings.map(booking => ({
     id: 'f-' + booking.id,
     bookingId: booking.id,
     lineItems: [{
       id: 'li-' + booking.id + '-1',
       folioId: 'f-' + booking.id,
       type: 'ROOM_CHARGE' as const,
       description: 'Room Charges',
       quantity: Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)),
       unitPrice: booking.dailyRate,
       total: booking.totalAmount,
       date: booking.checkIn,
     }],
     subtotal: booking.totalAmount,
     discountAmount: 0,
     discountPercent: 0,
     taxAmount: 0,
     taxPercent: 0,
     grandTotal: booking.totalAmount,
     createdAt: booking.createdAt,
     updatedAt: booking.createdAt,
   }));
 }
 
 // Create initial payments for paid bookings
 function createInitialPayments(): Payment[] {
   return mockBookings
     .filter(b => b.paymentStatus === 'PAID')
     .map(booking => ({
       id: 'p-' + booking.id,
       folioId: 'f-' + booking.id,
       bookingId: booking.id,
       amount: booking.totalAmount,
       method: 'CASH' as const,
       createdAt: booking.createdAt,
       createdBy: 'admin',
     }));
 }
 
 // Initialize on module load
 initializeStore();
 
 // ============================================
 // STORE CLASS - Manages all data operations
 // ============================================
 
 class HMSStore {
   // === Room Types (static) ===
   getRoomTypes(): RoomType[] {
     return mockRoomTypes;
   }
 
   // === Rooms ===
   getRooms(): Room[] {
     return load(STORAGE_KEYS.ROOMS, mockRooms);
   }
 
   updateRoom(roomId: string, updates: Partial<Room>): Room {
     const rooms = this.getRooms();
     const index = rooms.findIndex(r => r.id === roomId);
     if (index === -1) throw new Error('Room not found');
     rooms[index] = { ...rooms[index], ...updates };
     save(STORAGE_KEYS.ROOMS, rooms);
     return rooms[index];
   }
 
   // === Guests ===
   getGuests(): Guest[] {
     return load(STORAGE_KEYS.GUESTS, mockGuests);
   }
 
   addGuest(guest: Omit<Guest, 'id'>): Guest {
     const guests = this.getGuests();
     const newGuest: Guest = { ...guest, id: 'g-' + Date.now() };
     guests.push(newGuest);
     save(STORAGE_KEYS.GUESTS, guests);
     return newGuest;
   }
 
   updateGuest(guestId: string, updates: Partial<Guest>): Guest {
     const guests = this.getGuests();
     const index = guests.findIndex(g => g.id === guestId);
     if (index === -1) throw new Error('Guest not found');
     guests[index] = { ...guests[index], ...updates };
     save(STORAGE_KEYS.GUESTS, guests);
     return guests[index];
   }
 
   // === Bookings ===
   getBookings(): Booking[] {
     return load(STORAGE_KEYS.BOOKINGS, mockBookings);
   }
 
   getBookingSequence(): number {
     return load(STORAGE_KEYS.BOOKING_SEQUENCE, 5);
   }
 
   incrementBookingSequence(): number {
     const seq = this.getBookingSequence() + 1;
     save(STORAGE_KEYS.BOOKING_SEQUENCE, seq);
     return seq;
   }
 
   addBooking(booking: Booking): Booking {
     const bookings = this.getBookings();
     bookings.push(booking);
     save(STORAGE_KEYS.BOOKINGS, bookings);
     return booking;
   }
 
   updateBooking(bookingId: string, updates: Partial<Booking>): Booking {
     const bookings = this.getBookings();
     const index = bookings.findIndex(b => b.id === bookingId);
     if (index === -1) throw new Error('Booking not found');
     bookings[index] = { ...bookings[index], ...updates };
     save(STORAGE_KEYS.BOOKINGS, bookings);
     return bookings[index];
   }
 
   // === Folios ===
   getFolios(): Folio[] {
     return load(STORAGE_KEYS.FOLIOS, []);
   }
 
   getFolioByBookingId(bookingId: string): Folio | undefined {
     return this.getFolios().find(f => f.bookingId === bookingId);
   }
 
   addFolio(folio: Folio): Folio {
     const folios = this.getFolios();
     folios.push(folio);
     save(STORAGE_KEYS.FOLIOS, folios);
     return folio;
   }
 
   updateFolio(folioId: string, updates: Partial<Folio>): Folio {
     const folios = this.getFolios();
     const index = folios.findIndex(f => f.id === folioId);
     if (index === -1) throw new Error('Folio not found');
     folios[index] = { ...folios[index], ...updates, updatedAt: new Date() };
     save(STORAGE_KEYS.FOLIOS, folios);
     return folios[index];
   }
 
   addLineItem(folioId: string, item: Omit<FolioLineItem, 'id' | 'folioId'>): Folio {
     const folios = this.getFolios();
     const index = folios.findIndex(f => f.id === folioId);
     if (index === -1) throw new Error('Folio not found');
     
     const newItem: FolioLineItem = {
       ...item,
       id: 'li-' + Date.now(),
       folioId,
     };
     
     folios[index].lineItems.push(newItem);
     this.recalculateFolioTotals(folios[index]);
     save(STORAGE_KEYS.FOLIOS, folios);
     return folios[index];
   }
 
   removeLineItem(folioId: string, lineItemId: string): Folio {
     const folios = this.getFolios();
     const index = folios.findIndex(f => f.id === folioId);
     if (index === -1) throw new Error('Folio not found');
     
     folios[index].lineItems = folios[index].lineItems.filter(li => li.id !== lineItemId);
     this.recalculateFolioTotals(folios[index]);
     save(STORAGE_KEYS.FOLIOS, folios);
     return folios[index];
   }
 
   applyDiscount(folioId: string, amount: number, percent: number): Folio {
     const folios = this.getFolios();
     const index = folios.findIndex(f => f.id === folioId);
     if (index === -1) throw new Error('Folio not found');
     
     folios[index].discountAmount = amount;
     folios[index].discountPercent = percent;
     this.recalculateFolioTotals(folios[index]);
     save(STORAGE_KEYS.FOLIOS, folios);
     return folios[index];
   }
 
   private recalculateFolioTotals(folio: Folio): void {
     folio.subtotal = folio.lineItems.reduce((sum, item) => sum + item.total, 0);
     const discountFromPercent = folio.subtotal * (folio.discountPercent / 100);
     const totalDiscount = folio.discountAmount + discountFromPercent;
     const afterDiscount = folio.subtotal - totalDiscount;
     folio.taxAmount = afterDiscount * (folio.taxPercent / 100);
     folio.grandTotal = afterDiscount + folio.taxAmount;
     folio.updatedAt = new Date();
   }
 
   // === Payments ===
   getPayments(): Payment[] {
     return load(STORAGE_KEYS.PAYMENTS, []);
   }
 
   getPaymentsByFolioId(folioId: string): Payment[] {
     return this.getPayments().filter(p => p.folioId === folioId);
   }
 
   getPaymentsByBookingId(bookingId: string): Payment[] {
     return this.getPayments().filter(p => p.bookingId === bookingId);
   }
 
   addPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Payment {
     const payments = this.getPayments();
     const newPayment: Payment = {
       ...payment,
       id: 'p-' + Date.now(),
       createdAt: new Date(),
     };
     payments.push(newPayment);
     save(STORAGE_KEYS.PAYMENTS, payments);
     return newPayment;
   }
 
   updatePayment(paymentId: string, updates: Partial<Payment>): Payment {
     const payments = this.getPayments();
     const index = payments.findIndex(p => p.id === paymentId);
     if (index === -1) throw new Error('Payment not found');
     payments[index] = { ...payments[index], ...updates };
     save(STORAGE_KEYS.PAYMENTS, payments);
     return payments[index];
   }
 
   deletePayment(paymentId: string): void {
     const payments = this.getPayments();
     save(STORAGE_KEYS.PAYMENTS, payments.filter(p => p.id !== paymentId));
   }
 
   // === Audit Logs ===
   getAuditLogs(): AuditLog[] {
     return load(STORAGE_KEYS.AUDIT_LOGS, []);
   }
 
   addAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
     const logs = this.getAuditLogs();
     const newLog: AuditLog = {
       ...log,
       id: 'log-' + Date.now(),
       createdAt: new Date(),
     };
     logs.unshift(newLog); // Add to beginning
     save(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 500)); // Keep last 500 logs
     return newLog;
   }
 
   // === Reports ===
   getDailyReports(): DailyReport[] {
     return mockDailyReports;
   }
 
   // === Users ===
   getUsers(): User[] {
     return mockUsers;
   }
 
   // === Reset (for testing) ===
   resetStore(): void {
     localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
     localStorage.removeItem(STORAGE_KEYS.ROOMS);
     localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
     localStorage.removeItem(STORAGE_KEYS.GUESTS);
     localStorage.removeItem(STORAGE_KEYS.FOLIOS);
     localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
     localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
     localStorage.removeItem(STORAGE_KEYS.BOOKING_SEQUENCE);
     initializeStore();
   }
 }
 
 export const store = new HMSStore();