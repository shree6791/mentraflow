"""
Insights Routes
Endpoints for knowledge clusters and personalized recommendations
"""

from fastapi import APIRouter
from db.dashboard_data import KNOWLEDGE_CLUSTERS, RECOMMENDATIONS

router = APIRouter()


@router.get("/clusters")
async def get_knowledge_clusters():
    """Get knowledge clusters (related topics grouped together)"""
    return {"clusters": KNOWLEDGE_CLUSTERS}


@router.get("/recommendations")
async def get_recommendations():
    """Get personalized recommendations"""
    return {"recommendations": RECOMMENDATIONS}
