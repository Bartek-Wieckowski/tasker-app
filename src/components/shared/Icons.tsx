export const DelegatedListIcon = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 6H3" strokeWidth="2" />
    <path d="M7 12H3" strokeWidth="2" />
    <path d="M7 18H3" strokeWidth="2" />

    {/* Osoba delegująca */}
    <rect
      x="11"
      y="10"
      width="3"
      height="4"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <rect
      x="11.5"
      y="14"
      width="2"
      height="2.5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />

    {/* Strzałka */}
    <path d="M15 12h3" stroke="currentColor" strokeWidth="1" />
    <path
      d="M16 10l2 2-2 2"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />

    {/* Osoba odbierająca */}
    <rect
      x="19"
      y="10"
      width="3"
      height="4"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <rect
      x="19.5"
      y="14"
      width="2"
      height="2.5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
  </svg>
);

export const GlobalListIcon = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 6H3" strokeWidth="2" />
    <path d="M7 12H3" strokeWidth="2" />
    <path d="M7 18H3" strokeWidth="2" />

    {/* Globus */}
    <circle
      cx="16"
      cy="13"
      r="5"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    {/* Kontynenty */}
    <path d="M13 10l2 2-1 2-1-1z" fill="currentColor" />
    <path d="M17 9l2 1 1 2-1 2-2-1-1-1 1-2z" fill="currentColor" />
    <path d="M13 16l2 1 1-1 0 2-1 1z" fill="currentColor" />
    <circle cx="15" cy="11" r="0.5" fill="currentColor" />
    <circle cx="18" cy="15" r="0.3" fill="currentColor" />
  </svg>
);

export const CooperativeListIcon = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 6H3" strokeWidth="2" />
    <path d="M7 12H3" strokeWidth="2" />
    <path d="M7 18H3" strokeWidth="2" />

    {/* Trzy osoby współpracujące */}
    <rect
      x="11"
      y="9"
      width="2.5"
      height="3"
      rx="1.25"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <rect
      x="11.25"
      y="12"
      width="2"
      height="2"
      rx="1"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />

    <rect
      x="14.5"
      y="8"
      width="2.5"
      height="3"
      rx="1.25"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <rect
      x="14.75"
      y="11"
      width="2"
      height="2"
      rx="1"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />

    <rect
      x="18"
      y="9"
      width="2.5"
      height="3"
      rx="1.25"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <rect
      x="18.25"
      y="12"
      width="2"
      height="2"
      rx="1"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />

    {/* Linie łączące */}
    <line
      x1="13.5"
      y1="11"
      x2="14.5"
      y2="10"
      stroke="currentColor"
      strokeWidth="0.8"
    />
    <line
      x1="17"
      y1="10"
      x2="18"
      y2="11"
      stroke="currentColor"
      strokeWidth="0.8"
    />
  </svg>
);
