import { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MapPin, Check } from 'lucide-react';

interface LocationAutocompleteFieldProps {
  value: string;
  onChange: (value: string) => void;
}

// Generic UK locations list
const UK_LOCATIONS = [
  'London',
  'Birmingham',
  'Manchester',
  'Liverpool',
  'Leeds',
  'Sheffield',
  'Bristol',
  'Glasgow',
  'Edinburgh',
  'Leicester',
  'Coventry',
  'Bradford',
  'Cardiff',
  'Belfast',
  'Nottingham',
  'Kingston upon Hull',
  'Newcastle upon Tyne',
  'Stoke-on-Trent',
  'Southampton',
  'Derby',
  'Portsmouth',
  'Brighton and Hove',
  'Plymouth',
  'Northampton',
  'Reading',
  'Luton',
  'Wolverhampton',
  'Bolton',
  'Bournemouth',
  'Norwich',
  'Swindon',
  'Swansea',
  'Southend-on-Sea',
  'Middlesbrough',
  'Milton Keynes',
  'Aberdeen',
  'Dundee',
  'Cambridge',
  'Oxford',
  'Bath',
  'Canterbury',
  'Chester',
  'Exeter',
  'York',
  'Worcester',
  'Gloucester',
  'Lincoln',
  'Peterborough',
  'Lancaster',
  'Carlisle',
  'Durham',
  'Inverness',
  'Stirling',
  'Perth',
  'Bangor',
  'St Albans',
  'Winchester',
  'Salisbury',
  'Chichester',
  'Truro',
  'Hereford',
  'Chelmsford',
  'Maidstone',
  'Guildford',
  'Aylesbury',
  'Taunton',
  'Warwick',
  'Lichfield',
  'Wells',
  'Ripon',
  'Ely',
  'Armagh',
  'Lisburn',
  'Newry'
];

export const LocationAutocompleteField = ({ value, onChange }: LocationAutocompleteFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const filtered = UK_LOCATIONS.filter(location =>
        location.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10); // Limit to 10 results
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  const handleLocationSelect = (location: string) => {
    onChange(location);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (value && filteredLocations.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="location">Location *</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          id="location"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Enter city, postcode, or area you serve"
          className="pl-10"
          autoComplete="off"
        />
        
        {isOpen && filteredLocations.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {filteredLocations.map((location, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center justify-between text-sm"
                onClick={() => handleLocationSelect(location)}
              >
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 text-muted-foreground mr-2" />
                  {location}
                </div>
                {value === location && (
                  <Check className="h-3 w-3 text-primary" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};