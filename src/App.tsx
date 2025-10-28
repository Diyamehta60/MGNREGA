import { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import DistrictSelector from './components/DistrictSelector';
import PerformanceDashboard from './components/PerformanceDashboard';
import { fetchMGNREGAData, cacheData, getCachedData } from './utils/api';
import ComparativeAnalysis from './components/ComparativeAnalysis';
import HistoricalTrends from './components/HistoricalTrends';
import LoadingSpinner from './components/LoadingSpinner';

// Type definitions
interface District {
  state_name: string;
  district_name: string;
  state_code: string;
  district_code: string;
}

interface MGNREGARecord {
  fin_year: string;
  month: string;
  state_code: string;
  state_name: string;
  district_code: string;
  district_name: string;
  Approved_Labour_Budget: string;
  Average_Wage_rate_per_day_per_person: string;
  Average_days_of_employment_provided_per_Household: string;
  Differently_abled_persons_worked: string;
  Material_and_skilled_Wages: string;
  Number_of_Completed_Works: string;
  Number_of_GPs_with_NIL_exp: string;
  Number_of_Ongoing_Works: string;
  Persondays_of_Central_Liability_so_far: string;
  SC_persondays: string;
  SC_workers_against_active_workers: string;
  ST_persondays: string;
  ST_workers_against_active_workers: string;
  Total_Adm_Expenditure: string;
  Total_Exp: string;
  Total_Households_Worked: string;
  Total_Individuals_Worked: string;
  Total_No_of_Active_Job_Cards: string;
  Total_No_of_Active_Workers: string;
  Total_No_of_HHs_completed_100_Days_of_Wage_Employment: string;
  Total_No_of_JobCards_issued: string;
  Total_No_of_Workers: string;
  Total_No_of_Works_Takenup: string;
  Wages: string;
  Women_Persondays: string;
  percent_of_Category_B_Works: string;
  percent_of_Expenditure_on_Agriculture_Allied_Works: string;
  percent_of_NRM_Expenditure: string;
  percentage_payments_gererated_within_15_days: string;
  Remarks: string;
}

type ActiveTab = 'current' | 'comparative' | 'historical';

function App() {
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [districtData, setDistrictData] = useState<MGNREGARecord[] | null>(null);
  const [allDistricts, setAllDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('current');

  // Load available districts on app start
  useEffect(() => {
    loadDistricts();
  }, []);

  const loadDistricts = async () => {
    try {
      setLoading(true);
      const data = await fetchMGNREGAData();
      if (data && data.records) {
        // Extract unique districts
        const districtsMap = new Map();
        data.records.forEach((record: MGNREGARecord) => {
          const key = `${record.state_name}-${record.district_name}`;
          if (!districtsMap.has(key)) {
            districtsMap.set(key, {
              state_name: record.state_name,
              district_name: record.district_name,
              state_code: record.state_code,
              district_code: record.district_code
            });
          }
        });
        setAllDistricts(Array.from(districtsMap.values()));
      }
    } catch (error) {
      toast.error('Failed to load districts data');
      console.error('Error loading districts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStateSelect = async (stateName: string) => {
  try {
    setLoading(true);
    const data = await fetchMGNREGAData(undefined, stateName);
    if (data && data.records) {
      // Extract unique districts from the state data
      const districtsMap = new Map();
      data.records.forEach((record: MGNREGARecord) => {
        const key = `${record.state_name}-${record.district_name}`;
        if (!districtsMap.has(key)) {
          districtsMap.set(key, {
            state_name: record.state_name,
            district_name: record.district_name,
            state_code: record.state_code,
            district_code: record.district_code
          });
        }
      });
      setAllDistricts(Array.from(districtsMap.values()));
    }
  } catch (error) {
    toast.error(`Failed to load districts for ${stateName}`);
    console.error('Error loading state districts:', error);
  } finally {
    setLoading(false);
  }
};

  const handleDistrictSelect = useCallback(async (district: District | null) => {
    if (!district) {
      setSelectedDistrict(null);
      setDistrictData(null);
      return;
    }
    
    setSelectedDistrict(district);
    setLoading(true);
    
    try {
      // Try to get cached data first
      const cacheKey = `${district.state_name}-${district.district_name}`;
      const cached = getCachedData(cacheKey);
      
      if (cached) {
        setDistrictData(cached);
        toast.success('Loaded cached data');
      } else {
        const data = await fetchMGNREGAData(district.district_name);
        if (data && data.records) {
          const districtRecords = data.records.filter(
            (record: MGNREGARecord) => record.district_name === district.district_name
          );
          setDistrictData(districtRecords);
          cacheData(cacheKey, districtRecords);
        }
      }
    } catch (error) {
      toast.error('Failed to load district data');
      console.error('Error loading district data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="text-4xl">🇮🇳</div>
            <div className="text-center">
              <h1 className="text-3xl font-bold">MGNREGA District Performance</h1>
              <p className="text-green-100 mt-2 text-lg">
                Understanding your district's MGNREGA performance made simple
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* District Selection */}
        <section className="mb-8">
          <DistrictSelector
            districts={allDistricts}
            onDistrictSelect={handleDistrictSelect}
            selectedDistrict={selectedDistrict}
            loading={loading}
            onStateSelect={handleStateSelect}
          />
        </section>

        {/* Performance Data */}
        {selectedDistrict && districtData && (
          <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center space-x-2 transition-colors ${
                  activeTab === 'current' 
                    ? 'bg-white text-green-700 border-t-2 border-green-600' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
                onClick={() => setActiveTab('current')}
              >
                <span>📊</span>
                <span>Current Performance</span>
              </button>
              <button
                className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center space-x-2 transition-colors ${
                  activeTab === 'comparative' 
                    ? 'bg-white text-green-700 border-t-2 border-green-600' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
                onClick={() => setActiveTab('comparative')}
              >
                <span>⚖️</span>
                <span>Compare</span>
              </button>
              <button
                className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center space-x-2 transition-colors ${
                  activeTab === 'historical' 
                    ? 'bg-white text-green-700 border-t-2 border-green-600' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
                onClick={() => setActiveTab('historical')}
              >
                <span>📈</span>
                <span>Trends</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'current' && (
                <PerformanceDashboard 
                  data={districtData} 
                  district={selectedDistrict}
                />
              )}
              {activeTab === 'comparative' && (
                <ComparativeAnalysis 
                  districtData={districtData}
                  allDistricts={allDistricts}
                />
              )}
              {activeTab === 'historical' && (
                <HistoricalTrends 
                  data={districtData}
                  district={selectedDistrict}
                />
              )}
            </div>
          </section>
        )}

        {/* Loading State */}
        {loading && <LoadingSpinner />}

        {/* No District Selected */}
        {!selectedDistrict && !loading && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-6">👋</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to MGNREGA Performance Tracker
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Select your district from the dropdown above to see performance data about employment, wages, and development works in your area.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-semibold text-green-800 mb-2">Current Performance</h3>
                <p className="text-green-700 text-sm">Latest employment and wage data</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="text-3xl mb-3">⚖️</div>
                <h3 className="font-semibold text-blue-800 mb-2">Comparative Analysis</h3>
                <p className="text-blue-700 text-sm">Compare with other districts</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="font-semibold text-purple-800 mb-2">Historical Trends</h3>
                <p className="text-purple-700 text-sm">Progress over time</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                <div className="text-3xl mb-3">🌐</div>
                <h3 className="font-semibold text-orange-800 mb-2">Easy to Understand</h3>
                <p className="text-orange-700 text-sm">Simple language for everyone</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-300 mb-2">
            Data Source: data.gov.in | Ministry of Rural Development
          </p>
          <p className="text-gray-400">
            Made for the people of India 🇮🇳
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;