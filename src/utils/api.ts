// API configuration
const API_BASE_URL = 'https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722';
const API_KEY = import.meta.env.VITE_API_KEY 


// Cache configuration
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Type definitions for API response
export interface MGNREGARecord {
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

export interface APIResponse {
  index_name: string;
  title: string;
  desc: string;
  org_type: string;
  org: string[];
  sector: string[];
  source: string;
  catalog_uuid: string;
  visualizable: string;
  active: string;
  created: number;
  updated: number;
  created_date: string;
  updated_date: string;
  external_ws: number;
  external_ws_url: string;
  target_bucket: {
    index: string;
    type: string;
  };
  field: Array<{
    name: string;
    id: string;
    type: string;
  }>;
  field_dependent: any[];
  order: Array<{
    name: string;
    id: string;
  }>;
  aggregation: any[];
  field_exposed: Array<{
    name: string;
    id: string;
    type: string;
  }>;
  message: string;
  version: string;
  status: string;
  total: number;
  count: number;
  limit: string;
  offset: string;
  records: MGNREGARecord[];
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

// Simple in-memory cache
const cache: Map<string, CacheEntry> = new Map();

/**
 * Get cached data if it exists and is not expired
 */
export const getCachedData = (key: string): any => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Cache hit for key: ${key}`);
    return cached.data;
  }
  
  if (cached) {
    console.log(`Cache expired for key: ${key}`);
    cache.delete(key); // Remove expired cache
  }
  
  return null;
};

/**
 * Store data in cache
 */
export const cacheData = (key: string, data: any): void => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log(`Data cached for key: ${key}`);
};

/**
 * Clear entire cache
 */
export const clearCache = (): void => {
  cache.clear();
  console.log('Cache cleared');
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): { size: number; keys: string[] } => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
};

/**
 * Fetch MGNREGA data from the API with optional filters
 */
export const fetchMGNREGAData = async (
  districtName?: string,
  stateName?: string,
  financialYear?: string,
  limit: number = 1000
): Promise<APIResponse> => {
  try {
    // Build cache key based on parameters
    const cacheKey = `mgnrega_${districtName || 'all'}_${stateName || 'all'}_${financialYear || 'all'}_${limit}`;
    
    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log('Returning cached data');
      return cachedData;
    }

    // Build API URL with parameters
    const params = new URLSearchParams({
      'api-key': API_KEY,
      format: 'json',
      limit: limit.toString()
    });

    // Add filters if provided
    if (districtName) {
      params.append('filters[district_name]', districtName);
    }
    
    if (stateName) {
      params.append('filters[state_name]', stateName);
    }
    
    if (financialYear) {
      params.append('filters[fin_year]', financialYear);
    }

    const url = `${API_BASE_URL}?${params.toString()}`;
    
    console.log('Fetching data from:', url);

    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MGNREGA-Performance-Tracker/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status} - ${response.statusText}`);
    }

    const data: APIResponse = await response.json();
    
    if (!data) {
      throw new Error('No data received from API');
    }

    if (!data.records || !Array.isArray(data.records)) {
      throw new Error('Invalid data format received from API - records array missing');
    }

    console.log(`Successfully fetched ${data.records.length} records`);
    
    // Cache the successful response
    cacheData(cacheKey, data);
    
    return data;
  } catch (error:any) {
    console.error('Error fetching MGNREGA data:', error);
    
    // Handle specific error types
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to data source. Please check your internet connection.');
    }
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout: The data source is taking too long to respond. Please try again.');
    }
    
    // Check if we have any cached data to return as fallback
    const fallbackCacheKey = 'mgnrega_all_all_all_1000';
    const fallbackData = getCachedData(fallbackCacheKey);
    if (fallbackData) {
      console.log('Returning cached fallback data');
      return fallbackData;
    }
    
    throw error;
  }
};

/**
 * Fetch data for multiple districts in batch
 */
export const fetchMultipleDistrictsData = async (
  districtNames: string[],
  limitPerDistrict: number = 100
): Promise<{ [key: string]: MGNREGARecord[] }> => {
  const results: { [key: string]: MGNREGARecord[] } = {};
  
  // Use Promise.all to fetch data for all districts concurrently
  const promises = districtNames.map(async (districtName) => {
    try {
      const data = await fetchMGNREGAData(districtName, undefined, undefined, limitPerDistrict);
      results[districtName] = data.records;
    } catch (error) {
      console.error(`Failed to fetch data for district: ${districtName}`, error);
      results[districtName] = [];
    }
  });
  
  await Promise.all(promises);
  return results;
};

/**
 * Get available states from the data
 */
export const getAvailableStates = async (): Promise<string[]> => {
  try {
    const data = await fetchMGNREGAData();
    const states = new Set(data.records.map(record => record.state_name));
    return Array.from(states).sort();
  } catch (error) {
    console.error('Error fetching available states:', error);
    return [];
  }
};

/**
 * Get available districts for a state
 */
export const getDistrictsByState = async (stateName: string): Promise<string[]> => {
  try {
    const data = await fetchMGNREGAData(undefined, stateName);
    const districts = new Set(data.records.map(record => record.district_name));
    return Array.from(districts).sort();
  } catch (error) {
    console.error(`Error fetching districts for state ${stateName}:`, error);
    return [];
  }
};

/**
 * Get available financial years from the data
 */
export const getAvailableFinancialYears = async (): Promise<string[]> => {
  try {
    const data = await fetchMGNREGAData();
    const years = new Set(data.records.map(record => record.fin_year));
    return Array.from(years).sort().reverse(); // Most recent first
  } catch (error) {
    console.error('Error fetching available financial years:', error);
    return [];
  }
};

/**
 * Get latest data for a specific district
 */
export const getLatestDistrictData = async (districtName: string): Promise<MGNREGARecord | null> => {
  try {
    const data = await fetchMGNREGAData(districtName);
    
    if (data.records.length === 0) {
      return null;
    }
    
    // Sort by financial year and month to get the latest record
    const sortedRecords = [...data.records].sort((a, b) => {
      const yearCompare = b.fin_year.localeCompare(a.fin_year);
      if (yearCompare !== 0) return yearCompare;
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(b.month) - months.indexOf(a.month);
    });
    
    return sortedRecords[0];
  } catch (error) {
    console.error(`Error fetching latest data for district ${districtName}:`, error);
    return null;
  }
};

/**
 * Fallback data in case API is completely down (for development/demo)
 */
export const getFallbackData = (): APIResponse => {
  console.warn('Using fallback data - API might be unavailable');
  
  return {
    index_name: "ee03643a-ee4c-48c2-ac30-9f2ff26ab722",
    title: "District-wise MGNREGA Data at a Glance",
    desc: "District-wise MGNREGA Data at a Glance",
    org_type: "Central",
    org: ["Ministry of Rural Development", "Department of Land Resources (DLR)"],
    sector: ["Rural", "Land Resources"],
    source: "data.gov.in",
    catalog_uuid: "854e5a1f-a4e3-4177-8586-2bcc27b74552",
    visualizable: "1",
    active: "1",
    created: 1695098583,
    updated: 1761627724,
    created_date: "2023-09-19T06:43:03Z",
    updated_date: "2025-10-28T05:02:04Z",
    external_ws: 0,
    external_ws_url: "",
    target_bucket: {
      index: "mgnrega",
      type: "854e5a1f-a4e3-4177-8586-2bcc27b74552"
    },
    field: [],
    field_dependent: [],
    order: [],
    aggregation: [],
    field_exposed: [],
    message: "Resource lists",
    version: "2.2.0",
    status: "ok",
    total: 1,
    count: 1,
    limit: "10",
    offset: "0",
    records: [
      {
        fin_year: "2024-2025",
        month: "Dec",
        state_code: "17",
        state_name: "MADHYA PRADESH",
        district_code: "1752",
        district_name: "SAMPLE DISTRICT",
        Approved_Labour_Budget: "1078289",
        Average_Wage_rate_per_day_per_person: "245.41",
        Average_days_of_employment_provided_per_Household: "43",
        Differently_abled_persons_worked: "118",
        Material_and_skilled_Wages: "1786.85",
        Number_of_Completed_Works: "2640",
        Number_of_GPs_with_NIL_exp: "0",
        Number_of_Ongoing_Works: "3943",
        Persondays_of_Central_Liability_so_far: "741282",
        SC_persondays: "82041",
        SC_workers_against_active_workers: "7639",
        ST_persondays: "65379",
        ST_workers_against_active_workers: "7496",
        Total_Adm_Expenditure: "278.06",
        Total_Exp: "3884.10",
        Total_Households_Worked: "17219",
        Total_Individuals_Worked: "24607",
        Total_No_of_Active_Job_Cards: "37337",
        Total_No_of_Active_Workers: "63430",
        Total_No_of_HHs_completed_100_Days_of_Wage_Employment: "11",
        Total_No_of_JobCards_issued: "46280",
        Total_No_of_Workers: "78026",
        Total_No_of_Works_Takenup: "6583",
        Wages: "1819.19",
        Women_Persondays: "288446",
        percent_of_Category_B_Works: "63",
        percent_of_Expenditure_on_Agriculture_Allied_Works: "36.53",
        percent_of_NRM_Expenditure: "54.94",
        percentage_payments_gererated_within_15_days: "99.92",
        Remarks: "NA"
      }
    ]
  };
};

/**
 * Health check for the API
 */
export const checkAPIHealth = async (): Promise<{ healthy: boolean; responseTime: number; error?: string }> => {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_BASE_URL}?api-key=${API_KEY}&format=json&limit=1`, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'MGNREGA-Performance-Tracker/1.0'
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      healthy: response.ok,
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      healthy: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};