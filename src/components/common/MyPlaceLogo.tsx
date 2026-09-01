import React from 'react';

interface MyPlaceLogoProps {
  className?: string;
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export const MyPlaceLogo: React.FC<MyPlaceLogoProps> = ({
  className = 'w-8 h-8',
  size,
  primaryColor = '#203A5F',
  secondaryColor = '#595959'
}) => {
  return (
    <svg
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size * 0.8 } : undefined}
    >
      {/* Letter 'M' in Primary Color */}
      <path
        d="M16 70V16C16 12 20 10 23 13L46 48L64 15C66 12 70 14 70 18V42"
        stroke={primaryColor}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Letter 'P' in Secondary Color */}
      <path
        d="M66 15H74C83 15 89 21 89 30C89 39 83 45 74 45H66V70"
        stroke={secondaryColor}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
