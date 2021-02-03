import {ArticleStatistic, ArticleType, StatisticData, Timer} from './Article/types';

export const getDate = (dateString: string): string => {
  const date = new Date(dateString);
  const tmp = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()}`;
  return tmp.replace(/(^|\D)(\d)(?!\d)/g, '$10$2');
};

export const getTime = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getHours()}:${date.getMinutes()}`;
};

export const getStatistics = (
  timers: Timer[],
  articles: ArticleType[],
  clickedArticleIndex: number | null,
  user: string | null,
  domain: string,
  slug: string,
): StatisticData => {
  const statistics: ArticleStatistic[] = [];
  timers.forEach((timer, index) => {
    const article = articles[index];
    const isClickedArticle = index === clickedArticleIndex;
    if (timer.total || isClickedArticle) {
      statistics.push({
        user,
        domain: article.domain,
        slug: article.slug,
        parent_domain: domain,
        parent_slug: slug,
        time: timer.total,
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
