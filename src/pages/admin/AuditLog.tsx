 // ============================================
 // AUDIT LOG PAGE
 // View all system activity
 // ============================================
 
 import { useState, useEffect } from 'react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Input } from '@/components/ui/input';
 import { Badge } from '@/components/ui/badge';
 import { Clock, Search } from 'lucide-react';
 import { format } from 'date-fns';
 import { auditApi } from '@/services/hmsApi';
 import { AuditLog as AuditLogType } from '@/types';
 import { PageLoader } from '@/components/ui/LoadingSpinner';
 
 const actionColors: Record<string, string> = {
   BOOKING_CREATED: 'bg-success/10 text-success',
   CHECK_IN: 'bg-success/10 text-success',
   CHECK_OUT: 'bg-info/10 text-info',
   BACKDATED_CHECK_IN: 'bg-warning/10 text-warning',
   BACKDATED_CHECK_OUT: 'bg-warning/10 text-warning',
   BOOKING_CANCELLED: 'bg-destructive/10 text-destructive',
   NO_SHOW_MARKED: 'bg-destructive/10 text-destructive',
   PAYMENT_ADDED: 'bg-success/10 text-success',
   PAYMENT_EDITED: 'bg-warning/10 text-warning',
   PAYMENT_DELETED: 'bg-destructive/10 text-destructive',
   ROOM_CHANGED: 'bg-info/10 text-info',
   FOLIO_UPDATED: 'bg-info/10 text-info',
   BOOKING_UPDATED: 'bg-info/10 text-info',
 };
 
 export default function AuditLog() {
   const [logs, setLogs] = useState<AuditLogType[]>([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState('');
 
   useEffect(() => {
     loadLogs();
   }, []);
 
   const loadLogs = async () => {
     try {
       const data = await auditApi.getLogs();
       setLogs(data);
     } catch (error) {
       console.error('Failed to load audit logs:', error);
     } finally {
       setLoading(false);
     }
   };
 
   const filteredLogs = logs.filter(log => 
     log.description.toLowerCase().includes(search.toLowerCase()) ||
     log.action.toLowerCase().includes(search.toLowerCase()) ||
     log.reason?.toLowerCase().includes(search.toLowerCase())
   );
 
   if (loading) return <PageLoader />;
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div>
         <h1 className="font-display text-3xl font-bold">Audit Log</h1>
         <p className="text-muted-foreground">
           Track all system activities and changes
         </p>
       </div>
 
       {/* Search */}
       <div className="relative max-w-md">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
         <Input
           placeholder="Search logs..."
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           className="pl-10"
         />
       </div>
 
       {/* Logs */}
       <Card>
         <CardHeader className="pb-3">
           <CardTitle className="text-lg flex items-center gap-2">
             <Clock className="h-5 w-5" />
             Activity History
           </CardTitle>
         </CardHeader>
         <CardContent>
           {filteredLogs.length === 0 ? (
             <p className="text-muted-foreground text-center py-8">
               No activity recorded yet
             </p>
           ) : (
             <div className="space-y-4">
               {filteredLogs.map((log) => (
                 <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg border">
                   <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                   <div className="flex-1 min-w-0">
                     <div className="flex items-start justify-between gap-2 flex-wrap">
                       <div>
                         <p className="font-medium">{log.description}</p>
                         <Badge variant="outline" className={actionColors[log.action] || ''}>
                           {log.action.replace(/_/g, ' ')}
                         </Badge>
                       </div>
                       <p className="text-sm text-muted-foreground whitespace-nowrap">
                         {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                       </p>
                     </div>
                     {log.reason && (
                       <p className="text-sm text-muted-foreground mt-2">
                         <span className="font-medium">Reason:</span> {log.reason}
                       </p>
                     )}
                     <p className="text-xs text-muted-foreground mt-1">
                       By {log.createdBy} • {log.entityType} #{log.entityId.slice(0, 8)}
                     </p>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }