import './Article.scss';

import React, {FC, useEffect, useRef} from 'react';

import DateIcon from '@images/date.component.svg';

import {getDate, getTime} from '../utils';
import {ArticleProps} from './types';

export const Article: FC<ArticleProps> = ({
  article: {description, domain = 'sm-news.ru', slug, categories, title, published_at, image},
  index,
  observer,
  timer,
  articleClick,
  stop,
}) => {
  const ref = useRef(null);

  // Observe and unobserve this paragraph
  useEffect(() => {
    if (ref) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [observer, ref]);

  const total = timer.total;

  // The paragraph is active when it has a start time
  const seconds = (total / 1000).toFixed(0);

  const handleClick = (): void => articleClick(index);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return (
    <a className="article" ref={ref} data-id={index} href={'//' + domain + '/' + slug} onClick={handleClick}>
      <div className="article__image">
        <picture>
          {image.webp ? <source srcSet={image.webp} type="image/webp" /> : ''}
          {image.jpg ? <img src={image.jpg} alt={title} title={title} /> : ''}
        </picture>
        <div className="article__categories">
          {categories.length &&
            categories.map((category, i) => (
              <div className="article__category" key={i}>
                {category}
              </div>
            ))}
        </div>
      </div>
      <div className="article__bottom">
        <div className="article__date">
          <DateIcon className="article__date-icon" />
          {published_at && getDate(published_at)} в {published_at && getTime(published_at)}
        </div>
        <div className="article__title">{title}</div>
      </div>
    </a>
  );
};
