 // ============================================
 // BOOKING DETAIL / FOLIO PAGE
 // Full stay management with billing
 // ============================================
 
 import { useState, useEffect } from 'react';
 import { useParams, useNavigate } from 'react-router-dom';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import { Separator } from '@/components/ui/separator';
 import { Badge } from '@/components/ui/badge';
 import {
   ArrowLeft,
   User,
   BedDouble,
   Calendar,
   IndianRupee,
   Plus,
   Trash2,
   LogIn,
   LogOut,
   XCircle,
   Edit,
   Clock,
   Loader2,
   Printer,
   AlertTriangle,
 } from 'lucide-react';
 import { format } from 'date-fns';
 import { bookingsApiV2, frontDeskApi, folioApi, paymentsApi, auditApi } from '@/services/hmsApi';
 import { Booking, Guest, Room, RoomType, Folio, Payment, AuditLog, LineItemType, PaymentMethod, BalanceSummary } from '@/types';
 import { PageLoader } from '@/components/ui/LoadingSpinner';
 import { StatusBadge } from '@/components/ui/StatusBadge';
 import { toast } from 'sonner';
 
 type BookingWithDetails = Booking & { guest: Guest; room: Room & { type: RoomType } };
 
 export default function BookingDetail() {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   
   const [booking, setBooking] = useState<BookingWithDetails | null>(null);
   const [folio, setFolio] = useState<Folio | null>(null);
   const [payments, setPayments] = useState<Payment[]>([]);
   const [balance, setBalance] = useState<BalanceSummary | null>(null);
   const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
   const [loading, setLoading] = useState(true);
   const [actionLoading, setActionLoading] = useState(false);
   
   // Dialogs
   const [addChargeOpen, setAddChargeOpen] = useState(false);
   const [addPaymentOpen, setAddPaymentOpen] = useState(false);
   const [cancelOpen, setCancelOpen] = useState(false);
   const [backdatedOpen, setBackdatedOpen] = useState(false);
   const [discountOpen, setDiscountOpen] = useState(false);
   
   // Form states
   const [chargeType, setChargeType] = useState<LineItemType>('FOOD');
   const [chargeDesc, setChargeDesc] = useState('');
   const [chargeQty, setChargeQty] = useState(1);
   const [chargePrice, setChargePrice] = useState(0);
   
   const [paymentAmount, setPaymentAmount] = useState(0);
   const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
   const [paymentRef, setPaymentRef] = useState('');
   const [paymentNotes, setPaymentNotes] = useState('');
   
   const [cancelReason, setCancelReason] = useState('');
   const [backdatedReason, setBackdatedReason] = useState('');
   const [backdatedAction, setBackdatedAction] = useState<'checkin' | 'checkout'>('checkin');
   
   const [discountAmount, setDiscountAmount] = useState(0);
   const [discountPercent, setDiscountPercent] = useState(0);
 
   const loadData = async () => {
     if (!id) return;
     try {
       const [bookingData, folioData, paymentsData, balanceData, logsData] = await Promise.all([
         bookingsApiV2.getBookingById(id),
         folioApi.getFolio(id),
         paymentsApi.getPayments(id),
         folioApi.getBalanceSummary(id),
         auditApi.getLogs(id),
       ]);
       setBooking(bookingData);
       setFolio(folioData);
       setPayments(paymentsData);
       setBalance(balanceData);
       setAuditLogs(logsData);
     } catch (error) {
       console.error('Failed to load booking:', error);
       toast.error('Failed to load booking');
     } finally {
       setLoading(false);
     }
   };
 
   useEffect(() => {
     loadData();
   }, [id]);
 
   const handleCheckIn = async () => {
     if (!booking) return;
     setActionLoading(true);
     try {
       await frontDeskApi.checkIn(booking.id);
       toast.success('Guest checked in');
       loadData();
     } catch (error: any) {
       toast.error(error.message);
     } finally {
       setActionLoading(false);
     }
   };
 
   const handleCheckOut = async () => {
     if (!booking) return;
     if (balance && balance.balanceDue > 0) {
       toast.error(`Outstanding balance of ₹${balance.balanceDue.toLocaleString()}. Please collect payment first.`);
       return;
     }
     setActionLoading(true);
     try {
       await frontDeskApi.checkOut(booking.id);
       toast.success('Guest checked out');
       loadData();
     } catch (error: any) {
       toast.error(error.message);
     } finally {
       setActionLoading(false);
     }
   };
 
   const handleBackdatedAction = async () => {
     if (!booking || !backdatedReason.trim()) {
       toast.error('Please provide a reason');
       return;
     }
     setActionLoading(true);
     try {
       if (backdatedAction === 'checkin') {
         await frontDeskApi.checkIn(booking.id, true, backdatedReason);
         toast.success('Backdated check-in recorded');
       } else {
         await frontDeskApi.checkOut(booking.id, true, backdatedReason);
         toast.success('Backdated check-out recorded');
       }
       setBackdatedOpen(false);
       setBackdatedReason('');
       loadData();
     } catch (error: any) {
       toast.error(error.message);
     } finally {
       setActionLoading(false);
     }
   };
 
   const handleCancel = async () => {
     if (!booking || !cancelReason.trim()) {
       toast.error('Please provide a cancellation reason');
       return;
     }
     setActionLoading(true);
     try {
       await frontDeskApi.cancelBooking(booking.id, cancelReason);
       toast.success('Booking cancelled');
       setCancelOpen(false);
       loadData();
     } catch (error: any) {
       toast.error(error.message);
     } finally {
       setActionLoading(false);
     }
   };
 
   const handleAddCharge = async () => {
     if (!folio || !chargeDesc.trim()) {
       toast.error('Please fill all fields');
       return;
     }
     setActionLoading(true);
     try {
       await folioApi.addLineItem({
         folioId: folio.id,
         type: chargeType,
         description: chargeDesc,
         quantity: chargeQty,
         unitPrice: chargePrice,
       });
       toast.success('Charge added');
       setAddChargeOpen(false);
       setChargeDesc('');
       setChargeQty(1);
       setChargePrice(0);
       loadData();
     } catch (error: any) {
       toast.error(error.message);
     } finally {
       setActionLoading(false);
     }
   };
 
   const handleRemoveCharge = async (lineItemId: string) => {
     if (!folio) return;
     try {
       await folioApi.removeLineItem(folio.id, lineItemId);
       toast.success('Charge removed');
       loadData();
     } catch (error: any) {
       toast.error(error.message);
     }
   };
 
   const handleAddPayment = async () => {
     if (!folio || !booking || paymentAmount <= 0) {
       toast.error('Please enter a valid amount');
       return;
     }
     setActionLoading(true);
     try {
       await paymentsApi.addPayment({
         folioId: folio.id,
         bookingId: booking.id,
         amount: paymentAmount,
         method: paymentMethod,
         reference: paymentRef,
         notes: paymentNotes,
       });
       toast.success('Payment recorded');
       setAddPaymentOpen(false);
       setPaymentAmount(0);
       setPaymentRef('');
       setPaymentNotes('');
       loadData();
     } catch (error: any) {
       toast.error(error.message);
     } finally {
       setActionLoading(false);
     }
   };
 
   const handleApplyDiscount = async () => {
     if (!folio) return;
     setActionLoading(true);
     try {
       await folioApi.applyDiscount(folio.id, discountAmount, discountPercent);
       toast.success('Discount applied');
       setDiscountOpen(false);
       loadData();
     } catch (error: any) {
       toast.error(error.message);
     } finally {
       setActionLoading(false);
     }
   };
 
   if (loading) return <PageLoader />;
   if (!booking) return <div>Booking not found</div>;
 
   const isInHouse = booking.status === 'IN_HOUSE' || booking.status === 'CHECKED_IN';
   const canCheckIn = booking.status === 'CONFIRMED' || booking.status === 'RESERVED';
   const canCheckOut = isInHouse;
   const canCancel = booking.status === 'CONFIRMED' || booking.status === 'RESERVED';
   const canEdit = booking.status !== 'CHECKED_OUT' && booking.status !== 'CANCELLED';
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
             <ArrowLeft className="h-5 w-5" />
           </Button>
           <div>
             <div className="flex items-center gap-2">
               <h1 className="font-display text-2xl font-bold">{booking.bookingCode}</h1>
               <StatusBadge status={booking.status} type="booking" />
             </div>
             <p className="text-muted-foreground">
               {booking.bookingType === 'WALK_IN' ? 'Walk-in' : 'Reservation'} • Created {format(new Date(booking.createdAt), 'MMM d, yyyy')}
             </p>
           </div>
         </div>
         <div className="flex flex-wrap gap-2">
           {canCheckIn && (
             <Button onClick={handleCheckIn} disabled={actionLoading} className="bg-success hover:bg-success/90">
               <LogIn className="h-4 w-4 mr-2" />
               Check In
             </Button>
           )}
           {canCheckOut && (
             <Button onClick={handleCheckOut} disabled={actionLoading} variant="secondary">
               <LogOut className="h-4 w-4 mr-2" />
               Check Out
             </Button>
           )}
           {canCancel && (
             <Button variant="destructive" onClick={() => setCancelOpen(true)}>
               <XCircle className="h-4 w-4 mr-2" />
               Cancel
             </Button>
           )}
           <Button variant="outline" onClick={() => window.print()}>
             <Printer className="h-4 w-4 mr-2" />
             Print
           </Button>
         </div>
       </div>
 
       {/* Balance Alert */}
       {balance && balance.balanceDue > 0 && (
         <Card className="border-warning bg-warning/5">
           <CardContent className="p-4 flex items-center justify-between">
             <div className="flex items-center gap-2">
               <AlertTriangle className="h-5 w-5 text-warning" />
               <span className="font-medium">Balance Due: ₹{balance.balanceDue.toLocaleString()}</span>
             </div>
             <Button size="sm" onClick={() => { setPaymentAmount(balance.balanceDue); setAddPaymentOpen(true); }}>
               Collect Payment
             </Button>
           </CardContent>
         </Card>
       )}
 
       <div className="grid lg:grid-cols-3 gap-6">
         {/* Left Column - Guest & Stay Info */}
         <div className="space-y-6">
           {/* Guest Info */}
           <Card>
             <CardHeader className="pb-3">
               <CardTitle className="text-lg flex items-center gap-2">
                 <User className="h-5 w-5" />
                 Guest Information
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-2 text-sm">
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Name</span>
                 <span className="font-medium">{booking.guest?.name}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Phone</span>
                 <span>{booking.guest?.phone}</span>
               </div>
               {booking.guest?.email && (
                 <div className="flex justify-between">
                   <span className="text-muted-foreground">Email</span>
                   <span>{booking.guest.email}</span>
                 </div>
               )}
               {booking.guest?.city && (
                 <div className="flex justify-between">
                   <span className="text-muted-foreground">City</span>
                   <span>{booking.guest.city}</span>
                 </div>
               )}
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Guests</span>
                 <span>{booking.guestsCount}</span>
               </div>
             </CardContent>
           </Card>
 
           {/* Stay Info */}
           <Card>
             <CardHeader className="pb-3">
               <CardTitle className="text-lg flex items-center gap-2">
                 <BedDouble className="h-5 w-5" />
                 Stay Details
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-2 text-sm">
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Room</span>
                 <span className="font-medium">{booking.room?.number} ({booking.room?.type?.name})</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Check-in</span>
                 <span>{format(new Date(booking.checkIn), 'EEE, MMM d, yyyy')}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Check-out</span>
                 <span>{format(new Date(booking.checkOut), 'EEE, MMM d, yyyy')}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Daily Rate</span>
                 <span>₹{booking.dailyRate?.toLocaleString()}</span>
               </div>
             </CardContent>
           </Card>
 
           {/* Backdated Operations */}
           {canEdit && (
             <Card>
               <CardHeader className="pb-3">
                 <CardTitle className="text-lg flex items-center gap-2">
                   <Clock className="h-5 w-5" />
                   Manual Operations
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-2">
                 <Button 
                   variant="outline" 
                   className="w-full justify-start"
                   onClick={() => { setBackdatedAction('checkin'); setBackdatedOpen(true); }}
                 >
                   <LogIn className="h-4 w-4 mr-2" />
                   Backdated Check-in
                 </Button>
                 <Button 
                   variant="outline" 
                   className="w-full justify-start"
                   onClick={() => { setBackdatedAction('checkout'); setBackdatedOpen(true); }}
                 >
                   <LogOut className="h-4 w-4 mr-2" />
                   Backdated Check-out
                 </Button>
               </CardContent>
             </Card>
           )}
         </div>
 
         {/* Middle Column - Folio/Invoice */}
         <div className="lg:col-span-2 space-y-6">
           {/* Invoice */}
           <Card>
             <CardHeader className="flex flex-row items-center justify-between pb-3">
               <CardTitle className="text-lg flex items-center gap-2">
                 <IndianRupee className="h-5 w-5" />
                 Invoice / Folio
               </CardTitle>
               {canEdit && (
                 <div className="flex gap-2">
                   <Button size="sm" variant="outline" onClick={() => setDiscountOpen(true)}>
                     Discount
                   </Button>
                   <Button size="sm" onClick={() => setAddChargeOpen(true)}>
                     <Plus className="h-4 w-4 mr-1" />
                     Add Charge
                   </Button>
                 </div>
               )}
             </CardHeader>
             <CardContent>
               {/* Line Items */}
               <div className="border rounded-lg overflow-hidden">
                 <table className="w-full">
                   <thead className="bg-muted/50">
                     <tr>
                       <th className="text-left p-3 text-sm font-medium">Description</th>
                       <th className="text-right p-3 text-sm font-medium">Qty</th>
                       <th className="text-right p-3 text-sm font-medium">Rate</th>
                       <th className="text-right p-3 text-sm font-medium">Total</th>
                       {canEdit && <th className="p-3 w-10"></th>}
                     </tr>
                   </thead>
                   <tbody className="divide-y">
                     {folio?.lineItems.map((item) => (
                       <tr key={item.id}>
                         <td className="p-3">
                           <div>
                             <p className="font-medium">{item.description}</p>
                             <p className="text-xs text-muted-foreground">{item.type}</p>
                           </div>
                         </td>
                         <td className="p-3 text-right">{item.quantity}</td>
                         <td className="p-3 text-right">₹{item.unitPrice.toLocaleString()}</td>
                         <td className="p-3 text-right font-medium">₹{item.total.toLocaleString()}</td>
                         {canEdit && (
                           <td className="p-3">
                             {item.type !== 'ROOM_CHARGE' && (
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 className="h-8 w-8 text-destructive"
                                 onClick={() => handleRemoveCharge(item.id)}
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             )}
                           </td>
                         )}
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
 
               {/* Totals */}
               <div className="mt-4 space-y-2 text-sm">
                 <div className="flex justify-between">
                   <span className="text-muted-foreground">Subtotal</span>
                   <span>₹{folio?.subtotal.toLocaleString()}</span>
                 </div>
                 {(folio?.discountAmount || 0) + (folio?.discountPercent || 0) > 0 && (
                   <div className="flex justify-between text-success">
                     <span>Discount</span>
                     <span>-₹{((folio?.discountAmount || 0) + (folio?.subtotal || 0) * ((folio?.discountPercent || 0) / 100)).toLocaleString()}</span>
                   </div>
                 )}
                 {(folio?.taxAmount || 0) > 0 && (
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Tax ({folio?.taxPercent}%)</span>
                     <span>₹{folio?.taxAmount.toLocaleString()}</span>
                   </div>
                 )}
                 <Separator />
                 <div className="flex justify-between text-lg font-bold">
                   <span>Grand Total</span>
                   <span>₹{folio?.grandTotal.toLocaleString()}</span>
                 </div>
               </div>
             </CardContent>
           </Card>
 
           {/* Payments */}
           <Card>
             <CardHeader className="flex flex-row items-center justify-between pb-3">
               <CardTitle className="text-lg">Payments</CardTitle>
               {canEdit && (
                 <Button size="sm" onClick={() => setAddPaymentOpen(true)}>
                   <Plus className="h-4 w-4 mr-1" />
                   Add Payment
                 </Button>
               )}
             </CardHeader>
             <CardContent>
               {payments.length === 0 ? (
                 <p className="text-muted-foreground text-sm text-center py-4">No payments recorded</p>
               ) : (
                 <div className="space-y-2">
                   {payments.map((payment) => (
                     <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                       <div>
                         <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                         <p className="text-sm text-muted-foreground">
                           {payment.method} • {format(new Date(payment.createdAt), 'MMM d, h:mm a')}
                           {payment.reference && ` • Ref: ${payment.reference}`}
                         </p>
                       </div>
                       <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                         Received
                       </Badge>
                     </div>
                   ))}
                 </div>
               )}
 
               {/* Balance Summary */}
               <div className="mt-4 p-4 rounded-lg bg-muted/30 space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Total Billed</span>
                   <span>₹{balance?.totalBilled.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Total Paid</span>
                   <span className="text-success">₹{balance?.totalPaid.toLocaleString()}</span>
                 </div>
                 <Separator />
                 <div className={`flex justify-between font-bold ${(balance?.balanceDue || 0) > 0 ? 'text-destructive' : 'text-success'}`}>
                   <span>Balance Due</span>
                   <span>₹{balance?.balanceDue.toLocaleString()}</span>
                 </div>
               </div>
             </CardContent>
           </Card>
 
           {/* Audit Log */}
           {auditLogs.length > 0 && (
             <Card>
               <CardHeader className="pb-3">
                 <CardTitle className="text-lg flex items-center gap-2">
                   <Clock className="h-5 w-5" />
                   Activity Log
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-2 max-h-48 overflow-y-auto">
                   {auditLogs.slice(0, 10).map((log) => (
                     <div key={log.id} className="flex items-start gap-3 text-sm">
                       <div className="w-2 h-2 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                       <div>
                         <p>{log.description}</p>
                         {log.reason && (
                           <p className="text-muted-foreground text-xs">Reason: {log.reason}</p>
                         )}
                         <p className="text-muted-foreground text-xs">
                           {format(new Date(log.createdAt), 'MMM d, h:mm a')} by {log.createdBy}
                         </p>
                       </div>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
           )}
         </div>
       </div>
 
       {/* Add Charge Dialog */}
       <Dialog open={addChargeOpen} onOpenChange={setAddChargeOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Add Charge</DialogTitle>
             <DialogDescription>Add additional charges to the folio</DialogDescription>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <Label>Type</Label>
               <Select value={chargeType} onValueChange={(v) => setChargeType(v as LineItemType)}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="EXTRA_BED">Extra Bed</SelectItem>
                   <SelectItem value="FOOD">Food & Beverage</SelectItem>
                   <SelectItem value="LAUNDRY">Laundry</SelectItem>
                   <SelectItem value="MISC">Miscellaneous</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div>
               <Label>Description</Label>
               <Input 
                 value={chargeDesc} 
                 onChange={(e) => setChargeDesc(e.target.value)}
                 placeholder="e.g., Room Service - Dinner"
               />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label>Quantity</Label>
                 <Input 
                   type="number" 
                   min={1}
                   value={chargeQty} 
                   onChange={(e) => setChargeQty(parseInt(e.target.value) || 1)}
                 />
               </div>
               <div>
                 <Label>Unit Price (₹)</Label>
                 <Input 
                   type="number" 
                   min={0}
                   value={chargePrice} 
                   onChange={(e) => setChargePrice(parseFloat(e.target.value) || 0)}
                 />
               </div>
             </div>
             <div className="text-right text-lg font-bold">
               Total: ₹{(chargeQty * chargePrice).toLocaleString()}
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setAddChargeOpen(false)}>Cancel</Button>
             <Button onClick={handleAddCharge} disabled={actionLoading}>
               {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
               Add Charge
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
 
       {/* Add Payment Dialog */}
       <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Record Payment</DialogTitle>
             <DialogDescription>
               Balance due: ₹{balance?.balanceDue.toLocaleString()}
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <Label>Amount (₹)</Label>
               <Input 
                 type="number" 
                 min={0}
                 value={paymentAmount} 
                 onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
               />
             </div>
             <div>
               <Label>Payment Method</Label>
               <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="CASH">Cash</SelectItem>
                   <SelectItem value="UPI">UPI</SelectItem>
                   <SelectItem value="CARD">Card</SelectItem>
                   <SelectItem value="ONLINE">Online Transfer</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div>
               <Label>Reference (optional)</Label>
               <Input 
                 value={paymentRef} 
                 onChange={(e) => setPaymentRef(e.target.value)}
                 placeholder="Transaction ID, UPI ref, etc."
               />
             </div>
             <div>
               <Label>Notes (optional)</Label>
               <Textarea 
                 value={paymentNotes} 
                 onChange={(e) => setPaymentNotes(e.target.value)}
                 placeholder="Any additional notes"
               />
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setAddPaymentOpen(false)}>Cancel</Button>
             <Button onClick={handleAddPayment} disabled={actionLoading}>
               {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
               Record Payment
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
 
       {/* Cancel Dialog */}
       <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Cancel Booking</DialogTitle>
             <DialogDescription>This action cannot be undone.</DialogDescription>
           </DialogHeader>
           <div>
             <Label>Reason for cancellation *</Label>
             <Textarea 
               value={cancelReason} 
               onChange={(e) => setCancelReason(e.target.value)}
               placeholder="Enter the reason for cancellation"
             />
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep Booking</Button>
             <Button variant="destructive" onClick={handleCancel} disabled={actionLoading}>
               {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
               Cancel Booking
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
 
       {/* Backdated Action Dialog */}
       <Dialog open={backdatedOpen} onOpenChange={setBackdatedOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Backdated {backdatedAction === 'checkin' ? 'Check-in' : 'Check-out'}</DialogTitle>
             <DialogDescription>
               This will be logged in the audit trail.
             </DialogDescription>
           </DialogHeader>
           <div>
             <Label>Reason *</Label>
             <Textarea 
               value={backdatedReason} 
               onChange={(e) => setBackdatedReason(e.target.value)}
               placeholder="e.g., Guest arrived late yesterday, forgot to record"
             />
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setBackdatedOpen(false)}>Cancel</Button>
             <Button onClick={handleBackdatedAction} disabled={actionLoading}>
               {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
               Confirm
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
 
       {/* Discount Dialog */}
       <Dialog open={discountOpen} onOpenChange={setDiscountOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Apply Discount</DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <Label>Flat Discount (₹)</Label>
               <Input 
                 type="number" 
                 min={0}
                 value={discountAmount} 
                 onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
               />
             </div>
             <div>
               <Label>Percentage Discount (%)</Label>
               <Input 
                 type="number" 
                 min={0}
                 max={100}
                 value={discountPercent} 
                 onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
               />
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setDiscountOpen(false)}>Cancel</Button>
             <Button onClick={handleApplyDiscount} disabled={actionLoading}>
               {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
               Apply Discount
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 }