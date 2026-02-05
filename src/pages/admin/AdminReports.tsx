// ============================================
// ADMIN REPORTS PAGE
// Register-style reports with KPIs
// ============================================

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarIcon, 
  TrendingUp, 
  IndianRupee, 
  Users, 
  BedDouble,
  Download,
  Printer,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { reportsApi } from '@/services/api';
import { DailyReport } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { MetricCard } from '@/components/admin/ui/MetricCard';
import { formatCurrency, hotelConfig } from '@/config/hotel';

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date>(endOfMonth(new Date()));
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [totals, setTotals] = useState({
    totalBookings: 0,
    totalCheckins: 0,
    totalCheckouts: 0,
    totalRevenue: 0,
    avgOccupancy: 0,
  });

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await reportsApi.getReportSummary({ dateFrom, dateTo });
      setReports(data.reports);
      setTotals(data.totals);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [dateFrom, dateTo]);

  const quickRanges = [
    { label: 'Today', from: new Date(), to: new Date() },
    { label: '7 Days', from: subDays(new Date(), 7), to: new Date() },
    { label: '30 Days', from: subDays(new Date(), 30), to: new Date() },
    { label: 'This Month', from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
  ];

  // Calculate additional KPIs
  const days = Math.max(1, differenceInDays(dateTo, dateFrom) + 1);
  const adr = totals.totalCheckins > 0 ? totals.totalRevenue / totals.totalCheckins : 0;
  const revpar = (totals.totalRevenue / days) / hotelConfig.totalRooms;

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Bookings', 'Check-ins', 'Check-outs', 'Cash', 'UPI', 'Card', 'Online', 'Occupancy %'];
    const rows = reports.map(r => [
      format(new Date(r.date), 'yyyy-MM-dd'),
      r.totalBookings,
      r.totalCheckins,
      r.totalCheckouts,
      r.totalRevenueCash,
      r.totalRevenueUPI,
      r.totalRevenueCard,
      r.totalRevenueOnline,
      r.occupancyRate,
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${format(dateFrom, 'yyyyMMdd')}_${format(dateTo, 'yyyyMMdd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title="Reports"
        subtitle={`${format(dateFrom, 'MMM d')} - ${format(dateTo, 'MMM d, yyyy')}`}
        onRefresh={loadReports}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        }
      />

      {/* Date Range Picker */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">From:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-36">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateFrom, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => date && setDateFrom(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">To:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-36">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateTo, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => date && setDateTo(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-wrap gap-1 ml-auto">
              {quickRanges.map((range) => (
                <Button
                  key={range.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFrom(range.from);
                    setDateTo(range.to);
                  }}
                  className="text-xs h-7 px-2"
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Total Bookings"
          value={totals.totalBookings}
          icon={<CalendarIcon className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
        />
        <MetricCard
          title="Check-ins"
          value={totals.totalCheckins}
          icon={<Users className="h-5 w-5 text-success" />}
          iconBg="bg-success/10"
        />
        <MetricCard
          title="Check-outs"
          value={totals.totalCheckouts}
          icon={<Users className="h-5 w-5 text-warning" />}
          iconBg="bg-warning/10"
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totals.totalRevenue)}
          icon={<IndianRupee className="h-5 w-5 text-hotel-gold" />}
          iconBg="bg-hotel-gold/20"
        />
        <MetricCard
          title="Avg Occupancy"
          value={`${totals.avgOccupancy.toFixed(0)}%`}
          icon={<BedDouble className="h-5 w-5 text-info" />}
          iconBg="bg-info/10"
        />
        <MetricCard
          title="ADR"
          value={formatCurrency(adr)}
          subtitle="Avg Daily Rate"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
        />
      </div>

      {/* RevPAR Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Revenue Per Available Room (RevPAR)</p>
              <p className="text-3xl font-display font-bold">{formatCurrency(revpar)}</p>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-muted-foreground">Days in period</p>
                <p className="font-medium">{days}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total rooms</p>
                <p className="font-medium">{hotelConfig.totalRooms}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Room nights available</p>
                <p className="font-medium">{days * hotelConfig.totalRooms}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Reports Table */}
      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Daily Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No data available for the selected period
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Bookings</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">In</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Out</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Cash</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">UPI</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Card</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Online</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Occ %</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reports.map((report) => {
                    const totalDayRevenue = report.totalRevenueCash + report.totalRevenueUPI + 
                      report.totalRevenueCard + report.totalRevenueOnline;
                    return (
                      <tr key={report.date.toString()} className="hover:bg-muted/30">
                        <td className="p-3 font-medium">
                          {format(new Date(report.date), 'EEE, MMM d')}
                        </td>
                        <td className="p-3 text-right">{report.totalBookings}</td>
                        <td className="p-3 text-right text-success">{report.totalCheckins}</td>
                        <td className="p-3 text-right text-warning">{report.totalCheckouts}</td>
                        <td className="p-3 text-right">{formatCurrency(report.totalRevenueCash)}</td>
                        <td className="p-3 text-right">{formatCurrency(report.totalRevenueUPI)}</td>
                        <td className="p-3 text-right">{formatCurrency(report.totalRevenueCard)}</td>
                        <td className="p-3 text-right">{formatCurrency(report.totalRevenueOnline)}</td>
                        <td className="p-3 text-right">
                          <span className={cn(
                            'font-medium',
                            report.occupancyRate >= 70 && 'text-success',
                            report.occupancyRate >= 40 && report.occupancyRate < 70 && 'text-warning',
                            report.occupancyRate < 40 && 'text-muted-foreground'
                          )}>
                            {report.occupancyRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 font-medium">
                    <td className="p-3">Total</td>
                    <td className="p-3 text-right">{totals.totalBookings}</td>
                    <td className="p-3 text-right text-success">{totals.totalCheckins}</td>
                    <td className="p-3 text-right text-warning">{totals.totalCheckouts}</td>
                    <td className="p-3 text-right" colSpan={4}>
                      {formatCurrency(totals.totalRevenue)}
                    </td>
                    <td className="p-3 text-right">{totals.avgOccupancy.toFixed(0)}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
