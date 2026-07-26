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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-on-surface">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 level-1 rounded-DEFAULT border border-outline-variant overflow-hidden shadow-2xl">
        {/* Left Side: Form */}
        <div className="p-8 md:p-10 flex flex-col justify-between bg-surface-container-low border-b md:border-b-0 md:border-r border-outline-variant">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <ForgeLogo className="w-7 h-7" />
              <span className="font-mono-label text-mono-label font-bold tracking-widest text-primary uppercase">Forge</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-semibold text-primary mb-2">
              Sign In
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
              Access your project workspace, semantic indexes, and persistent memories.
            </p>

            <form className="space-y-4" onSubmit={submit}>
              <div>
                <label className="block font-mono-label text-mono-label text-on-surface-variant uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  className="forge-input"
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
                  className="forge-input"
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
          </div>

          <div className="mt-8 pt-4 border-t border-outline-variant/40 flex items-center justify-between text-body-sm text-on-surface-variant">
            <span>Don't have an account?</span>
            <Link className="font-mono-label text-mono-label text-primary underline underline-offset-4 hover:text-white" to="/register">
              Create Account
            </Link>
          </div>
        </div>

        {/* Right Side: Features */}
        <div className="p-8 md:p-10 flex flex-col justify-between bg-surface-container-lowest">
          <div>
            <div className="inline-block px-2 py-1 level-2 border border-outline-variant text-on-surface-variant font-mono-label text-mono-label uppercase tracking-widest mb-6">
              Workspace Features
            </div>

            <ul className="space-y-4 font-body-sm text-on-surface-variant">
              <li className="flex items-start gap-3 p-3 level-1 rounded-DEFAULT">
                <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">folder_open</span>
                <div>
                  <strong className="block text-primary font-mono-label text-mono-label uppercase">Project-Scoped Knowledge</strong>
                  Isolated document vectorization, chunk extraction, and metadata indexing.
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 level-1 rounded-DEFAULT">
                <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">neurology</span>
                <div>
                  <strong className="block text-primary font-mono-label text-mono-label uppercase">Persistent Memory Engine</strong>
                  Entities, relationship graphs, and historical memory synthesis.
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 level-1 rounded-DEFAULT">
                <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">terminal</span>
                <div>
                  <strong className="block text-primary font-mono-label text-mono-label uppercase">Asynchronous Worker Queue</strong>
                  Background ingestion pipeline with real-time status telemetry.
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-8 p-3 level-2 rounded-DEFAULT border border-outline-variant text-body-sm text-on-surface-variant font-mono-code">
            <span className="text-primary font-mono-label uppercase block mb-1">[SYS_INFO] Session Persistence</span>
            JWT tokens store state locally while refresh credentials manage background verification.
          </div>
        </div>
      </div>
    </div>
  );
}
