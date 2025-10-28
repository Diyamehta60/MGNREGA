import React, { useMemo } from 'react';

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

interface PerformanceDashboardProps {
  data: MGNREGARecord[];
  district: District;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ data, district }) => {
  const latestData = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // Sort by financial year and month to get latest
    const sorted = [...data].sort((a, b) => {
      const yearCompare = b.fin_year.localeCompare(a.fin_year);
      if (yearCompare !== 0) return yearCompare;
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(b.month) - months.indexOf(a.month);
    });
    
    return sorted[0];
  }, [data]);

  // Format large numbers for better readability
  const formatNumber = (num: string | number): string => {
    const value = typeof num === 'string' ? parseFloat(num) || 0 : num;
    if (value >= 10000000) return (value / 10000000).toFixed(1) + ' Cr';
    if (value >= 100000) return (value / 100000).toFixed(1) + ' L';
    if (value >= 1000) return (value / 1000).toFixed(1) + ' K';
    return value.toString();
  };

  const formatCurrency = (amount: string | number): string => {
    const value = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
    if (value >= 10000000) return '₹' + (value / 10000000).toFixed(1) + ' Cr';
    if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + ' L';
    if (value >= 1000) return '₹' + (value / 1000).toFixed(1) + ' K';
    return '₹' + value;
  };

  const getPerformanceColor = (value: number, threshold: number): string => {
    if (value >= threshold * 1.1) return 'text-green-600';
    if (value >= threshold * 0.9) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!latestData) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-4">No Performance Data Available</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          There is no performance data available for {district.district_name} at this time.
          Please check back later or try a different district.
        </p>
      </div>
    );
  }

  const performanceMetrics = [
    {
      title: 'Employment Provided',
      icon: '👥',
      value: formatNumber(latestData.Total_Individuals_Worked),
      subtitle: 'People employed',
      description: 'Total individuals who got work under MGNREGA',
      trend: 'positive'
    },
    {
      title: 'Average Wage Rate',
      icon: '💰',
      value: `₹${parseFloat(latestData.Average_Wage_rate_per_day_per_person || '0').toFixed(2)}`,
      subtitle: 'Per day per person',
      description: 'Average daily wage rate provided',
      trend: 'positive'
    },
    {
      title: 'Work Days Provided',
      icon: '📅',
      value: latestData.Average_days_of_employment_provided_per_Household || '0',
      subtitle: 'Days per household',
      description: 'Average employment days per household',
      trend: 'neutral'
    },
    {
      title: 'Completed Works',
      icon: '✅',
      value: formatNumber(latestData.Number_of_Completed_Works),
      subtitle: 'Projects finished',
      description: 'Development works successfully completed',
      trend: 'positive'
    }
  ];

  const socialInclusionMetrics = [
    {
      title: 'Women Participation',
      icon: '👩',
      value: formatNumber(latestData.Women_Persondays),
      subtitle: 'Women work days',
      description: 'Total days worked by women',
      percentage: ((parseFloat(latestData.Women_Persondays) / parseFloat(latestData.Total_Individuals_Worked)) * 100).toFixed(1)
    },
    {
      title: 'SC Community',
      icon: '🤝',
      value: formatNumber(latestData.SC_persondays),
      subtitle: 'SC work days',
      description: 'Days worked by SC community',
      percentage: ((parseFloat(latestData.SC_persondays) / parseFloat(latestData.Total_Individuals_Worked)) * 100).toFixed(1)
    },
    {
      title: 'ST Community',
      icon: '🌳',
      value: formatNumber(latestData.ST_persondays),
      subtitle: 'ST work days',
      description: 'Days worked by ST community',
      percentage: ((parseFloat(latestData.ST_persondays) / parseFloat(latestData.Total_Individuals_Worked)) * 100).toFixed(1)
    },
    {
      title: 'Differently Abled',
      icon: '♿',
      value: formatNumber(latestData.Differently_abled_persons_worked),
      subtitle: 'Persons worked',
      description: 'Employment provided to differently abled',
      trend: 'positive'
    }
  ];

  const financialMetrics = [
    {
      title: 'Total Expenditure',
      icon: '💵',
      value: formatCurrency(latestData.Total_Exp),
      description: 'Total funds utilized',
      size: 'large' as const
    },
    {
      title: 'Wages Paid',
      icon: '👷',
      value: formatCurrency(latestData.Wages),
      description: 'Total wages distributed to workers',
      size: 'large' as const
    },
    {
      title: 'Timely Payments',
      icon: '⚡',
      value: `${latestData.percentage_payments_gererated_within_15_days || '0'}%`,
      description: 'Payments made within 15 days',
      size: 'medium' as const,
      color: getPerformanceColor(parseFloat(latestData.percentage_payments_gererated_within_15_days || '0'), 80)
    }
  ];

  const additionalInfo = [
    { label: 'Active Job Cards', value: formatNumber(latestData.Total_No_of_Active_Job_Cards) },
    { label: 'Active Workers', value: formatNumber(latestData.Total_No_of_Active_Workers) },
    { label: 'Households Completed 100 Days', value: formatNumber(latestData.Total_No_of_HHs_completed_100_Days_of_Wage_Employment) },
    { label: 'Ongoing Works', value: formatNumber(latestData.Number_of_Ongoing_Works) },
    { label: 'Total Works Taken Up', value: formatNumber(latestData.Total_No_of_Works_Takenup) },
    { label: 'Approved Labour Budget', value: formatNumber(latestData.Approved_Labour_Budget) }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            📊 {district.district_name} Performance
          </h2>
          <p className="text-lg text-gray-600 mt-1">
            {latestData.month} {latestData.fin_year} • {district.state_name}
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-800 font-medium">Latest data available</span>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <span className="w-1 h-6 bg-green-500 rounded mr-3"></span>
          Key Performance Indicators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{metric.icon}</div>
                {metric.trend === 'positive' && (
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    👍 Good
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <div className="font-semibold text-gray-800 mb-1">{metric.title}</div>
              <div className="text-sm text-gray-600 mb-2">{metric.subtitle}</div>
              <div className="text-xs text-gray-500">{metric.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Financial Overview */}
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <span className="w-1 h-6 bg-blue-500 rounded mr-3"></span>
          Financial Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {financialMetrics.map((metric, index) => (
            <div key={index} className={`bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 ${
              metric.size === 'large' ? 'md:col-span-1' : ''
            }`}>
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{metric.icon}</div>
                <div>
                  <div className={`text-2xl font-bold ${metric.color || 'text-gray-900'} mb-1`}>
                    {metric.value}
                  </div>
                  <div className="font-semibold text-gray-800 mb-1">{metric.title}</div>
                  <div className="text-sm text-gray-600">{metric.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Inclusion */}
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <span className="w-1 h-6 bg-purple-500 rounded mr-3"></span>
          Social Inclusion & Diversity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {socialInclusionMetrics.map((metric, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-3xl mb-4">{metric.icon}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <div className="font-semibold text-gray-800 mb-1">{metric.title}</div>
              <div className="text-sm text-gray-600 mb-2">{metric.subtitle}</div>
              {metric.percentage && (
                <div className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium inline-block">
                  {metric.percentage}% of total
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Additional Information */}
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <span className="w-1 h-6 bg-gray-500 rounded mr-3"></span>
          Additional Information
        </h3>
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {additionalInfo.map((info, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">{info.label}</div>
                <div className="text-lg font-semibold text-gray-900">{info.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Source Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-yellow-600 text-lg">💡</div>
          <div>
            <h4 className="font-semibold text-yellow-800 mb-1">Understanding the Data</h4>
            <p className="text-yellow-700 text-sm">
              This data shows how MGNREGA is performing in your district. Higher numbers in employment, 
              wages, and completed works indicate better implementation of the scheme.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;