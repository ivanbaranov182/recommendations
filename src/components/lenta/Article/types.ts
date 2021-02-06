import { Timer } from '@components/crawler/types';

export type ArticleImage = {
  jpg: string;
  webp: string;
};

export type ArticleType = {
  image: ArticleImage;
  domain: string;
  slug: string;
  title: string;
  body: string;
  categories: string[];
  description: string;
  published_at: string;
};

export type ArticleViewProps = {
  article: ArticleType;
};

export type ArticleProps = {
  article: ArticleType;
  index: number;
  observer: IntersectionObserver | null;
  timer: Timer;
  articleClick: (index: number) => void;
};

export type ArticleStatistic = {
  user: string | null;
  domain: string;
  slug: string;
  parent_domain: string;
  parent_slug: string;
  time: number;
  index: number;
  click?: boolean;
  reject?: boolean;
};

export type RecommendationStatistic = {
  data: ArticleStatistic[];
  scriptVersion?: string | null;
};
