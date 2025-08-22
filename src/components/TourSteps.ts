import { TourType } from './CustomTour';

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  offset?: { x: number; y: number };
  disableInteraction?: boolean;
}

export const tourSteps: Record<TourType, TourStep[]> = {
  overview: [
    {
      target: 'body',
      title: 'Welcome to Your Commission Platform',
      content: 'This comprehensive tour will guide you through all features and workflows. Learn to navigate, manage invoices, track commissions, and understand every element in the system.',
      placement: 'center'
    },
    {
      target: '#nav-dashboard',
      title: 'Dashboard Overview',
      content: 'Monitor key metrics: revenue cards, commission tracking, pending payments, and performance trends all in one place.',
      placement: 'right'
    },
    {
      target: '#nav-all-invoices',
      title: 'Invoice Management',
      content: 'View and manage all your invoices. Track payment status, edit details, and monitor invoice history.',
      placement: 'right'
    },
    {
      target: '#nav-create-new',
      title: 'Create New Invoice',
      content: 'Quickly create new invoices with client details, amounts, and commission settings.',
      placement: 'right'
    },
    {
      target: '#nav-pending-payments',
      title: 'Pending Payments',
      content: 'Track outstanding invoices and manage payment follow-ups.',
      placement: 'right'
    },
    {
      target: '#nav-commission-settlement',
      title: 'Commission Settlement',
      content: 'Track quarterly commissions, view settlement status, and manage commission calculations by quarter.',
      placement: 'right'
    },
    {
      target: '#nav-analytics',
      title: 'Analytics & Reports',
      content: 'Access performance metrics, visual charts, export options, and key performance indicators.',
      placement: 'right'
    },
    {
      target: '#nav-referral-overview',
      title: 'Referral Partners',
      content: 'Manage referral partners, track performance, and handle commission relationships with other firms.',
      placement: 'right'
    },
    {
      target: 'body',
      title: 'Commission Workflow Explained',
      content: 'Create invoices → Track payments → Calculate commissions → Generate quarterly settlements → Analyze performance. This cycle drives your commission management.',
      placement: 'center'
    }
  ],

  'invoice-workflow': [
    {
      target: 'body',
      title: 'Invoice Management Guide',
      content: 'Master invoice creation, editing, settlement tracking, and payment processing with this comprehensive workflow.',
      placement: 'center'
    },
    {
      target: '#nav-all-invoices',
      title: 'All Invoices',
      content: 'View and manage all your invoices. Track payment status, edit details, and monitor invoice history.',
      placement: 'right'
    },
    {
      target: '#nav-create-new',
      title: 'Create New Invoice',
      content: 'Click here to create a new invoice. This opens the invoice creation form with all necessary fields.',
      placement: 'right'
    },
    {
      target: '#nav-pending-payments',
      title: 'Pending Payments',
      content: 'Track outstanding invoices and manage payment follow-ups. Monitor which invoices still need payment.',
      placement: 'right'
    },
    {
      target: '#dashboard-overview',
      title: 'Dashboard Overview',
      content: 'Your main dashboard shows key metrics including total revenue, commissions, and pending invoices.',
      placement: 'center'
    },
    {
      target: '#kpi-cards',
      title: 'Key Performance Indicators',
      content: 'Monitor your financial performance with real-time metrics including revenue, commissions, and invoice counts.',
      placement: 'top'
    },
    {
      target: '#quarterly-overview',
      title: 'Quarterly Overview',
      content: 'Track commission performance by quarter and view settlement status for each period.',
      placement: 'top'
    }
  ],

  'commission-workflow': [
    {
      target: 'body',
      title: 'Commission Management Guide',
      content: 'Learn to track quarterly commissions, manage settlements, and navigate between different time periods.',
      placement: 'center'
    },
    {
      target: '#nav-commission-settlement',
      title: 'Commission Settlement',
      content: 'Your central location for tracking all commission-related activities by quarter.',
      placement: 'right'
    },
    {
      target: '#quarterly-commissions',
      title: 'Commission Overview',
      content: 'View detailed commission breakdown by quarter, track settlement status, and manage commission payments.',
      placement: 'center'
    },
    {
      target: 'select.rounded-lg.border-gray-300',
      title: 'Quarter Selection',
      content: 'Switch between different quarters to view historical commission data and settlement status.',
      placement: 'left'
    }
  ],

  analytics: [
    {
      target: 'body',
      title: 'Analytics Dashboard Guide',
      content: 'Explore comprehensive analytics to understand your business performance and commission trends.',
      placement: 'center'
    },
    {
      target: '#nav-analytics',
      title: 'Analytics Section',
      content: 'Access detailed reports, charts, and insights about your commission business.',
      placement: 'right'
    },
    {
      target: '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4.gap-6',
      title: 'Analytics Metrics',
      content: 'View key performance metrics including total revenue, commissions, and invoice statistics for your selected time period.',
      placement: 'top'
    },
    {
      target: '.grid.grid-cols-1.lg\\:grid-cols-2.gap-6',
      title: 'Performance Charts',
      content: 'Analyze trends with interactive charts showing revenue patterns, commission distribution, and performance over time.',
      placement: 'top'
    }
  ],

  admin: [
    {
      target: 'body',
      title: 'Admin Panel Guide',
      content: 'Manage system settings, user accounts, and configure commission structures.',
      placement: 'center'
    },
    {
      target: '#nav-user-management',
      title: 'User Management',
      content: 'Add, edit, or remove user accounts and manage access permissions.',
      placement: 'right'
    },
    {
      target: '#dashboard-overview',
      title: 'Admin Dashboard',
      content: 'Your administrative overview showing system metrics and user activity.',
      placement: 'center'
    }
  ],

  referrals: [
    {
      target: 'body',
      title: 'Referral Management Guide',
      content: 'Manage your referral partnerships and track commission relationships with other firms.',
      placement: 'center'
    },
    {
      target: '#nav-referral-overview',
      title: 'Referral Partners',
      content: 'View and manage your referral partners, track performance, and handle commission agreements.',
      placement: 'right'
    },
    {
      target: 'body',
      title: 'Referral Dashboard',
      content: 'Monitor referral performance, track commission flows between firms, and manage partnership relationships.',
      placement: 'center'
    }
  ]
};

export default tourSteps;