import { Link, useLocation } from "react-router";
import rabbitSubmark from "../../assets/submark-rabbit.png";

interface HeaderProps {
  title?: string;
}

function TattooChairIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5.55 4.12a1 1 0 0 1 1.35.45l2.05 4.01h4.72c.38 0 .73.2.92.52l1.19 2.16h3.63c.44 0 .85.25 1.05.64l1.91 3.55a1 1 0 1 1-1.76.95l-1.64-3.05h-3.62a1 1 0 0 1-.89-.53l-1.19-2.18H8.37a1 1 0 0 1-.89-.55L5.1 5.47a1 1 0 0 1 .45-1.35Z" fill="currentColor" />
      <path d="M13.72 13.58h2.16v3.1h1.82a1.1 1.1 0 1 1 0 2.2h-5.8a1.1 1.1 0 1 1 0-2.2h1.82v-3.1Z" fill="currentColor" />
      <rect x="10.05" y="10.86" width="3.34" height="1.92" rx="0.2" fill="#e6e6e6" />
      <rect x="8.95" y="9.35" width="4.9" height="1.25" rx="0.42" fill="currentColor" />
      <rect x="11.7" y="8.45" width="2.2" height="1.05" rx="0.35" transform="rotate(58 11.7 8.45)" fill="currentColor" />
      <rect x="6.05" y="3.62" width="1.35" height="2.8" rx="0.35" transform="rotate(-28 6.05 3.62)" fill="currentColor" />
    </svg>
  );
}

function TattooShopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.4" y="3.5" width="17.2" height="6.2" rx="1.4" fill="currentColor" />
      <rect x="4.6" y="10.3" width="14.8" height="9.8" rx="1.3" fill="currentColor" />

      <text
        x="12"
        y="7.75"
        fill="#ffffff"
        textAnchor="middle"
        fontSize="3.1"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        letterSpacing="0.32"
      >
        TATTOO
      </text>

      <rect x="6.4" y="12.2" width="4.8" height="4.5" rx="0.8" fill="#e6e6e6" />
      <rect x="12.8" y="12.2" width="4.8" height="4.5" rx="0.8" fill="#e6e6e6" />

      <line x1="7.1" y1="13.0" x2="8.1" y2="12.1" stroke="currentColor" strokeWidth="0.55" strokeLinecap="round" />
      <line x1="7.6" y1="13.5" x2="8.6" y2="12.6" stroke="currentColor" strokeWidth="0.55" strokeLinecap="round" />
      <line x1="15.9" y1="15.9" x2="16.8" y2="15.0" stroke="currentColor" strokeWidth="0.55" strokeLinecap="round" />
      <line x1="16.4" y1="16.4" x2="17.3" y2="15.5" stroke="currentColor" strokeWidth="0.55" strokeLinecap="round" />
    </svg>
  );
}

function TattooGunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <g transform="translate(0.9 0.8) rotate(-28 12 12)">
        <rect x="9.2" y="3.7" width="7.8" height="1.5" rx="0.5" />
        <rect x="8.8" y="5.4" width="8.8" height="4.6" rx="1.2" />
        <rect x="9.2" y="10.2" width="7.8" height="1.3" rx="0.4" />
        <rect x="5.9" y="6.9" width="3.2" height="1.1" rx="0.4" />
        <rect x="4.7" y="7.1" width="1.4" height="0.8" rx="0.3" />
        <rect x="7.1" y="7.8" width="1.2" height="6.1" rx="0.5" />
        <rect x="6.2" y="13.2" width="3.2" height="3.9" rx="1.1" />
        <path d="M7.9 16.9l.9 2.4-.9 1.9-.9-1.9z" />
        <rect x="10.7" y="6.2" width="1" height="3" rx="0.3" fill="#e6e6e6" />
        <rect x="14" y="6.2" width="1" height="3" rx="0.3" fill="#e6e6e6" />
      </g>
    </svg>
  );
}

export default function Header({ title }: HeaderProps) {
  const location = useLocation();
  const isExplore = location.pathname === "/explore";
  const isLibrary =
    location.pathname === "/library" || location.pathname === "/upload";
  const isTryOn = location.pathname.startsWith("/ar-camera");

  const navItems = [
    {
      to: "/explore",
      label: "Explore",
      isActive: isExplore,
      icon: <TattooShopIcon className="h-8 w-8" />,
    },
    {
      to: "/library",
      label: "Library",
      isActive: isLibrary,
      icon: <TattooChairIcon className="h-8 w-8" />,
    },
    {
      to: "/ar-camera",
      label: "Try On",
      isActive: isTryOn,
      icon: <TattooGunIcon className="h-8 w-8" />,
    },
  ];

  return (
    <>
      <header className="relative bg-black">
        {/* Submark — top-left (mobile); large tap target; PNG has extra canvas — bigger box + scale so the mark reads */}
        <div className="absolute left-2 top-2 z-30 md:hidden">
          <Link
            to="/splash"
            aria-label="Open splash screen"
            className="flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-md p-1 outline-none ring-white/30 focus-visible:ring-2 active:opacity-90"
          >
            <img
              src={rabbitSubmark}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-contain select-none"
              draggable={false}
            />
          </Link>
        </div>

        {/* Plain Pirata title (no image banner/frame). */}
        <div className="flex items-center justify-center px-4 pt-4 pb-3">
          <h2
            className="celestial-heading text-center text-4xl sm:text-5xl tracking-wide"
            style={{ fontFamily: '"Pirata One", serif' }}
          >
            {title || "Public Library"}
          </h2>
        </div>

        {/* Mobile bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t-[6px] border-white/25 md:hidden">
          <nav className="flex w-full items-center justify-center gap-3 bg-black px-2 py-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex min-w-[56px] items-center justify-center gap-2 rounded-full border-2 border-white bg-white px-3 py-1.5 text-black shadow-[2px_4px_0px_0px_rgba(255,255,255,0.35)] transition-colors ${
                  item.isActive ? "brightness-110 scale-[1.03]" : ""
                }`}
              >
                <span className="text-black">
                  {item.icon}
                </span>
                {item.isActive && (
                  <span className="font-['Fugaz_One:Regular',sans-serif] text-base leading-none text-black">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Pinterest-style left navigation + submark at top */}
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[7.25rem] flex-col items-center border-r-2 border-white/15 bg-black pt-4 pb-6 md:flex">
          <Link
            to="/splash"
            aria-label="Open splash screen"
            className="mb-2 flex h-[6.5rem] w-[6.5rem] shrink-0 items-center justify-center rounded-md p-1 outline-none ring-white/30 focus-visible:ring-2 active:opacity-90"
          >
            <img
              src={rabbitSubmark}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-contain select-none"
              draggable={false}
            />
          </Link>
          <nav className="flex min-h-0 flex-1 flex-col items-center justify-around py-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className={`rounded-2xl border-2 border-white bg-white p-2 text-black shadow-[2px_4px_0px_0px_rgba(255,255,255,0.35)] transition-all ${
                  item.isActive ? "brightness-110" : ""
                }`}
              >
                <span className="text-black">
                  {item.icon}
                </span>
              </Link>
            ))}
          </nav>
        </aside>
      </header>
    </>
  );
}