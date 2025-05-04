
import React from 'react';
import { ClipboardCheck, MapPin, FileCheck, File } from 'lucide-react';

export const ProoflyRoadmap: React.FC = () => {
  const steps = [
    {
      icon: <MapPin className="h-7 w-7 text-[#FF385C]" />,
      title: 'Add Property',
      description: 'Enter the property address and landlord information'
    },
    {
      icon: <ClipboardCheck className="h-7 w-7 text-[#FF385C]" />,
      title: 'Process Order',
      description: 'Our specialists review and process your request'
    },
    {
      icon: <FileCheck className="h-7 w-7 text-[#FF385C]" />,
      title: 'Property Inspection',
      description: 'Thorough on-site property inspection by our experts'
    },
    {
      icon: <File className="h-7 w-7 text-[#FF385C]" />,
      title: 'Report Delivery',
      description: 'Receive a comprehensive evaluation report'
    }
  ];

  return (
    <div className="w-full">
      {/* Mobile View (Vertical) */}
      <div className="md:hidden">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start mb-8 last:mb-0">
            <div className="flex-shrink-0 relative">
              <div className="h-12 w-12 rounded-full bg-[#FF385C]/10 flex items-center justify-center">
                {step.icon}
              </div>
              {index < steps.length - 1 && (
                <div className="absolute top-12 bottom-0 left-1/2 transform -translate-x-1/2 w-1 bg-gray-200 h-full"></div>
              )}
            </div>
            <div className="ml-6">
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-gray-600 mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Desktop View (Horizontal) */}
      <div className="hidden md:block">
        <div className="flex">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 relative">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-[#FF385C]/10 flex items-center justify-center mb-4 z-10">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-center mb-1">{step.title}</h3>
                <p className="text-gray-600 text-center px-4">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="absolute top-8 left-1/2 w-full h-1 bg-gray-200"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
