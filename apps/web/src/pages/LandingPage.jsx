import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ForgeLogo from "../components/ForgeLogo.jsx";

export default function LandingPage() {
  const navbarRef = useRef(null);
  const bgRef = useRef(null);
  const revealRefs = useRef([]);

  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    title: "",
    content: "",
  });

  const [isIntroFinished, setIsIntroFinished] = useState(false);

  useEffect(() => {
    const video = document.getElementById("forge-watermark-video");
    if (!video || video.loop) {
      setIsIntroFinished(true);
    } else {
      document.body.classList.add("landing-page-intro");
      const handleEnded = () => {
        document.body.classList.remove("landing-page-intro");
        setIsIntroFinished(true);
      };
      video.addEventListener("ended", handleEnded, { once: true });
      const timeout = setTimeout(handleEnded, 8000); // safety fallback

      return () => {
        video.removeEventListener("ended", handleEnded);
        clearTimeout(timeout);
        document.body.classList.remove("landing-page-intro");
      };
    }
  }, []);

  const openDialog = (e, title, content) => {
    e.preventDefault();
    setDialogConfig({ isOpen: true, title, content });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        navbarRef.current?.classList.add(
          "bg-surface/80",
          "backdrop-blur-md",
          "border-outline-variant",
        );
        navbarRef.current?.classList.remove(
          "bg-surface/0",
          "backdrop-blur-none",
          "border-transparent",
        );
      } else {
        navbarRef.current?.classList.remove(
          "bg-surface/80",
          "backdrop-blur-md",
          "border-outline-variant",
        );
        navbarRef.current?.classList.add(
          "bg-surface/0",
          "backdrop-blur-none",
          "border-transparent",
        );
      }
    };
    window.addEventListener("scroll", handleScroll);

    const handleMouseMove = (e) => {
      if (!bgRef.current) return;
      const x = (window.innerWidth - e.pageX * 2) / 90;
      const y = (window.innerHeight - e.pageY * 2) / 90;
      bgRef.current.style.transform = `translateX(${x}px) translateY(${y}px)`;
    };
    document.addEventListener("mousemove", handleMouseMove);

    document.body.classList.add("landing-page-active");

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousemove", handleMouseMove);
      document.body.classList.remove("landing-page-active");
    };
  }, []);

  useEffect(() => {
    if (!isIntroFinished) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isIntroFinished]);

  return (
    <div className="bg-transparent text-on-surface antialiased min-h-screen flex flex-col z-10 relative">
      <style>{`
        .grid-bg {
          background-image: 
              linear-gradient(to right, theme('colors.surface-container-high') 1px, transparent 1px),
              linear-gradient(to bottom, theme('colors.surface-container-high') 1px, transparent 1px);
          background-size: 32px 32px;
          background-position: center top;
          mask-image: radial-gradient(circle at 50% 30%, black 10%, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at 50% 30%, black 10%, transparent 80%);
        }
        .transition-machined {
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        .delay-0 { animation-delay: 0ms; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .reveal-item {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-item.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.2; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* TopNavBar */}
      <nav
        ref={navbarRef}
        className="flex justify-between items-center h-14 px-4 md:px-6 w-full z-50 sticky top-0 border-b transition-all duration-300 transition-machined bg-surface/0 backdrop-blur-none border-transparent max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="font-headline-lg text-headline-lg font-bold text-primary tracking-tighter hover:text-primary transition-colors duration-200 active:scale-95 transition-machined flex items-center gap-2"
          >
            Forge
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            {/* Nav links removed per request */}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200 hidden md:block transition-machined"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="font-body-md text-body-md bg-primary text-black px-4 py-1.5 rounded hover:bg-primary-container hover:scale-105 active:scale-95 transition-all duration-200 transition-machined font-medium block"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center w-full relative">
        <section className="w-full max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-32 flex flex-col items-center justify-center relative overflow-hidden text-center min-h-[80vh]">
          {/* Atmospheric Grid */}
          <div
            ref={bgRef}
            className="absolute inset-0 grid-bg opacity-40 -z-10 pointer-events-none animate-pulse-slow transition-transform duration-300 ease-out"
          ></div>

          {isIntroFinished && (
            <>
              <h1 className="font-headline-lg text-[32px] md:text-[64px] md:leading-[1.1] font-bold text-primary max-w-4xl mb-6 tracking-tighter opacity-0 animate-fade-in-up delay-100">
                The intelligent operating system for your software projects.
              </h1>
              <p className="font-body-md text-body-md md:text-[18px] md:leading-[28px] text-on-surface-variant max-w-2xl mb-12 opacity-0 animate-fade-in-up delay-200">
                Forge seamlessly integrates your codebase, documentation, and
                communications into a unified, AI-driven workspace—giving your
                team unparalleled insight and operational velocity.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto z-10 opacity-0 animate-fade-in-up delay-300">
                <Link
                  to="/login"
                  className="forge-button px-8 py-3 w-full sm:w-auto text-center"
                >
                  Initialize Workspace
                </Link>
              </div>
            </>
          )}
        </section>

        {isIntroFinished && (
          <>
            {/* Features Bento Grid */}
            <section className="w-full max-w-7xl mx-auto px-4 md:px-6 py-24 border-t border-outline-variant/30 relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
                {/* Feature 1: Large */}
                <div
                  ref={(el) => (revealRefs.current[0] = el)}
                  className="md:col-span-2 level-1 rounded-xl p-8 flex flex-col justify-between group reveal-item hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 hover:bg-surface-container-high"
                >
                  <div className="mb-8">
                    <span className="material-symbols-outlined text-primary mb-4 text-[28px] transition-transform duration-300 transition-machined">
                      neurology
                    </span>
                    <h3 className="font-body-md text-body-md font-bold text-primary mb-2">
                      Institutional Memory Graph
                    </h3>
                    <p className="font-mono-code text-body-sm text-on-surface-variant max-w-md">
                      Automatically maps relationships between pull requests,
                      documentation, and chat history. Never lose context on why
                      a technical decision was made three years ago.
                    </p>
                  </div>
                  <div className="w-full h-32 bg-surface-container-highest border border-outline-variant/30 rounded flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0iIzQ0NDc0OCIvPjwvc3ZnPg==')] opacity-20"></div>
                    <div className="flex items-center gap-4 z-10">
                      <div className="w-12 h-12 rounded border border-outline-variant bg-surface flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant">
                          account_tree
                        </span>
                      </div>
                      <div className="w-8 h-[1px] bg-outline-variant"></div>
                      <div className="w-12 h-12 rounded border border-primary/50 bg-primary/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">
                          neurology
                        </span>
                      </div>
                      <div className="w-8 h-[1px] bg-outline-variant"></div>
                      <div className="w-12 h-12 rounded border border-outline-variant bg-surface flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant">
                          forum
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature 2: Small */}
                <div
                  ref={(el) => (revealRefs.current[1] = el)}
                  className="level-1 rounded-xl p-8 flex flex-col group reveal-item relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 hover:bg-surface-container-high"
                  style={{ transitionDelay: "100ms" }}
                >
                  <span className="material-symbols-outlined text-primary mb-4 text-[28px] transition-transform duration-300 transition-machined">
                    dashboard
                  </span>
                  <h3 className="font-body-md text-body-md font-bold text-primary mb-2">
                    High-Density Dashboards
                  </h3>
                  <p className="font-mono-code text-body-sm text-on-surface-variant">
                    Monospaced metrics and sparklines. Maximum data density with
                    zero decorative noise. Monitor your infrastructure at a
                    glance.
                  </p>
                  <div className="mt-auto pt-6 flex flex-col gap-2">
                    <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-3/4"></div>
                    </div>
                    <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-on-surface-variant w-1/2"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1/2 sparkline-up opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
                </div>

                {/* Feature 3: Small */}
                <div
                  ref={(el) => (revealRefs.current[2] = el)}
                  className="level-1 rounded-xl p-8 flex flex-col group reveal-item relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 hover:bg-surface-container-high"
                  style={{ transitionDelay: "200ms" }}
                >
                  <span className="material-symbols-outlined text-primary mb-4 text-[28px] transition-transform duration-300 transition-machined">
                    manage_search
                  </span>
                  <h3 className="font-body-md text-body-md font-bold text-primary mb-2">
                    Semantic Search Engine
                  </h3>
                  <p className="font-mono-code text-body-sm text-on-surface-variant">
                    Query your entire codebase and isolated documentation
                    environments using natural language rather than keyword
                    matching.
                  </p>
                  <div className="mt-auto pt-6 flex flex-col gap-2">
                    <div className="bg-surface p-2 rounded border border-outline-variant/30 flex items-center justify-between">
                      <span className="text-on-surface-variant text-[10px] uppercase font-mono-label tracking-widest">
                        Query
                      </span>
                      <span className="text-primary text-[11px] font-mono-code">
                        "auth routing"
                      </span>
                    </div>
                    <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[85%]"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1/2 sparkline-down opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
                </div>

                {/* Feature 4: Large */}
                <div
                  ref={(el) => (revealRefs.current[3] = el)}
                  className="md:col-span-2 level-1 rounded-xl p-8 flex flex-col justify-between group reveal-item hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 hover:bg-surface-container-high"
                  style={{ transitionDelay: "300ms" }}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <span className="material-symbols-outlined text-primary mb-4 text-[28px] transition-transform duration-300 transition-machined">
                        local_library
                      </span>
                      <h3 className="font-body-md text-body-md font-bold text-primary mb-2">
                        Immutable Library
                      </h3>
                      <p className="font-mono-code text-body-sm text-on-surface-variant max-w-md">
                        Content addressed storage for your critical technical
                        assets. Guarantee that dependencies and specifications
                        never drift over time.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 font-mono-code text-mono-code text-on-surface-variant bg-surface border border-outline-variant/30 p-4 rounded h-32 overflow-hidden relative">
                    <div className="flex justify-between py-1 border-b border-outline-variant/30">
                      <span>core_engine_v2.rs</span>{" "}
                      <span className="text-primary">sha256:8f43...</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-outline-variant/30">
                      <span>auth_schema.graphql</span>{" "}
                      <span>sha256:1a9c...</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-outline-variant/30">
                      <span>network_policy.yaml</span>{" "}
                      <span>sha256:5c2b...</span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-surface to-transparent"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1/2 sparkline-up opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 items-center px-4 md:px-6 py-8 w-full max-w-7xl mx-auto border-t border-outline-variant bg-transparent text-on-surface-variant font-body-sm text-body-sm relative z-10">
        <div className="flex items-center justify-center md:justify-start gap-4">
          <span className="">
            © 2026 Forge Systems Inc. Built for permanence.
          </span>
        </div>
        <div className="flex items-center justify-center gap-1">
          Made with{" "}
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>{" "}
          by{" "}
          <a
            href="https://www.linkedin.com/in/jyotshah1/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Jyot Shah
          </a>
        </div>
        <div className="flex justify-center md:justify-end gap-6">
          <a
            className="hover:text-primary transition-colors cursor-pointer"
            onClick={(e) =>
              openDialog(
                e,
                "Privacy Policy",
                "We do not track, collect, or share your telemetry metadata unnecessarily. Your knowledge graphs remain isolated to your environment.",
              )
            }
          >
            Privacy
          </a>
          <a
            className="hover:text-primary transition-colors cursor-pointer"
            onClick={(e) =>
              openDialog(
                e,
                "Terms of Service",
                "By accessing Forge, you adhere to the guidelines set in protecting our intellectual property. Code usage must be strictly compliant with standard open-source licenses.",
              )
            }
          >
            Terms
          </a>
          <a
            className="hover:text-primary transition-colors cursor-pointer"
            onClick={(e) =>
              openDialog(
                e,
                "Security",
                "The system encrypts your data in-transit up to AES-256 standards. JWT session persistence isolates user data efficiently.",
              )
            }
          >
            Security
          </a>
        </div>
      </footer>

      {/* Dynamic Pop-up Dialog */}
      {dialogConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="level-1 interactive-panel rounded-xl max-w-md w-full p-8 relative border border-outline-variant shadow-2xl">
            <button
              onClick={() =>
                setDialogConfig({ ...dialogConfig, isOpen: false })
              }
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-1 rounded-full hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>
            <h2 className="font-headline-lg text-primary mb-4 pr-6 tracking-tight">
              {dialogConfig.title}
            </h2>
            <div className="font-body-md text-on-surface-variant leading-relaxed">
              {dialogConfig.content}
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() =>
                  setDialogConfig({ ...dialogConfig, isOpen: false })
                }
                className="forge-button px-6 py-2"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
