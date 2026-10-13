import logging
import asyncio
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

logger = logging.getLogger("app.database")

class MockAsyncCollection:
    """In-memory mock MongoDB collection for local testing and zero-setup resilience."""
    def __init__(self, name: str):
        self.name = name
        self._data: Dict[str, Dict[str, Any]] = {}

    async def insert_one(self, document: Dict[str, Any]):
        doc = document.copy()
        if "_id" not in doc:
            doc["_id"] = str(uuid.uuid4())
        self._data[str(doc["_id"])] = doc
        class Result:
            inserted_id = doc["_id"]
        return Result()

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for doc in self._data.values():
            if self._matches(doc, query):
                return doc.copy()
        return None

    def find(self, query: Optional[Dict[str, Any]] = None):
        query = query or {}
        matches = [doc.copy() for doc in self._data.values() if self._matches(doc, query)]
        class MockCursor:
            def __init__(self, items):
                self._items = items
            def sort(self, key, direction=-1):
                self._items.sort(key=lambda x: x.get(key, 0), reverse=(direction == -1))
                return self
            def limit(self, n: int):
                self._items = self._items[:n]
                return self
            async def to_list(self, length: Optional[int] = None):
                if length is not None:
                    return self._items[:length]
                return self._items
            def __aiter__(self):
                self._iter = iter(self._items)
                return self
            async def __anext__(self):
                try:
                    return next(self._iter)
                except StopIteration:
                    raise StopAsyncIteration
        return MockCursor(matches)

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        target_id = None
        for doc_id, doc in self._data.items():
            if self._matches(doc, query):
                target_id = doc_id
                break
        
        if target_id:
            doc = self._data[target_id]
            if "$set" in update:
                doc.update(update["$set"])
            if "$inc" in update:
                for k, v in update["$inc"].items():
                    doc[k] = doc.get(k, 0) + v
            class UpdateResult:
                matched_count = 1
                modified_count = 1
            return UpdateResult()
        elif upsert:
            new_doc = query.copy()
            if "$set" in update:
                new_doc.update(update["$set"])
            if "$inc" in update:
                for k, v in update["$inc"].items():
                    new_doc[k] = v
            await self.insert_one(new_doc)
            class UpsertResult:
                matched_count = 0
                modified_count = 1
            return UpsertResult()
        
        class NoUpdateResult:
            matched_count = 0
            modified_count = 0
        return NoUpdateResult()

    async def delete_one(self, query: Dict[str, Any]):
        for doc_id, doc in list(self._data.items()):
            if self._matches(doc, query):
                del self._data[doc_id]
                class DeleteResult:
                    deleted_count = 1
                return DeleteResult()
        class NoDeleteResult:
            deleted_count = 0
        return NoDeleteResult()

    async def count_documents(self, query: Dict[str, Any]) -> int:
        return sum(1 for doc in self._data.values() if self._matches(doc, query))

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        for k, v in query.items():
            if k == "_id":
                if str(doc.get("_id")) != str(v):
                    return False
            elif isinstance(v, dict):
                if "$in" in v:
                    if doc.get(k) not in v["$in"]:
                        return False
                elif "$gte" in v:
                    if doc.get(k, 0) < v["$gte"]:
                        return False
            else:
                if doc.get(k) != v:
                    return False
        return True


class MockAsyncDatabase:
    """Mock database instance holding collections in memory."""
    def __init__(self):
        self._collections: Dict[str, MockAsyncCollection] = {}

    def __getitem__(self, name: str) -> MockAsyncCollection:
        if name not in self._collections:
            self._collections[name] = MockAsyncCollection(name)
        return self._collections[name]


client: Optional[AsyncIOMotorClient] = None
db: Optional[Any] = None
is_mock_db: bool = False

async def init_db():
    global client, db, is_mock_db
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL} (Database: {settings.MONGODB_DB_NAME})...")
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=2000,
            connectTimeoutMS=2000
        )
        # Verify connection by pinging
        await client.admin.command('ping')
        db = client[settings.MONGODB_DB_NAME]
        is_mock_db = False
        logger.info("Successfully connected to MongoDB.")
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB ({e}). Falling back to resilient in-memory database store.")
        db = MockAsyncDatabase()
        is_mock_db = True

    # Seed demo user
    try:
        from app.services.auth_service import get_password_hash
        existing_demo = await db["users"].find_one({"email": "student@demo.ai"})
        if not existing_demo:
            demo_user = {
                "_id": "demo_student_user_1",
                "id": "demo_student_user_1",
                "email": "student@demo.ai",
                "full_name": "Demo Student",
                "hashed_password": get_password_hash("password123"),
                "created_at": datetime.utcnow()
            }
            await db["users"].insert_one(demo_user)
            logger.info("Demo student account ('student@demo.ai' / 'password123') seeded successfully.")
    except Exception as ex:
        logger.warning(f"Could not seed demo student user: {ex}")

def get_db():
    global db
    if db is None:
        db = MockAsyncDatabase()
    return db
