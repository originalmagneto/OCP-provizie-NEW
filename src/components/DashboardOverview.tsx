import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useYear } from '../context/YearContext';
import { useInvoices } from '../context/InvoiceContext';
import { useCommissions } from '../context/CommissionContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Euro, 
  Clock, 
  FileText,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Target,
  Activity
} from 'lucide-react';
import { StatsCard, ContentSection } from './MainContent';
import CompactQuarterlyOverview from './CompactQuarterlyOverview';
import { getFirmBranding } from '../config/firmBranding';
import type { FirmType } from '../types';
import type { SettingsData } from './SettingsModal';

interface DashboardOverviewProps {
  customSettings?: SettingsData;
}

export default function DashboardOverview({ customSettings }: DashboardOverviewProps) {
  const { user } = useAuth();
  const { currentYear, currentQuarter } = useYear();
  const { invoices } = useInvoices();
  const { isQuarterSettled } = useCommissions();

  // Helper function to check if date is in quarter
  const isInQuarter = (date: Date, year: number, quarter: number) => {
    const invoiceQuarter = Math.floor(date.getMonth() / 3) + 1;
    const invoiceYear = date.getFullYear();
    return invoiceQuarter === quarter && invoiceYear === year;
  };

  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    const currentQuarterInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return isInQuarter(invoiceDate, currentYear, currentQuarter);
    });

    const allTimeInvoices = invoices.filter(invoice => invoice.isPaid);
    
    // Current quarter metrics
    const totalRevenue = currentQuarterInvoices
      .filter(invoice => invoice.isPaid && invoice.invoicedByFirm === user?.firm)
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    const commissionsToReceive = currentQuarterInvoices
      .filter(invoice => invoice.isPaid && invoice.referredByFirm === user?.firm && invoice.invoicedByFirm !== user?.firm)
      .reduce((sum, invoice) => sum + (invoice.amount * invoice.commissionPercentage / 100), 0);

    const commissionsToPay = currentQuarterInvoices
      .filter(invoice => invoice.isPaid && invoice.invoicedByFirm === user?.firm && invoice.referredByFirm !== user?.firm)
      .reduce((sum, invoice) => sum + (invoice.amount * invoice.commissionPercentage / 100), 0);

    const pendingInvoices = invoices.filter(invoice => !invoice.isPaid).length;
    const totalInvoices = currentQuarterInvoices.length;
    const paidInvoices = currentQuarterInvoices.filter(invoice => invoice.isPaid).length;
    
    // All-time metrics for comparison
    const allTimeRevenue = allTimeInvoices
      .filter(invoice => invoice.invoicedByFirm === user?.firm)
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    const allTimeCommissionsReceived = allTimeInvoices
      .filter(invoice => invoice.referredByFirm === user?.firm && invoice.invoicedByFirm !== user?.firm)
      .reduce((sum, invoice) => sum + (invoice.amount * invoice.commissionPercentage / 100), 0);

    // Calculate trends (simplified - comparing to previous quarter)
    const prevQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
    const prevYear = currentQuarter === 1 ? currentYear - 1 : currentYear;
    
    const prevQuarterInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return isInQuarter(invoiceDate, prevYear, prevQuarter);
    });

    const prevRevenue = prevQuarterInvoices
      .filter(invoice => invoice.isPaid && invoice.invoicedByFirm === user?.firm)
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100) : 0;
    const revenueTrend: 'up' | 'down' | 'neutral' = revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'neutral';

    return {
      totalRevenue,
      commissionsToReceive,
      commissionsToPay,
      pendingInvoices,
      totalInvoices,
      paidInvoices,
      allTimeRevenue,
      allTimeCommissionsReceived,
      revenueChange: Math.abs(revenueChange),
      revenueTrend,
      paymentRate: totalInvoices > 0 ? (paidInvoices / totalInvoices * 100) : 0
    };
  }, [invoices, user, currentYear, currentQuarter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (!user) return null;

  const firmBranding = getFirmBranding(user.firm as FirmType);
  const quarterLabel = `Q${currentQuarter} ${currentYear}`;

  return (
    <div className="space-y-6">
      {/* Quarterly Commission Overview */}
      {(!customSettings?.dashboardCards || customSettings.dashboardCards.quarterlyOverview) && (
        <CompactQuarterlyOverview />
      )}

      {/* Key Performance Indicators */}
      {(!customSettings?.dashboardCards || customSettings.dashboardCards.kpiCards) && (
        <ContentSection 
          title="Key Performance Indicators" 
          subtitle={`Performance metrics for ${quarterLabel}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(!customSettings?.dashboardCards || customSettings.dashboardCards.totalRevenue) && (
              <StatsCard
                title="Total Revenue"
                value={formatCurrency(metrics.totalRevenue)}
                change={metrics.revenueChange > 0 ? `+${formatPercentage(metrics.revenueChange)}` : undefined}
                trend={metrics.revenueTrend}
                icon={<Euro className="h-6 w-6" />}
                color="green"
              />
            )}
            
            {(!customSettings?.dashboardCards || customSettings.dashboardCards.commissionsToReceive) && (
              <StatsCard
                title="Commissions to Receive"
                value={formatCurrency(metrics.commissionsToReceive)}
                icon={<TrendingUp className="h-6 w-6" />}
                color="blue"
              />
            )}
            
            {(!customSettings?.dashboardCards || customSettings.dashboardCards.commissionsToPay) && (
              <StatsCard
                title="Commissions to Pay"
                value={formatCurrency(metrics.commissionsToPay)}
                icon={<TrendingDown className="h-6 w-6" />}
                color="orange"
              />
            )}
            
            {(!customSettings?.dashboardCards || customSettings.dashboardCards.pendingInvoices) && (
              <StatsCard
                title="Pending Invoices"
                value={metrics.pendingInvoices.toString()}
                icon={<Clock className="h-6 w-6" />}
                color="red"
              />
            )}
          </div>
        </ContentSection>
      )}

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        {(!customSettings?.dashboardCards || customSettings.dashboardCards.performanceMetrics) && (
          <ContentSection 
            title="Performance Metrics" 
            subtitle="Current quarter performance"
          >
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Rate</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatPercentage(metrics.paymentRate)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                  <p className="text-xl font-bold text-gray-900">
                    {metrics.totalInvoices}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Paid Invoices</p>
                  <p className="text-xl font-bold text-gray-900">
                    {metrics.paidInvoices}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-gray-900">
                    {metrics.pendingInvoices}
                  </p>
                </div>
              </div>
            </div>
          </div>
          </ContentSection>
        )}

        {/* All-Time Summary */}
        {(!customSettings?.dashboardCards || customSettings.dashboardCards.allTimeSummary) && (
          <ContentSection 
            title="All-Time Summary" 
            subtitle="Historical performance overview"
          >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue Generated</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(metrics.allTimeRevenue)}
                  </p>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-blue-600" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Commissions Received</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(metrics.allTimeCommissionsReceived)}
                  </p>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Since</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {firmBranding.displayName} Portal
                  </p>
                </div>
              </div>
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          </ContentSection>
        )}
      </div>
    </div>
  );
}