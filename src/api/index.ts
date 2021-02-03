import {serialize} from 'object-to-formdata';

import {StatisticData} from '@components/Article/types';

const {API_URL = 'https://desire-analytics.cf/api/v1'} = process.env;

export const api = {
  getApiUrl: (url: string): string => `${API_URL}${url}`,
  canBeacon: !!navigator.sendBeacon,
  getRecommendations: (user: string | null, domain: string, slug: string) => {
    const params: {[index: string]: string | null} = {
      user,
      domain: domain,
      slug,
    };
    const queryString = Object.keys(params)
      .map((key) => key + '=' + params[key])
      .join('&');
    return fetch(api.getApiUrl(`/recommendations?${queryString}`)).then((res) => res.json());
  },
  sendRecommendationStatistic: (statisticData: StatisticData, useBeacon = true): boolean | void => {
    const serializeOptions = {
      indices: true,
      booleansAsIntegers: true,
    };
    const data = serialize(statisticData, serializeOptions);
    const opts: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statisticData),
    };
    if (api.canBeacon && useBeacon) {
      return navigator.sendBeacon(api.getApiUrl('/recommendation-statistics'), data);
    }
    return void fetch(api.getApiUrl('/recommendation-statistics'), opts);
  },
};
