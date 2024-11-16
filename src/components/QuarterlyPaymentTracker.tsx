import React, { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useInvoiceContext } from '../context/InvoiceContext';
import { useYearContext } from '../context/YearContext';

ChartJS.register(ArcElement, Tooltip, Legend);

interface QuarterlyPaymentTrackerProps {
  year: number;
}

const QuarterlyPaymentTracker: React.FC<QuarterlyPaymentTrackerProps> = ({ year }) => {
  const { invoices } = useInvoiceContext();
  const { currentYear } = useYearContext();
  const [data, setData] = useState<{ labels: string[]; datasets: { data: number[]; backgroundColor: string[] }[] }>({
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
    }],
  });

  useEffect(() => {
    const filteredInvoices = invoices.filter(invoice => new Date(invoice.date).getFullYear() === year);
    const quarterlySums = [0, 0, 0, 0];

    filteredInvoices.forEach(invoice => {
      const quarter = Math.floor(new Date(invoice.date).getMonth() / 3);
      quarterlySums[quarter] += invoice.amount;
    });

    setData({
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        data: quarterlySums,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      }],
    });
  }, [invoices, year]);

  const chartData = useMemo(() => data, [data]);

  return (
    <div className="quarterly-payment-tracker" aria-label="Quarterly Payment Tracker">
      <h2>Quarterly Payments for {year}</h2>
      <Pie 
        data={chartData} 
        options={{
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => `Quarter ${context.label}: $${context.formattedValue}`,
              },
            },
            legend: {
              position: 'bottom',
            },
          },
          responsive: true,
          maintainAspectRatio: false,
        }}
      />
      <div className="chart-controls">
        <button onClick={() => setData({ ...data, datasets: [{ ...data.datasets[0], data: [0, 0, 0, 0] }] })}>Reset</button>
        <button onClick={() => setData({ ...data, datasets: [{ ...data.datasets[0], data: data.datasets[0].data.map(d => d * 2) }] })}>Zoom In</button>
        <button onClick={() => setData({ ...data, datasets: [{ ...data.datasets[0], data: data.datasets[0].data.map(d => d / 2) }] })}>Zoom Out</button>
      </div>
    </div>
  );
};

export default QuarterlyPaymentTracker;
