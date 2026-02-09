import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLoginForm } from "../hooks/useLoginForm";
import { Input } from "../components/Input";
import { APP_ROUTES } from "../data/route";

export const LoginPage = () => {
  const { formData, errors, isLoading, handleInputChange, handleLogin } =
    useLoginForm();
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="flex  justify-center items-center min-h-screen bg-white p-2">
      <div className=" md:min-w-125 w-full md:max-w-190 max-w-[90vw] bg-white rounded-2xl px-6 py-12 shadow border border-gray-200">
        {/* Logo */}
        <div className="text-center flex flex-col gap-2 ">
          <h1 className="text-3xl font-semibold  text-gray-900">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500">
            Please enter your details to sign in
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="Your Email Address"
            type="email"
            name="email"
            placeholder="Your Email Address"
            value={formData.email}
            onChange={(e) =>
              handleInputChange(e as React.ChangeEvent<HTMLInputElement>)
            }
            error={errors.email ?? ""}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="• • • • • • • • • •"
            value={formData.password}
            onChange={(e) =>
              handleInputChange(e as React.ChangeEvent<HTMLInputElement>)
            }
            error={errors.password ?? ""}
          />

          <div className="flex justify-between items-center mb-6">
            <label className="flex items-center text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2 cursor-pointer"
              />
              Remember me
            </label>
            <Link
              to="#"
              className="text-sm text-primary-500 no-underline font-medium hover:text-primary-600"
            >
              Forgot password?
            </Link>
          </div>

          {errors.form && (
            <div className="p-3 bg-red-50 rounded-lg mb-4 text-sm text-red-800">
              {errors.form}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 text-base font-semibold text-white border-none rounded-lg transition-all ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-900 cursor-pointer hover:bg-gray-700"
            }`}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to={APP_ROUTES.REGISTER_PAGE}
            className="text-primary-500 no-underline font-semibold hover:text-primary-600"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
