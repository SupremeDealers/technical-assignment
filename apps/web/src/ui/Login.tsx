import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../utils/auth";
import { getErrorMessage } from "../lib/common";
import { RiArrowRightSLine, RiLoader4Line } from "@remixicon/react";

export default function Login() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const mutation = useMutation({
    mutationFn: login,
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
  return (
    <section className="relative min-h-screen bg-secondary flex items-center justify-center px-4">
      <section className="w-full max-w-[820px]">
        <section className="relative z-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-10 text-text-primary shadow-xl">
          <form
            className="mx-auto w-full max-w-[440px] space-y-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex rounded-xl bg-white/5 p-1">
              <Link
                to="/signup"
                className="flex-1 text-center rounded-lg py-2 text-sm font-semibold text-text-secondary hover:text-white transition"
              >
                Register
              </Link>

              <button
                type="button"
                className="flex-1 rounded-lg py-2 text-sm font-semibold bg-primary text-text-secondary hover:text-white transition"
              >
                Login
              </button>
            </div>

            <div className="space-y-4 text-center">
              <h2 className="text-2xl md:text-[28px] font-semibold">
                Welcome Back
              </h2>
              <p className="text-base text-text-secondary">
                Login to continue to your dashboard
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-primary">
                  Email
                </label>
                <input
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
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
                  type="text"
                  onChange={handleChange}
                />

                <Link
                  to="#"
                  className="text-xs text-text-primary hover:text-text-secondary transition inline-block"
                >
                  Forgot password?
                </Link>
              </div>
              {mutation.isError && (
                <p role="alert" className="m-0 text-red-500">
                  {getErrorMessage(mutation.error)}
                </p>
              )}

              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-common py-3 text-sm font-semibold text-secondary transition hover:opacity-90 disabled:opacity-60"
                type="submit"
                disabled={mutation.isPending}
                onClick={handleSubmit}
              >
                {mutation.isPending && (
                  <RiLoader4Line className="h-5 w-5 animate-spin" />
                )}
                <span>Login</span>
                {!mutation.isPending && (
                  <RiArrowRightSLine className="h-4 w-4" />
                )}
              </button>
            </div>
          </form>
        </section>
      </section>
    </section>
  );
}
