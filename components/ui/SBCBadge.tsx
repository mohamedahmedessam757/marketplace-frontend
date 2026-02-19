import React from 'react';

export const SBCBadge: React.FC = () => {
  return (
    <a
      href="https://eauthenticate.saudibusiness.gov.sa/certificate-details/0000177555"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
    >
      <div className="flex flex-col items-end">
        {/* Updated Logo with the provided image */}
        <div className="w-10 h-10 flex items-center justify-center">
          <img
            src="https://drive.google.com/thumbnail?id=1ZirCRTXqDpO8FUXhmcYV7-oBAw7Xv0dA&sz=w1000"
            alt="SBC Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[10px] text-gray-500 font-bold mb-0.5">موثق في المركز السعودي للأعمال</span>
        <span className="text-sm font-bold text-[#002B5C] tracking-widest font-mono">0000177555</span>
      </div>
    </a>
  );
};