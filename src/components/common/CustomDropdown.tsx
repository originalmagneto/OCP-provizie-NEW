import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, CheckIcon } from "lucide-react";

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
  disabled?: boolean;
}

export default function CustomDropdown({
  value,
  onChange,
  options,
  label,
  disabled = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2 text-left border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          ${
            disabled
              ? "bg-gray-50 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-900 hover:bg-gray-50"
          }
          flex items-center justify-between
        `}
      >
        <span>{value}</span>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon
            className={`h-5 w-5 text-gray-400 transition-transform duration-200
            ${isOpen ? "transform rotate-180" : ""}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 animate-slide-down">
          <div className="max-h-60 overflow-auto py-1 scrollbar-thin">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left px-4 py-2 text-sm flex items-center justify-between
                  ${
                    value === option
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <span>{option}</span>
                {value === option && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <CheckIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
