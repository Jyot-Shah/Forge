import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ForgeLogo from "../components/ForgeLogo.jsx";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  async function submit(event) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      await register(
        form.get("displayName"),
        form.get("email"),
        form.get("password"),
      );
      navigate("/projects");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error?.message ||
          "Unable to create your account.",
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-on-surface">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 level-1 rounded-DEFAULT border border-outline-variant overflow-hidden shadow-2xl">
        <div className="p-8 md:p-10 flex flex-col justify-between bg-surface-container-low border-b md:border-b-0 md:border-r border-outline-variant">
          <div>
            <div className="flex items-center mb-6 border-none">
              <Link to="/">
                <ForgeLogo className="w-10 h-10 hover:opacity-80 transition-opacity cursor-pointer" />
              </Link>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-semibold text-primary mb-2">
              Create Account
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
              Initialize your developer workspace for document vectorization and
              persistent memory.
            </p>

            <form className="space-y-4" onSubmit={submit}>
              <div>
                <label className="block font-mono-label text-mono-label text-on-surface-variant uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  className="forge-input"
                  name="displayName"
                  required
                  placeholder="Jane Doe"
                />
              </div>

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
                  Password (12+ characters)
                </label>
                <input
                  className="forge-input"
                  name="password"
                  type="password"
                  minLength={12}
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
                Initialize Account
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-outline-variant/40 flex items-center justify-between text-body-sm text-on-surface-variant">
            <span>Already have an account?</span>
            <Link
              className="font-mono-label text-mono-label text-primary underline underline-offset-4 hover:text-white"
              to="/login"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="p-8 md:p-10 flex flex-col justify-between bg-surface-container-lowest">
          <div>
            <div className="inline-block px-2 py-1 level-2 border border-outline-variant text-on-surface-variant font-mono-label text-mono-label uppercase tracking-widest mb-6">
              Industrial Specs
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-body-sm text-on-surface-variant">
              <div className="p-3 level-1 rounded-DEFAULT border border-outline-variant">
                <span className="material-symbols-outlined text-[18px] text-primary block mb-1">
                  upload_file
                </span>
                <strong className="block text-primary font-mono-label text-mono-label uppercase">
                  Multi-format RAG
                </strong>
                PDF, TXT, MD, Code parsing with hybrid search index.
              </div>

              <div className="p-3 level-1 rounded-DEFAULT border border-outline-variant">
                <span className="material-symbols-outlined text-[18px] text-primary block mb-1">
                  memory
                </span>
                <strong className="block text-primary font-mono-label text-mono-label uppercase">
                  Memory Graph
                </strong>
                Entity relationship extraction & dynamic confidence decay.
              </div>

              <div className="p-3 level-1 rounded-DEFAULT border border-outline-variant">
                <span className="material-symbols-outlined text-[18px] text-primary block mb-1">
                  psychology
                </span>
                <strong className="block text-primary font-mono-label text-mono-label uppercase">
                  AI Assistant
                </strong>
                Context-grounded model responses with citation links.
              </div>

              <div className="p-3 level-1 rounded-DEFAULT border border-outline-variant">
                <span className="material-symbols-outlined text-[18px] text-primary block mb-1">
                  dns
                </span>
                <strong className="block text-primary font-mono-label text-mono-label uppercase">
                  Worker Queue
                </strong>
                Asynchronous job processor with telemetry diagnostics.
              </div>
            </div>
          </div>

          <div className="mt-8 p-3 level-2 rounded-DEFAULT border border-outline-variant text-body-sm text-on-surface-variant font-mono-code">
            <span className="text-primary font-mono-label uppercase block mb-1">
              [SECURITY_NOTE] Enterprise Encryption
            </span>
            Passwords hashed with bcrypt + salt. Tokens isolated per user space.
          </div>
        </div>
      </div>
    </div>
  );
}
