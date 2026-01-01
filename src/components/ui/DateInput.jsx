import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-day-picker/style.css';

/**
 * DateInput - A button-based date picker with calendar popover
 * 
 * Features:
 * - Button/chip-style trigger (no text input)
 * - Calendar popover for date selection
 * - Styled to match rhine-dark theme
 * - Fixed navigation arrows styling
 */
export default function DateInput({ value, onChange, placeholder = 'YYYY-MM-DD', label }) {
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
    setIsOpen(false);
  };

  // Parse current value to Date object for calendar
  const selectedDate = value ? new Date(value) : undefined;

  // Format display value
  const displayValue = value || placeholder;

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-2">
        {label && (
          <label className="text-xs font-mono text-gray-400 whitespace-nowrap">
            {label}
          </label>
        )}
        
        {/* Button trigger instead of text input */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-2 px-3 py-1.5 text-xs font-mono 
            bg-black/30 border transition-all
            ${value 
              ? 'text-white border-rhine-green' 
              : 'text-gray-500 border-gray-600'
            }
            hover:border-rhine-green hover:text-white
            focus:outline-none focus:border-rhine-green
          `}
          style={{ minWidth: '130px' }}
          aria-label={`Select ${label || 'date'}`}
        >
          <Calendar size={14} className={value ? 'text-rhine-green' : 'text-gray-500'} />
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
            components={{
              // Custom navigation icons with proper styling
              Chevron: (props) => {
                if (props.orientation === 'left') {
                  return <ChevronLeft className="h-4 w-4" />;
                }
                return <ChevronRight className="h-4 w-4" />;
              },
            }}
            classNames={{
              months: "flex flex-col",
              month: "space-y-4 p-3",
              month_caption: "flex justify-center pt-1 relative items-center text-sm font-mono text-rhine-green mb-2",
              nav: "flex items-center",
              button_previous: "absolute left-1 h-8 w-8 bg-black/30 border border-gray-600 hover:border-rhine-green hover:bg-black/50 p-0 flex items-center justify-center text-gray-400 hover:text-rhine-green transition-all",
              button_next: "absolute right-1 h-8 w-8 bg-black/30 border border-gray-600 hover:border-rhine-green hover:bg-black/50 p-0 flex items-center justify-center text-gray-400 hover:text-rhine-green transition-all",
              month_grid: "w-full border-collapse space-y-1",
              weekdays: "flex",
              weekday: "text-gray-500 w-9 font-mono text-[10px] text-center",
              week: "flex w-full mt-1",
              day: "h-9 w-9 text-center text-sm p-0 relative font-mono",
              day_button: "h-9 w-9 p-0 font-mono text-xs text-gray-300 hover:bg-rhine-green/20 hover:text-white transition-colors border border-transparent hover:border-rhine-green/50",
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
