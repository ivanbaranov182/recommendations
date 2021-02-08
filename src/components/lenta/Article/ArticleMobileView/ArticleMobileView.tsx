import React, { FC } from 'react';

import { ArticleViewProps } from '@components/lenta/Article/types';

import { getDate, getTime } from '../../utils';
import styles from './ArticleMobileView.module.scss';

export const ArticleMobileView: FC<ArticleViewProps> = ({ article: { categories, title, published_at, image, body } }) => {
  return (
    <div className={styles.articleViewWrapper}>
      <div className={styles.articleViewImage}>
        <picture>
          {image.webp ? <source srcSet={image.webp} type="image/webp" /> : ''}
          {image.jpg ? <img src={image.jpg} alt={title} title={title} /> : ''}
        </picture>
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
      <div className={styles.articleViewDate}>
        {published_at && getDate(published_at)} в {published_at && getTime(published_at)}
      </div>
      <div className={styles.articleViewTitle}>{title}</div>
    </div>
  );
};
