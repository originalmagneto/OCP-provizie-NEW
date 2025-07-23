import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, DollarSign, Clock, Users } from 'lucide-react';
import { useCommissions } from '../context/CommissionContext';
import { useInvoices } from '../context/InvoiceContext';
import { useAuth } from '../context/AuthContext';
import type { Invoice, FirmType } from '../types';

interface CalendarEvent {
  id: string;
  date: Date;
  type: 'settlement' | 'payment' | 'referral' | 'deadline';
  title: string;
  amount?: number;
  description: string;
  status: 'pending' | 'completed' | 'overdue';
}

interface CalendarViewProps {
  className?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getEventColor = (type: string, status: string) => {
  if (status === 'overdue') return 'bg-red-100 text-red-800 border-red-200';
  
  switch (type) {
    case 'settlement':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'payment':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'referral':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'deadline':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getEventIcon = (type: string) => {
  switch (type) {
    case 'settlement':
      return <DollarSign className="h-3 w-3" />;
    case 'payment':
      return <DollarSign className="h-3 w-3" />;
    case 'referral':
      return <Users className="h-3 w-3" />;
    case 'deadline':
      return <Clock className="h-3 w-3" />;
    default:
      return <Calendar className="h-3 w-3" />;
  }
};

export default function CalendarView({ className = '' }: CalendarViewProps) {
  const { invoices } = useInvoices();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate calendar events from invoices and add some mock events
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];
    const now = new Date();

    // Add invoice-based events
    if (user?.firm) {
      invoices.forEach((invoice: Invoice) => {
        const invoiceDate = new Date(invoice.date);
        const isReceivable = invoice.referredByFirm === user.firm;
        const commissionAmount = (invoice.amount * invoice.commissionPercentage) / 100;
        
        events.push({
          id: `invoice-${invoice.id}`,
          date: invoiceDate,
          type: 'payment',
          title: isReceivable ? 'Commission Receivable' : 'Commission Payable',
          amount: commissionAmount,
          description: `${invoice.clientName} - ${invoice.referredByFirm} → ${invoice.invoicedByFirm}`,
          status: invoice.isPaid ? 'completed' : (invoiceDate < now ? 'overdue' : 'pending')
        });
      });
    }

    // Add quarterly settlement deadlines
    const currentYear = now.getFullYear();
    const quarters = [
      { month: 3, name: 'Q1' },
      { month: 6, name: 'Q2' },
      { month: 9, name: 'Q3' },
      { month: 12, name: 'Q4' }
    ];

    quarters.forEach(quarter => {
      const settlementDate = new Date(currentYear, quarter.month, 15); // 15th of the month after quarter
      events.push({
        id: `settlement-${quarter.name}-${currentYear}`,
        date: settlementDate,
        type: 'settlement',
        title: `${quarter.name} Settlement Due`,
        description: `Quarterly commission settlement deadline`,
        status: settlementDate < now ? 'overdue' : 'pending'
      });
    });

    // Add some mock referral events
    const mockReferrals = [
      {
        date: new Date(currentYear, currentDate.getMonth(), 5),
        title: 'New Referral',
        description: 'Client referral from Partner Firm'
      },
      {
        date: new Date(currentYear, currentDate.getMonth(), 12),
        title: 'Referral Follow-up',
        description: 'Follow up on pending referral'
      }
    ];

    mockReferrals.forEach((referral, index) => {
      events.push({
        id: `referral-${index}`,
        date: referral.date,
        type: 'referral',
        title: referral.title,
        description: referral.description,
        status: 'pending'
      });
    });

    return events;
  }, [invoices, user?.firm, currentDate]);

  // Get calendar grid
  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayEvents = calendarEvents.filter(event => 
        event.date.toDateString() === current.toDateString()
      );
      
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString(),
        events: dayEvents
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate, calendarEvents]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const selectedDateEvents = selectedDate 
    ? calendarEvents.filter(event => event.date.toDateString() === selectedDate.toDateString())
    : [];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Commission Calendar
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-lg font-medium px-4">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Settlements</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Payments</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Referrals</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Deadlines</span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Calendar Grid */}
        <div className="flex-1 p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {DAYS.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarGrid.map((day, index) => (
              <div
                key={index}
                className={`min-h-[120px] p-3 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                } ${
                  day.isToday ? 'bg-blue-50 border-blue-200' : ''
                } ${
                  selectedDate?.toDateString() === day.date.toDateString() ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedDate(day.date)}
              >
                <div className="text-sm font-medium mb-2">
                  {day.date.getDate()}
                </div>
                <div className="space-y-1.5">
                  {day.events.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs px-2 py-1 rounded border truncate ${
                        getEventColor(event.type, event.status)
                      }`}
                      title={event.description}
                    >
                      <div className="flex items-center space-x-1">
                        {getEventIcon(event.type)}
                        <span className="truncate">{event.title}</span>
                      </div>
                    </div>
                  ))}
                  {day.events.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{day.events.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Details Sidebar */}
        {selectedDate && (
          <div className="w-80 border-l border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            {selectedDateEvents.length === 0 ? (
              <p className="text-gray-500 text-sm">No events scheduled</p>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map(event => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border ${
                      getEventColor(event.type, event.status)
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      {getEventIcon(event.type)}
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <p className="text-sm mb-3">{event.description}</p>
                    {event.amount && (
                      <p className="text-sm font-medium">
                        Amount: €{event.amount.toLocaleString()}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.status === 'completed' ? 'bg-green-100 text-green-800' :
                        event.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}