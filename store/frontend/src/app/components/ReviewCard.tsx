import StarRating from './StarRating';

interface ReviewCardProps {
  userName: string;
  rating: number;
  comment: string;
  productName: string;
  createdAt: string;
  onProductClick?: () => void;
}

export default function ReviewCard({
  userName,
  rating,
  comment,
  productName,
  createdAt,
  onProductClick,
}: ReviewCardProps) {
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const avatarColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-red-500',
  ];
  const colorIndex = userName.length % avatarColors.length;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full ${avatarColors[colorIndex]} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
        >
          {getInitial(userName)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header: name + rating */}
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-800 truncate">{userName}</span>
            <span className="text-xs text-gray-400">{getTimeAgo(createdAt)}</span>
          </div>

          {/* Stars */}
          <StarRating rating={rating} size="sm" />

          {/* Comment */}
          {comment && (
            <p className="text-gray-600 text-sm mt-2 leading-relaxed line-clamp-3">
              {comment}
            </p>
          )}

          {/* Product link */}
          <button
            onClick={onProductClick}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 hover:underline"
          >
            Product: {productName}
          </button>
        </div>
      </div>
    </div>
  );
}
