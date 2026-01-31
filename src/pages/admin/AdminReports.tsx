import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingUp, IndianRupee, Users, BedDouble } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { reportsApi } from '@/services/api';
import { DailyReport } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';

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
    { label: 'Last 7 days', from: subDays(new Date(), 7), to: new Date() },
    { label: 'Last 30 days', from: subDays(new Date(), 30), to: new Date() },
    { label: 'This Month', from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            View occupancy and revenue statistics
          </p>
        </div>
      </div>

      {/* Date Range Picker */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">From:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('justify-start text-left font-normal w-40')}>
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
                  <Button variant="outline" className={cn('justify-start text-left font-normal w-40')}>
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

            <div className="flex flex-wrap gap-2">
              {quickRanges.map((range) => (
                <Button
                  key={range.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFrom(range.from);
                    setDateTo(range.to);
                  }}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-3xl font-display font-bold">{totals.totalBookings}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Check-ins</p>
                <p className="text-3xl font-display font-bold">{totals.totalCheckins}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Check-outs</p>
                <p className="text-3xl font-display font-bold">{totals.totalCheckouts}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-display font-bold">
                  ₹{totals.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-hotel-gold/20 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-hotel-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Occupancy</p>
                <p className="text-3xl font-display font-bold">
                  {totals.avgOccupancy.toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <BedDouble className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daily Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No reports available for the selected date range
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Bookings</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Check-ins</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Check-outs</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Cash</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Online</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Occupancy</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reports.map((report) => (
                    <tr key={report.date.toString()} className="hover:bg-muted/30">
                      <td className="p-3 font-medium">
                        {format(new Date(report.date), 'EEE, MMM d')}
                      </td>
                      <td className="p-3 text-right">{report.totalBookings}</td>
                      <td className="p-3 text-right text-success">{report.totalCheckins}</td>
                      <td className="p-3 text-right text-warning">{report.totalCheckouts}</td>
                      <td className="p-3 text-right">₹{report.totalRevenueCash.toLocaleString()}</td>
                      <td className="p-3 text-right">₹{report.totalRevenueOnline.toLocaleString()}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Export report data for the selected date range
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.print()}>
                Print Report
              </Button>
              <Button variant="outline" disabled>
                Export CSV (Coming Soon)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
