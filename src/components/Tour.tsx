import React from "react";
import Joyride, { CallBackProps, Step, STATUS } from "react-joyride";

const steps: Step[] = [
  {
    target: ".dashboard-header",
    content:
      "Welcome to the Commission Dashboard! This is where you can manage all your commission-related activities.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "#invoice-form",
    content:
      "Create new invoices here. Enter client details, amount, and commission percentage.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "#invoice-list",
    content:
      "View and manage all invoices. Track payment status and commission details.",
    placement: "left",
    disableBeacon: true,
  },
  {
    target: "#quarterly-overview",
    content: "Monitor quarterly commission summaries and trends.",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: "#payment-tracker",
    content: "Track commission payments between firms and manage settlements.",
    placement: "top",
    disableBeacon: true,
  },
];

interface TourProps {
  isRunning: boolean;
  onTourEnd: () => void;
}

export default function Tour({ isRunning, onTourEnd }: TourProps) {
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      onTourEnd();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={isRunning}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      spotlightClicks
      disableScrolling={false}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#4F46E5",
          textColor: "#111827",
          zIndex: 1000,
        },
        spotlight: {
          borderRadius: "8px",
        },
        tooltip: {
          padding: 20,
          borderRadius: "8px",
        },
        buttonNext: {
          backgroundColor: "#4F46E5",
          padding: "8px 16px",
          borderRadius: "6px",
        },
        buttonBack: {
          marginRight: 10,
          padding: "8px 16px",
          borderRadius: "6px",
        },
        buttonSkip: {
          padding: "8px 16px",
          borderRadius: "6px",
        },
      }}
      locale={{
        back: "Previous",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip tour",
      }}
    />
  );
}
