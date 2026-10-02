"""
Database access layer.

- If MONGO_URI is set (e.g. a MongoDB Atlas connection string), the app
  uses Motor (async MongoDB driver) against a real database.
- If MONGO_URI is NOT set, the app falls back to a simple in-memory list.
  This lets you run and test the whole API locally in VS Code before you
  set up MongoDB Atlas -- there is nothing to install for step 1.

Switch to real MongoDB at any time just by setting the MONGO_URI
environment variable; no code changes needed.
"""

import os
import itertools
from datetime import datetime, timezone
from typing import Optional

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "civic_grievance_db")
COLLECTION_NAME = "complaints"

_use_mongo = bool(MONGO_URI)

if _use_mongo:
    from motor.motor_asyncio import AsyncIOMotorClient

    _client = AsyncIOMotorClient(MONGO_URI)
    _db = _client[DB_NAME]
    _collection = _db[COLLECTION_NAME]
else:
    # ---- In-memory fallback store (per-process, resets on restart) ----
    _memory_store: list[dict] = []
    _id_counter = itertools.count(1)


def using_mongo() -> bool:
    return _use_mongo


async def insert_complaint(doc: dict) -> dict:
    doc["created_at"] = datetime.now(timezone.utc).isoformat()

    if _use_mongo:
        result = await _collection.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        return doc

    doc["id"] = str(next(_id_counter))
    _memory_store.append(doc)
    return doc


async def list_complaints(category: Optional[str] = None) -> list[dict]:
    if _use_mongo:
        query = {"category": category} if category else {}
        cursor = _collection.find(query).sort("created_at", -1)
        results = []
        async for item in cursor:
            item["id"] = str(item.pop("_id"))
            results.append(item)
        return results

    results = _memory_store
    if category:
        results = [c for c in results if c.get("category") == category]
    return list(reversed(results))


async def get_stats() -> dict:
    complaints = await list_complaints()
    total = len(complaints)

    by_category: dict[str, int] = {}
    by_sentiment: dict[str, int] = {}
    for c in complaints:
        by_category[c.get("category", "Other")] = by_category.get(c.get("category", "Other"), 0) + 1
        label = c.get("sentiment_label", "Neutral")
        by_sentiment[label] = by_sentiment.get(label, 0) + 1

    return {"total": total, "by_category": by_category, "by_sentiment": by_sentiment}
