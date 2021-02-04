import { Api } from '@src/api';

import { Parser } from '../Parser';
import { PropParser } from '../PropParser';
import { Article, ArticleStatistic } from '../types';
import { User } from '../User';
import { addElement, msToSec } from '../utils';

export class Crawler {
  private readonly parser: Parser;
  private readonly article: Article;
  private readonly articleEl: HTMLElement | null;
  private readonly userId: string;
  private read: number;
  private readonly articleStartEl: HTMLElement | undefined;
  private readonly articleEndEl: HTMLElement | undefined;
  private startReadTime: number;
  private readonly articleBodyEl: HTMLElement | null;

  constructor() {
    this.parser = this.getParser();
    this.article = this.parser.result;
    this.articleEl = this.parser.articleElement;
    this.articleBodyEl = this.parser.articleBody;
    this.userId = User.getId();
    this.read = 0;
    this.articleStartEl = addElement(this.articleEl, 'js-observer-start', true);
    this.articleEndEl = addElement(this.articleBodyEl, 'js-observer-end');
    this.startReadTime = new Date().getTime();
    if (this.articleEl) this.initEvents();
  }

  get statistic(): ArticleStatistic {
    return {
      user: this.userId,
      domain: this.article.domain,
      slug: this.article.slug,
      time: msToSec(new Date().getTime() - this.startReadTime),
      read: this.read,
    };
  }

  getParser(): Parser {
    const canPropParser = document.querySelector('[itemtype="http://schema.org/NewsArticle"]');
    if (!canPropParser) console.log('Микроразметка не найдена');
    return canPropParser ? new PropParser() : new Parser();
  }

  sendArticleInfo(): void {
    Api.sendArticleInfo(this.article);
  }

  articleRead(): void {
    this.read = 1;
    Api.sendArticleStatistic(this.statistic);
  }

  articleReject(): void {
    Api.sendArticleStatistic(this.statistic);
  }

  setObserver(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        if (entry.target === this.articleStartEl && !this.startReadTime) this.startReadTime = new Date().getTime();
        if (entry.target === this.articleEndEl && !this.read) this.articleRead();
      },
      {
        threshold: 1,
        rootMargin: '20px',
      },
    );
    if (this.articleStartEl) observer.observe(this.articleStartEl);
    if (this.articleEndEl) observer.observe(this.articleEndEl);
  }

  pageLeave(): void {
    window.addEventListener('beforeunload', () => !this.read && this.articleReject());
  }

  initEvents(): void {
    this.sendArticleInfo();
    this.setObserver();
    this.pageLeave();
  }
}
