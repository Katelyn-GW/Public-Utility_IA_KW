import { useEffect } from "react";
import { useNavigate } from "react-router";
import splashArt from "../../assets/TITLE.png";

/** Splash art bitmap synced into `src/assets/TITLE.png`. */
export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate("/explore", { replace: true });
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <img
        src={splashArt}
        alt="Inktrix"
        className="h-auto w-full max-w-[min(92vw,760px)] max-h-[88vh] object-contain"
        draggable={false}
        decoding="async"
      />
    </div>
  );
}
