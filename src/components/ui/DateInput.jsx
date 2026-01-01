import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { Calendar } from 'lucide-react';
import 'react-day-picker/style.css';

/**
 * DateInput - Button-only date picker with calendar popover
 * 
 * Features:
 * - Button/chip UI showing selected date or placeholder
 * - No text input - calendar-only interaction
 * - Calendar popover for date selection
 * - Styled to match rhine-dark theme
 * - Auto-closes after selection
 */
export default function DateInput({ value, onChange, placeholder = '---- -- --', label }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle calendar date selection
  const handleDaySelect = (date) => {
    if (!date) return;
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    
    onChange(formatted);
    setIsOpen(false); // Auto-close after selection
  };

  // Parse current value to Date object for calendar
  const selectedDate = value ? new Date(value) : undefined;

  // Display value (date or placeholder)
  const displayValue = value || placeholder;

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-2">
        {label && (
          <label className="text-xs font-mono text-gray-400 whitespace-nowrap">
            {label}
          </label>
        )}
        
        {/* Button/Chip to trigger calendar */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-2 px-3 py-1.5 text-xs font-mono border transition-all
            ${value 
              ? 'bg-rhine-green/10 text-rhine-green border-rhine-green hover:bg-rhine-green/20' 
              : 'bg-black/30 text-gray-400 border-gray-600 hover:border-rhine-green hover:text-gray-200'
            }
          `}
        >
          <Calendar size={14} />
          <span>{displayValue}</span>
        </button>
      </div>

      {/* Calendar Popover */}
      {isOpen && (
        <div 
          className="absolute left-0 top-full mt-2 z-50 bg-rhine-dark border border-rhine-green shadow-lg"
          style={{ 
            minWidth: '280px',
            boxShadow: '0 0 20px rgba(140, 198, 63, 0.2)'
          }}
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDaySelect}
            className="rdp-custom"
            classNames={{
              months: "flex flex-col",
              month: "space-y-4 p-3",
              month_caption: "flex justify-center pt-1 relative items-center text-sm font-mono text-rhine-green mb-2",
              nav: "flex items-center",
              button_previous: "absolute left-1 h-8 w-8 bg-transparent p-0 flex items-center justify-center text-gray-400 hover:text-rhine-green hover:bg-rhine-green/10 transition-all rounded border border-transparent hover:border-rhine-green/30",
              button_next: "absolute right-1 h-8 w-8 bg-transparent p-0 flex items-center justify-center text-gray-400 hover:text-rhine-green hover:bg-rhine-green/10 transition-all rounded border border-transparent hover:border-rhine-green/30",
              month_grid: "w-full border-collapse space-y-1",
              weekdays: "flex",
              weekday: "text-gray-500 w-9 font-mono text-[10px] text-center",
              week: "flex w-full mt-1",
              day: "h-9 w-9 text-center text-sm p-0 relative font-mono",
              day_button: "h-9 w-9 p-0 font-mono text-xs text-gray-300 hover:bg-rhine-green/20 hover:text-white transition-colors border border-transparent hover:border-rhine-green/50 rounded",
              selected: "bg-rhine-green text-black font-bold border-rhine-green hover:bg-rhine-green hover:text-black",
              today: "text-rhine-green font-bold",
              outside: "text-gray-600 opacity-50",
              disabled: "text-gray-700 opacity-30",
              range_middle: "aria-selected:bg-rhine-green/20 aria-selected:text-white",
              hidden: "invisible"
            }}
          />
        </div>
      )}
    </div>
  );
}
