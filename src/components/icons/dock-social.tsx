import type React from 'react';

const strokeProps = {
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  shapeRendering: 'geometricPrecision' as const,
  vectorEffect: 'non-scaling-stroke' as const,
  style: { display: 'block' },
};

/** Telefon araması: ahize + küçük çağrı dalgası/ok (WhatsApp ahizesine benzemez). */
export function DockPhoneCall(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...strokeProps} aria-hidden focusable="false" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
      <path d="M14.05 2a9 9 0 0 1 8 7.94" />
      <path d="M14.05 6A5 5 0 0 1 18 10" />
    </svg>
  );
}

/** WhatsApp: Figma 24×24 Copy as SVG (stroke=1). */
export function DockWhatsApp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      style={{ display: 'block' }}
      {...props}
    >
      <path d="M19.794 4.20105C18.7803 3.18257 17.573 2.37502 16.2425 1.82546C14.912 1.27589 13.4848 0.995311 12.0442 1.00006C6.00804 1.00006 1.08844 5.89505 1.08844 11.901C1.08844 13.826 1.59698 15.696 2.54774 17.346L1 23L6.80402 21.482C8.40703 22.351 10.209 22.813 12.0442 22.813C18.0804 22.813 23 17.918 23 11.912C23 8.99704 21.8613 6.25804 19.794 4.20105ZM12.0442 20.965C10.408 20.965 8.80502 20.525 7.401 19.7L7.06935 19.502L3.6201 20.404L4.53769 17.06L4.31658 16.719C3.40734 15.2748 2.92464 13.6052 2.92362 11.901C2.92362 6.90704 7.01407 2.83705 12.0332 2.83705C14.4653 2.83705 16.7538 3.78305 18.4673 5.49905C19.316 6.33929 19.9885 7.33884 20.4458 8.4397C20.9032 9.54056 21.1363 10.7208 21.1317 11.912C21.1538 16.906 17.0633 20.965 12.0442 20.965ZM17.0412 14.189C16.7648 14.057 15.4161 13.397 15.1729 13.298C14.9186 13.21 14.7417 13.166 14.5538 13.43C14.3658 13.705 13.8462 14.321 13.6915 14.497C13.5367 14.684 13.3709 14.706 13.0945 14.563C12.8181 14.431 11.9337 14.134 10.8945 13.21C10.0764 12.484 9.53467 11.593 9.36884 11.318C9.21407 11.043 9.34673 10.9 9.49045 10.757C9.61206 10.636 9.76683 10.438 9.8995 10.284C10.0322 10.13 10.0874 10.009 10.1759 9.83304C10.2643 9.64604 10.2201 9.49204 10.1538 9.36004C10.0874 9.22804 9.53467 7.88604 9.31357 7.33604C9.09246 6.80804 8.8603 6.87404 8.69447 6.86304H8.16382C7.97588 6.86304 7.68844 6.92904 7.43417 7.20404C7.19095 7.47904 6.48342 8.13904 6.48342 9.48104C6.48342 10.823 7.46734 12.121 7.6 12.297C7.73266 12.484 9.53467 15.234 12.2764 16.411C12.9286 16.697 13.4372 16.862 13.8352 16.983C14.4874 17.192 15.0844 17.159 15.5598 17.093C16.0905 17.016 17.1849 16.433 17.406 15.795C17.6382 15.157 17.6382 14.618 17.5608 14.497C17.4834 14.376 17.3176 14.321 17.0412 14.189Z" />
    </svg>
  );
}

/** Instagram: yuvarlatılmış kare + mercek (outline). */
export function DockInstagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...strokeProps} aria-hidden focusable="false" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

/** Telegram: kağıt uçak (outline). */
export function DockTelegram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...strokeProps} aria-hidden focusable="false" {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

/** YouTube: yuvarlatılmış dikdörtgen + play (outline). */
export function DockYouTube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...strokeProps} aria-hidden focusable="false" {...props}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33Z" />
      <path d="m9.75 15.02 5.75-3.27-5.75-3.27v6.54Z" />
    </svg>
  );
}
