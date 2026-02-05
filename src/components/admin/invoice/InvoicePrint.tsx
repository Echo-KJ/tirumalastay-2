// ============================================
// PROFESSIONAL INVOICE COMPONENT
// A4 Print-ready GST Invoice for Hotels
// ============================================

import { format } from 'date-fns';
import { hotelConfig, formatCurrency, generateInvoiceNumber, calculateGST } from '@/config/hotel';
import { Booking, Guest, Room, RoomType, Folio, Payment } from '@/types';
import { Separator } from '@/components/ui/separator';

interface InvoicePrintProps {
  booking: Booking & { guest: Guest; room: Room & { type: RoomType } };
  folio: Folio;
  payments: Payment[];
  invoiceDate?: Date;
}

export function InvoicePrint({ booking, folio, payments, invoiceDate = new Date() }: InvoicePrintProps) {
  const invoiceNumber = generateInvoiceNumber(booking.bookingCode);
  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Calculate GST on subtotal after discount
  const afterDiscount = folio.subtotal - folio.discountAmount - (folio.subtotal * folio.discountPercent / 100);
  const gst = calculateGST(afterDiscount);
  
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = gst.grandTotal - totalPaid;

  return (
    <div className="invoice-print bg-white text-black p-8 max-w-4xl mx-auto font-sans text-sm">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{hotelConfig.name}</h1>
          <p className="text-gray-600 mt-1">{hotelConfig.tagline}</p>
          <div className="mt-2 text-xs text-gray-600 leading-relaxed">
            <p>{hotelConfig.address}</p>
            <p>{hotelConfig.city}, {hotelConfig.state} - {hotelConfig.pincode}</p>
            <p>Phone: {hotelConfig.phone}</p>
            {hotelConfig.email && <p>Email: {hotelConfig.email}</p>}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Tax Invoice</h2>
          <div className="mt-2 text-xs text-gray-600">
            <p><span className="font-medium">GSTIN:</span> {hotelConfig.gstin}</p>
            {hotelConfig.pan && <p><span className="font-medium">PAN:</span> {hotelConfig.pan}</p>}
          </div>
        </div>
      </div>

      {/* Invoice Details Row */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-xs">
        <div className="border border-gray-300 p-3 rounded">
          <p className="font-semibold text-gray-700 mb-1">Invoice Details</p>
          <p><span className="text-gray-500">Invoice No:</span> <span className="font-mono font-medium">{invoiceNumber}</span></p>
          <p><span className="text-gray-500">Date:</span> {format(invoiceDate, 'dd MMM yyyy')}</p>
          <p><span className="text-gray-500">Booking ID:</span> <span className="font-mono">{booking.bookingCode}</span></p>
        </div>
        
        <div className="border border-gray-300 p-3 rounded">
          <p className="font-semibold text-gray-700 mb-1">Guest Details</p>
          <p className="font-medium">{booking.guest.name}</p>
          <p>{booking.guest.phone}</p>
          {booking.guest.email && <p>{booking.guest.email}</p>}
          {booking.guest.city && <p>{booking.guest.city}</p>}
        </div>
        
        <div className="border border-gray-300 p-3 rounded">
          <p className="font-semibold text-gray-700 mb-1">Stay Details</p>
          <p><span className="text-gray-500">Room:</span> {booking.room.number} ({booking.room.type.name})</p>
          <p><span className="text-gray-500">Check-in:</span> {format(new Date(booking.checkIn), 'dd MMM yyyy')}</p>
          <p><span className="text-gray-500">Check-out:</span> {format(new Date(booking.checkOut), 'dd MMM yyyy')}</p>
          <p><span className="text-gray-500">Nights:</span> {nights} | <span className="text-gray-500">Guests:</span> {booking.guestsCount}</p>
        </div>
      </div>

      {/* Line Items Table */}
      <table className="w-full border-collapse mb-6 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left font-semibold">S.No</th>
            <th className="border border-gray-300 p-2 text-left font-semibold">Description</th>
            <th className="border border-gray-300 p-2 text-center font-semibold">HSN/SAC</th>
            <th className="border border-gray-300 p-2 text-right font-semibold">Qty</th>
            <th className="border border-gray-300 p-2 text-right font-semibold">Rate (₹)</th>
            <th className="border border-gray-300 p-2 text-right font-semibold">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {folio.lineItems.map((item, index) => (
            <tr key={item.id}>
              <td className="border border-gray-300 p-2">{index + 1}</td>
              <td className="border border-gray-300 p-2">
                {item.description}
                <span className="text-gray-500 text-[10px] block">{item.type}</span>
              </td>
              <td className="border border-gray-300 p-2 text-center">
                {item.type === 'ROOM_CHARGE' ? '9963' : '9963'}
              </td>
              <td className="border border-gray-300 p-2 text-right">{item.quantity}</td>
              <td className="border border-gray-300 p-2 text-right">{item.unitPrice.toLocaleString()}</td>
              <td className="border border-gray-300 p-2 text-right font-medium">{item.total.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div className="flex justify-end mb-6">
        <div className="w-72 text-xs">
          <div className="flex justify-between py-1">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(folio.subtotal)}</span>
          </div>
          
          {(folio.discountAmount > 0 || folio.discountPercent > 0) && (
            <div className="flex justify-between py-1 text-green-700">
              <span>
                Discount
                {folio.discountPercent > 0 && ` (${folio.discountPercent}%)`}:
              </span>
              <span>- {formatCurrency(folio.discountAmount + (folio.subtotal * folio.discountPercent / 100))}</span>
            </div>
          )}
          
          <div className="flex justify-between py-1 border-t border-gray-200 mt-1">
            <span>Taxable Amount:</span>
            <span className="font-medium">{formatCurrency(afterDiscount)}</span>
          </div>
          
          <div className="flex justify-between py-1 text-gray-600">
            <span>CGST @ {hotelConfig.cgstRate}%:</span>
            <span>{formatCurrency(gst.cgst)}</span>
          </div>
          
          <div className="flex justify-between py-1 text-gray-600">
            <span>SGST @ {hotelConfig.sgstRate}%:</span>
            <span>{formatCurrency(gst.sgst)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-t-2 border-black mt-1 text-base font-bold">
            <span>Grand Total:</span>
            <span>{formatCurrency(gst.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      {payments.length > 0 && (
        <div className="mb-6">
          <p className="font-semibold text-gray-700 mb-2 text-xs">Payment Details</p>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left">Date</th>
                <th className="border border-gray-300 p-2 text-left">Mode</th>
                <th className="border border-gray-300 p-2 text-left">Reference</th>
                <th className="border border-gray-300 p-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="border border-gray-300 p-2">
                    {format(new Date(payment.createdAt), 'dd MMM yyyy')}
                  </td>
                  <td className="border border-gray-300 p-2">{payment.method}</td>
                  <td className="border border-gray-300 p-2">{payment.reference || '-'}</td>
                  <td className="border border-gray-300 p-2 text-right font-medium">
                    {payment.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-medium">
                <td colSpan={3} className="border border-gray-300 p-2 text-right">Total Paid:</td>
                <td className="border border-gray-300 p-2 text-right">{formatCurrency(totalPaid)}</td>
              </tr>
            </tbody>
          </table>
          
          {balanceDue > 0 && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
              <span className="font-semibold text-red-700">Balance Due: {formatCurrency(balanceDue)}</span>
            </div>
          )}
          
          {balanceDue <= 0 && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
              <span className="font-semibold text-green-700">✓ PAID IN FULL</span>
            </div>
          )}
        </div>
      )}

      {/* Terms & Conditions */}
      <div className="border-t border-gray-200 pt-4 mb-6">
        <p className="font-semibold text-gray-700 mb-2 text-xs">Terms & Conditions</p>
        <ol className="list-decimal list-inside text-[10px] text-gray-600 space-y-0.5">
          {hotelConfig.termsAndConditions.map((term, index) => (
            <li key={index}>{term}</li>
          ))}
        </ol>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end border-t border-gray-200 pt-4">
        <div className="text-[10px] text-gray-500">
          <p>This is a computer-generated invoice.</p>
          <p>Thank you for staying with us!</p>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-gray-600 mb-8">For {hotelConfig.name}</p>
          <div className="border-t border-gray-400 pt-1">
            <p className="text-[10px] text-gray-600">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component that handles print functionality
export function InvoicePrintWrapper({ 
  booking, 
  folio, 
  payments,
  onClose 
}: InvoicePrintProps & { onClose?: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-container">
      {/* Print controls - hidden when printing */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button 
          onClick={handlePrint}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90"
        >
          Print Invoice
        </button>
        {onClose && (
          <button 
            onClick={onClose}
            className="bg-muted text-muted-foreground px-4 py-2 rounded-lg font-medium hover:bg-muted/80"
          >
            Close
          </button>
        )}
      </div>
      
      <InvoicePrint booking={booking} folio={folio} payments={payments} />
    </div>
  );
}
