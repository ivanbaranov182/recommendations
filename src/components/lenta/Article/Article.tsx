import React, { FC, useEffect, useRef } from 'react';

import { getDate, getTime } from '../utils';
import styles from './Article.module.scss';
import { ArticleProps } from './types';

const debug = window.location.search.includes('debug=1');

export const Article: FC<ArticleProps> = ({
  article: { description, domain = 'sm-news.ru', slug, categories, title, published_at, image, body },
  index,
  observer,
  timer,
  articleClick,
}) => {
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
      <div className={`article__observer ${debug ? '_debug' : ''}`}>{debug ? (timer.start ? timer.start.toString() : null) : ''}</div>
      <div className={styles.articleWrapper} ref={startRef} data-id={index} data-position="start">
        <div className={styles.articleTop}>
          <div className={styles.articleLeft}>
            <div className={styles.articleDate}>{published_at && getDate(published_at)}</div>
            <div>{published_at && getTime(published_at)}</div>
            {debug && <div className={styles.articleTimer}>{seconds} s</div>}
          </div>
          <div className={styles.articleCategories}>
            {categories.length
              ? categories.map((category, i) => (
                  <div className={styles.articleCategory} key={i}>
                    {category}
                  </div>
                ))
              : ''}
          </div>
        </div>
        <div className={styles.articleTitle}>{title}</div>
        <div className={styles.articleImage}>
          <picture>
            {image.webp ? <source srcSet={image.webp} type="image/webp" /> : ''}
            {image.jpg ? <img src={image.jpg} alt={title} title={title} /> : ''}
          </picture>
        </div>
        <div className={styles.articleDescription}>{description}</div>
        <div className={styles.articleContent} dangerouslySetInnerHTML={{ __html: body }} />
        <div className={styles.articleButton}>Посмотреть новость</div>
      </div>
      <div className={`article__observer ${debug ? '_debug' : ''}`} ref={endRef} data-id={index} data-position="end">
        {debug ? (timer.end ? timer.end.toString() : null) : ''}
      </div>
    </a>
  );
};
