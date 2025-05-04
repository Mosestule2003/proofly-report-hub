
import React from 'react';

interface OrderProcessingModalProps {
  properties: any[];
  onComplete: () => void | Promise<void>;
  totalPrice: number;
  rush?: boolean; // Optional rush property
}

// This is a placeholder component for the OrderProcessingModal
export const OrderProcessingModal: React.FC<OrderProcessingModalProps> = ({
  properties,
  onComplete,
  totalPrice,
  rush
}) => {
  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">Processing Your Booking</h2>
        <p className="mb-6 text-gray-600">
          {rush ? 'Rush booking in progress.' : 'Booking in progress.'}
          <br />
          We're contacting landlords to arrange property viewings...
        </p>
        <div className="animate-pulse flex space-x-4 justify-center mb-6">
          <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
          <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
          <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
        </div>
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="font-semibold">Total: ${totalPrice.toFixed(2)} CAD</p>
          <p className="text-sm text-gray-500 mb-4">Properties: {properties.length}</p>
          <button 
            onClick={onComplete}
            className="w-full bg-[#FF385C] text-white py-2 px-4 rounded-md hover:bg-[#e0334f] transition-colors"
          >
            Continue to Confirmation
          </button>
        </div>
      </div>
    </div>
  );
};

// Create the wrapper component that includes the rush property
export const OrderProcessingModalWrapper: React.FC<OrderProcessingModalProps> = ({
  properties,
  onComplete,
  totalPrice,
  rush
}) => {
  return (
    <OrderProcessingModal
      properties={properties}
      onComplete={onComplete}
      totalPrice={totalPrice}
      rush={rush}
    />
  );
};
