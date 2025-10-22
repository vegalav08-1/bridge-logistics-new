'use client';
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Address {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
}

interface ArrivalAddressSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function ArrivalAddressSelect({ value, onChange, error }: ArrivalAddressSelectProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Загружаем адреса от администраторов
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        // В реальном приложении здесь был бы API запрос
        // Пока используем моковые данные
        const mockAddresses: Address[] = [
          {
            id: 'addr_1',
            name: 'Склад "Северный"',
            address: 'ул. Промышленная, д. 15',
            city: 'Санкт-Петербург',
            country: 'Россия'
          },
          {
            id: 'addr_2',
            name: 'Склад "Южный"',
            address: 'ул. Логистическая, д. 42',
            city: 'Москва',
            country: 'Россия'
          },
          {
            id: 'addr_3',
            name: 'Терминал "Восток"',
            address: 'пр. Транспортный, д. 8',
            city: 'Новосибирск',
            country: 'Россия'
          },
          {
            id: 'addr_4',
            name: 'Склад "Западный"',
            address: 'ул. Складская, д. 25',
            city: 'Калининград',
            country: 'Россия'
          }
        ];
        
        setAddresses(mockAddresses);
      } catch (error) {
        console.error('Ошибка загрузки адресов:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, []);

  const selectedAddress = addresses.find(addr => addr.id === value);

  const handleSelect = (addressId: string) => {
    onChange(addressId);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="w-full h-11 rounded-xl border border-gray-300 px-3 flex items-center text-gray-500">
        Загрузка адресов...
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 rounded-xl border px-3 flex items-center justify-between ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${isOpen ? 'ring-2 ring-[var(--brand)] ring-opacity-50' : ''}`}
      >
        <span className={selectedAddress ? 'text-gray-900' : 'text-gray-500'}>
          {selectedAddress 
            ? `${selectedAddress.name} - ${selectedAddress.address}, ${selectedAddress.city}`
            : 'Выберите адрес прибытия'
          }
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {addresses.map((address) => (
            <button
              key={address.id}
              type="button"
              onClick={() => handleSelect(address.id)}
              className="w-full px-3 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="font-medium text-gray-900">{address.name}</div>
              <div className="text-sm text-gray-600">
                {address.address}, {address.city}, {address.country}
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
