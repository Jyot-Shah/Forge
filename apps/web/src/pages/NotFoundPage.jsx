import { Link } from "react-router-dom";
import ForgeLogo from "../components/ForgeLogo.jsx";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="level-1 p-10 max-w-md w-full rounded-DEFAULT border border-outline-variant shadow-2xl flex flex-col items-center">
        <ForgeLogo className="w-12 h-12 mb-4" />
        <span className="font-mono-code text-[12px] text-error uppercase tracking-widest mb-1">
          [ERROR 404] Page Not Found
        </span>
        <h1 className="font-headline-xl text-headline-xl text-primary font-semibold mb-3">
          Unknown Route
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
          The requested page route does not exist or has been relocated within the workspace.
        </p>

        <Link to="/projects" className="forge-button w-full py-2.5">
          Return to Projects
        </Link>
      </div>
    </div>
  );
}
