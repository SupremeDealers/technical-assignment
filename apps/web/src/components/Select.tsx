import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { FaCheck } from "react-icons/fa6";

import { IconType } from "react-icons/lib";

interface Option {
  id: string | number;
  name: string;
  flag?: string;
  avatar_url?: string;
  avatar?: boolean;
  icon?: IconType;
}

interface SelectProps {
  options: Option[];
  value?: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  placeholder?: string;
  className?: string;
  height?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  bg_color?: string;
  border_color?: string;
  text_color?: string;
  accent_color?: string;
  isMulti?: boolean;
  rounded?: string;
  maxSelections?: number;
  required?: boolean;
  onValidationChange?: (isValid: boolean) => void;
  name?: string;
  form?: string;
  validate?: (isValid: boolean) => void;
  optionalLabel?: React.ReactElement;
  bottomLabel?: React.ReactElement;
  isLoading?: boolean;
  scrollToOnError?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  height = "h-[34px]",
  label,
  error,
  disabled = false,
  border_color = "border-gray-300",
  bg_color = "bg-white",
  text_color = "text-gray-700",
  accent_color = "text-gray-500",
  isMulti = false,
  rounded = "rounded-md",
  isLoading = false,
  maxSelections,
  required = false,
  onValidationChange,
  name,
  form,
  validate,
  optionalLabel,
  bottomLabel,
  scrollToOnError = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [validationError, setValidationError] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
    openUp: boolean;
  } | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const [dropdownHeight, setDropdownHeight] = useState<number>(240); // Default height

  useEffect(() => {
    if (value) {
      const selected = options.filter((opt) => value.includes(opt.id));
      setSelectedOptions(selected);
    } else {
      setSelectedOptions([]);
    }
  }, [value, options]);
  const handleBlur = () => {
    if (required && selectedOptions.length === 0) {
      setIsSubmitted(true);
      setValidationError("This field is required");
      onValidationChange?.(false);
      validate?.(false);
    }
  };
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
        handleBlur();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Expose validation method
  useEffect(() => {
    if (validate) {
      const isValid = !required || selectedOptions.length > 0;
      validate(isValid);
    }
  }, [validate, required, selectedOptions]);

  // Handle form submission
  useEffect(() => {
    if (form && name) {
      const formElement = document.getElementById(form) as HTMLFormElement;
      if (formElement) {
        const handleSubmit = (e: Event) => {
          if (required && selectedOptions.length === 0) {
            e.preventDefault();
            setIsSubmitted(true);
            setValidationError("This field is required");
            onValidationChange?.(false);
            validate?.(false);
            return false;
          }
          setIsSubmitted(false);
          setValidationError("");
          onValidationChange?.(true);
          validate?.(true);
          return true;
        };

        formElement.addEventListener("submit", handleSubmit);
        return () => formElement.removeEventListener("submit", handleSubmit);
      }
    }
  }, [form, name, required, selectedOptions, onValidationChange, validate]);

  const showError = ((isSubmitted || !isFocused) && validationError) || error;

  const handleSelect = (option: Option) => {
    if (isMulti) {
      const isSelected = selectedOptions.some((opt) => opt.id === option.id);
      let newSelectedOptions: Option[];

      if (isSelected) {
        newSelectedOptions = selectedOptions.filter(
          (opt) => opt.id !== option.id,
        );
      } else {
        if (maxSelections && selectedOptions.length >= maxSelections) {
          return;
        }
        newSelectedOptions = [...selectedOptions, option];
      }

      setSelectedOptions(newSelectedOptions);
      onChange(newSelectedOptions.map((opt) => opt.id));

      if (required) {
        const isValid = newSelectedOptions.length > 0;
        setValidationError(isValid ? "" : "This field is required");
        onValidationChange?.(isValid);
      }
      setIsFocused(false); // Remove focus after selection
    } else {
      const isSelected = selectedOptions.some((opt) => opt.id === option.id);
      if (isSelected) {
        setSelectedOptions([]);
        onChange([]);

        // Validate after clearing
        if (required) {
          setValidationError("This field is required");
          onValidationChange?.(false);
        }
      } else {
        setSelectedOptions([option]);
        onChange([option.id]);

        // Validate after selection
        if (required) {
          setValidationError("");
          onValidationChange?.(true);
        }
      }
      setIsOpen(false);
      setIsFocused(false); // Remove focus after selection
    }
  };

  const handleClear = (e: React.MouseEvent, optionId?: string | number) => {
    e.stopPropagation();
    if (isMulti && optionId) {
      const newSelectedOptions = selectedOptions.filter(
        (opt) => opt.id !== optionId,
      );
      setSelectedOptions(newSelectedOptions);
      onChange(newSelectedOptions.map((opt) => opt.id));

      // Validate after clearing
      if (required) {
        const isValid = newSelectedOptions.length > 0;
        setValidationError(isValid ? "" : "This field is required");
        onValidationChange?.(isValid);
      }
    } else {
      setSelectedOptions([]);
      onChange([]);

      // Validate after clearing
      if (required) {
        setValidationError("This field is required");
        onValidationChange?.(false);
      }
    }
  };

  const inputStyle = `flex w-full ${rounded} border text-inherit ring-offset-background file:border-0 file:text-xs file:font-medium placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus:outline-none focus:ring-2 focus-within:ring-ring focus-within:ring-offset-0 focus-within:bg-smalltext/10 focus:ring-blue-500/80  focus:ring-2 focus:border-blue-500/80 focus:ring-blue-500/80 focus-within:border-blue-500/80 disabled:cursor-not-allowed disabled:opacity-50 transition-all  hover:bg-btnblue/10 hover:bg-gray-300/10`;
  const getBorderColor = () => {
    if (showError) return "ring-2 !ring-[#ff6347] !border-[#ff6347] border"; // tomato
    if (isFocused)
      return "outline-none ring-2 ring-blue-500/80 outline-none ring-ring ring-offset-0 bg-smalltext/10 border-blue-500/80"; // use the same color as border
    return `${border_color} border`; // gray-200
  };

  const renderSelectedValue = () => {
    if (selectedOptions.length === 0) {
      return <span className={`${text_color} `}>{placeholder}...</span>;
    }

    if (isMulti) {
      return (
        <div className="flex flex-wrap gap-1 ">
          {selectedOptions.map((option) => (
            <div
              key={option.id}
              className="flex cursor-pointer items-center ring-2 gap-1 bg-smalltext/10 text-btnblue px-3 py-1 font-semibold rounded-full text-xs"
            >
              <span>{option.name}</span>
              <button
                onClick={(e) => handleClear(e, option.id)}
                className="hover:text-darkprimary cursor-pointer"
              >
                hg
                {/* <IoClose size={14} /> */}
              </button>
            </div>
          ))}
        </div>
      );
    }

    return <span className={`${text_color}`}>{selectedOptions[0].name}</span>;
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      // After dropdown renders, measure its height
      setTimeout(() => {
        if (dropdownMenuRef.current) {
          const actualHeight = dropdownMenuRef.current.offsetHeight;
          setDropdownHeight(actualHeight);

          // Scroll to selected option
          if (selectedOptions.length > 0) {
            const selectedElement = dropdownMenuRef.current.querySelector(
              '[data-selected="true"]',
            );
            if (selectedElement) {
              selectedElement.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
              });
            }
          }
        }
      }, 0);
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUp = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
      setDropdownPosition({
        top: openUp ? rect.bottom - dropdownHeight : rect.bottom,
        left: rect.left,
        width: rect.width,
        openUp,
      });
    } else {
      setDropdownPosition(null);
    }
  }, [isOpen, dropdownHeight, selectedOptions]);

  useEffect(() => {
    if (showError && dropdownRef.current && scrollToOnError) {
      dropdownRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [showError, scrollToOnError]);

  return (
    <div
      className="relative text-blueprimary w-full flex flex-col gap-0.5"
      ref={dropdownRef}
      tabIndex={-1}
    >
      {label && (
        <div className="flex justify-between items-center gap-4">
          <label
            className={`text-[11px] text-inherit font-semibold tracking-wide ${
              showError ? "text-[tomato]" : text_color
            }`}
            htmlFor={name}
          >
            {label} {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {optionalLabel && (
            <span className="text-[10px] text-btnblue">{optionalLabel}</span>
          )}
        </div>
      )}
      {isLoading ? (
        <div
          className={`relative ${height} w-full ${inputStyle} ${getBorderColor()} border  flex items-center justify-between px-3 ${className} bg-smalltext/70 animate-pulse hover:bg-smalltext/70`}
        ></div>
      ) : (
        <div
          className={`relative ${height} w-full ${inputStyle} ${getBorderColor()} border ${bg_color} flex items-center justify-between px-3 cursor-pointer ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          } ${className}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              setIsOpen(!isOpen);
              setIsFocused(true);
            }
          }}
          ref={inputRef}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={name ? `${name}-listbox` : undefined}
          aria-required={required}
          aria-invalid={!!showError}
        >
          <div className="flex-1 truncate text-xs">{renderSelectedValue()}</div>
          <div className="flex items-center gap-2"></div>
        </div>
      )}
      {required && (
        <input
          type="hidden"
          name={name}
          value={
            selectedOptions.length > 0
              ? selectedOptions.map((opt) => opt.id).join(",")
              : ""
          }
          form={form}
          required={required}
          aria-required={required}
          aria-invalid={!!showError}
        />
      )}

      {showError && (
        <p className="mt-1 text-xs text-[tomato]" role="alert">
          {validationError}
        </p>
      )}

      {isOpen &&
        dropdownPosition &&
        ReactDOM.createPortal(
          <div
            ref={dropdownMenuRef}
            className={`z-[120000] min-w-60  w-[${dropdownPosition.width}px] ${bg_color} border ${border_color} text-nblack rounded-lg shadow-lg`}
            style={{
              position: "fixed",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              maxHeight: 240,
            }}
          >
            <div className="max-h-60 p-1 flex flex-col gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 text-xs scrollbar-track-transparent">
              {options.length > 0 ? (
                options.map((option) => (
                  <div
                    key={option.id}
                    data-selected={selectedOptions.some(
                      (opt) => opt.id === option.id,
                    )}
                    className={`p-2 flex justify-between gap-2 items-center cursor-pointer rounded-md font-semibold hover:bg-black/20 text-black ${
                      selectedOptions.some((opt) => opt.id === option.id)
                        ? `bg-blue-600 text-white font-bold`
                        : "text-black"
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    <div className="flex gap-2 items-center">
                      {/* {option.icon && <option.icon fontSize={20} />} */}
                      <p className={`truncate`}>{option.name}</p>
                    </div>
                    <div className="flex gap-2 items-center h-full">
                      {selectedOptions.some((opt) => opt.id === option.id) && (
                        <FaCheck size={20} />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className={`px-3 py-2 text-black text-center`}>
                  No options available
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
      {bottomLabel && (
        <div className="flex justify-end items-center gap-4">
          <span className="text-[10px] text-btnblue">{bottomLabel}</span>
        </div>
      )}
    </div>
  );
};

export default Select;
