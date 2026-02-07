export interface WPRenderedField {
  rendered: string;
  protected?: boolean;
}

export interface WPPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: WPRenderedField;
  excerpt: WPRenderedField;
  content: WPRenderedField;
  categories: number[];
  author: number;
  featured_media: number;
}

export interface WPCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
}

export interface WPAuthor {
  id: number;
  name: string;
  slug: string;
  description: string;
  link: string;
  avatar_urls: {
    "24": string;
    "48": string;
    "96": string;
  };
}

export interface WPMediaSize {
  file: string;
  width: number;
  height: number;
  source_url: string;
}

export interface WPMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: WPRenderedField;
  alt_text: string;
  source_url: string;
  media_details: {
    width: number;
    height: number;
    sizes: {
      full?: WPMediaSize;
      large?: WPMediaSize;
      medium?: WPMediaSize;
      thumbnail?: WPMediaSize;
    };
  };
}
