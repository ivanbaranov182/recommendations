import React, { FC, useEffect, useRef } from 'react';

import { ArticleCustomView } from '@components/lenta/Article/ArticleCustomView';
import { ArticleMobileView } from '@components/lenta/Article/ArticleMobileView';

import styles from './Article.module.scss';
import { ArticleProps } from './types';

const debug = window.location.search.includes('debug=1');

const { DEFAULT_ARTICLE_LAYOUT } = process.env;

export const Article: FC<ArticleProps> = ({ article, index, observer, timer, articleClick }) => {
  const { domain = 'sm-news.ru', slug } = article;
  const startRef = useRef<HTMLHeadingElement>(null);
  const endRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!observer) return;
    if (startRef && startRef.current) observer.observe(startRef.current);
    if (endRef && endRef.current) observer.observe(endRef.current);
    return () => {
      if (startRef.current) observer.unobserve(startRef.current);
      if (endRef.current) observer.unobserve(endRef.current);
    };
  }, [observer, startRef, endRef]);

  const handleClick = (): void => articleClick(index);

  const seconds: string = (timer.total / 1000).toFixed(0);

  return (
    <a className={styles.article} href={'//' + domain + '/' + slug} onClick={handleClick}>
      <div className={debug ? styles.articleObserver : ''} />
      <div className={styles.articleWrapper} ref={startRef} data-id={index} data-position="start">
        {debug && <div className={styles.articleTimer}>{seconds} s</div>}
        {DEFAULT_ARTICLE_LAYOUT === 'true' ? <ArticleMobileView article={article} /> : <ArticleCustomView />}
      </div>
      <div className={debug ? styles.articleObserver : ''} ref={endRef} data-id={index} data-position="end" />
    </a>
  );
};
