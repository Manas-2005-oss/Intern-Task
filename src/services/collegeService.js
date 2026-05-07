import { fallbackColleges } from '../data/fallbackColleges';
import { normalizeCollege } from '../utils/college';
import apiClient from './apiClient';

function filterFallback(params = {}) {
  let items = fallbackColleges.map(normalizeCollege);

  if (params.search) {
    const search = params.search.toLowerCase();

    items = items.filter(
      (college) =>
        college.name?.toLowerCase().includes(search) ||
        college.location?.city?.toLowerCase().includes(search) ||
        college.location?.state?.toLowerCase().includes(search)
    );
  }

  return items;
}

export async function getColleges(params = {}) {
  try {
    // Remove empty query params
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) =>
          value !== '' &&
          value !== null &&
          value !== undefined
      )
    );

    const { data } = await apiClient.get('/colleges', {
      params: cleanedParams,
    });

    const items = Array.isArray(data)
      ? data
      : data.items || data.colleges || [];

    return {
      items: items.map(normalizeCollege),
      total: data.total ?? items.length,
      page: data.page ?? Number(params.page || 1),
      totalPages:
        data.totalPages ??
        Math.max(
          1,
          Math.ceil(
            (data.total ?? items.length) /
              Number(params.limit || 9)
          )
        ),
      source: 'api',
    };
  } catch (error) {
    console.error('API failed, using fallback:', error.message);

    const items = filterFallback(params);

    return {
      items,
      total: items.length,
      page: 1,
      totalPages: 1,
      source: 'fallback',
      warning: error.message,
    };
  }
}

export async function getCollegeById(id) {
  try {
    const { data } = await apiClient.get(`/colleges/${id}`);

    return normalizeCollege(data.college || data);
  } catch (error) {
    console.error('API failed, using fallback:', error.message);

    const college = fallbackColleges
      .map(normalizeCollege)
      .find((item) => String(item.id) === String(id));

    if (!college) {
      throw new Error('College not found');
    }

    return {
      ...college,
      source: 'fallback',
      warning: error.message,
    };
  }
}

export async function compareColleges(ids = []) {
  try {
    const { data } = await apiClient.post(
      '/colleges/compare',
      { ids }
    );

    const items = Array.isArray(data)
      ? data
      : data.items || data.colleges || [];

    return items.map(normalizeCollege);
  } catch (error) {
    console.error('Compare API failed:', error.message);

    return fallbackColleges
      .map(normalizeCollege)
      .filter((college) => ids.includes(college.id));
  }
}