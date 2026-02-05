// ============================================
// HOTEL CONFIGURATION
// Centralized branding & business settings
// ============================================

export interface HotelConfig {
  // Branding
  name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  altPhone?: string;
  email: string;
  website?: string;
  
  // Tax & Compliance
  gstin: string;
  pan?: string;
  cgstRate: number; // percentage
  sgstRate: number; // percentage
  
  // Operations
  checkInTime: string;
  checkOutTime: string;
  totalRooms: number;
  
  // Invoice
  invoicePrefix: string;
  termsAndConditions: string[];
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifscCode: string;
  };
}

export const hotelConfig: HotelConfig = {
  // Branding
  name: "Tirumala Residency",
  tagline: "Your Home Away From Home",
  address: "123, Main Road, Temple Street",
  city: "Tirupati",
  state: "Andhra Pradesh",
  pincode: "517501",
  phone: "+91 98765 43210",
  altPhone: "+91 87654 32109",
  email: "info@tirumalaresidency.com",
  website: "www.tirumalaresidency.com",
  
  // Tax & Compliance (12% GST for rooms ₹1000-7500)
  gstin: "37AABCT1234F1Z5", // Example GSTIN for AP
  pan: "AABCT1234F",
  cgstRate: 6, // 6% CGST
  sgstRate: 6, // 6% SGST
  
  // Operations
  checkInTime: "12:00 PM",
  checkOutTime: "11:00 AM",
  totalRooms: 22,
  
  // Invoice
  invoicePrefix: "TR",
  termsAndConditions: [
    "Check-in time is 12:00 PM and check-out time is 11:00 AM.",
    "Early check-in and late check-out subject to availability and additional charges.",
    "Government-issued photo ID is mandatory at the time of check-in.",
    "Pets are not allowed in the hotel premises.",
    "The management is not responsible for loss of valuables not deposited in the safe.",
    "Any damage to hotel property will be charged to the guest.",
  ],
  bankDetails: {
    bankName: "State Bank of India",
    accountName: "Tirumala Residency",
    accountNumber: "12345678901234",
    ifscCode: "SBIN0001234",
  },
};

// Room type configurations
export const roomCategories = [
  { id: 'standard', name: 'Standard Room', count: 8 },
  { id: 'deluxe', name: 'Deluxe Room', count: 6 },
  { id: 'family', name: 'Family Suite', count: 5 },
  { id: 'premium', name: 'Premium Suite', count: 3 },
] as const;

// ID proof types for guest registration
export const idProofTypes = [
  { value: 'AADHAR', label: 'Aadhar Card' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVING_LICENSE', label: 'Driving License' },
  { value: 'VOTER_ID', label: 'Voter ID' },
  { value: 'PAN_CARD', label: 'PAN Card' },
  { value: 'OTHER', label: 'Other Government ID' },
] as const;

export type IdProofType = typeof idProofTypes[number]['value'];

// Payment method labels
export const paymentMethods = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CARD', label: 'Card' },
  { value: 'ONLINE', label: 'Online Transfer' },
] as const;

// Booking status configuration with colors
export const bookingStatusConfig = {
  RESERVED: { label: 'Reserved', color: 'info', bgClass: 'bg-info/10 text-info border-info/30' },
  CONFIRMED: { label: 'Confirmed', color: 'info', bgClass: 'bg-info/10 text-info border-info/30' },
  CHECKED_IN: { label: 'In House', color: 'success', bgClass: 'bg-success/10 text-success border-success/30' },
  IN_HOUSE: { label: 'In House', color: 'success', bgClass: 'bg-success/10 text-success border-success/30' },
  CHECKED_OUT: { label: 'Checked Out', color: 'muted', bgClass: 'bg-muted text-muted-foreground border-border' },
  CANCELLED: { label: 'Cancelled', color: 'destructive', bgClass: 'bg-destructive/10 text-destructive border-destructive/30' },
  NO_SHOW: { label: 'No Show', color: 'warning', bgClass: 'bg-warning/10 text-warning border-warning/30' },
} as const;

// Room status configuration
export const roomStatusConfig = {
  AVAILABLE: { label: 'Available', color: 'success', bgClass: 'bg-success/10 text-success border-success/30' },
  OCCUPIED: { label: 'Occupied', color: 'destructive', bgClass: 'bg-destructive/10 text-destructive border-destructive/30' },
  CLEANING: { label: 'Cleaning', color: 'warning', bgClass: 'bg-warning/10 text-warning border-warning/30' },
  MAINTENANCE: { label: 'Maintenance', color: 'muted', bgClass: 'bg-muted text-muted-foreground border-border' },
} as const;

// Payment status configuration
export const paymentStatusConfig = {
  PAID: { label: 'Paid', color: 'success', bgClass: 'bg-success/10 text-success border-success/30' },
  PENDING: { label: 'Pending', color: 'warning', bgClass: 'bg-warning/10 text-warning border-warning/30' },
  PAY_AT_HOTEL: { label: 'Pay at Hotel', color: 'info', bgClass: 'bg-info/10 text-info border-info/30' },
  FAILED: { label: 'Failed', color: 'destructive', bgClass: 'bg-destructive/10 text-destructive border-destructive/30' },
} as const;

// Line item types for folio
export const lineItemTypes = [
  { value: 'ROOM_CHARGE', label: 'Room Charge' },
  { value: 'EXTRA_BED', label: 'Extra Bed' },
  { value: 'FOOD', label: 'Food & Beverages' },
  { value: 'LAUNDRY', label: 'Laundry' },
  { value: 'TRANSPORT', label: 'Transport/Pickup' },
  { value: 'MISC', label: 'Miscellaneous' },
] as const;

// Calculate GST amounts
export function calculateGST(subtotal: number): {
  cgst: number;
  sgst: number;
  totalTax: number;
  grandTotal: number;
} {
  const cgst = Math.round(subtotal * (hotelConfig.cgstRate / 100) * 100) / 100;
  const sgst = Math.round(subtotal * (hotelConfig.sgstRate / 100) * 100) / 100;
  return {
    cgst,
    sgst,
    totalTax: cgst + sgst,
    grandTotal: subtotal + cgst + sgst,
  };
}

// Format currency (INR)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Generate invoice number
export function generateInvoiceNumber(bookingCode: string): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const seq = bookingCode.split('-').pop() || '000001';
  return `${hotelConfig.invoicePrefix}${year}${month}-${seq}`;
}
