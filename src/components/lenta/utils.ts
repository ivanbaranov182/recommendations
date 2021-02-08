import { format, parseISO } from 'date-fns';

import { Timer } from '@components/crawler/types';
import { msToSec } from '@components/utils';

import { ArticleStatistic, ArticleType, RecommendationStatistic } from './Article/types';

export const getDate = (dateString: string): string => {
  return format(parseISO(dateString), 'yyyy-MM-dd');
};

export const getTime = (dateString: string): string => {
  return format(parseISO(dateString), 'HH:mm');
};

export const getStatistics = (
  timers: Timer[],
  articles: ArticleType[],
  clickedArticleIndex: number | null,
  user: string | null,
  domain: string,
  slug: string,
): RecommendationStatistic => {
  const statistics: ArticleStatistic[] = [];
  timers.forEach((timer, index) => {
    const article = articles[index];
    const isClickedArticle = index === clickedArticleIndex;
    if (timer.total > 60000) return;
    if (timer.total || isClickedArticle) {
      statistics.push({
        user,
        domain: article.domain,
        slug: article.slug,
        parent_domain: domain,
        parent_slug: slug,
        time: msToSec(timer.total),
        index,
        click: isClickedArticle,
        reject: !isClickedArticle && Boolean(timer.start),
      });
    }
  });

  return {
    data: statistics,
  };
};
