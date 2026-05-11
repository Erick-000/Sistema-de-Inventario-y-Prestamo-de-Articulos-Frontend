import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

function BaseIcon({ title, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function IconDashboard(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M4 13.5a2.5 2.5 0 0 1 2.5-2.5h2A2.5 2.5 0 0 1 11 13.5v6.5H6.5A2.5 2.5 0 0 1 4 17.5v-4Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M13 6.5A2.5 2.5 0 0 1 15.5 4h2A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20H13V6.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4H11v5H6.5A2.5 2.5 0 0 1 4 6.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </BaseIcon>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconPencil(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 6.5 17.5 11.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconSliders(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M6 7h12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10 7v10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6 17h12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M14 17V7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10 12h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M14 12h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M4 7h16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10 4h4l1 2H9l1-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7 7l1 14h8l1-14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}

export function IconX(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconReturn(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M10 7h7a3 3 0 0 1 0 6H9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M11 9 8 12l3 3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 20h16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconBox(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M21 8.5 12 13 3 8.5 12 4l9 4.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M21 8.5v8L12 21l-9-4.5v-8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 13v8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconClock(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}

export function IconAlert(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M12 3 2.6 19.5A1 1 0 0 0 3.5 21h17a1 1 0 0 0 .9-1.5L12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M12 17h.01"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconInbox(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M4 4h16v12H4V4Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M4 16h5l1.5 2h3L15 16h5v4H4v-4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}

export function IconHardware(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M7 8h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M9 12h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M9 18v2M15 18v2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconPeripherals(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M8 7h8a3 3 0 0 1 3 3v3H5v-3a3 3 0 0 1 3-3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7 16h10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M8 11h.01M11 11h.01M14 11h.01M17 11h.01"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconCable(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M7 9v6a3 3 0 0 0 6 0v-1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M13 9V7a3 3 0 0 1 6 0v8a3 3 0 0 1-6 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6 9h2M6 15h2M18 9h2M18 15h2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconElectric(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M9 2h6v6H9V2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M10.5 5h.01M13.5 5h.01"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M12 8v6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M8 14h8l-4 8-4-8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}

export function IconTools(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M14.5 7.5 20 2l2 2-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 9 4 18a2 2 0 0 0 2.8 2.8l9-9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M12.2 10.8 15 13.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconRemote(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M10 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 7h.01M11 11h.01M13 11h.01M12 15h.01"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconInventory(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M7 7.5h10M7 12h10M7 16.5h7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6 4h12a2 2 0 0 1 2 2v12.5a1.5 1.5 0 0 1-1.5 1.5H6A2 2 0 0 1 4 18V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </BaseIcon>
  );
}

export function IconRequests(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M7 4h10a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M9 8h6M9 12h6M9 16h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconLoans(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M7 8.5h10a3 3 0 0 1 0 6H9.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M7 12.5 4.5 10v5L7 12.5Z"
        fill="currentColor"
      />
      <path
        d="M4.5 18h15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconReports(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M5 20V9M10 20V4M15 20v-7M20 20v-11"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconBell(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M12 22a2.5 2.5 0 0 0 2.45-2H9.55A2.5 2.5 0 0 0 12 22Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M18 16H6c1.2-1.3 2-2.7 2-5.5a4 4 0 1 1 8 0c0 2.8.8 4.2 2 5.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}

export function IconRoom(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M5 20V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 20v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M4 20h16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M9 7h.01M12 7h.01M15 7h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconUser(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M12 12a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 12 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M20 20a7.8 7.8 0 0 0-16 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconLogout(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M10 7V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M12.5 12H4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M7 9.5 4 12l3 2.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}

export function IconDownload(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m7 10 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15V3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}

export function IconUpload(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m17 8-5-5-5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 3v12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}

export function IconDocument(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 13H8M16 17H8M10 9H8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}
