# News API Research Document

## Overview

This document provides a comprehensive analysis of news APIs and RSS feeds for global news sources, including BBC services in multiple languages, Finnish news sources, Czech news, Taiwanese news, and Swedish news. The research focuses on free public APIs and RSS feeds, with HTML scraping as a fallback option.

## Research Methodology

### Testing Results Summary

#### ✅ **Working RSS Feeds**

1. **BBC English World News** - RSS feed working
2. **BBC Mundo (Spanish)** - Website accessible, RSS structure found

#### ❌ **Non-Working/Requires API Keys**

1. **BBC Chinese** - RSS feed not found
2. **BBC Russian** - RSS feed not found
3. **Helsingin Sanomat** - RSS feed not accessible
4. **Yle Uutiset** - RSS feed returns 404
5. **iDNES.cz** - RSS feed requires consent/redirect
6. **Taiwanese News** - RSS feeds not found
7. **8 Sidor** - Website accessible, no RSS found

#### ⚠️ **Commercial APIs Requiring Keys**

1. **NewsAPI.org** - Requires API key
2. **New York Times API** - Requires API key

## Detailed Analysis by News Source

### 1. BBC English News

**Status**: ✅ Working
**RSS Feed**: `https://feeds.bbci.co.uk/news/world/rss.xml`
**Language**: English
**Category**: World/Politics

**RSS Structure**:

```xml
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>BBC News</title>
    <description>BBC News - World</description>
    <link>https://www.bbc.co.uk/news/world</link>
    <item>
      <title>Article Title</title>
      <description>Article description</description>
      <link>https://www.bbc.com/news/articles/article-id</link>
      <guid>https://www.bbc.com/news/articles/article-id#0</guid>
      <pubDate>Wed, 16 Jul 2025 00:23:39 GMT</pubDate>
      <media:thumbnail width="240" height="135" url="image-url"/>
    </item>
  </channel>
</rss>
```

**TypeScript Interface**:

```typescript
interface BBCWorldNewsItem {
  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: string;
  mediaThumbnail?: {
    width: string;
    height: string;
    url: string;
  };
}

interface BBCWorldNewsRSS {
  channel: {
    title: string;
    description: string;
    link: string;
    language: string;
    lastBuildDate: string;
    item: BBCWorldNewsItem[];
  };
}
```

### 2. BBC Mundo (Spanish)

**Status**: ⚠️ Website accessible, RSS structure found in HTML
**Website**: `https://www.bbc.com/mundo`
**Language**: Spanish
**Category**: World/Politics

**Analysis**: The BBC Mundo website contains RSS-like data structures in its HTML, but no direct RSS feed URL was found. The site uses a modern JavaScript-based architecture.

**Scraping Approach**:

```typescript
interface BBCMundoArticle {
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  publishDate: string;
}

interface BBCMundoScrapingData {
  articles: BBCMundoArticle[];
}
```

**HTML Selectors** (from analysis):

- Article titles: `.bbc-14nw343.e47bds20 a`
- Article links: `.bbc-1i4ie53.e1d658bg0`
- Article descriptions: `.promo-paragraph.bbc-1xza832.ewjbyra0`
- Publish dates: `.promo-timestamp.bbc-16jlylf.e1mklfmt0`

### 3. BBC Chinese News

**Status**: ❌ RSS feed not found
**Tested URLs**:

- `https://feeds.bbci.co.uk/news/zhongwen/rss.xml` - Returns 404
- `https://www.bbc.com/zhongwen` - Website accessible

**Alternative**: Use BBC Chinese website scraping
**Language**: Chinese (Simplified/Traditional)
**Category**: World/Politics

**Scraping Approach**:

```typescript
interface BBCChineseArticle {
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  publishDate: string;
  language: 'zh-CN' | 'zh-TW';
}
```

### 4. BBC Russian News

**Status**: ❌ RSS feed not found
**Tested URLs**:

- `https://feeds.bbci.co.uk/news/russian/rss.xml` - Returns 404
- `https://www.bbc.com/russian` - Website accessible

**Alternative**: Use BBC Russian website scraping
**Language**: Russian
**Category**: World/Politics

**Scraping Approach**:

```typescript
interface BBCRussianArticle {
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  publishDate: string;
}
```

### 5. Helsingin Sanomat (HS)

**Status**: ❌ RSS feed not accessible
**Tested URLs**:

- `https://www.hs.fi/rss/ulkomaat.xml` - Returns "Could not fetch articles"
- `https://www.hs.fi/rss/` - Various RSS endpoints tested

**Alternative**: Use HS website scraping
**Language**: Finnish
**Category**: World/Politics (Ulkomaat)

**Website**: `https://www.hs.fi/ulkomaat/`
**Scraping Approach**:

```typescript
interface HSArticle {
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  publishDate: string;
  category: 'ulkomaat' | 'kotimaa' | 'talous';
}
```

### 6. Yle Uutiset

**Status**: ❌ RSS feed returns 404
**Tested URLs**:

- `https://yle.fi/rss/ulkomaat.xml` - Returns 404
- `https://yle.fi/rss/` - Various RSS endpoints tested

**Alternative**: Use Yle website scraping
**Language**: Finnish
**Category**: World/Politics (Ulkomaat)

**Website**: `https://yle.fi/ulkomaat/`
**Scraping Approach**:

```typescript
interface YleArticle {
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  publishDate: string;
  category: 'ulkomaat' | 'kotimaa' | 'talous';
}
```

### 7. iDNES.cz

**Status**: ⚠️ RSS requires consent/redirect
**Tested URLs**:

- `https://www.idnes.cz/rss/domaci` - Returns 404
- `https://www.idnes.cz/rss` - Redirects to consent page

**Alternative**: Use iDNES.cz website scraping
**Language**: Czech
**Category**: World/Politics (Zahraničí)

**Website**: `https://www.idnes.cz/zahranicni/`
**Scraping Approach**:

```typescript
interface IDNESArticle {
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  publishDate: string;
  category: 'zahranicni' | 'domaci' | 'ekonomika';
}
```

### 8. Taiwanese News Sources

**Status**: ❌ RSS feeds not found
**Tested Sources**:

- Taipei Times: `https://www.taipeitimes.com/rss` - Returns 404
- Taiwan News: No RSS found
- China Times: No RSS found

**Recommended Alternatives**:

#### A. Taipei Times (English)

**Website**: `https://www.taipeitimes.com/`
**Language**: English
**Category**: World/Politics

**Scraping Approach**:

```typescript
interface TaipeiTimesArticle {
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  publishDate: string;
  category: 'world' | 'taiwan' | 'business';
}
```

#### B. Liberty Times Net (Chinese)

**Website**: `https://www.ltn.com.tw/`
**Language**: Chinese (Traditional)
**Category**: World/Politics

**Scraping Approach**:

```typescript
interface LTNArticle {
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  publishDate: string;
  category: 'world' | 'taiwan' | 'politics';
}
```

### 9. 8 Sidor (Swedish)

**Status**: ⚠️ Website accessible, no RSS found
**Website**: `https://8sidor.se/`
**Language**: Swedish (Simple Swedish)
**Category**: World/Politics

**Analysis**: 8 Sidor is a news source in simple Swedish for people learning the language. No RSS feed was found.

**Scraping Approach**:

```typescript
interface EightSidorArticle {
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  publishDate: string;
  difficulty: 'simple-swedish';
}
```

## Commercial News APIs (Require API Keys)

### 1. NewsAPI.org

**URL**: `https://newsapi.org/v2/top-headlines`
**Status**: ❌ Requires API key
**Free Tier**: 1,000 requests/day
**Documentation**: https://newsapi.org/docs

**Query Parameters**:

```typescript
interface NewsAPIParams {
  country?: string; // e.g., 'us', 'gb', 'de'
  category?: string; // e.g., 'world', 'politics'
  q?: string; // search query
  pageSize?: number; // 1-100
  page?: number;
  apiKey: string; // required
}
```

**Response Type**:

```typescript
interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: Array<{
    source: {
      id: string;
      name: string;
    };
    author: string;
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    content: string;
  }>;
}
```

### 2. New York Times API

**URL**: `https://api.nytimes.com/svc/news/v3/content/all/world.json`
**Status**: ❌ Requires API key
**Free Tier**: 1,000 requests/day
**Documentation**: https://developer.nytimes.com/

## Implementation Recommendations

### 1. RSS Feed Implementation (Recommended)

#### BBC English World News

```typescript
const BBC_WORLD_RSS_ENDPOINT: NewsEndpoint<BBCWorldNewsRSS> = {
  url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  parser: 'rss',
  language: 'en',
  category: 'world',
};
```

### 2. Scraping Implementation

#### BBC Mundo (Spanish)

```typescript
const BBC_MUNDO_SCRAPING: ScrapingService = {
  url: 'https://www.bbc.com/mundo',
  selectors: {
    articles: '.bbc-qyyagp',
    title: '.bbc-14nw343.e47bds20 a',
    description: '.promo-paragraph.bbc-1xza832.ewjbyra0',
    link: '.bbc-1i4ie53.e1d658bg0',
    date: '.promo-timestamp.bbc-16jlylf.e1mklfmt0',
  },
  parser: (html: string) => {
    // Parse BBC Mundo HTML and extract articles
  },
};
```

#### Finnish News Sources

```typescript
const HS_SCRAPING: ScrapingService = {
  url: 'https://www.hs.fi/ulkomaat/',
  selectors: {
    articles: '.article-item',
    title: '.article-title',
    description: '.article-description',
    link: '.article-link',
    date: '.article-date',
  },
  parser: (html: string) => {
    // Parse HS HTML and extract articles
  },
};

const YLE_SCRAPING: ScrapingService = {
  url: 'https://yle.fi/ulkomaat/',
  selectors: {
    articles: '.article-item',
    title: '.article-title',
    description: '.article-description',
    link: '.article-link',
    date: '.article-date',
  },
  parser: (html: string) => {
    // Parse Yle HTML and extract articles
  },
};
```

#### Czech News

```typescript
const IDNES_SCRAPING: ScrapingService = {
  url: 'https://www.idnes.cz/zahranicni/',
  selectors: {
    articles: '.art-item',
    title: '.art-title',
    description: '.art-perex',
    link: '.art-link',
    date: '.art-date',
  },
  parser: (html: string) => {
    // Parse iDNES HTML and extract articles
  },
};
```

#### Taiwanese News

```typescript
const TAIPEI_TIMES_SCRAPING: ScrapingService = {
  url: 'https://www.taipeitimes.com/',
  selectors: {
    articles: '.article-item',
    title: '.article-title',
    description: '.article-description',
    link: '.article-link',
    date: '.article-date',
  },
  parser: (html: string) => {
    // Parse Taipei Times HTML and extract articles
  },
};

const LTN_SCRAPING: ScrapingService = {
  url: 'https://www.ltn.com.tw/',
  selectors: {
    articles: '.article-item',
    title: '.article-title',
    description: '.article-description',
    link: '.article-link',
    date: '.article-date',
  },
  parser: (html: string) => {
    // Parse Liberty Times HTML and extract articles
  },
};
```

#### Swedish News

```typescript
const EIGHT_SIDOR_SCRAPING: ScrapingService = {
  url: 'https://8sidor.se/',
  selectors: {
    articles: '.article-item',
    title: '.article-title',
    description: '.article-description',
    link: '.article-link',
    date: '.article-date',
  },
  parser: (html: string) => {
    // Parse 8 Sidor HTML and extract articles
  },
};
```

## Universal News Data Interface

```typescript
interface NewsArticle {
  id: string;
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  publishDate: string;
  source: {
    name: string;
    language: string;
    country: string;
  };
  category: 'world' | 'politics' | 'business' | 'technology';
  language: string;
}

interface NewsSource {
  name: string;
  language: string;
  country: string;
  type: 'rss' | 'scraping' | 'api';
  url: string;
  category: string;
  parser: (data: any) => NewsArticle[];
}
```

## Rate Limiting and Caching Strategy

### Recommended Caching Strategy

- **RSS Feeds**: Cache for 15 minutes
- **Scraped Content**: Cache for 30 minutes
- **API Content**: Cache for 10 minutes

### Rate Limit Management

- Implement exponential backoff for failed requests
- Use multiple news sources as fallbacks
- Implement request queuing for high-frequency endpoints
- Respect robots.txt and implement polite scraping delays

## Environment Variables Required

```bash
# Optional API Keys (for commercial APIs)
NEWSAPI_KEY=your_key_here
NYTIMES_API_KEY=your_key_here
```

## Testing Strategy

### RSS Testing

- Mock RSS responses in tests
- Test XML parsing logic
- Validate data extraction accuracy
- Test error handling for malformed RSS

### Scraping Testing

- Mock HTML responses
- Test parsing logic
- Validate data extraction accuracy
- Test error handling for malformed HTML
- Test rate limiting and polite delays

## Conclusion

The research shows that most news sources require scraping rather than public APIs or RSS feeds. The only reliable RSS feed found was BBC English World News. All other sources will require HTML scraping with proper error handling and rate limiting.

### Recommended Implementation Order:

1. **Start with BBC English RSS** (working, reliable)
2. **Implement BBC Mundo scraping** (Spanish content)
3. **Add Finnish news scraping** (HS and Yle)
4. **Implement Czech news scraping** (iDNES.cz)
5. **Add Taiwanese news scraping** (Taipei Times, Liberty Times)
6. **Implement Swedish news scraping** (8 Sidor)
7. **Add BBC Chinese and Russian scraping** (if needed)

### Technical Considerations:

1. **Language Support**: Implement proper UTF-8 encoding for all languages
2. **Rate Limiting**: Implement polite delays between scraping requests
3. **Error Handling**: Robust error handling for network failures and parsing errors
4. **Caching**: Implement proper caching to avoid excessive requests
5. **Fallbacks**: Multiple news sources per language for redundancy
