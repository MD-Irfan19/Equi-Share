import React from 'react';

interface RupeeIconProps {
  className?: string;
}

const RupeeIcon: React.FC<RupeeIconProps> = ({ className }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span className="font-semibold">₹</span>
    </div>
  );
};

export default RupeeIcon;