import React, { useState, useMemo } from 'react';

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

interface ComparativeAnalysisProps {
  districtData: MGNREGARecord[];
  allDistricts: District[];
}

const ComparativeAnalysis: React.FC<ComparativeAnalysisProps> = ({ 
  districtData, 
  allDistricts 
}) => {
  const [selectedComparisonDistrict, setSelectedComparisonDistrict] = useState<string>('');
  const [selectedMetric, setSelectedMetric] = useState<string>('Total_Individuals_Worked');
  const [comparisonType, setComparisonType] = useState<'district' | 'state'>('district');

  // Get current district name from the data
  const currentDistrictName = useMemo(() => {
    return districtData[0]?.district_name || '';
  }, [districtData]);

  const currentStateName = useMemo(() => {
    return districtData[0]?.state_name || '';
  }, [districtData]);

  // Get latest data for current district
  const currentDistrictData = useMemo(() => {
    if (!districtData || districtData.length === 0) return null;
    
    const sorted = [...districtData].sort((a, b) => {
      const yearCompare = b.fin_year.localeCompare(a.fin_year);
      if (yearCompare !== 0) return yearCompare;
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(b.month) - months.indexOf(a.month);
    });
    
    return sorted[0];
  }, [districtData]);

  // Filter districts for comparison (exclude current district and filter by state if needed)
  const availableComparisonDistricts = useMemo(() => {
    return allDistricts.filter(district => 
      district.district_name !== currentDistrictName &&
      (comparisonType === 'state' ? district.state_name === currentStateName : true)
    );
  }, [allDistricts, currentDistrictName, currentStateName, comparisonType]);

  // Metric definitions with user-friendly names and formatting
  const metrics = [
    {
      id: 'Total_Individuals_Worked',
      name: 'Employment Provided',
      description: 'Total individuals who got work',
      icon: '👥',
      format: (value: string) => formatNumber(value),
      unit: 'people'
    },
    {
      id: 'Average_Wage_rate_per_day_per_person',
      name: 'Average Wage Rate',
      description: 'Daily wage per person',
      icon: '💰',
      format: (value: string) => `₹${parseFloat(value || '0').toFixed(2)}`,
      unit: 'per day'
    },
    {
      id: 'Average_days_of_employment_provided_per_Household',
      name: 'Work Days per Household',
      description: 'Average employment days per household',
      icon: '📅',
      format: (value: string) => value || '0',
      unit: 'days'
    },
    {
      id: 'Number_of_Completed_Works',
      name: 'Completed Works',
      description: 'Development works completed',
      icon: '✅',
      format: (value: string) => formatNumber(value),
      unit: 'works'
    },
    {
      id: 'Total_Exp',
      name: 'Total Expenditure',
      description: 'Total funds utilized',
      icon: '💵',
      format: (value: string) => formatCurrency(value),
      unit: ''
    },
    {
      id: 'Wages',
      name: 'Wages Paid',
      description: 'Total wages distributed',
      icon: '👷',
      format: (value: string) => formatCurrency(value),
      unit: ''
    },
    {
      id: 'Women_Persondays',
      name: 'Women Participation',
      description: 'Work days by women',
      icon: '👩',
      format: (value: string) => formatNumber(value),
      unit: 'days'
    },
    {
      id: 'percentage_payments_gererated_within_15_days',
      name: 'Timely Payments',
      description: 'Payments within 15 days',
      icon: '⚡',
      format: (value: string) => `${value || '0'}%`,
      unit: ''
    }
  ];

  // Format large numbers
  const formatNumber = (num: string): string => {
    const value = parseFloat(num) || 0;
    if (value >= 10000000) return (value / 10000000).toFixed(1) + ' Cr';
    if (value >= 100000) return (value / 100000).toFixed(1) + ' L';
    if (value >= 1000) return (value / 1000).toFixed(1) + ' K';
    return value.toString();
  };

  const formatCurrency = (amount: string): string => {
    const value = parseFloat(amount) || 0;
    if (value >= 10000000) return '₹' + (value / 10000000).toFixed(1) + ' Cr';
    if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + ' L';
    if (value >= 1000) return '₹' + (value / 1000).toFixed(1) + ' K';
    return '₹' + value;
  };

  // Calculate comparison data
  const comparisonData = useMemo(() => {
    if (!currentDistrictData || !selectedMetric) return null;

    const currentValue = parseFloat(currentDistrictData[selectedMetric as keyof MGNREGARecord] as string) || 0;
    
    // For demo purposes, we'll generate some comparison data
    // In a real app, you would fetch data for the selected comparison district
    const comparisonDistricts = availableComparisonDistricts.slice(0, 5).map(district => {
      // Generate random values for demonstration (within ±50% of current value)
      const randomFactor = 0.5 + Math.random();
      const comparisonValue = currentValue * randomFactor;
      
      const difference = comparisonValue - currentValue;
      const percentageDiff = currentValue > 0 ? (difference / currentValue) * 100 : 0;

      return {
        name: district.district_name,
        value: comparisonValue,
        difference,
        percentageDiff,
        isBetter: difference > 0
      };
    });

    // Sort by value (descending)
    comparisonDistricts.sort((a, b) => b.value - a.value);

    return {
      currentValue,
      comparisonDistricts,
      averageValue: comparisonDistricts.reduce((sum, district) => sum + district.value, 0) / comparisonDistricts.length,
      maxValue: Math.max(...comparisonDistricts.map(d => d.value)),
      minValue: Math.min(...comparisonDistricts.map(d => d.value))
    };
  }, [currentDistrictData, selectedMetric, availableComparisonDistricts]);

  const selectedMetricInfo = metrics.find(metric => metric.id === selectedMetric);

  if (!currentDistrictData) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚖️</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-4">No Data for Comparison</h3>
        <p className="text-gray-500">
          Unable to load data for {currentDistrictName}. Please try selecting a different district.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          ⚖️ Comparative Analysis
        </h2>
        <p className="text-lg text-gray-600">
          Compare {currentDistrictName}'s performance with other districts
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Comparison Type */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Comparison Scope
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setComparisonType('district')}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  comparisonType === 'district'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                All Districts
              </button>
              <button
                onClick={() => setComparisonType('state')}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  comparisonType === 'state'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Same State
              </button>
            </div>
          </div>

          {/* Metric Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Compare By
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {metrics.map(metric => (
                <option key={metric.id} value={metric.id}>
                  {metric.name}
                </option>
              ))}
            </select>
          </div>

          {/* District Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Compare With District
            </label>
            <select
              value={selectedComparisonDistrict}
              onChange={(e) => setSelectedComparisonDistrict(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a district</option>
              {availableComparisonDistricts.map(district => (
                <option key={district.district_code} value={district.district_name}>
                  {district.district_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Current District Summary */}
      {selectedMetricInfo && comparisonData && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {currentDistrictName}'s Performance
              </h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900">
                  {selectedMetricInfo.format(currentDistrictData[selectedMetric as keyof MGNREGARecord] as string)}
                </span>
                <span className="text-gray-600">{selectedMetricInfo.unit}</span>
              </div>
              <p className="text-gray-600 mt-1">{selectedMetricInfo.description}</p>
            </div>
            <div className="text-4xl">{selectedMetricInfo.icon}</div>
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {comparisonData && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Comparison with Other {comparisonType === 'state' ? 'State' : ''} Districts
          </h3>

          {/* Statistics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600">
                {selectedMetricInfo?.format(comparisonData.maxValue.toString())}
              </div>
              <div className="text-sm text-gray-600">Highest Performing District</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {selectedMetricInfo?.format(comparisonData.averageValue.toString())}
              </div>
              <div className="text-sm text-gray-600">Average Among Districts</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-red-600">
                {selectedMetricInfo?.format(comparisonData.minValue.toString())}
              </div>
              <div className="text-sm text-gray-600">Lowest Performing District</div>
            </div>
          </div>

          {/* Comparison List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
              <div className="col-span-5">District</div>
              <div className="col-span-3 text-right">Value</div>
              <div className="col-span-4 text-right">Comparison</div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {comparisonData.comparisonDistricts.map((district, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-5">
                    <div className="font-medium text-gray-800">{district.name}</div>
                    <div className="text-sm text-gray-500">
                      {index === 0 && <span className="text-green-600 font-medium">🏆 Best</span>}
                      {index === comparisonData.comparisonDistricts.length - 1 && 
                       <span className="text-red-600 font-medium">📉 Needs Improvement</span>}
                    </div>
                  </div>
                  
                  <div className="col-span-3 text-right">
                    <div className="font-semibold text-gray-900">
                      {selectedMetricInfo?.format(district.value.toString())}
                    </div>
                  </div>
                  
                  <div className="col-span-4 text-right">
                    {district.difference !== 0 && (
                      <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                        district.isBetter 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <span>{district.isBetter ? '↑' : '↓'}</span>
                        <span>
                          {Math.abs(district.percentageDiff).toFixed(1)}%
                          {district.isBetter ? ' better' : ' lower'}
                        </span>
                      </div>
                    )}
                    {district.difference === 0 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        Same
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
              <span className="text-lg mr-2">💡</span>
              Performance Insights
            </h4>
            <div className="space-y-2 text-yellow-700">
              <p>
                <strong>Current Rank:</strong> {comparisonData.comparisonDistricts.findIndex(d => 
                  Math.abs(d.value - comparisonData.currentValue) < 0.01
                ) + 1} out of {comparisonData.comparisonDistricts.length + 1} districts
              </p>
              <p>
                <strong>Performance:</strong> {
                  comparisonData.currentValue > comparisonData.averageValue * 1.1 
                    ? 'Above average - Good work!' 
                    : comparisonData.currentValue < comparisonData.averageValue * 0.9
                    ? 'Below average - Needs improvement'
                    : 'Average - Room for growth'
                }
              </p>
              <p>
                <strong>Gap to Best:</strong> {
                  selectedMetricInfo?.format((comparisonData.maxValue - comparisonData.currentValue).toString())
                } difference from top performer
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 text-lg">ℹ️</div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">How to Use This Comparison</h4>
            <p className="text-blue-700 text-sm">
              This comparison helps you understand how your district is performing relative to others. 
              Use the filters above to compare with specific districts or see how you rank within your state.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparativeAnalysis;