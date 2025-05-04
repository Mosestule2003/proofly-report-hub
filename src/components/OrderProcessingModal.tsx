
import React, { useState, useEffect } from 'react';
import { MessageSquare, Building, Check } from 'lucide-react';

interface OrderProcessingModalProps {
  properties: any[];
  onComplete: () => void | Promise<void>;
  totalPrice: number;
  rush?: boolean; // Optional rush property
}

// This is the actual component implementation
export const OrderProcessingModal: React.FC<OrderProcessingModalProps> = ({
  properties,
  onComplete,
  totalPrice,
  rush
}) => {
  const [stage, setStage] = useState<'outreach' | 'evaluation'>('outreach');
  const [progress, setProgress] = useState(0);

  // Simulate the processing stages
  useEffect(() => {
    const timer = setTimeout(() => {
      if (stage === 'outreach' && progress < 100) {
        setProgress(prev => Math.min(prev + 20, 100));
      } else if (stage === 'outreach' && progress === 100) {
        setStage('evaluation');
        setProgress(0);
      } else if (stage === 'evaluation' && progress < 100) {
        setProgress(prev => Math.min(prev + 25, 100));
      }
    }, rush ? 800 : 1200);
    
    return () => clearTimeout(timer);
  }, [progress, stage, rush]);

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
      <div className="text-center">
        {stage === 'outreach' ? (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">AI Outreach In Progress</h2>
            <p className="mb-4 text-gray-600">
              {rush ? 'Rush processing activated.' : 'Outreach in progress.'}<br />
              We're contacting landlords to arrange property viewings...
            </p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="space-y-2 mb-6 text-left">
              {progress >= 20 && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Initializing property data...</span>
                </div>
              )}
              {progress >= 40 && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Contacting landlords via AI messaging system...</span>
                </div>
              )}
              {progress >= 60 && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Processing {properties.length} property requests...</span>
                </div>
              )}
              {progress >= 80 && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Scheduling viewing times...</span>
                </div>
              )}
              {progress === 100 && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>AI outreach complete!</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <Building className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Evaluation Workflow</h2>
            <p className="mb-4 text-gray-600">
              {rush ? 'Rush evaluation in progress.' : 'Evaluation in progress.'}<br />
              Assigning local Proofly evaluators to your properties...
            </p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="space-y-2 mb-6 text-left">
              {progress >= 25 && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Finding local Proofly "friends" in your area...</span>
                </div>
              )}
              {progress >= 50 && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Coordinating schedules for {properties.length} properties...</span>
                </div>
              )}
              {progress >= 75 && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Setting up property walkthroughs...</span>
                </div>
              )}
              {progress === 100 && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>All preparations complete!</span>
                </div>
              )}
            </div>
          </>
        )}
        
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="font-semibold">Total: ${totalPrice.toFixed(2)} CAD</p>
          <p className="text-sm text-gray-500 mb-4">Properties: {properties.length}</p>
          <button 
            onClick={onComplete}
            className={`w-full bg-[#FF385C] text-white py-2 px-4 rounded-md hover:bg-[#e0334f] transition-colors ${(stage !== 'evaluation' || progress < 100) ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={stage !== 'evaluation' || progress < 100}
          >
            {stage === 'outreach' ? 'Processing...' : progress < 100 ? 'Finalizing...' : 'Continue to Confirmation'}
          </button>
        </div>
      </div>
    </div>
  );
};
