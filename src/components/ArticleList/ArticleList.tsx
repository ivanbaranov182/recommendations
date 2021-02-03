import './ArticleList.scss';

import React, {FC, useEffect, useRef, useState} from 'react';

import {api} from '@src/api';

import {Article} from '../Article';
import {ArticleStatistic, ArticleType, StatisticData, Timer} from '../Article/types';
import {getStatistics, getTotalTimerTime} from '../utils';

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
  const timerRef = useRef<Timer[]>([]);
  const clickedArticleIndex = useRef<number | null>(null);
  const paragraphObserver = useRef<IntersectionObserver>(null);
  const stop = useRef(false);

  const check = () => {
    if (noActive.current >= notActiveDelay) {
      stop.current = true;
    } else if (timerRef.current.length) {
      timerRef.current = timerRef.current.map((timer) => {
        return timer.end
          ? timer
          : {
              ...timer,
              total: timer.total + (timer.start ? 1000 : 0),
            };
      });
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
    const interval = setInterval(() => setTick(new Date()), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const clearNoActive = (): number => (noActive.current = 0);

  useEffect(() => {
    document.onmousemove = clearNoActive;
    document.onscroll = clearNoActive;
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    paragraphObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // @ts-ignore
          const id = entry.target.dataset.id;
          // @ts-ignore
          const position = entry.target.dataset.position;
          const timer = timerRef.current[id] || {
            total: 0,
            start: null,
            end: null,
          };

          timerRef.current[id] = {
            ...timer,
            [position]: entry.isIntersecting ? new Date() : null,
          };
        });
      },
      {threshold: 1},
    );
  }, []);

  const getArticles = (): void => {
    api
      .getRecommendations(user, domain, slug)
      .then((res) => (articles.current = res.data ?? []))
      .catch((e) => console.log('Fail to load recommendations: ', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => getArticles(), []);

  const articleClick = (index: number): number => (clickedArticleIndex.current = index);

  const pageLeave = (): void => {
    const articleStatistic = getStatistics(timerRef.current, articles.current, clickedArticleIndex.current, user, domain, slug);
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
    <div className="article-list" onClick={() => pageLeave()}>
      {articles.current.map((article, index) => (
        <Article
          article={article}
          index={index}
          observer={paragraphObserver.current}
          timer={
            timerRef.current[index] || {
              total: 0,
              start: null,
              end: null,
            }
          }
          articleClick={articleClick}
          key={index}
        />
      ))}
      {debug && stop.current && (
        <div className="article-list__disabled">
          <div className="article-list__disabled-message">Пользователь не активен!</div>
        </div>
      )}
    </div>
  );
};
