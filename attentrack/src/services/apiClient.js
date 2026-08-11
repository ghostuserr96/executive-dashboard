const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/v1') ? envUrl : `${envUrl}/v1`;
  }
  return 'http://localhost:5000/api/v1';
};

const BASE_URL = getBaseUrl();

export const apiClient = async (endpoint, { body, ...customConfig } = {}) => {
  const token = localStorage.getItem('attentrack_token');

  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: customConfig.method || (body ? 'POST' : 'GET'),
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${cleanEndpoint}`;

    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');

    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`API request to ${endpoint} failed (${response.status}): ${text || 'non-JSON response'}`);
    }

    if (!response.ok) {
      const error = new Error(data.message || `API request to ${endpoint} failed (${response.status})`);
      error.status = response.status;
      throw error;
    }

    // Normalize the varying backend response formats into a single shape.
    // Backend controllers wrap payloads differently (ApiResponse vs plain objects)
    // and some responses omit fields, so we guarantee a consistent contract.
    return {
      success: data?.success ?? true,
      statusCode: data?.statusCode ?? response.status,
      data: data?.data !== undefined ? data.data : data,
      message: data?.message ?? '',
    };
  } catch (error) {
    console.warn(`[ApiClient] Request to ${endpoint} failed:`, error.message);
    throw error;
  }
};

/**
 * Normalized wrapper around apiClient used by data services.
 * Always resolves to { success, data, message } and rethrows on API errors
 * so that callers' try/catch blocks behave consistently.
 */
export const apiRequest = async (endpoint, options = {}) => {
  const res = await apiClient(endpoint, options);
  return {
    success: res?.success ?? true,
    data: res?.data ?? null,
    message: res?.message ?? '',
  };
};
