import { serialize } from 'object-to-formdata';

import { Article, ArticleStatistic } from '@components/crawler/types';
import { RecommendationStatistic } from '@components/lenta/Article/types';

const { API_URL = 'https://desire-analytics.cf/api/v1' } = process.env;

const getScriptVersion = () => {
  const scriptPath = document.currentScript ? document.currentScript.getAttribute('src') : null;
  const params = scriptPath?.match(/ver=.*/);
  return params ? params[0].replace('ver=', '') : null;
};

const scriptVersion = getScriptVersion();

export class Api {
  private static canBeacon = !!navigator.sendBeacon;

  static getApiUrl(url: string): string {
    return `${API_URL}${url}`;
  }

  static get<T>(url: string, data: { [index: string]: string | null }): Promise<T> {
    const queryString = Object.keys(data)
      .map((key) => key + '=' + data[key])
      .join('&');
    return fetch(Api.getApiUrl(`${url}?${queryString}`)).then((res) => res.json());
  }

  static post(url: string, data: Article | ArticleStatistic | RecommendationStatistic): Promise<Response> {
    data.scriptVersion = scriptVersion;
    const opts: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    return fetch(Api.getApiUrl(url), opts);
  }

  static sendBeacon(url: string, data: ArticleStatistic | RecommendationStatistic): boolean {
    data.scriptVersion = scriptVersion;
    const serializeOptions = {
      indices: true,
      booleansAsIntegers: true,
    };
    const formData = serialize(data, serializeOptions);
    return navigator.sendBeacon(Api.getApiUrl(url), formData);
  }

  static sendArticleInfo(article: Article): Promise<Response> {
    return Api.post('/articles', article);
  }

  static sendArticleStatistic(statistic: ArticleStatistic): boolean {
    return Api.sendBeacon('/article-statistics', statistic);
  }

  static getRecommendations<T>(user: string | null, domain: string, slug: string): Promise<T> {
    const data: { [index: string]: string | null } = {
      user,
      domain,
      slug,
    };
    return Api.get('/recommendations', data);
  }

  static sendRecommendationStatistic(statisticData: RecommendationStatistic, useBeacon = true): Promise<Response> | boolean {
    if (useBeacon) return Api.sendBeacon('/recommendation-statistics', statisticData);
    return Api.post('/recommendation-statistics', statisticData);
  }
}
