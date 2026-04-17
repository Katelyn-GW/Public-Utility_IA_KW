import { useEffect } from "react";
import { useNavigate } from "react-router";
import imgLogo from "../../imports/logo.png";
import imgBannerFrame from "../../imports/IPhone174/4413c43c9d3a0efcf7faded2b68712983ceda16c.png";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate("/explore", { replace: true });
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#8dd7ca] px-4">
      <div className="relative flex h-[440px] w-full max-w-5xl items-center justify-center overflow-visible">
        <img
          src={imgLogo}
          alt=""
          className="splash-gun-vibrate pointer-events-none absolute left-1/2 top-[40%] h-[470px] w-[470px] -translate-x-1/2 -translate-y-1/2 object-contain sm:top-[38%] sm:h-[595px] sm:w-[595px]"
        />

        <img
          src={imgBannerFrame}
          alt=""
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-[740px] max-w-none -translate-x-1/2 -translate-y-[calc(50%+2px)] object-contain sm:w-[980px]"
        />
        <p className="relative z-20 translate-x-[14px] -translate-y-[28px] text-center text-[52px] leading-none text-black font-['Fruktur:Italic',sans-serif] italic sm:translate-x-[18px] sm:-translate-y-[34px] sm:text-[72px]">
          inkAnatomy
        </p>
      </div>
    </div>
  );
}
