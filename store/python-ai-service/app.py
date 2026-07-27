from typing import List, Optional

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Mystore AI Recommendation Service")


class ProductItem(BaseModel):
    id: int
    name: str
    category: str
    price: float
    stockQuantity: int
    imageName: Optional[str] = None
    averageRating: float = 0.0
    reviewCount: int = 0
    active: bool = True


class RecommendationRequest(BaseModel):
    userId: Optional[int] = None
    products: List[ProductItem]
    orderCategories: List[str] = []


class RecommendedProduct(ProductItem):
    recommendationTag: str


class RecommendationResponse(BaseModel):
    trending: List[RecommendedProduct]
    topRated: List[RecommendedProduct]
    forYou: List[RecommendedProduct]


@app.post("/recommendations", response_model=RecommendationResponse)
def recommend(request: RecommendationRequest):
    active_products = [p for p in request.products if p.active]

    trending = sorted(
        active_products,
        key=lambda p: (-p.reviewCount, -p.averageRating, p.name),
    )[:6]
    trending_items = [RecommendedProduct(**p.dict(), recommendationTag="🔥 AI Trending") for p in trending]

    top_rated = sorted(
        active_products,
        key=lambda p: (-p.averageRating, -p.reviewCount, p.name),
    )[:6]
    top_rated_items = [RecommendedProduct(**p.dict(), recommendationTag="⭐ AI Top Rated") for p in top_rated]

    if request.orderCategories:
        candidates = [p for p in active_products if p.category in request.orderCategories]
        candidates = sorted(
            candidates,
            key=lambda p: (-p.averageRating, -p.reviewCount, p.name),
        )
        for_you_candidates = candidates[:6]
    else:
        for_you_candidates = trending

    for_you_items = [RecommendedProduct(**p.dict(), recommendationTag="💡 AI For You") for p in for_you_candidates[:6]]

    return RecommendationResponse(
        trending=trending_items,
        topRated=top_rated_items,
        forYou=for_you_items,
    )
