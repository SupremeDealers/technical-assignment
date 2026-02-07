"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { RiArrowRightSLine, RiLoader4Line } from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../utils/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
  });

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: async (data) => {
      localStorage.setItem("token", data.token);
      await qc.invalidateQueries({ queryKey: ["me"] });
      navigate("/");
    },
  });

  const handleSubmit = () => {
    mutation.mutate(formData);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isValid = () => {
    if (
      formData.email &&
      formData.email.includes("@") &&
      formData.name &&
      formData.name.length > 2 &&
      formData.password
    ) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    isValid();
  }, [formData]);

  return (
    <section className="relative min-h-screen bg-secondary flex items-center justify-center px-4">
      <section className="w-full max-w-205">
        <section className="relative z-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-10 text-text-primary shadow-xl">
          <form
            className="mx-auto w-full max-w-110 space-y-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex rounded-xl bg-white/5 p-1">
              <Link
                to="/signup"
                className="flex-1 rounded-lg py-2 text-sm font-semibold bg-primary text-text-secondary hover:text-white transition text-center"
              >
                Register
              </Link>

              <Link
                to="/login"
                className="flex-1 text-center rounded-lg py-2 text-sm font-semibold text-text-secondary hover:text-white transition"
              >
                Login
              </Link>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label
                  htmlFor="username"
                  className="text-sm font-medium text-text-primary"
                >
                  Username
                </label>
                <input
                  type="text"
                  value={formData.name}
                  name="name"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="name"
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-text-primary"
                >
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="email address"
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-primary">
                  Password
                </label>
                <input
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  type="password"
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-common py-3 text-sm font-semibold text-secondary transition hover:opacity-90 disabled:opacity-60"
              disabled={mutation.isPending && !isValid()}
              onClick={handleSubmit}
            >
              {mutation.isPending && isValid() && (
                <RiLoader4Line className="size-5 mr-2 animate-spin" />
              )}
              Continue <RiArrowRightSLine className="h-4 w-4" />
            </button>
          </form>
        </section>
      </section>
    </section>
  );
}
