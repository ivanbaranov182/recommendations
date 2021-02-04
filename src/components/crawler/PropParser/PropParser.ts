import { Parser } from '../Parser';
import { Category, ContentImage } from '../types';
import { formatDate } from '../utils';

export class PropParser extends Parser {
  private readonly articleQuery: string;
  private readonly articleBodyEl: HTMLElement | null;
  private readonly articleAuthorEl: HTMLElement | null;
  private readonly articleSectionEl: HTMLElement | null;

  constructor() {
    super();
    this.articleQuery = '[itemtype="http://schema.org/NewsArticle"]';
    this.articleBodyEl = this.element && this.getElement('[itemprop="articleBody"]', this.element);
    this.articleSectionEl = this.element && this.getElement('[itemprop="articleSection"]', this.element);
    this.articleAuthorEl = this.element && this.getElement('[itemprop="author"]', this.element);
  }

  get element(): HTMLElement | null {
    return document.querySelector(this.articleQuery);
  }

  getElementParam(query: string, param: string | null): string {
    const el = this.element && this.getElement(query, this.element);
    if (!el) return '';
    return param ? this.getElementAttributeValue(el, param) : this.getElementTextValue(el);
  }

  getElement(query: string, rootElement?: HTMLElement): HTMLElement | null {
    const root = rootElement || this.rootElement;
    return root.querySelector(query);
  }

  get articleBody(): HTMLElement | null {
    return this.articleBodyEl;
  }

  getElementAttributeValue(el: HTMLElement, param: string): string {
    return el.getAttribute(param) ?? '';
  }

  getElementTextValue(el: HTMLElement): string {
    return el.textContent ?? '';
  }

  removeHtml(el: HTMLElement): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = el.innerHTML;
    this.removedTags.forEach((tag) => {
      const tagsElements = div.getElementsByTagName(tag);
      let i = tagsElements.length;
      while (i--) {
        tagsElements[i].parentNode?.removeChild(tagsElements[i]);
      }
    });
    return div;
  }

  get url(): string {
    return this.getElementParam('[itemprop="mainEntityOfPage"]', 'itemid') ?? window.location.href;
  }

  get categories(): Category[] {
    if (!this.articleSectionEl) return [];
    return this.articleSectionEl.textContent ? this.articleSectionEl.textContent.split(',') : [];
  }

  get createAt(): string {
    const date = this.getElementParam('[itemprop="datePublished"]', 'content');
    return date ? formatDate(date) : '';
  }

  get updateAt(): string {
    const date = this.getElementParam('[itemprop="dateModified"]', 'content');
    return date ? formatDate(date) : '';
  }

  get title(): string {
    return this.getElementParam('[itemprop="headline"]', null);
  }

  get image(): string {
    return this.getElementParam('img[itemprop="image"]', 'src');
  }

  get description(): string {
    return this.getElementParam('[itemprop="description"]', null);
  }

  get textHtml(): string {
    if (!this.articleBodyEl) return '';
    const normalizedArticle = this.removeHtml(this.articleBodyEl);
    return normalizedArticle ? normalizedArticle.innerHTML.toString().trim() : '';
  }

  get content_images(): ContentImage[] {
    if (!this.articleBodyEl) return [];
    const imageElements = this.articleBodyEl.querySelectorAll('img');
    const images: string[] = [];
    imageElements.forEach((image) => {
      images.push(this.getElementAttributeValue(image, 'src'));
    });
    return images;
  }

  get author_id(): string {
    return this.getElementParam('[itemprop="vatID"]', 'content');
  }

  get author_name(): string {
    return this.getElementParam('[itemprop="name"]', null);
  }
}
