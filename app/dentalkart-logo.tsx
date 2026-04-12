export default function DentalkartLogo({
  size = 32,
  showText = true,
}: {
  size?: number;
  showText?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Tooth + cart icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Tooth outline */}
        <path
          d="M20 2 C25 2 30 5 32 10 C33.5 14 32 22 30 28 C28.5 32 27 34 25 34 C23.5 34 23 32 23 29 C23 27 22 26 20 26 C18 26 17 27 17 29 C17 32 16.5 34 15 34 C13 34 11.5 32 10 28 C8 22 6.5 14 8 10 C10 5 15 2 20 2 Z"
          fill="none"
          stroke="#5B86B8"
          strokeWidth="2"
        />
        {/* Orange cart grid background */}
        <rect x="12" y="10" width="16" height="14" rx="1.5" fill="#E8862A" opacity="0.9" />
        {/* Grid lines */}
        <line x1="12" y1="14" x2="28" y2="14" stroke="#5B86B8" strokeWidth="1.2" />
        <line x1="12" y1="18" x2="28" y2="18" stroke="#5B86B8" strokeWidth="1.2" />
        <line x1="12" y1="22" x2="28" y2="22" stroke="#5B86B8" strokeWidth="1.2" />
        <line x1="17" y1="10" x2="17" y2="24" stroke="#5B86B8" strokeWidth="1.2" />
        <line x1="22" y1="10" x2="22" y2="24" stroke="#5B86B8" strokeWidth="1.2" />
        {/* Wheels */}
        <circle cx="15" cy="40" r="2.5" fill="none" stroke="#5B86B8" strokeWidth="1.5" />
        <circle cx="25" cy="40" r="2.5" fill="none" stroke="#5B86B8" strokeWidth="1.5" />
      </svg>

      {showText && (
        <span
          className="font-extrabold tracking-tight"
          style={{ fontSize: size * 0.65 }}
        >
          <span style={{ color: "#5B86B8" }}>Dentalkart</span>
          <span style={{ color: "#E8862A", fontSize: size * 0.45 }}>.com</span>
        </span>
      )}
    </div>
  );
}
