import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const handleClick = (star: number) => {
    if (interactive && onChange) {
      onChange(star);
    }
  };

  return (
    <div className={`flex items-center gap-0.5 ${sizeClasses[size]}`}>
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const filled = displayRating >= starValue;
        const halfFilled = !filled && displayRating >= starValue - 0.5;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform ${
              filled ? 'text-yellow-400' : halfFilled ? 'text-yellow-300' : 'text-gray-300'
            }`}
          >
            {filled ? '★' : halfFilled ? '★' : '☆'}
          </button>
        );
      })}
    </div>
  );
}
