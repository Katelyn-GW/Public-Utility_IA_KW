import { Link, useLocation } from "react-router";
import { Search, UserRound, Camera } from "lucide-react";
import imgLogo from "../../imports/logo.png";
import imgBannerFrame from "../../imports/IPhone174/4413c43c9d3a0efcf7faded2b68712983ceda16c.png";
import imgExploreBanner from "../../imports/EP.png";
import imgLibraryBanner from "../../imports/PL.png";
import imgARBanner from "../../imports/TTO.png";

interface HeaderProps {
  title?: string;
  bannerImage?: "explore" | "library" | "ar";
}

export default function Header({ title, bannerImage }: HeaderProps) {
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
      icon: <Search className="h-6 w-6 stroke-[2.5]" />,
    },
    {
      to: "/library",
      label: "Library",
      isActive: isLibrary,
      icon: <UserRound className="h-6 w-6 stroke-[2.5]" />,
    },
    {
      to: "/ar-camera",
      label: "Try On",
      isActive: isTryOn,
      icon: <Camera className="h-6 w-6 stroke-[2.5]" />,
    },
  ];

  const bannerScale =
    bannerImage === "explore" ? 1.32 : bannerImage === "ar" ? 1.2 : 1.12;

  return (
    <>
      <header className="relative bg-[#8dd7ca]">
        {/* Logo - top right */}
        <div className="absolute right-3 top-3 z-10">
          <Link to="/splash" aria-label="Replay splash screen">
            <img
              src={imgLogo}
              alt="inkAnatomy"
              className="h-16 w-16 object-contain"
            />
          </Link>
        </div>

        {/* Title Banner - centered, fixed size to prevent page-to-page shifting */}
        <div className="flex items-center justify-center px-4 pt-4 pb-3">
          {bannerImage ? (
            <div className="flex h-[100px] w-[320px] items-center justify-center sm:h-[130px] sm:w-[420px]">
              <img
                src={bannerImage === "explore" ? imgExploreBanner : bannerImage === "library" ? imgLibraryBanner : imgARBanner}
                alt={title || ""}
                className="h-full w-full object-contain"
                style={{ transform: `scale(${bannerScale})` }}
              />
            </div>
          ) : (
            <div className="relative inline-flex items-center justify-center">
              <p className="relative z-10 font-['Fruktur:Italic',sans-serif] text-[36px] sm:text-[46px] italic text-black whitespace-nowrap px-16 py-6">
                {title || "Public Library"}
              </p>
              <img
                src={imgBannerFrame}
                alt=""
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] min-w-[190%] min-h-[270%] object-contain pointer-events-none"
              />
            </div>
          )}
        </div>

        {/* Primary navigation bar */}
        <div className="px-4 pb-4">
          <nav className="mx-auto flex w-full max-w-xl items-center justify-center gap-3 rounded-full border-4 border-black bg-[#72aea3] px-2 py-1.5 shadow-[3px_5px_0px_0px_rgba(0,0,0,1)]">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex min-w-[56px] items-center justify-center gap-2 rounded-full px-3 py-1.5 transition-colors ${
                  item.isActive
                    ? "bg-black text-white"
                    : "text-[#028a7b] hover:bg-black/10"
                }`}
              >
                <span className={item.isActive ? "text-white" : "text-[#028a7b]"}>
                  {item.icon}
                </span>
                {item.isActive && (
                  <span className="font-['Fugaz_One:Regular',sans-serif] text-base leading-none">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}