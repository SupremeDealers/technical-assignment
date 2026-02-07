import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";
import "./Input.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="form-field">
        {label && <label htmlFor={inputId}>{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={clsx("input", error && "input-error", className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className="field-error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="form-field">
        {label && <label htmlFor={inputId}>{label}</label>}
        <textarea
          ref={ref}
          id={inputId}
          className={clsx("textarea", error && "input-error", className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className="field-error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="form-field">
        {label && <label htmlFor={inputId}>{label}</label>}
        <select
          ref={ref}
          id={inputId}
          className={clsx("select", error && "input-error", className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span id={`${inputId}-error`} className="field-error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
