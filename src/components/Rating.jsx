import React from 'react';
import PropTypes from 'prop-types';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Rating = ({ value, text, color }) => {
  return (
    <div className="rating">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <span key={index}>
            {value >= ratingValue ? (
              <FaStar style={{ color }} />
            ) : value >= ratingValue - 0.5 ? (
              <FaStarHalfAlt style={{ color }} />
            ) : (
              <FaRegStar style={{ color }} />
            )}
          </span>
        );
      })}
      <span className="ms-2">{text && text}</span>
    </div>
  );
};

Rating.defaultProps = {
  color: '#f8e825',
};

Rating.propTypes = {
  value: PropTypes.number.isRequired,
  text: PropTypes.string,
  color: PropTypes.string,
};

export default Rating; 