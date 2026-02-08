import { Link } from "react-router-dom";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { Input } from "../components/Input";
import { APP_ROUTES } from "../data/route";
import React from "react";

export const RegisterPage = () => {
  const { formData, errors, isLoading, handleInputChange, handleRegister } =
    useRegisterForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegister();
  };

  return (
    <div className="flex  justify-center items-center min-h-screen bg-white p-2">
      <div className=" md:min-w-125 w-full md:max-w-190 max-w-[90vw] bg-white rounded-2xl px-6 py-12 shadow border border-gray-100">
        {/* Logo */}
        <div className="text-center flex flex-col gap-2 ">
          <h1 className="text-3xl font-semibold text-gray-900">
            Create your account
          </h1>
          <p className="text-sm text-gray-500">
            Please enter your details to sign up
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="Email Address"
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
            label="Username"
            type="text"
            name="username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={(e) =>
              handleInputChange(e as React.ChangeEvent<HTMLInputElement>)
            }
            error={errors.username ?? ""}
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
          <Input
            label="Confirm Password"
            type="password"
            name="confirm_password"
            placeholder="• • • • • • • • • •"
            value={formData.confirm_password}
            onChange={(e) =>
              handleInputChange(e as React.ChangeEvent<HTMLInputElement>)
            }
            error={errors.confirm_password ?? ""}
          />

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
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to={APP_ROUTES.LOGIN_PAGE}
            className="text-primary-500 no-underline font-semibold hover:text-primary-600"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
