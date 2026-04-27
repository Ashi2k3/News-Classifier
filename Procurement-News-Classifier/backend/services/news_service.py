import feedparser  # type: ignore
from datetime import datetime

# Broad set of RSS feeds covering all topics relevant to Aramco's business
FEEDS = [

    # Supply Chain & Procurement
    "https://www.supplychaindive.com/feeds/news/",
    "https://spendmatters.com/feed/",
    "https://www.logisticsmgmt.com/rss",

    # Energy & Oil
    "https://feeds.feedburner.com/oilprice/rss",
    "https://www.rigzone.com/news/rss/rigzone_latest.aspx",
    "https://feeds.reuters.com/reuters/energy",

    # Business & Finance
    "https://feeds.reuters.com/reuters/businessNews",
    "https://feeds.bbci.co.uk/news/business/rss.xml",
    "https://www.cnbc.com/id/10001147/device/rss/rss.html",
    "https://feeds.bloomberg.com/markets/news.rss",

    # Geopolitics & Trade
    "https://feeds.reuters.com/Reuters/worldNews",
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",

    # Logistics & Shipping
    "https://www.freightwaves.com/news/feed",
    "https://splash247.com/feed/",

    # Technology & Semiconductors
    "https://feeds.reuters.com/reuters/technologyNews",
    "https://feeds.feedburner.com/TechCrunch",

]


def fetch_latest_news():

    print("Fetching RSS feeds...")

    articles = []
    seen_urls = set()
    seen_titles = set()

    for url in FEEDS:

        try:

            feed = feedparser.parse(url)

            if not feed.entries:
                print(f"No entries from: {url}")
                continue

            fetched = 0

            for entry in feed.entries[:10]:

                title = entry.get("title", "").strip()
                link = entry.get("link", "").strip()

                if not title or title in seen_titles:
                    continue

                if link and link in seen_urls:
                    continue

                if "[Removed]" in title or not title:
                    continue

                seen_titles.add(title)
                if link:
                    seen_urls.add(link)

                # Parse published date
                published_at = ""

                if entry.get("published_parsed"):
                    try:
                        published_at = datetime(
                            *entry.published_parsed[:6]
                        ).isoformat() + "+00:00"
                    except Exception:
                        published_at = datetime.utcnow().isoformat() + "+00:00"
                else:
                    published_at = datetime.utcnow().isoformat() + "+00:00"

                articles.append({
                    "title": title,
                    "description": entry.get("summary", "")[:500],
                    "url": link,
                    "publishedAt": published_at
                })

                fetched += 1

            print(f"Fetched {fetched} articles from: {url}")

        except Exception as e:
            print(f"RSS error {url}: {e}")
            continue

    print(f"\nTotal unique articles fetched: {len(articles)}")

    return articles