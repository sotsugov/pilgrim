import { SVGProps } from 'react';

export function PilgrimIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <g>
        <circle cx="12" cy="12" r="6" fill="url(#grad1)" />
        <circle cx="12" cy="11" r="3" fill="currentColor" opacity="0.1" />
      </g>
    </svg>
  );
}
