import React, { useMemo } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import { useCommissions } from '../context/CommissionContext';
import { useAuth } from '../context/AuthContext';
import { calculateCommissions, groupCommissionsBySettlement } from '../utils/commissionCalculator';
import QuarterlyCommissionCard from './QuarterlyCommissionCard';
import type { Commission, CommissionGroup } from '../types';

interface QuarterlyData {
  quarter: string;
  year: number;
  quarterNumber: number;
  eligibleCommissions: {
    fromFirm: string;
    amount: number;
    isSettled: boolean;
    invoiceIds: string[];
    isPaying: boolean;
    settlementGroup: string;
  }[];
}

interface CommissionGroup {
  batchKey: string | null;
  commissions: Commission[];
  isSettled: boolean;
}

function QuarterlyCommissions() {
  const { user } = useAuth();
  const { invoices } = useInvoices();
  const { isQuarterSettled, settleQuarter, getSettledInvoiceIds, getSettlementBatch, unsettleQuarter } = useCommissions();
  const [selectedQuarter, setSelectedQuarter] = React.useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
  });

  const quarterlyData = useMemo(() => {
    if (!invoices || !user?.firm) return [];

    const data: { [key: string]: QuarterlyData } = {};

    // First, filter out unpaid invoices
    const paidInvoices = invoices.filter(invoice => invoice.isPaid === true);

    paidInvoices.forEach((invoice) => {
      if (!invoice.isPaid) return;

      const date = new Date(invoice.date);
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const year = date.getFullYear();
      const quarterKey = `${year}-Q${quarter}`;

      if (!data[quarterKey]) {
        data[quarterKey] = {
          quarter: quarterKey,
          year,
          quarterNumber: quarter,
          eligibleCommissions: []
        };
      }

      if (invoice.referredByFirm === user.firm) {
        const settlementKey = `${quarterKey}-${invoice.invoicedByFirm}-${user.firm}`;
        const batchKey = getSettlementBatch(quarterKey, invoice.invoicedByFirm, invoice.id);
        const isInvoiceSettled = isQuarterSettled(quarterKey, invoice.invoicedByFirm, invoice.id);
        
        // Generate a unique settlement group for each batch
        // If invoice is not settled, check if there are any settled invoices for this quarter/firm combination
        const hasSettledInvoices = getSettledInvoiceIds(quarterKey, invoice.invoicedByFirm).length > 0;
        const settlementGroup = batchKey || 
          (hasSettledInvoices ? `new-batch-${settlementKey}` : `unsettled-${settlementKey}`);

        let existingCommission = data[quarterKey].eligibleCommissions.find(
          comm => comm.fromFirm === invoice.invoicedByFirm && 
                 !comm.isPaying && 
                 comm.settlementGroup === settlementGroup
        );

        const amount = invoice.amount * (invoice.commissionPercentage / 100);

        if (existingCommission) {
          existingCommission.amount += amount;
          existingCommission.invoiceIds.push(invoice.id);
        } else {
          data[quarterKey].eligibleCommissions.push({
            fromFirm: invoice.invoicedByFirm,
            amount,
            isPaying: false,
            isSettled: isInvoiceSettled,
            invoiceIds: [invoice.id],
            settlementGroup
          });
        }
      }

      if (invoice.invoicedByFirm === user.firm && invoice.referredByFirm !== user.firm) {
        const settlementKey = `${quarterKey}-${user.firm}-${invoice.referredByFirm}`;
        const batchKey = getSettlementBatch(quarterKey, invoice.referredByFirm, invoice.id);
        const isInvoiceSettled = isQuarterSettled(quarterKey, invoice.referredByFirm, invoice.id);

        // Generate a unique settlement group for each batch
        // If invoice is not settled, check if there are any settled invoices for this quarter/firm combination
        const hasSettledInvoices = getSettledInvoiceIds(quarterKey, invoice.referredByFirm).length > 0;
        const settlementGroup = batchKey || 
          (hasSettledInvoices ? `new-batch-${settlementKey}` : `unsettled-${settlementKey}`);

        let existingCommission = data[quarterKey].eligibleCommissions.find(
          comm => comm.fromFirm === invoice.referredByFirm && 
                 comm.isPaying && 
                 comm.settlementGroup === settlementGroup
        );

        const amount = invoice.amount * (invoice.commissionPercentage / 100);

        if (existingCommission) {
          existingCommission.amount += amount;
          existingCommission.invoiceIds.push(invoice.id);
        } else {
          data[quarterKey].eligibleCommissions.push({
            fromFirm: invoice.referredByFirm,
            amount,
            isPaying: true,
            isSettled: isInvoiceSettled,
            invoiceIds: [invoice.id],
            settlementGroup
          });
        }
      }
    });

    return Object.values(data);
  }, [invoices, user?.firm, getSettledInvoiceIds]);

  const quarterlyCommissionGroups = useMemo(() => {
    if (!user?.firm) return [];

    // Get all settled invoice IDs for this quarter
    const settledInvoiceIds = getSettledInvoiceIds(selectedQuarter, user.firm);

    // Filter invoices for this quarter
    const quarterInvoices = invoices.filter(invoice => 
      invoice.quarterKey === selectedQuarter && 
      invoice.paid
    );

    // Calculate all commissions for this quarter
    const allCommissions = quarterInvoices.flatMap(invoice => 
      calculateCommissions(invoice, user.firm)
    );

    // Group commissions by settlement batch
    const groupedCommissions = groupCommissionsBySettlement(
      allCommissions,
      selectedQuarter,
      getSettlementBatch
    );

    // Convert to array of CommissionGroup objects
    const groups: CommissionGroup[] = [];
    
    groupedCommissions.forEach((commissions, batchKey) => {
      groups.push({
        batchKey,
        commissions,
        isSettled: batchKey !== null
      });
    });

    return groups;
  }, [selectedQuarter, invoices, user?.firm, getSettlementBatch]);

  const handleSettleCommission = React.useCallback(async (firm: string, invoiceIds: string[]) => {
    if (!user?.firm) return;
    
    try {
      const settlementKey = `${selectedQuarter}-${firm}-${user.firm}`;
      await settleQuarter(settlementKey, firm, invoiceIds);
      console.log('Settlement completed for:', settlementKey, 'with invoices:', invoiceIds);
    } catch (error) {
      console.error('Error settling commission:', error);
    }
  }, [selectedQuarter, settleQuarter, user?.firm]);

  if (!user?.firm) {
    return null;
  }

  const sortedQuarterlyData = [...quarterlyData].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.quarterNumber - a.quarterNumber;
  });

  const selectedQuarterData = sortedQuarterlyData.find(data => data.quarter === selectedQuarter);

  const { totalToReceive, totalToPay, receiveCount, payCount } = useMemo(() => {
    if (!selectedQuarterData) return { totalToReceive: 0, totalToPay: 0, receiveCount: 0, payCount: 0 };

    return selectedQuarterData.eligibleCommissions.reduce(
      (acc, commission) => {
        if (commission.isPaying) {
          acc.totalToPay += commission.amount;
          if (!commission.isSettled) acc.payCount++;
        } else {
          acc.totalToReceive += commission.amount;
          if (!commission.isSettled) acc.receiveCount++;
        }
        return acc;
      },
      { totalToReceive: 0, totalToPay: 0, receiveCount: 0, payCount: 0 }
    );
  }, [selectedQuarterData]);

  const quarters = useMemo(() => {
    return [
      { label: 'Q1', months: 'Jan - Mar', hasUnpaidInvoices: false, hasUnsettledCommissions: false },
      { label: 'Q2', months: 'Apr - Jun', hasUnpaidInvoices: false, hasUnsettledCommissions: false },
      { label: 'Q3', months: 'Jul - Sep', hasUnpaidInvoices: false, hasUnsettledCommissions: false },
      { label: 'Q4', months: 'Oct - Dec', hasUnpaidInvoices: false, hasUnsettledCommissions: false },
    ];
  }, []);

  const commissionSummary = useMemo(() => {
    return {
      toReceive: totalToReceive,
      toPay: totalToPay,
    };
  }, [totalToReceive, totalToPay]);

  const commissionsToReceive = useMemo(() => {
    const result: { [firm: string]: { amount: number, unpaidInvoices: number } } = {};

    selectedQuarterData?.eligibleCommissions.forEach(commission => {
      if (!commission.isPaying) {
        if (!result[commission.fromFirm]) {
          result[commission.fromFirm] = { amount: 0, unpaidInvoices: 0 };
        }

        result[commission.fromFirm].amount += commission.amount;
        result[commission.fromFirm].unpaidInvoices += commission.invoiceIds.length;
      }
    });

    return result;
  }, [selectedQuarterData]);

  const commissionsToPay = useMemo(() => {
    const result: { [firm: string]: { amount: number, unpaidInvoices: number, requiresAction: boolean } } = {};

    selectedQuarterData?.eligibleCommissions.forEach(commission => {
      if (commission.isPaying) {
        if (!result[commission.fromFirm]) {
          result[commission.fromFirm] = { amount: 0, unpaidInvoices: 0, requiresAction: false };
        }

        result[commission.fromFirm].amount += commission.amount;
        result[commission.fromFirm].unpaidInvoices += commission.invoiceIds.length;
        result[commission.fromFirm].requiresAction = !commission.isSettled;
      }
    });

    return result;
  }, [selectedQuarterData]);

  const handleCurrentQuarter = React.useCallback(() => {
    const now = new Date();
    setSelectedQuarter(`${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`);
  }, []);

  const handlePrevQuarter = React.useCallback(() => {
    const currentQuarter = selectedQuarter.split('-')[1];
    const newQuarter = parseInt(currentQuarter) - 1;
    setSelectedQuarter(`${selectedQuarter.split('-')[0]}-Q${newQuarter}`);
  }, [selectedQuarter]);

  const handleNextQuarter = React.useCallback(() => {
    const currentQuarter = selectedQuarter.split('-')[1];
    const newQuarter = parseInt(currentQuarter) + 1;
    setSelectedQuarter(`${selectedQuarter.split('-')[0]}-Q${newQuarter}`);
  }, [selectedQuarter]);

  const canNavigatePrev = useMemo(() => {
    const currentQuarter = selectedQuarter.split('-')[1];
    return parseInt(currentQuarter) > 1;
  }, [selectedQuarter]);

  const canNavigateNext = useMemo(() => {
    const currentQuarter = selectedQuarter.split('-')[1];
    return parseInt(currentQuarter) < 4;
  }, [selectedQuarter]);

  const isYearDropdownOpen = false;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="space-y-6">
        {/* Quarter Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="relative">
                <button className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-lg font-semibold text-gray-900">{selectedQuarterData?.year}</span>
                  <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isYearDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>
              </div>
              <button
                className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                onClick={handleCurrentQuarter}
              >
                <Clock className="h-4 w-4 mr-1.5" />
                Current Quarter
              </button>
            </div>
          </div>

          {/* Quarter Navigation */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevQuarter}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canNavigatePrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <ArrowLeftRight className="h-4 w-4" />
                <span>Navigate between quarters</span>
              </div>
              <button
                onClick={handleNextQuarter}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canNavigateNext}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Quarter Grid */}
            <div className="grid grid-cols-4 gap-3">
              {quarters.map((q, index) => (
                <button
                  key={q.label}
                  onClick={() => setSelectedQuarter(`${selectedQuarterData?.year}-Q${index + 1}`)}
                  className={`
                    relative p-3 rounded-lg text-left transition-all duration-200
                    ${
                      selectedQuarter === `${selectedQuarterData?.year}-Q${index + 1}`
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex flex-col min-h-[4rem]">
                    <div className="flex-grow">
                      <div className="font-semibold">Q{index + 1}</div>
                      <div className={`text-xs mt-1 ${
                        selectedQuarter === `${selectedQuarterData?.year}-Q${index + 1}` ? 'text-indigo-100' : 'text-gray-500'
                      }`}>
                        {q.months}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2 justify-end">
                      {selectedQuarter === `${selectedQuarterData?.year}-Q${index + 1}` && (
                        <div className={`
                          text-xs px-1.5 py-0.5 rounded-full
                          ${selectedQuarter === `${selectedQuarterData?.year}-Q${index + 1}` ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'}
                        `}>
                          Current
                        </div>
                      )}
                      {q.hasUnpaidInvoices && (
                        <div className={`
                          flex items-center px-1.5 py-0.5 rounded-full
                          ${selectedQuarter === `${selectedQuarterData?.year}-Q${index + 1}` ? 'bg-indigo-500' : 'bg-amber-100'}
                        `} title="Has unpaid invoices">
                          <AlertCircle className={`h-3 w-3 ${
                            selectedQuarter === `${selectedQuarterData?.year}-Q${index + 1}` ? 'text-white' : 'text-amber-600'
                          }`} />
                        </div>
                      )}
                      {q.hasUnsettledCommissions && (
                        <div className={`
                          flex items-center px-1.5 py-0.5 rounded-full
                          ${selectedQuarter === `${selectedQuarterData?.year}-Q${index + 1}` ? 'bg-indigo-500' : 'bg-gray-200'}
                        `} title="Has unsettled commissions">
                          <CircleDollarSign className={`h-3 w-3 ${
                            selectedQuarter === `${selectedQuarterData?.year}-Q${index + 1}` ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Commission Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm font-medium text-green-700">To Receive</div>
            <div className="mt-2 text-2xl font-semibold text-gray-900">
              {commissionSummary.toReceive.toFixed(2)}&nbsp;€
            </div>
            <div className="mt-1 text-sm text-green-600">From all partners</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-700">To Pay</div>
            <div className="mt-2 text-2xl font-semibold text-gray-900">
              {commissionSummary.toPay.toFixed(2)}&nbsp;€
            </div>
            <div className="mt-1 text-sm text-blue-600">To all partners</div>
          </div>
        </div>

        {/* Commission Details */}
        <div className="grid grid-cols-2 gap-6">
          {/* Commissions to Receive */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Commissions to Receive</h3>
            <div className="space-y-3">
              {Object.entries(commissionsToReceive).map(([firm, data]) => (
                <div key={firm} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{firm}</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">
                          {data.unpaidInvoices > 0
                            ? "Some invoices pending payment"
                            : "All invoices paid"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900">
                        {data.amount.toFixed(2)}&nbsp;€
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Clock className="w-4 h-4 mr-1" />
                        Pending Payments
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commissions to Pay */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Commissions to Pay</h3>
            <div className="space-y-3">
              {Object.entries(commissionsToPay).map(([firm, data]) => (
                <div
                  key={firm}
                  className={`p-4 bg-white rounded-lg border ${
                    data.requiresAction ? 'border-red-300 shadow-md' : 'border-gray-200 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{firm}</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">
                          {data.unpaidInvoices > 0
                            ? "Some invoices pending payment"
                            : "All invoices paid"}
                        </p>
                        {data.requiresAction && (
                          <p className="text-sm text-red-600 font-medium">
                            Commission payment required
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900">
                        {data.amount.toFixed(2)}&nbsp;€
                      </p>
                      {data.requiresAction && (
                        <div className="flex flex-col items-end space-y-1">
                          <span className="text-sm text-red-600">
                            Waiting for {firm} to confirm
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Batched Settlements */}
        <div className="space-y-4">
          {quarterlyCommissionGroups.map((group, index) => (
            <QuarterlyCommissionCard
              key={group.batchKey || `unsettled-${index}`}
              quarterKey={selectedQuarter}
              commissions={group.commissions}
              isSettled={group.isSettled}
              batchKey={group.batchKey}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuarterlyCommissions;
