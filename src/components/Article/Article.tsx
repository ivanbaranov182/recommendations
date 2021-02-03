import './Article.scss'; // TODO css.modules

import React, {FC, useEffect, useRef} from 'react';

import {getDate, getTime} from '../utils';
import {ArticleProps} from './types';

const debug = window.location.search.includes('debug=1');

export const Article: FC<ArticleProps> = ({
  article: {description, domain = 'sm-news.ru', slug, categories, title, published_at, image, body},
  index,
  observer,
  timer,
  articleClick,
}) => {
  const startRef = useRef(null);
  const endRef = useRef(null);

  // Observe and unobserve this paragraph
  useEffect(() => {
    if (startRef) observer.observe(startRef.current);
    if (endRef) observer.observe(endRef.current);
    return () => {
      if (startRef.current) observer.unobserve(startRef.current);
      if (endRef.current) observer.unobserve(endRef.current);
    };
  }, [observer, startRef, endRef]);

  const total = timer.total;

  const handleClick = (): void => articleClick(index);

  const seconds = (total / 1000).toFixed(0);

  return (
    <a className="article" href={'//' + domain + '/' + slug} onClick={handleClick}>
      <div className="article__observer" ref={startRef} data-id={index} data-position="start">
        {debug ? (timer.start ? timer.start.toString() : null) : ''}
      </div>
      <div className="article__wrapper">
        <div className="article__top">
          <div className="article__left">
            <div className="article__date">{published_at && getDate(published_at)}</div>
            <div className="article__time">{published_at && getTime(published_at)}</div>
            {debug && <div className="article__timer">{seconds} s</div>}
          </div>
          <div className="article__categories">
            {categories.length
              ? categories.map((category, i) => (
                  <div className="article__category" key={i}>
                    {category}
                  </div>
                ))
              : ''}
          </div>
        </div>
        <div className="article__title">{title}</div>
        <div className="article__image">
          <picture>
            {image.webp ? <source srcSet={image.webp} type="image/webp" /> : ''}
            {image.jpg ? <img src={image.jpg} alt={title} title={title} /> : ''}
          </picture>
        </div>
        <div className="article__description">{description}</div>
        <div className="article__content" dangerouslySetInnerHTML={{__html: body}} />
        <div className="article__content-after" />
        <div className="article__button">Посмотреть новость</div>
      </div>
      <div className="article__observer" ref={endRef} data-id={index} data-position="end">
        {debug ? (timer.end ? timer.end.toString() : null) : ''}
      </div>
    </a>
  );
};
