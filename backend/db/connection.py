"""
Database Connection
Centralized MongoDB connection management
"""

from motor.motor_asyncio import AsyncIOMotorClient
import os

# MongoDB connection (singleton pattern)
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'knowledge_app')

# Create client and database instances
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]


def get_database():
    """
    Get the database instance
    Use this function in routes that need database access
    """
    return db


def get_client():
    """
    Get the MongoDB client instance
    Useful for operations that need client-level access
    """
    return client
