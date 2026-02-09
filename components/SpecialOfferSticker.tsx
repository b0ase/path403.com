import React from 'react';

interface SpecialOfferStickerProps {
  text?: string;
  className?: string;
}

const SpecialOfferSticker: React.FC<SpecialOfferStickerProps> = ({ text = 'Special Offer', className = '' }) => {
  return (
    <div className={`relative inline-block my-4 filter drop-shadow-md ${className}`}>
      <div className="bg-pink-500 text-white font-extrabold uppercase tracking-wider px-6 py-2.5 rounded-md">
        {text}
      </div>
      <div 
        className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0"
        style={{
            borderLeft: '1rem solid transparent',
            borderRight: '1rem solid transparent',
            borderTop: '1rem solid #db2777', // pink-600 for the darker fold
        }}
      />
    </div>
  );
};

export default SpecialOfferSticker; 