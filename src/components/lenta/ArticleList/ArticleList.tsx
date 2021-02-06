import React, { FC, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { Api } from '@src/api';

import { Timer } from '@components/crawler/types';
import { User } from '@components/crawler/User';

import { Article } from '../Article';
import { ArticleType } from '../Article/types';
import { getStatistics } from '../utils';
import styles from './ArticleList.module.scss';

const debug = window.location.search.includes('debug=1');
const test = window.location.search.includes('test=1');

export const ArticleList: FC = () => {
  const user = !test ? User.getId() : '0166qw0ad6320f06b5bww001d535c3a6re14';
  const domain = !test ? window.location.host : 'ivanovo.sm.news';
  const slug = !test ? window.location.pathname : 'v-ivanove-bojcy-rosgvardii-otbili-u-stai-sobak-moloduyu-zhenshhinu-69781-u3t5';
  const articles = useRef<ArticleType[]>([]);
  const [loading, setLoading] = useState(true);
  const VISIBLE_ITEMS = 5;
  const [visibleArticles, setVisibleArticles] = useState<ArticleType[]>([]);
  const [page, setPage] = useState(0);
  const notActiveDelay = 10;
  const noActiveTime = useRef(0);
  const [_tick, setTick] = useState<Date | null>(null);
  const timerRef = useRef<Timer[]>([]);
  const clickedArticleIndex = useRef<number | null>(null);
  const paragraphObserver = useRef<IntersectionObserver>(null);
  const stop = useRef(false);

  const setTotalTime = () => {
    if (noActiveTime.current >= notActiveDelay) {
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
    const interval = setInterval(() => (noActiveTime.current = noActiveTime.current + 1), 1000);
    const checkInterval = setInterval(setTotalTime, 1000);
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

  const clearNoActive = (): number => (noActiveTime.current = 0);

  useEffect(() => {
    window.addEventListener('mousemove', clearNoActive);
    window.addEventListener('scroll', clearNoActive);
    return () => {
      window.removeEventListener('mousemove', clearNoActive);
      window.removeEventListener('scroll', clearNoActive);
    };
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
      { threshold: 0.01 },
    );
  }, []);

  const getArticles = (): void => {
    Api.getRecommendations(user, domain, slug)
      .then((res: { data: ArticleType[] }) => {
        articles.current = res.data ?? [];
        setPage((page) => page + 1);
      })
      .catch((e) => console.log('Fail to load recommendations: ', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => getArticles(), []);

  const articleClick = (index: number): number => (clickedArticleIndex.current = index);

  const pageLeave = (): void => {
    const articleStatistic = getStatistics(timerRef.current, articles.current, clickedArticleIndex.current, user, domain, slug);
    articleStatistic.data.length && Api.sendRecommendationStatistic(articleStatistic);
  };

  const sendStatistic = (): void => {
    const articleStatistic = getStatistics(timerRef.current, articles.current, clickedArticleIndex.current, user, domain, slug);
    Api.sendRecommendationStatistic(articleStatistic, false);
  };

  useEffect(() => {
    window.addEventListener('beforeunload', pageLeave);
    return () => {
      window.removeEventListener('beforeunload', pageLeave);
    };
  }, [articles]);

  useEffect(() => {
    setVisibleArticles((visibleArticles) => {
      return [...visibleArticles, ...articles.current.slice((page - 1) * VISIBLE_ITEMS, page * VISIBLE_ITEMS)];
    });
  }, [page]);

  if (loading) {
    return <>Loading...</>;
  }

  if (!articles.current.length) {
    return <></>;
  }

  const next = () => setPage((page) => page + 1);

  return (
    <div className={styles.articleList} onClick={() => debug && sendStatistic()}>
      <InfiniteScroll
        dataLength={visibleArticles.length}
        next={next}
        hasMore={visibleArticles.length !== articles.current.length}
        loader={<h4>Loading...</h4>}
      >
        {visibleArticles.map((article, index) => (
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
      </InfiniteScroll>
      {debug && stop.current && (
        <div className={styles.articleListDisabled}>
          <div className={styles.articleListDisabledMessage}>Пользователь не активен!</div>
        </div>
      )}
    </div>
  );
};
