import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface InvoiceFormProps {
  onSubmit: (invoiceData: InvoiceData) => void;
}

interface InvoiceData {
  clientName: string;
  invoiceDate: Date;
  dueDate: Date;
  amount: number;
  description: string;
  isPaid: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSubmit }) => {
  const [clientName, setClientName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const invoiceData: InvoiceData = {
      clientName,
      invoiceDate,
      dueDate,
      amount: parseFloat(amount),
      description,
      isPaid,
    };
    onSubmit(invoiceData);
    // Reset form fields
    setClientName('');
    setInvoiceDate(new Date());
    setDueDate(new Date());
    setAmount('');
    setDescription('');
    setIsPaid(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Client Name:</label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Invoice Date:</label>
        <DatePicker
          selected={invoiceDate}
          onChange={(date: Date | null) => date && setInvoiceDate(date)}
          dateFormat="MM/dd/yyyy"
          required
        />
      </div>
      <div>
        <label>Due Date:</label>
        <DatePicker
          selected={dueDate}
          onChange={(date: Date | null) => date && setDueDate(date)}
          dateFormat="MM/dd/yyyy"
          required
        />
      </div>
      <div>
        <label>Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
          />
          Paid
        </label>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default InvoiceForm;
