import React from 'react';
import PropTypes from 'prop-types';
import { formatNumber } from '../utils/formatters';

const UserRankCard = ({ userRank, timeframe }) => {
  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'daily':
        return 'today';
      case 'weekly':
        return 'this week';
      case 'monthly':
        return 'this month';
      case 'alltime':
        return 'all time';
      default:
        return '';
    }
  };

  if (!userRank || userRank.rank === null) {
    return (
      <div className="user-rank-card bg-card-bg rounded-xl p-4 mb-6">
        <p className="text-gray-400 text-center">
          You haven't earned any rewards {getTimeframeLabel()} yet.
        </p>
      </div>
    );
  }

  return (
    <div className="user-rank-card bg-card-bg rounded-xl p-4 mb-6">
      <h3 className="text-lg font-medium text-white mb-2">Your Rank</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="value-display text-2xl font-bold text-primary">
            #{userRank.rank}
          </div>
          <div className="label text-sm text-gray-400">Rank</div>
        </div>
        
        <div className="text-center">
          <div className="value-display text-2xl font-bold text-primary">
            {formatNumber(userRank.rewards, 6)}
          </div>
          <div className="label text-sm text-gray-400">Rewards</div>
        </div>
        
        <div className="text-center">
          <div className="value-display text-2xl font-bold text-primary">
            {userRank.totalUsers}
          </div>
          <div className="label text-sm text-gray-400">Total Miners</div>
        </div>
      </div>
      
      <div className="text-center mt-3 text-xs text-gray-400">
        Out of {userRank.totalUsers} miners {getTimeframeLabel()}
      </div>
    </div>
  );
};

UserRankCard.propTypes = {
  userRank: PropTypes.shape({
    rank: PropTypes.number,
    rewards: PropTypes.number,
    totalUsers: PropTypes.number,
    timeframe: PropTypes.string
  }),
  timeframe: PropTypes.string.isRequired
};

export default UserRankCard; 