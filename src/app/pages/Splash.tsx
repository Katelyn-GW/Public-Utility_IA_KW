import { useEffect } from "react";
import { useNavigate } from "react-router";
import splashLogo from "../../assets/inktrix-logo.png";

/** Transparent splash logo (`src/assets/inktrix-logo.png`). */
export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate("/explore", { replace: true });
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      <style>{`
        .splash-screen-rays {
          position: absolute;
          inset: -30vmax;
          z-index: 0;
          pointer-events: none;
          mix-blend-mode: screen;
          opacity: 0.38;
          background:
            radial-gradient(circle at 50% 50%, rgba(243, 211, 141, 0.22) 0%, rgba(243, 211, 141, 0.08) 24%, rgba(243, 211, 141, 0) 56%),
            repeating-conic-gradient(
              from 0deg at 50% 50%,
              rgba(233, 190, 95, 0.26) 0deg 10deg,
              rgba(0, 0, 0, 0) 10deg 24deg
            );
          filter: blur(16px);
          animation: splash-sunrays-rotate 26s linear infinite, splash-sunrays-pulse 4.4s ease-in-out infinite;
          transform-origin: 50% 50%;
          /* Keep rays out of full logo lockup center. */
          -webkit-mask: radial-gradient(circle at 50% 50%, transparent 0 27vmin, #000 36vmin);
          mask: radial-gradient(circle at 50% 50%, transparent 0 27vmin, #000 36vmin);
        }

        .splash-celestial-wrap {
          position: relative;
          width: min(92vw, 760px);
          aspect-ratio: 1 / 1;
          max-height: 88vh;
          overflow: hidden;
          background: transparent;
          isolation: isolate;
          z-index: 2;
        }

        .splash-celestial-wrap::before {
          content: none;
        }

        @keyframes splash-sunrays-rotate {
          0% { transform: rotate(0deg) scale(1); }
          100% { transform: rotate(360deg) scale(1); }
        }

        @keyframes splash-sunrays-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.52; }
        }
      `}</style>
      <div className="splash-screen-rays" />
      <div className="splash-celestial-wrap">
        <img
          src={splashLogo}
          alt="Inktrix"
          className="relative z-10 h-full w-full max-h-[min(78vh,760px)] object-contain object-center p-6"
          draggable={false}
          decoding="async"
        />
      </div>
    </div>
  );
}
