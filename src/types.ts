export interface HLNews {
  status: string;
  totalResults: number;
  articles: Article[];
}

export interface Article {
  source: Source;
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: null | string;
  publishedAt: Date;
  content: string;
}

export interface Source {
  id: null | string;
  name: string;
}

export interface SteamResponse {
  appnews: {
    appid: number;
    newsitems: Newsitem[];
    count: number;
  };
}

export interface Newsitem {
  gid: string;
  title: string;
  url: string;
  is_external_url: boolean;
  author: string;
  contents: string;
  feedlabel: string;
  date: number;
  feedname: string;
  feed_type: number;
  appid: number;
}
