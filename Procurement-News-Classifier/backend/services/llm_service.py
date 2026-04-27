import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def classify_news(text: str):

    prompt = f"""
You are an expert Business Risk Analyst for Aramco, a global energy and petrochemical company.

Analyze the following news and assess its potential impact on Aramco's business operations including:
- Oil and gas production, pricing, and exports
- Procurement operations and sourcing
- Supplier financial stability or continuity
- Commodity or raw material availability
- Logistics, shipping, or distribution disruptions
- Geopolitical trade risks, sanctions, or tariffs
- Financial markets, currency, and inflation
- Energy policy, regulations, and environmental changes
- Supply chain and logistics networks
- Technology and semiconductor supply
- Labor markets and industrial actions

News:
{text}

SCORING RUBRIC — use this strictly:
- 9-10: Critical impact. Immediate threat to Aramco's operations or supply chain continuity. Examples: major oil price crash, war in Middle East, port closure on key shipping routes, critical supplier bankruptcy.
- 7-8: High impact. Significant disruption likely within weeks. Examples: oil price spike/drop >10%, supplier financial distress, major shipping delays, new trade sanctions on key partners.
- 5-6: Medium impact. Moderate risk that could affect costs or timelines. Examples: commodity price increases, regional logistics disruption, currency fluctuation, minor regulatory changes.
- 3-4: Low impact. Indirect or early warning signals. Examples: industry trends, potential policy changes, minor supplier issues.
- 1-2: Minimal impact. Very indirect relevance to Aramco's business.
- 0: Completely irrelevant to Aramco or its business.

CATEGORY RULES — pick the most specific one:
- "Supplier Financial Risk" — supplier bankruptcy, layoffs, credit issues
- "Procurement Risk" — sourcing disruptions, contract issues, supplier consolidation
- "Commodity Risk" — raw material shortage, oil/gas price movements, resource scarcity
- "Logistics Risk" — shipping delays, port issues, transport strikes, route disruptions
- "Geopolitical Risk" — sanctions, tariffs, trade wars, political instability affecting energy or trade
- "Financial Risk" — currency fluctuation, interest rates, inflation, market crashes
- "Energy Policy Risk" — oil production quotas, OPEC decisions, environmental regulations
- "Technology Risk" — semiconductor shortage, cyber threats, tech supply chain issues
- "Not Relevant" — use ONLY if zero connection to Aramco's business

ENTITY RULES:
- Always name the specific company, country, commodity, or region affected
- Use "Global" if impact is worldwide
- Never return "None" if an entity can be identified

Return ONLY a valid JSON object with no extra text:

{{
  "category": "Supplier Financial Risk | Procurement Risk | Commodity Risk | Logistics Risk | Geopolitical Risk | Financial Risk | Energy Policy Risk | Technology Risk | Not Relevant",
  "risk_score": 0-10,
  "risk_level": "Low | Medium | High | Critical",
  "entity": "specific company / country / commodity impacted",
  "impact_summary": "one sentence describing the direct impact on Aramco's business"
}}
"""

    try:

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )

        result = response.text.strip()

        try:
            return json.loads(result)

        except json.JSONDecodeError:
            print("JSON parse error from Gemini:")
            print(result)
            return None

    except Exception as e:
        print("LLM error:", e)
        return None