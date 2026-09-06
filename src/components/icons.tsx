import { vmin } from "@/lib/fluid";

type IconSize = number | string;

export function HangerIcon({ size = vmin(22) }: { size?: IconSize }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
      <path d="M9 3 4.5 5.5 6 10l1.6-.6V21h8.8V9.4L18 10l1.5-4.5L15 3a3 3 0 0 1-6 0z" />
    </svg>
  );
}

export function CartIcon({
  size = vmin(22),
  stroke = "#fff",
}: {
  size?: IconSize;
  stroke?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 4h2l2.6 10h10.2l2.2-7H6" />
      <circle cx="9.5" cy="18.5" r="1.4" />
      <circle cx="17" cy="18.5" r="1.4" />
    </svg>
  );
}

export function BagIcon({ size = vmin(20) }: { size?: IconSize }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 8h16l-1.4 12H5.4L4 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function HeartIcon({
  size = vmin(22),
  stroke = "#fff",
}: {
  size?: IconSize;
  stroke?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9z" />
    </svg>
  );
}

export function HeartFilledIcon({ size = vmin(20) }: { size?: IconSize }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
      <path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9z" />
    </svg>
  );
}

export function ProfileIcon({ size = vmin(22) }: { size?: IconSize }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.5 18.5a6 6 0 0 1 11 0" />
    </svg>
  );
}

export function ChevronLeftIcon({ size = vmin(18) }: { size?: IconSize }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function ChevronRightIcon({ size = vmin(18) }: { size?: IconSize }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function ArrowRightIcon({
  size = vmin(18),
  stroke = "#fff",
}: {
  size?: IconSize;
  stroke?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ShippingIcon({ size = vmin(18) }: { size?: IconSize }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </svg>
  );
}

export function TrashIcon({ size = vmin(17) }: { size?: IconSize }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M18 7l-.8 13.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7" />
    </svg>
  );
}

export function LocationDotIcon() {
  return (
    <div
      className="location-dot"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: vmin(2),
      }}
    >
      <div
        className="location-dot-head"
        style={{
          width: vmin(6),
          height: vmin(6),
          borderRadius: 999,
          background: "#fff",
        }}
      />
      <div
        className="location-dot-stem"
        style={{
          width: vmin(4),
          height: vmin(11),
          borderRadius: 2,
          background: "#fff",
        }}
      />
    </div>
  );
}

export function GridIcon() {
  return (
    <div
      className="grid-icon"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(3, ${vmin(4)})`,
        gridAutoRows: vmin(4),
        gap: vmin(3),
      }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 1 }} />
      ))}
    </div>
  );
}
