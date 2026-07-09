import React from 'react';
import { Calendar } from 'lucide-react';

export const DatePicker = ({ 
  selectedDate, 
  onChange, 
  placeholderText = "Select date", 
  showIcon = true, 
  icon = <Calendar size={16} />,
  minDate = null,
  maxDate = null
}) => {
  // Format a date object as YYYY-MM-DD for input value
  const formatDateForInput = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleChange = (e) => {
    const dateValue = e.target.value;
    if (!dateValue) {
      onChange(null);
      return;
    }
    
    const newDate = new Date(dateValue);
    onChange(newDate);
  };

  return (
    <div className="relative">
      <input
        type="date"
        value={formatDateForInput(selectedDate)}
        onChange={handleChange}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10"
        placeholder={placeholderText}
        min={minDate ? formatDateForInput(minDate) : undefined}
        max={maxDate ? formatDateForInput(maxDate) : undefined}
      />
      {showIcon && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </div>
      )}
    </div>
  );
};

export default DatePicker;