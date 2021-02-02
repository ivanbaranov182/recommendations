import './ArticleList.scss';

import React, {FC, useEffect, useRef, useState} from 'react';

import {api} from '@src/api';

import {Article} from '../Article';
import {ArticleStatistic, ArticleType, StatisticData, Timer} from '../Article/types';
import {getTotalTimerTime} from '../utils';

const debug = window.location.search.includes('?debug=1');

export const ArticleList: FC = () => {
  const user = !debug ? localStorage.getItem('crawler-user') : '0166qw0ad6320f06b5bww001d535c3a6re14';
  const domain = !debug ? window.location.host : 'izhevsk.sm.news';
  const slug = !debug ? window.location.pathname : 'olimpiyskoy-chempionke-aline-zagitovoy-podarili-kvartiru-v-izhevske';
  const articles = useRef<ArticleType[]>([]);
  const [loading, setLoading] = useState(true);
  const notActiveDelay = 10;
  const noActive = useRef(0);
  const [_tick, setTick] = useState<Date | null>(null);
  const [timers, setTimers] = useState<Timer[]>([]);
  const clickedArticleIndex = useRef<number | null>(null);
  const paragraphObserver = useRef<IntersectionObserver>(null);
  const stop = useRef(false);

  const check = () => {
    if (noActive.current >= notActiveDelay) {
      const test = timers.map((timer) => {
        return {
          total: timer.total,
          start: null,
        };
      });
      setTimers([...test]);
      stop.current = true;
    } else if (timers.length) {
      setTimers([
        ...timers.map((timer) => {
          return {
            total: timer.start ? new Date().getTime() - timer.start.getTime() : timer.total,
            start: timer.start ? new Date() : null,
          };
        }),
      ]);
      stop.current = false;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      noActive.current = noActive.current + 1;
    }, 1000);
    const checkInterval = setInterval(check, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(checkInterval);
    };
  }, []);

  // Using the tick to force a re-render
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(new Date());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const clearNoActive = () => {
    noActive.current = 0;
  };

  useEffect(() => {
    document.onmousemove = clearNoActive;
    document.onscroll = clearNoActive;
  }, []);

  // Track timers for each paragraph's visibility
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    paragraphObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setTimers((timers) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const id = entry.target.dataset.id;
            const timer = timers[id] || {
              total: 0,
              start: null,
            };

            if (entry.isIntersecting) {
              // Start the timer
              timer.start = new Date();
            } else if (timer.start) {
              // Stop the timer and add to the total
              timer.total += new Date().getTime() - timer.start.getTime();
              timer.start = null;
            }

            timers[id] = timer;

            return timers;
          });
        });
      },
      {threshold: 0.5},
    );
  }, []);

  const getStatistics = (timers: Timer[], articles: ArticleType[]): StatisticData => {
    const statistics: ArticleStatistic[] = [];
    timers.forEach((timer, index) => {
      const totalTime: number = getTotalTimerTime(timer);
      const article = articles[index];
      const isClickedArticle = index === clickedArticleIndex.current;
      timer.total = totalTime ? Number((getTotalTimerTime(timer) / 1000).toFixed(0)) : 0;
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

  const getArticles = (): void => {
    api
      .getRecommendations(user, domain, slug)
      .then((res) => (articles.current = res.data ?? []))
      .catch((e) => console.log('Fail to load recommendations: ', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => getArticles(), []);

  const articleClick = (index: number): void => {
    clickedArticleIndex.current = index;
  };

  const pageLeave = (): void => {
    const articleStatistic = getStatistics(timers, articles.current);
    api.sendRecommendationStatistic(articleStatistic);
  };

  useEffect(() => {
    window.addEventListener('beforeunload', pageLeave);
    return () => {
      window.removeEventListener('beforeunload', pageLeave);
    };
  }, [articles]);

  if (loading) {
    return <>Loading...</>;
  }

  if (!articles.current.length) {
    return <>Список рекомендаций пуст</>;
  }

  return (
    <div className="article-list">
      {articles.current.map((article, index) => (
        <Article
          article={article}
          index={index}
          observer={paragraphObserver.current}
          timer={
            timers[index] || {
              total: 0,
              start: null,
            }
          }
          articleClick={articleClick}
          key={index}
          stop={stop.current}
        />
      ))}
    </div>
  );
};
