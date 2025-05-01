
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, CloudRain, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

interface PlaceResult {
  formatted_address?: string;
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
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
  const [isLoading, setIsLoading] = useState(true);
  const [googleMapsError, setGoogleMapsError] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Handle input value changes from parent component
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Initialize Google Maps Autocomplete
  useEffect(() => {
    // Function to initialize autocomplete
    const initializeAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error("Google Maps JavaScript API not loaded");
        setGoogleMapsError(true);
        setIsLoading(false);
        return;
      }

      try {
        if (inputRef.current) {
          // Initialize autocomplete
          autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'us' },
            fields: ['formatted_address', 'geometry']
          });

          // Add place_changed listener
          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace() as PlaceResult;
            
            if (!place || !place.formatted_address) {
              toast.error("Please select a valid address from the suggestions");
              return;
            }

            // Get coordinates if available
            let coordinates = null;
            if (place.geometry && place.geometry.location) {
              coordinates = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              };
            }

            // Update input value
            setInputValue(place.formatted_address);
            
            // Call the callback
            onAddressSelected(
              place.formatted_address,
              coordinates,
              place.formatted_address
            );
            
            // If parent component has onChange handler, call it too
            if (onChange) {
              onChange(place.formatted_address);
            }
          });
        }
      } catch (error) {
        console.error("Error initializing Google Maps autocomplete:", error);
        setGoogleMapsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Load Google Maps API if needed
    if (window.google && window.google.maps && window.google.maps.places) {
      initializeAutocomplete();
    } else {
      // Script already exists, wait for it to load
      const checkGoogleMapsLoaded = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkGoogleMapsLoaded);
          initializeAutocomplete();
        }
      }, 100);

      // Set a timeout to prevent infinite checking
      setTimeout(() => {
        clearInterval(checkGoogleMapsLoaded);
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          console.error("Google Maps API failed to load in time");
          setGoogleMapsError(true);
          setIsLoading(false);
        }
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearListeners(autocompleteRef.current, 'place_changed');
      }
    };
  }, [onAddressSelected, onChange]);

  // Handle manual input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Call parent onChange if provided
    if (onChange) {
      onChange(newValue);
    }
    
    // For manual address entry when Google Maps fails
    if (googleMapsError && newValue.trim().length > 10) {
      onAddressSelected(
        newValue, 
        { lat: 34.0522, lng: -118.2437 }, // Default coordinates for manual entry
        newValue
      );
    }
  };

  return (
    <div className="relative">
      {isLoading ? (
        <div className="w-full p-3 pl-10 border rounded-lg h-24 bg-muted/20 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading address search...</span>
        </div>
      ) : (
        <>
          <MapPin className="absolute top-3 left-3 text-muted-foreground h-5 w-5" />
          <Input
            ref={inputRef}
            id={id}
            type="text"
            placeholder={googleMapsError ? "Enter full property address..." : placeholder}
            value={inputValue}
            onChange={handleInputChange}
            className={`w-full p-3 pl-10 ${hasError ? 'border-red-500 focus:ring-red-200' : 'focus:ring-primary focus:border-primary'} ${className}`}
          />

          {hasError && errorMessage && (
            <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
          )}
          
          {googleMapsError && inputValue.length > 0 && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm">
              <p>Address autocomplete is unavailable. Please enter a complete address manually.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AddressAutocomplete;
