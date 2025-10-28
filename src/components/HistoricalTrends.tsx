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

interface HistoricalTrendsProps {
  data: MGNREGARecord[];
  district: District;
}

interface TrendData {
  period: string;
  employment: number;
  wages: number;
  completedWorks: number;
  womenParticipation: number;
  timelyPayments: number;
}

const HistoricalTrends: React.FC<HistoricalTrendsProps> = ({ data, district }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('employment');
  const [timeRange, setTimeRange] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Available metrics for trend analysis
  const metrics = [
    {
      id: 'employment',
      name: 'Employment',
      description: 'Total individuals employed',
      icon: '👥',
      color: 'blue',
      key: 'Total_Individuals_Worked' as keyof MGNREGARecord
    },
    {
      id: 'wages',
      name: 'Wage Rate',
      description: 'Average daily wage rate',
      icon: '💰',
      color: 'green',
      key: 'Average_Wage_rate_per_day_per_person' as keyof MGNREGARecord
    },
    {
      id: 'completedWorks',
      name: 'Completed Works',
      description: 'Development works completed',
      icon: '✅',
      color: 'purple',
      key: 'Number_of_Completed_Works' as keyof MGNREGARecord
    },
    {
      id: 'womenParticipation',
      name: 'Women Participation',
      description: 'Work days by women',
      icon: '👩',
      color: 'pink',
      key: 'Women_Persondays' as keyof MGNREGARecord
    },
    {
      id: 'timelyPayments',
      name: 'Timely Payments',
      description: 'Payments within 15 days',
      icon: '⚡',
      color: 'orange',
      key: 'percentage_payments_gererated_within_15_days' as keyof MGNREGARecord
    }
  ];

  // Process data for trends
  const trendData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort data chronologically
    const sortedData = [...data].sort((a, b) => {
      const yearCompare = a.fin_year.localeCompare(b.fin_year);
      if (yearCompare !== 0) return yearCompare;
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });

    // Filter by selected year if any
    const filteredData = selectedYear 
      ? sortedData.filter(record => record.fin_year === selectedYear)
      : sortedData;

    if (timeRange === 'yearly') {
      // Group by financial year
      const yearlyData: { [key: string]: MGNREGARecord[] } = {};
      filteredData.forEach(record => {
        if (!yearlyData[record.fin_year]) {
          yearlyData[record.fin_year] = [];
        }
        yearlyData[record.fin_year].push(record);
      });

      return Object.entries(yearlyData).map(([year, records]) => {
        // Use the latest month's data for each year
        const latestRecord = records[records.length - 1];
        return {
          period: year,
          employment: parseFloat(latestRecord.Total_Individuals_Worked) || 0,
          wages: parseFloat(latestRecord.Average_Wage_rate_per_day_per_person) || 0,
          completedWorks: parseFloat(latestRecord.Number_of_Completed_Works) || 0,
          womenParticipation: parseFloat(latestRecord.Women_Persondays) || 0,
          timelyPayments: parseFloat(latestRecord.percentage_payments_gererated_within_15_days) || 0
        };
      });
    } else {
      // Monthly data
      return filteredData.map(record => ({
        period: `${record.month} ${record.fin_year}`,
        employment: parseFloat(record.Total_Individuals_Worked) || 0,
        wages: parseFloat(record.Average_Wage_rate_per_day_per_person) || 0,
        completedWorks: parseFloat(record.Number_of_Completed_Works) || 0,
        womenParticipation: parseFloat(record.Women_Persondays) || 0,
        timelyPayments: parseFloat(record.percentage_payments_gererated_within_15_days) || 0
      }));
    }
  }, [data, timeRange, selectedYear]);

  // Get available years for filtering
  const availableYears = useMemo(() => {
    if (!data) return [];
    const years = new Set(data.map(record => record.fin_year));
    return Array.from(years).sort();
  }, [data]);

  // Calculate trends and statistics
  const trendStats = useMemo(() => {
    if (trendData.length === 0) return null;

    const currentMetric = metrics.find(m => m.id === selectedMetric);
    if (!currentMetric) return null;

    const values = trendData.map(d => d[currentMetric.id as keyof TrendData] as number);
    const currentValue = values[values.length - 1];
    const previousValue = values.length > 1 ? values[values.length - 2] : currentValue;
    
    const change = currentValue - previousValue;
    const percentageChange = previousValue > 0 ? (change / previousValue) * 100 : 0;

    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;

    return {
      currentValue,
      change,
      percentageChange,
      maxValue,
      minValue,
      averageValue,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  }, [trendData, selectedMetric]);

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + ' Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + ' L';
    if (num >= 1000) return (num / 1000).toFixed(1) + ' K';
    return num.toFixed(0);
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000) return '₹' + (amount / 1000).toFixed(1) + 'K';
    return '₹' + amount.toFixed(0);
  };

  // Get color classes based on metric
  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-500 text-blue-600 border-blue-200 bg-blue-50',
      green: 'bg-green-500 text-green-600 border-green-200 bg-green-50',
      purple: 'bg-purple-500 text-purple-600 border-purple-200 bg-purple-50',
      pink: 'bg-pink-500 text-pink-600 border-pink-200 bg-pink-50',
      orange: 'bg-orange-500 text-orange-600 border-orange-200 bg-orange-50'
    };
    return colorMap[color] || colorMap.blue;
  };

  // Calculate bar height for chart (0-100%)
  const calculateBarHeight = (value: number, maxValue: number): number => {
    if (maxValue === 0) return 0;
    return (value / maxValue) * 100;
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📈</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-4">No Historical Data Available</h3>
        <p className="text-gray-500">
          There is no historical data available for {district.district_name} at this time.
        </p>
      </div>
    );
  }

  const selectedMetricInfo = metrics.find(m => m.id === selectedMetric);
  const maxValue = Math.max(...trendData.map(d => d[selectedMetric as keyof TrendData] as number));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          📈 Historical Trends
        </h2>
        <p className="text-lg text-gray-600">
          Track {district.district_name}'s performance over time
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Time Range */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Time Range
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeRange('monthly')}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  timeRange === 'monthly'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeRange('yearly')}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  timeRange === 'yearly'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* Metric Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Performance Metric
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

          {/* Year Filter */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Filter by Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Trend Summary */}
      {trendStats && selectedMetricInfo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {selectedMetricInfo.id === 'wages' 
                ? formatCurrency(trendStats.currentValue)
                : selectedMetricInfo.id === 'timelyPayments'
                ? `${trendStats.currentValue.toFixed(1)}%`
                : formatNumber(trendStats.currentValue)
              }
            </div>
            <div className="text-sm text-gray-600">Current Value</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <div className={`text-2xl font-bold mb-1 ${
              trendStats.trend === 'up' ? 'text-green-600' : 
              trendStats.trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trendStats.trend === 'up' ? '↑' : trendStats.trend === 'down' ? '↓' : '→'}
              {Math.abs(trendStats.percentageChange).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Change</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {selectedMetricInfo.id === 'wages' 
                ? formatCurrency(trendStats.maxValue)
                : selectedMetricInfo.id === 'timelyPayments'
                ? `${trendStats.maxValue.toFixed(1)}%`
                : formatNumber(trendStats.maxValue)
              }
            </div>
            <div className="text-sm text-gray-600">Highest</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {selectedMetricInfo.id === 'wages' 
                ? formatCurrency(trendStats.averageValue)
                : selectedMetricInfo.id === 'timelyPayments'
                ? `${trendStats.averageValue.toFixed(1)}%`
                : formatNumber(trendStats.averageValue)
              }
            </div>
            <div className="text-sm text-gray-600">Average</div>
          </div>
        </div>
      )}

      {/* Trend Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <span className={`w-1 h-6 ${getColorClasses(selectedMetricInfo?.color || 'blue').split(' ')[0]} rounded mr-3`}></span>
          {selectedMetricInfo?.name} Trend
        </h3>

        {trendData.length > 0 ? (
          <div className="space-y-4">
            {/* Chart Bars */}
            <div className="flex items-end justify-between space-x-2 h-64">
              {trendData.map((dataPoint, index) => {
                const value = dataPoint[selectedMetric as keyof TrendData] as number;
                const height = calculateBarHeight(value, maxValue);
                const colorClass = getColorClasses(selectedMetricInfo?.color || 'blue').split(' ')[0];
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                    <div className="text-xs text-gray-500 text-center h-8 flex items-center justify-center">
                      {dataPoint.period}
                    </div>
                    <div
                      className={`w-full ${colorClass} rounded-t transition-all duration-500 ease-in-out hover:opacity-80 cursor-pointer relative group`}
                      style={{ height: `${Math.max(height, 5)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {selectedMetricInfo?.id === 'wages' 
                          ? formatCurrency(value)
                          : selectedMetricInfo?.id === 'timelyPayments'
                          ? `${value.toFixed(1)}%`
                          : formatNumber(value)
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis label */}
            <div className="text-center text-sm text-gray-600 mt-4">
              {timeRange === 'monthly' ? 'Months' : 'Financial Years'}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-500">No data available for the selected filters</p>
          </div>
        )}
      </div>

      {/* Data Table */}
      {trendData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Detailed Data</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  {metrics.map(metric => (
                    <th key={metric.id} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {metric.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {trendData.map((dataPoint, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dataPoint.period}
                    </td>
                    {metrics.map(metric => {
                      const value = dataPoint[metric.id as keyof TrendData] as number;
                      return (
                        <td key={metric.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {metric.id === 'wages' 
                            ? formatCurrency(value)
                            : metric.id === 'timelyPayments'
                            ? `${value.toFixed(1)}%`
                            : formatNumber(value)
                          }
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trend Analysis */}
      {trendStats && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
            <span className="text-lg mr-2">📊</span>
            Trend Analysis
          </h4>
          <div className="space-y-2 text-blue-700">
            <p>
              <strong>Overall Trend:</strong> {
                trendStats.trend === 'up' ? 'Improving 📈' : 
                trendStats.trend === 'down' ? 'Declining 📉' : 'Stable →'
              }
            </p>
            <p>
              <strong>Performance:</strong> {
                trendStats.currentValue > trendStats.averageValue * 1.1 
                  ? 'Better than average performance' 
                  : trendStats.currentValue < trendStats.averageValue * 0.9
                  ? 'Below average performance'
                  : 'Average performance'
              }
            </p>
            <p>
              <strong>Consistency:</strong> {
                (trendStats.maxValue - trendStats.minValue) / trendStats.averageValue < 0.3
                  ? 'Stable and consistent performance'
                  : 'Variable performance with significant changes'
              }
            </p>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-green-600 text-lg">💡</div>
          <div>
            <h4 className="font-semibold text-green-800 mb-1">Understanding Trends</h4>
            <p className="text-green-700 text-sm">
              Track how MGNREGA performance changes over time. Look for consistent improvements in key metrics 
              like employment, wages, and timely payments. Upward trends indicate better implementation and 
              more benefits reaching the community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalTrends;