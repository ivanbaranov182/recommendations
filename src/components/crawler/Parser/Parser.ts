import { Article, Category, ContentImage } from '../types';

export class Parser {
  protected removedTags: string[];
  protected readonly rootElement: Document;

  constructor() {
    this.removedTags = ['script', 'iframe'];
    this.rootElement = document;
  }

  get url(): string {
    return window.location.href;
  }

  get urlObj(): URL {
    return new URL(this.url);
  }

  get element(): HTMLElement | null {
    return null;
  }

  get domain(): string {
    return this.urlObj.hostname;
  }

  get slug(): string {
    return this.urlObj.pathname;
  }

  get categories(): Category[] {
    return [];
  }

  get image(): string {
    return '';
  }

  get createAt(): string {
    return '';
  }

  get updateAt(): string {
    return '';
  }

  get title(): string {
    return '';
  }

  get description(): string {
    return '';
  }

  get textHtml(): string {
    return '';
  }

  get content_images(): ContentImage[] {
    return [];
  }

  get author_id(): string {
    return '';
  }

  get author_name(): string {
    return '';
  }

  get articleElement(): HTMLElement | null {
    return this.element;
  }

  get articleBody(): HTMLElement | null {
    return null;
  }

  get result(): Article {
    return {
      domain: this.domain,
      slug: this.slug,
      categories: this.categories,
      image: this.image,
      title: this.title,
      description: this.description,
      text_html: this.textHtml,
      content_images: this.content_images,
      author_id: this.author_id,
      author_name: this.author_name,
      published_at: this.createAt,
      edited_at: this.updateAt,
    };
  }
}
