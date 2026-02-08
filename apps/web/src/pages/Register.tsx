import React, { useState } from "react";
import { register } from "../api/auth.api";
import { Link } from "react-router-dom";

export default function Register({
  onRegister,
}: {
  onRegister: (token: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    try {
      const data = await register(email, password);
      setSubmitted(false);
      onRegister(data.token);
    } catch (e: any) {
      setErr(e?.response?.data?.error?.message || "Register failed");
      setSubmitted(false);
    }
  }

  return (
    <div className="p-8 w-full flex flex-col items-center h-dvh justify-center">
      <main>
        <section>
          <h2 className="font-semibold text-3xl text-slate-900">
            Create Account
          </h2>
          <p className="text-gray-500 my-3">
            Create your account with us for free
          </p>
        </section>
        <form onSubmit={submit} className="w-full">
          <div className="flex flex-col">
            <label htmlFor="email" className="text-slate-900 font-semibold">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full border-2 rounded-md py-2 px-3 mt-2 outline-slate-500"
            />
          </div>
          <div className="flex flex-col my-5">
            <label htmlFor="password" className="text-slate-900 font-semibold">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border-2 rounded-md py-2 px-3 mt-2 outline-slate-500"
            />
          </div>
          {err && <div style={{ color: "red" }}>{err}</div>}
          <div className="w-full my-5">
            {submitted ? (
              <h3 className="w-full py-2 cursor-wait text-gray-50 bg-green-600  rounded-md font-semibold text-center">
                Loading...
              </h3>
            ) : (
              <button
                type="submit"
                className="w-full py-2 text-gray-50 bg-green-600 rounded-md font-semibold"
              >
                Register
              </button>
            )}
          </div>
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link to={"/login"} className="text-blue-600 font-semibold">
              Login Here
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
