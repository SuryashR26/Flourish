import React from 'react';

interface FilterIconProps {
  className?: string;
  color?: string;
}

const FilterIcon: React.FC<FilterIconProps> = ({ className = "", color = "currentColor" }) => {
  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="-0.5 -0.5 16 16" 
      height="24" 
      width="24"
    >
      <desc>
        Horizontal Sliders Lines Streamline Icon: https://streamlinehq.com
      </desc>
      <defs></defs>
      <path d="m4.50625 2.1125 10.181249999999999 -0.00625" fill="none" stroke={color} strokeMiterlimit="10" strokeWidth="1"></path>
      <path d="m0.3125 2.1125 2.39375 0" fill="none" stroke={color} strokeMiterlimit="10" strokeWidth="1"></path>
      <path d="m12.293750000000001 7.5 2.39375 0" fill="none" stroke={color} strokeMiterlimit="10" strokeWidth="1"></path>
      <path d="m0.3125 7.5 10.181249999999999 0" fill="none" stroke={color} strokeMiterlimit="10" strokeWidth="1"></path>
      <path d="m8.7 12.893749999999999 5.9875 -0.00625" fill="none" stroke={color} strokeMiterlimit="10" strokeWidth="1"></path>
      <path d="m0.3125 12.893749999999999 6.5874999999999995 0" fill="none" stroke={color} strokeMiterlimit="10" strokeWidth="1"></path>
      <path d="m2.70625 0.3125 0 3.59375" fill="none" stroke={color} strokeMiterlimit="10" strokeWidth="1"></path>
      <path d="m10.493749999999999 5.699999999999999 0 3.59375" fill="none" stroke={color} strokeMiterlimit="10" strokeWidth="1"></path>
      <path d="m6.8999999999999995 11.09375 0 3.59375" fill="none" stroke={color} strokeMiterlimit="10" strokeWidth="1"></path>
    </svg>
  );
};

export default FilterIcon; 