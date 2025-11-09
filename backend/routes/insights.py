"""
Insights Routes
Endpoints for knowledge clusters and personalized recommendations
"""

from fastapi import APIRouter
from db.dashboard_data import NODES
from services.insights_service import get_knowledge_clusters, get_recommendations

router = APIRouter()


@router.get("/clusters")
async def get_knowledge_clusters_endpoint():
    """Get knowledge clusters (related topics grouped together)"""
    clusters = get_knowledge_clusters(NODES)
    return {"clusters": clusters}


@router.get("/recommendations")
async def get_recommendations_endpoint():
    """Get personalized recommendations"""
    recommendations = get_recommendations(NODES)
    return {"recommendations": recommendations}
