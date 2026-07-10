import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface Option {
  id: string;
  name: string;
}

interface MultiSelectProps {
  label?: string;
  placeholder: string;
  options: Option[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  error?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  placeholder,
  options,
  selectedIds,
  onChange,
  disabled = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((x) => x !== id));
  };

  const selectedOptions = options.filter((opt) => selectedIds.includes(opt.id));
  const availableOptions = options.filter((opt) => !selectedIds.includes(opt.id));

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`min-h-[46px] w-full px-3 py-2 rounded-lg border bg-[#FAFAFA] text-gray-900 flex flex-wrap gap-1.5 items-center justify-between cursor-pointer transition-all duration-150 ${
            disabled
              ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
              : error
              ? 'border-red-500 focus:ring-2 focus:ring-red-500'
              : 'border-gray-200 hover:border-gray-300 focus-within:ring-2 focus-within:ring-[#5B7FEC]'
          }`}
        >
          {selectedOptions.length === 0 ? (
            <span className="text-gray-400 text-sm select-none">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {selectedOptions.map((opt) => (
                <span
                  key={opt.id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0F4FE] text-[#5B7FEC] border border-[#Dbe4fc]"
                >
                  {opt.name}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(opt.id, e)}
                    disabled={disabled}
                    className="ml-1 text-[#5B7FEC] hover:text-[#4A6FD8] rounded-full focus:outline-none"
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Dropdown Options List */}
        {isOpen && !disabled && (
          <div className="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto rounded-lg shadow-lg bg-white border border-gray-150 focus:outline-none">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-450 italic text-center">No options available</div>
            ) : availableOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-450 italic text-center">All options selected</div>
            ) : (
              <div className="py-1">
                {availableOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-950 transition-colors"
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-650 font-semibold">{error}</p>}
    </div>
  );
};
