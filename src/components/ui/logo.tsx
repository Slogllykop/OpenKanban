import Image from "next/image";
import Link from "next/link";
import LOGO from "../../../public/OpenKanban-Logo.png";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function Logo({
  className = "",
  size = 32,
  showText = true,
}: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <Image
          src={LOGO.src}
          alt="OpenKanban Logo"
          width={size}
          height={size}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className="font-bold font-display text-white text-xl tracking-tight">
          OpenKanban
        </span>
      )}
    </Link>
  );
}
