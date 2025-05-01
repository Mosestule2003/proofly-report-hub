
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface AddressAutocompleteProps {
  onAddressSelected: (address: string, coordinates: { lat: number; lng: number } | null, formattedAddress: string) => void;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
  hasError?: boolean;
  errorMessage?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelected,
  placeholder = "Enter an address...",
  className = "",
  value = "",
  onChange,
  id = "address-input",
  hasError = false,
  errorMessage
}) => {
  const [inputValue, setInputValue] = useState(value);

  // Handle manual input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Call parent onChange if provided
    if (onChange) {
      onChange(newValue);
    }
    
    // For addresses longer than 10 characters, consider them valid
    if (newValue.trim().length > 10) {
      // Generate random coordinates near US for demo purposes
      const randomLat = 37 + (Math.random() * 10 - 5);
      const randomLng = -98 + (Math.random() * 20 - 10);
      
      onAddressSelected(
        newValue, 
        { lat: randomLat, lng: randomLng }, 
        newValue
      );
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim().length > 10) {
      // Generate random coordinates near US for demo purposes
      const randomLat = 37 + (Math.random() * 10 - 5);
      const randomLng = -98 + (Math.random() * 20 - 10);
      
      onAddressSelected(
        inputValue, 
        { lat: randomLat, lng: randomLng }, 
        inputValue
      );
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <MapPin className="absolute top-3 left-3 text-muted-foreground h-5 w-5" />
        <Input
          id={id}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className={`w-full p-3 pl-10 ${hasError ? 'border-red-500 focus:ring-red-200' : 'focus:ring-primary focus:border-primary'} ${className}`}
        />

        {hasError && errorMessage && (
          <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
        )}
      </form>
    </div>
  );
};

export default AddressAutocomplete;
