import StarRating from './StarRating';

interface ProductRecommendationCardProps {
  id: number;
  name: string;
  price: number;
  category: string;
  imageName?: string;
  averageRating?: number;
  reviewCount?: number;
  recommendationTag?: string;
  onClick?: (id: number) => void;
}

export default function ProductRecommendationCard({
  id,
  name,
  price,
  category,
  imageName,
  averageRating = 0,
  reviewCount = 0,
  recommendationTag,
  onClick,
}: ProductRecommendationCardProps) {
  const getImageUrl = (imgName?: string) => {
    if (!imgName) return 'http://localhost:8082/images/mystore.jpg';
    return `http://localhost:8082/images/${imgName}`;
  };

  const tagColors: Record<string, string> = {
    '🔥 Trending': 'bg-gradient-to-r from-red-500 to-orange-500 text-white',
    '⭐ Top Rated': 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white',
    '💡 For You': 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
  };

  const tagColor = recommendationTag ? (tagColors[recommendationTag] || 'bg-gray-500 text-white') : '';

  return (
    <div
      onClick={() => onClick?.(id)}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={getImageUrl(imageName)}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'http://localhost:8082/images/mystore.jpg';
          }}
        />
        {/* Recommendation badge */}
        {recommendationTag && (
          <span
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-md ${tagColor}`}
          >
            {recommendationTag}
          </span>
        )}
        {/* Category badge */}
        <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-xs">
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <StarRating rating={averageRating} size="sm" />
          <span className="text-xs text-gray-400">
            {averageRating > 0 ? `${averageRating.toFixed(1)}` : 'N/A'} ({reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-red-500">
            ¥{typeof price === 'number' ? price.toFixed(2) : price}
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
            View →
          </span>
        </div>
      </div>
    </div>
  );
}
