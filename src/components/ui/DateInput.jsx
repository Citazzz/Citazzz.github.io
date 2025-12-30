import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { Calendar } from 'lucide-react';
import 'react-day-picker/style.css';

/**
 * DateInput - A styled date input component with calendar picker
 * 
 * Features:
 * - Manual text input with YYYY-MM-DD format
 * - Calendar popover for date selection
 * - Styled to match rhine-dark theme
 * - Validation and normalization
 */
export default function DateInput({ value, onChange, placeholder = 'YYYY-MM-DD', label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync with external value changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

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

  // Normalize date string to YYYY-MM-DD format
  const normalizeDate = (dateStr) => {
    if (!dateStr) return '';
    
    // Try to parse the date
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    
    const [year, month, day] = parts;
    
    // Validate ranges
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    
    if (isNaN(y) || isNaN(m) || isNaN(d)) return dateStr;
    if (m < 1 || m > 12 || d < 1 || d > 31) return dateStr;
    
    // Normalize to YYYY-MM-DD
    return `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  };

  // Validate date string
  const isValidDate = (dateStr) => {
    if (!dateStr) return true; // Empty is valid
    
    const dateRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;
    if (!dateRegex.test(dateStr)) return false;
    
    // Parse and validate the actual date
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    // Check month and day ranges
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    // Create date and verify it matches the input
    // This catches invalid dates like Feb 31
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || 
        date.getMonth() !== month - 1 || 
        date.getDate() !== day) {
      return false;
    }
    
    return true;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Clear error while typing
    if (hasError) setHasError(false);
  };

  // Handle input blur - validate and normalize
  const handleBlur = () => {
    if (!inputValue) {
      setHasError(false);
      onChange('');
      return;
    }

    const normalized = normalizeDate(inputValue);
    
    if (isValidDate(normalized)) {
      setInputValue(normalized);
      onChange(normalized);
      setHasError(false);
    } else {
      // Clear the invalid input
      setInputValue('');
      onChange('');
      setHasError(true);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
      inputRef.current?.blur();
    }
  };

  // Handle calendar date selection
  const handleDaySelect = (date) => {
    if (!date) return;
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    
    setInputValue(formatted);
    onChange(formatted);
    setHasError(false);
    setIsOpen(false);
  };

  // Parse current value to Date object for calendar
  const selectedDate = inputValue && isValidDate(inputValue) ? new Date(inputValue) : undefined;

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-2">
        {label && (
          <label className="text-xs font-mono text-gray-400 whitespace-nowrap">
            {label}
          </label>
        )}
        
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`
              bg-black/30 text-white border px-3 py-1.5 text-xs font-mono 
              focus:outline-none transition-colors pr-8
              ${hasError 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-600 focus:border-rhine-green'
              }
            `}
            style={{ width: '130px' }}
          />
          
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-1 p-1 text-gray-400 hover:text-rhine-green transition-colors"
            aria-label="Open calendar"
          >
            <Calendar size={16} />
          </button>
        </div>
      </div>

      {/* Error message */}
      {hasError && (
        <div className="absolute left-0 top-full mt-1 text-[10px] text-red-500 font-mono">
          Invalid date format
        </div>
      )}

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
              button_previous: "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-400 hover:text-rhine-green transition-colors",
              button_next: "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-400 hover:text-rhine-green transition-colors",
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
