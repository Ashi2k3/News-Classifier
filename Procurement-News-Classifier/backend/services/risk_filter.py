RISK_KEYWORDS = [
    "supply chain",
    "supplier",
    "bankruptcy",
    "strike",
    "port",
    "logistics",
    "factory fire",
    "shortage",
    "commodity",
    "oil price",
    "semiconductor",
    "sanctions",
    "trade war",
    "shipping delay",
    "inflation",
    "procurement"
]
 
 
def is_procurement_related(text: str):
 
    text = text.lower()
 
    for keyword in RISK_KEYWORDS:
        if keyword in text:
            return True
 
    return False