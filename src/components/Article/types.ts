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

export type ArticleProps = {
  article: ArticleType;
  index: number;
  observer: any;
  timer: Timer;
  articleClick: (index: number) => void;
};

export type Timer = {
  total: number;
  start: Date | null;
  end: Date | null;
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

export type StatisticData = {
  data: ArticleStatistic[];
};
