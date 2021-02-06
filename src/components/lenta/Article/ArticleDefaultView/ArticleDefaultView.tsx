import React, { FC } from 'react';

import { ArticleViewProps } from '@components/lenta/Article/types';

import { getDate, getTime } from '../../utils';
import styles from './ArticleDefaultView.module.scss';

export const ArticleDefaultView: FC<ArticleViewProps> = ({
  article: { description, domain = 'sm-news.ru', slug, categories, title, published_at, image, body },
}) => {
  return (
    <>
      <div className={styles.articleViewTop}>
        <div className={styles.articleViewLeft}>
          <div className={styles.articleViewDate}>{published_at && getDate(published_at)}</div>
          <div>{published_at && getTime(published_at)}</div>
        </div>
        <div className={styles.articleViewCategories}>
          {categories.length
            ? categories.map((category, i) => (
                <div className={styles.articleViewCategory} key={i}>
                  {category}
                </div>
              ))
            : ''}
        </div>
      </div>
      <div className={styles.articleViewTitle}>{title}</div>
      <div className={styles.articleViewImage}>
        <picture>
          {image.webp ? <source srcSet={image.webp} type="image/webp" /> : ''}
          {image.jpg ? <img src={image.jpg} alt={title} title={title} /> : ''}
        </picture>
      </div>
      <div className={styles.articleViewDescription}>{description}</div>
      <div className={styles.articleViewContent} dangerouslySetInnerHTML={{ __html: body }} />
      <div className={styles.articleViewButton}>Посмотреть новость</div>
    </>
  );
};
