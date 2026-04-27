import chromadb
from datetime import datetime, timezone

# Persistent ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_storage")

collection = chroma_client.get_or_create_collection(
    name="procurement_risks"
)


# -----------------------------
# Keyword extractor
# -----------------------------
def extract_keywords(text: str) -> set:

    stop_words = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
        "for", "of", "with", "by", "from", "is", "are", "was", "were",
        "it", "its", "this", "that", "be", "as", "we", "our", "how",
        "why", "what", "who", "will", "new", "can", "has", "have", "says",
        "said", "after", "into", "over", "about", "than", "more", "also",
        "their", "they", "been", "would", "could", "just", "when", "which"
    }

    words = text.lower().replace("-", " ").replace(":", " ").replace("/", " ").split()
    return {w.strip(".,!?'\"()[]") for w in words if len(w) > 3 and w not in stop_words}


# -----------------------------
# Semantic duplicate check
# -----------------------------
def is_similar_news(title: str, description: str = "") -> bool:

    try:

        results = collection.get()

        if not results or not results["metadatas"]:
            return False

        new_keywords = extract_keywords(title + " " + description[:100])

        if len(new_keywords) < 3:
            return False

        for meta in results["metadatas"]:

            existing_title = meta.get("title", "")
            existing_keywords = extract_keywords(existing_title)

            if not existing_keywords:
                continue

            overlap = len(new_keywords & existing_keywords)
            smaller_set = min(len(new_keywords), len(existing_keywords))

            if smaller_set == 0:
                continue

            overlap_ratio = overlap / smaller_set

            # 50% keyword overlap = same story
            if overlap_ratio >= 0.5:
                print(f"Similar news blocked: '{title[:50]}' ~ '{existing_title[:50]}'")
                return True

        return False

    except Exception as e:
        print(f"Similarity check error: {e}")
        return False


# -----------------------------
# Store news item
# -----------------------------
def store_news_item(news: dict, classification: dict):

    doc_id = news.get("url") or f"manual-{abs(hash(news['title']))}"
    document_text = f"{news['title']} - {news.get('description', '')}"

    published_at = (
        news.get("publishedAt")
        or news.get("published_at")
        or datetime.now(timezone.utc).isoformat()
    )

    # Block similar stories
    if is_similar_news(news["title"], news.get("description", "")):
        print(f"Similar story skipped: {news['title'][:60]}")
        return

    metadata = {
        "title": news["title"][:150],
        "url": news.get("url", ""),
        "published_at": published_at,
        "category": classification.get("category", "Unknown"),
        "risk_score": classification.get("risk_score", 0),
        "risk_level": classification.get("risk_level", "Unknown"),
        "entity": classification.get("entity", "Unknown"),
        "impact_summary": classification.get("impact_summary", "")[:250]
    }

    try:

        collection.add(
            ids=[doc_id],
            documents=[document_text],
            metadatas=[metadata]
        )

        print(f"Saved: {news['title'][:60]} | Score: {metadata['risk_score']} | Date: {published_at}")

    except Exception:

        try:
            collection.update(
                ids=[doc_id],
                documents=[document_text],
                metadatas=[metadata]
            )
            print(f"Updated: {news['title'][:60]}")
        except Exception as e:
            print(f"Store error: {e}")


# -----------------------------
# Get all risks (full history)
# -----------------------------
def get_all_risks(min_score: int = 0):

    results = collection.get(
        where={"risk_score": {"$gte": min_score}}
    )

    if not results or not results.get("metadatas"):
        return {"metadatas": []}

    seen_titles = set()
    unique_results = []

    for meta in results["metadatas"]:
        title_key = meta.get("title", "").lower().strip()[:60]
        if title_key not in seen_titles:
            seen_titles.add(title_key)
            unique_results.append(meta)

    sorted_results = sorted(
        unique_results,
        key=lambda x: x.get("published_at", ""),
        reverse=True
    )

    return {"metadatas": sorted_results}


# -----------------------------
# Get high risks by score
# -----------------------------
def get_high_risks(min_score: int = 5):

    results = collection.get(
        where={"risk_score": {"$gte": min_score}}
    )

    if results and results["metadatas"]:

        seen_titles = set()
        unique_results = []

        for meta in results["metadatas"]:
            title_key = meta.get("title", "").lower().strip()[:60]
            if title_key not in seen_titles:
                seen_titles.add(title_key)
                unique_results.append(meta)

        sorted_results = sorted(
            unique_results,
            key=lambda x: x["risk_score"],
            reverse=True
        )

        return {"metadatas": sorted_results}

    return {"metadatas": []}


# -----------------------------
# Get risks by days
# -----------------------------
def get_risks_by_days(days: int = 7, min_score: int = 0):

    from datetime import timedelta

    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    results = collection.get(
        where={"risk_score": {"$gte": min_score}}
    )

    if not results or not results.get("metadatas"):
        return {"metadatas": []}

    seen_titles = set()
    filtered = []

    for meta in results["metadatas"]:

        published_at = meta.get("published_at", "")

        if not published_at:
            continue

        try:
            pub_date = datetime.fromisoformat(published_at.replace("Z", "+00:00"))

            if pub_date >= cutoff:
                title_key = meta.get("title", "").lower().strip()[:60]
                if title_key not in seen_titles:
                    seen_titles.add(title_key)
                    filtered.append(meta)

        except Exception as e:
            print(f"Date parse error for '{meta.get('title', '')}': {e}")
            continue

    sorted_filtered = sorted(
        filtered,
        key=lambda x: x.get("published_at", ""),
        reverse=True
    )

    return {"metadatas": sorted_filtered}