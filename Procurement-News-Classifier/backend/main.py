from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from apscheduler.schedulers.background import BackgroundScheduler

from services.news_service import fetch_latest_news
from services.llm_service import classify_news
from services.db_service import store_news_item, get_high_risks, get_all_risks, get_risks_by_days

import uvicorn
import time


# -----------------------------
# FastAPI App
# -----------------------------
app = FastAPI(title="Procurement Risk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scheduler = BackgroundScheduler()


# -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
''
''
# Keyword filtering — broad topics relevant to Aramco
# -----------------------------
RISK_KEYWORDS = [
    "supply chain", "supplier", "bankruptcy", "strike", "port",
    "logistics", "factory fire", "shortage", "commodity", "oil",
    "gas", "energy", "semiconductor", "sanctions", "trade war",
    "shipping", "inflation", "procurement", "tariff", "opec",
    "freight", "currency", "interest rate", "geopolit", "refinery",
    "pipeline", "chemical", "petrochemical", "middle east", "saudi"
]


def is_relevant(text: str):
    text = text.lower()
    for keyword in RISK_KEYWORDS:
        if keyword in text:
            return True
    return False


# -----------------------------
# Automated News Pipeline
# -----------------------------
def process_news_pipeline():

    print("\n------ NEWS PIPELINE STARTED ------")

    articles = fetch_latest_news()
    print("Articles fetched:", len(articles))

    saved_count = 0
    seen_titles = set()

    for article in articles[:20]:

        if article["title"] in seen_titles:
            continue

        seen_titles.add(article["title"])

        text = f"{article['title']} {article['description']}"

        if not is_relevant(text):
            print(f"Skipped (not relevant): {article['title'][:60]}")
            continue

        classification = classify_news(text)

        time.sleep(2)

        if not classification:
            print("LLM quota reached or invalid response — stopping pipeline")
            break

        if isinstance(classification, list):
            classification = classification[0]

        if not isinstance(classification, dict):
            print("Unexpected classification format")
            continue

        category = classification.get("category", "Not Relevant")
        score = classification.get("risk_score", 0)

        print(f"-> {article['title'][:50]} | {category} | Score: {score}")

        if category != "Not Relevant" and score >= 2:
            store_news_item(article, classification)
            saved_count += 1

    print(f"New risks stored: {saved_count}")
    print("------ PIPELINE FINISHED ------\n")


# -----------------------------
# Scheduler
# -----------------------------
@app.on_event("startup")
def start_scheduler():
    print("Running first pipeline immediately...")
    process_news_pipeline()

    # Run every 6 hours to accumulate news daily
    scheduler.add_job(
        process_news_pipeline,
        "interval",
        hours=6
    )

    scheduler.start()
    print("Scheduler started. Running every 6 hours.")


# -----------------------------
# API: Get All Risks (entire history)
# -----------------------------
@app.get("/api/risks")
def fetch_risks(min_score: int = 5):

    risks = get_all_risks(min_score)

    formatted_risks = []

    if risks and risks.get("metadatas"):
        for meta in risks["metadatas"]:
            formatted_risks.append(meta)

    return {
        "data": formatted_risks,
        "count": len(formatted_risks)
    }


# -----------------------------
# API: All News (entire history, any score)
# -----------------------------
@app.get("/api/news")
def fetch_news_feed():

    risks = get_all_risks(min_score=0)

    formatted_news = []

    if risks and risks.get("metadatas"):
        for meta in risks["metadatas"]:
            formatted_news.append({
                "title": meta.get("title", ""),
                "impact_summary": meta.get("impact_summary", ""),
                "risk_score": meta.get("risk_score", 0),
                "category": meta.get("category", ""),
                "entity": meta.get("entity", ""),
                "url": meta.get("url", ""),
                "published_at": meta.get("published_at", "")
            })

    return {
        "data": formatted_news,
        "count": len(formatted_news)
    }


# -----------------------------
# API: Recent Risks by Days
# -----------------------------
@app.get("/api/recent-risks")
def fetch_recent_risks(days: int = 7, min_score: int = 0):

    risks = get_risks_by_days(days=days, min_score=min_score)

    formatted_risks = []

    if risks and risks.get("metadatas"):
        for meta in risks["metadatas"]:
            formatted_risks.append(meta)

    return {
        "data": formatted_risks,
        "count": len(formatted_risks)
    }


# -----------------------------
# API: Critical Alerts
# -----------------------------
@app.get("/api/alerts")
def fetch_critical_alerts():

    risks = get_high_risks(8)

    formatted_risks = []

    if risks and risks.get("metadatas"):
        for meta in risks["metadatas"]:
            formatted_risks.append(meta)

    return {
        "critical_alerts": formatted_risks,
        "count": len(formatted_risks)
    }


# -----------------------------
# Request model for manual news
# -----------------------------
class ManualNews(BaseModel):
    text: str


# -----------------------------
# API: Analyze Manual News
# -----------------------------
@app.post("/api/analyze-news")
def analyze_manual_news(news: ManualNews):

    try:

        text = news.text

        if not text or len(text.strip()) == 0:
            return {"error": "Empty news text"}

        classification = classify_news(text)

        if not classification:
            return {"error": "AI classification failed. Possible Gemini quota limit."}

        if isinstance(classification, list):
            classification = classification[0]

        if not isinstance(classification, dict):
            return {"error": "Unexpected classification format"}

        category = classification.get("category", "Not Relevant")
        score = classification.get("risk_score", 0)

        print(f"Manual News -> Category: {category} | Score: {score}")

        if category == "Not Relevant" or score < 3:
            return {
                "message": "Low risk",
                "classification": classification
            }

        article = {
            "title": text[:100],
            "description": text,
            "url": "",
            "publishedAt": ""
        }

        store_news_item(article, classification)

        return {
            "message": "News analyzed successfully",
            "classification": classification
        }

    except Exception as e:
        print("Analyze News Error:", e)
        return {"error": str(e)}


# -----------------------------
# Run server
# -----------------------------
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )