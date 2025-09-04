import React from 'react';

const WandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 4V2" />
    <path d="M15 10V8" />
    <path d="M12.5 6.5L14 5" />
    <path d="M12.5 11.5L14 13" />
    <path d="M5 4L2 7l3 3" />
    <path d="M12 10l-2 2" />
    <path d="M8 22l4-4" />
    <path d="m21 3-9.5 9.5" />
    <path d="M19 13l-1.5 1.5" />
  </svg>
);

export default WandIcon;
