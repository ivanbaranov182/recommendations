import React from 'react';
import ReactDom from 'react-dom';

import { Api } from '@src/api';

import { ArticleList } from '@components/lenta/ArticleList';
import { msToSec } from '@components/utils';

import { Info } from '../Info';
import { PropInfo } from '../PropInfo';
import { Article, ArticleStatistic, Timer } from '../types';
import { User } from '../User';
import { addElement } from '../utils';
import styles from './App.module.scss';

export class App {
  private readonly debug: boolean;
  private readonly parser: Info;
  private readonly article: Article;
  private readonly articleEl: HTMLElement | null;
  private readonly userId: string;
  private read: number;
  private readonly articleStartEl: HTMLElement | undefined;
  private readonly articleEndEl: HTMLElement | undefined;
  private readonly articleBodyEl: HTMLElement | null;
  private proxy: { articleInfoSend: boolean | null };
  private readonly timer: Timer;
  private noActiveTime: number;
  private readonly notActiveDelay: number;
  private readonly totalTimerEl: HTMLElement | undefined;

  constructor() {
    this.proxy = new Proxy(
      {
        articleInfoSend: null,
      },
      {
        set: function (obj, prop, newval) {
          prop === 'articleInfoSend' &&
            newval === true &&
            ReactDom.render(<ArticleList />, document.getElementById('recommendations-root'));
          return true;
        },
      },
    );
    this.debug = window.location.search.includes('debug=1');
    this.parser = this.getParser();
    this.article = this.parser.result;
    this.articleEl = this.parser.articleElement;
    this.articleBodyEl = this.parser.articleBody;
    this.userId = User.getId();
    this.read = 0;
    this.timer = {
      start: null,
      end: null,
      total: 0,
    };
    this.noActiveTime = 0;
    this.notActiveDelay = 10;
    if (this.articleEl) {
      if (this.debug) this.totalTimerEl = addElement(this.articleBodyEl, styles.totalTimer, true, false);
      this.articleStartEl = this.articleEl;
      this.articleEndEl = addElement(this.articleBodyEl, styles.jsObserverEnd, false, true);
      this.debug && this.addDebugInfo();
      this.initEvents();
    }
  }

  get statistic(): ArticleStatistic {
    return {
      user: this.userId,
      domain: this.article.domain,
      slug: this.article.slug,
      time: msToSec(this.timer.total),
      read: this.read,
    };
  }

  getParser(): Info {
    const canPropParser = document.querySelector('[itemtype="http://schema.org/NewsArticle"]');
    if (!canPropParser) console.log('Микроразметка не найдена');
    return canPropParser ? new PropInfo() : new Info();
  }

  sendArticleInfo(): void {
    Api.sendArticleInfo(this.article).then((res) => (this.proxy.articleInfoSend = res.ok));
  }

  articleRead(): void {
    this.read = 1;
    this.statistic.time < 60 && Api.sendArticleStatistic(this.statistic);
  }

  articleReject(): void {
    Api.sendArticleStatistic(this.statistic);
  }

  clearNoActive = (): number => (this.noActiveTime = 0);

  setTotalTime(): void {
    if (this.noActiveTime >= this.notActiveDelay || this.timer.end || this.read) return;
    this.timer.total += this.timer.start ? 1000 : 0;
    if (this.debug && this.totalTimerEl) this.totalTimerEl.innerText = `${msToSec(this.timer.total)} s`;
  }

  setObserver(): void {
    const setNoActiveTimeInterval = setInterval(() => this.noActiveTime++, 1000);
    const setTotalTimeInterval = setInterval(this.setTotalTime.bind(this), 1000);
    window.addEventListener('mousemove', this.clearNoActive.bind(this));
    window.addEventListener('scroll', this.clearNoActive.bind(this));

    const clearObserverIntervals = (): void => {
      clearInterval(setNoActiveTimeInterval);
      clearInterval(setTotalTimeInterval);
      window.removeEventListener('mousemove', this.clearNoActive.bind(this));
      window.removeEventListener('scroll', this.clearNoActive.bind(this));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // @ts-ignore
        const position = entry.target.dataset.position || 'start';
        this.timer[position] = entry.isIntersecting ? new Date() : null;
        if (entry.target === this.articleEndEl && !this.read) {
          // unobserve after read
          this.articleStartEl && observer.unobserve(this.articleStartEl);
          this.articleEndEl && observer.unobserve(this.articleEndEl);
          this.articleRead();
          clearObserverIntervals();
        }
      },
      { threshold: 0.01 },
    );
    this.articleStartEl && observer.observe(this.articleStartEl);
    this.articleEndEl && observer.observe(this.articleEndEl);

    window.addEventListener('beforeunload', () => {
      clearObserverIntervals();
    });
  }

  pageLeave(): void {
    window.addEventListener('beforeunload', () => !this.read && this.articleReject());
  }

  initEvents(): void {
    this.sendArticleInfo();
    this.setObserver();
    this.pageLeave();
  }

  addDebugInfo(): void {
    this.articleStartEl?.classList.add('_debug');
    this.articleEndEl?.classList.add('_debug');
  }
}
