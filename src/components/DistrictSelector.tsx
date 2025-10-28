import React, { useState, useMemo } from 'react';
// import { fetchMGNREGAData } from './api';

interface District {
  state_name: string;
  district_name: string;
  state_code: string;
  district_code: string;
}

interface DistrictSelectorProps {
  districts: District[];
  onDistrictSelect: (district: District | null) => void;
  selectedDistrict: District | null;
  loading: boolean;
  onStateSelect: (stateName: string) => void;
}

const DistrictSelector: React.FC<DistrictSelectorProps> = ({
  districts,
  onDistrictSelect,
  selectedDistrict,
  loading,
  onStateSelect
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');

  // Group districts by state
  const states = useMemo(() => {
    const stateMap = new Map<string, District[]>();
    districts.forEach(district => {
      if (!stateMap.has(district.state_name)) {
        stateMap.set(district.state_name, []);
      }
      stateMap.get(district.state_name)!.push(district);
    });

    stateMap.set("RAJASTHAN", []);
    return stateMap;
  }, [districts]);

  // Filter districts based on search and state selection
  const filteredDistricts = useMemo(() => {
    return districts.filter(district => {
      const matchesSearch = district.district_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          district.state_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesState = !selectedState || district.state_name === selectedState;
      return matchesSearch && matchesState;
    });
  }, [districts, searchTerm, selectedState]);

  const handleDistrictClick = (district: District) => {
    onDistrictSelect(district);
    setSearchTerm('');
    setSelectedState('');
  };

  const handleClearSelection = () => {
    onDistrictSelect(null);
    setSearchTerm('');
    setSelectedState('');
  };

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    if (stateName) {
      onStateSelect(stateName);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Find Your District</h2>
        <p className="text-gray-600">Select your district to see MGNREGA performance data</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* State Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Filter by State
          </label>
          <select 
            value={selectedState} 
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
          >
            <option value="">All States</option>
            {Array.from(states.keys()).map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Search District
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Type district name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected District Info */}
      {selectedDistrict && (
        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📍</div>
              <div>
                <div className="font-semibold text-green-800">
                  Selected: <span className="text-green-900">{selectedDistrict.district_name}</span>
                </div>
                <div className="text-sm text-green-700">
                  {selectedDistrict.state_name}
                </div>
              </div>
            </div>
            <button 
              onClick={handleClearSelection}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Change District
            </button>
          </div>
        </div>
      )}

      {/* Districts Grid */}
      {!selectedDistrict && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {filteredDistricts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                {filteredDistricts.slice(0, 100).map((district, index) => (
                  <button
                    key={`${district.state_code}-${district.district_code}-${index}`}
                    onClick={() => handleDistrictClick(district)}
                    className="text-left p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <div className="font-semibold text-gray-800 mb-1 truncate">
                      {district.district_name}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {district.state_name}
                    </div>
                  </button>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No districts found
                </h3>
                <p className="text-gray-500">
                  No districts found for "<span className="font-medium">{searchTerm}</span>"
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Try a different search term or state filter
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏛️</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No districts available
                </h3>
                <p className="text-gray-500">
                  District data is being loaded...
                </p>
              </div>
            )}
          </div>

          {/* Results Count */}
          {filteredDistricts.length > 0 && (
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {Math.min(filteredDistricts.length, 100)} of {filteredDistricts.length} districts
                {selectedState && ` in ${selectedState}`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading district data...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the latest information</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictSelector;