import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext.jsx";
import ForgeLogo from "../components/ForgeLogo.jsx";

export default function LoginPage() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { login } = useAuth();

  async function submit(event) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      await login(form.get("email"), form.get("password"));
      queryClient.clear();
      navigate("/projects");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error?.message || "Unable to sign in.",
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 z-10 relative">
      <Link
        to="/"
        className="mb-8 inline-flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
      >
        <ForgeLogo className="w-14 h-14" />
      </Link>

      <div className="w-full max-w-sm level-1 p-8 rounded-DEFAULT flex flex-col justify-center relative overflow-hidden group shadow-2xl">
        <h1 className="font-headline-lg text-headline-lg font-semibold text-primary mb-2 z-10 relative">
          Sign In
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 z-10 relative">
          Authenticate to access your workspace.
        </p>

        <form className="space-y-4 z-10 relative" onSubmit={submit}>
          <div>
            <label className="block font-mono-label text-mono-label text-on-surface-variant uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              className="forge-input bg-surface-container-low"
              name="email"
              type="email"
              required
              placeholder="developer@forge.internal"
            />
          </div>

          <div>
            <label className="block font-mono-label text-mono-label text-on-surface-variant uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              className="forge-input bg-surface-container-low"
              name="password"
              type="password"
              required
              placeholder="••••••••••••"
            />
          </div>

          {error ? (
            <div className="p-3 level-2 rounded-DEFAULT border border-error-container text-error text-body-sm font-mono-code">
              {error}
            </div>
          ) : null}

          <button className="forge-button w-full py-2.5 mt-2" type="submit">
            Authorize Session
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-outline-variant/40 flex items-center justify-between text-body-sm text-on-surface-variant z-10 relative">
          <span>Don't have an account?</span>
          <Link
            className="font-mono-label text-mono-label text-primary underline underline-offset-4 hover:text-white transition-colors"
            to="/register"
          >
            Create Account
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1/2 sparkline-up opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
      </div>
    </div>
  );
}
