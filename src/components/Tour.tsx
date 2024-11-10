import React, { useState, useEffect } from "react";
import Joyride, { CallBackProps, Status, Step } from "react-joyride";

const steps: Step[] = [
  {
    target: ".dashboard-header",
    content:
      "Welcome to the Commission Dashboard! This is where you can manage all your commission-related activities.",
    placement: "bottom",
  },
  {
    target: ".invoice-form",
    content:
      "Create new invoices here. Enter client details, amount, and commission percentage.",
    placement: "right",
  },
  {
    target: ".invoice-list",
    content:
      "View and manage all invoices. Track payment status and commission details.",
    placement: "left",
  },
  {
    target: ".quarterly-overview",
    content: "Monitor quarterly commission summaries and trends.",
    placement: "top",
  },
  {
    target: ".payment-tracker",
    content: "Track commission payments between firms and manage settlements.",
    placement: "top",
  },
];

export default function Tour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const handleStartTour = () => setRun(true);
    window.addEventListener("START_TOUR", handleStartTour);
    return () => window.removeEventListener("START_TOUR", handleStartTour);
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([Status.FINISHED, Status.SKIPPED].includes(status)) {
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#4F46E5",
          textColor: "#111827",
        },
      }}
    />
  );
}
