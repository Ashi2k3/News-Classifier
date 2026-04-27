import chromadb
client = chromadb.PersistentClient(path="./chroma_storage")
collection = client.get_or_create_collection(name="procurement_risks")

# Manually add one item
collection.add(
    ids=["test_1"],
    documents=["Manual Test News"],
    metadatas=[{"title": "Test", "risk_score": 10, "category": "Logistics"}]
)

print("Manual data added. Now refresh your /api/risks?min_score=1 in Swagger.")