// Normalize base URL - remove trailing /api if present to avoid double /api/api
const getBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';
  // Remove trailing /api if it exists
  return baseUrl.replace(/\/api\/?$/, '');
};

export const API_BASE_URL = getBaseUrl();

