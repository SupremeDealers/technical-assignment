import { useState } from "react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

interface InputProps {
  label: string;
  type?: "text" | "email" | "password" | "textarea";
  name: string;
  placeholder: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  error?: string;
}

export const Input = ({
  label,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  error,
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const isTextarea = type === "textarea";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="flex flex-col gap-0.5">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {isTextarea ? (
          <textarea
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
            className={`w-full px-2 py-2 text-sm border rounded-lg outline-none transition-all ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-primary-500"
            }`}
            rows={4}
          />
        ) : (
          <input
            type={inputType}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`w-full p-2 text-sm border rounded-lg outline-none transition-all ${
              isPassword ? "pr-12" : ""
            } ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-primary-500"
            }`}
          />
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <IoEyeOffOutline size={20} />
            ) : (
              <IoEyeOutline size={20} />
            )}
          </button>
        )}
      </div>
      {error && (
        <span className="text-red-500 text-[13px] mt-1 block">{error}</span>
      )}
    </div>
  );
};
