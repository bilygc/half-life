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
    id: null;
    name: string;
}
