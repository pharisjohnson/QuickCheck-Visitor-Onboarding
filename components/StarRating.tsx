
import React from 'react';

interface StarRatingProps {
  rating: number;
  onRating: (rate: number) => void;
  count?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRating, count = 5 }) => {
  return (
    <div className="flex items-center">
      {[...Array(count)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            className={`text-3xl transition-colors duration-200 ${ratingValue <= rating ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-200'}`}
            onClick={() => onRating(ratingValue)}
            aria-label={`Rate ${ratingValue} out of ${count}`}
          >
            &#9733;
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
