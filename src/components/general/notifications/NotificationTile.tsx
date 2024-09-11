import React from 'react';
import { FaTag, FaFutbol, FaUsers, FaTrophy } from 'react-icons/fa'; // Icons for notifications
import { IconType } from 'react-icons';

type NotificationType = 'coupon' | 'gameStart' | 'communityTraffic' | 'gameResult';

type NotificationProps = {
  id: number;
  type: NotificationType;
  message?: string;
  isNew?: boolean; // Indicates if the notification is new
  percentageOff?: number; // For coupon notifications
  teams?: { home: string; away: string }; // For game start notifications
  communityName?: string; // For community traffic notifications
  communityCount?: number; // For community traffic notifications
  winningTeam?: 'Brooklyn Nets' | 'Orlando Magic' | 'Tie'; // For game result notifications
  onActivateCoupon?: () => void; // Callback for activating the coupon
};

// Map notification type to icons
const getIcon = (type: NotificationType): IconType => {
  switch (type) {
    case 'coupon':
      return FaTag;
    case 'gameStart':
      return FaFutbol;
    case 'communityTraffic':
      return FaUsers;
    case 'gameResult':
      return FaTrophy;
    default:
      return FaTag; // Default icon
  }
};

const NotificationTileComponent: React.FC<NotificationProps> = ({
  type,
  isNew,
  percentageOff,
  teams,
  communityName,
  communityCount,
  winningTeam,
  onActivateCoupon,
}) => {
  const IconComponent = getIcon(type);

  const renderNotification = () => {
    switch (type) {
      case 'coupon':
        return (
          <div className="flex items-center bg-gray-800 p-4 shadow-md text-white">
            <IconComponent className="text-blue-500 w-6 h-6 mr-4" />
            <div className="flex-1">
              <p className="text-sm">
                You are eligible for <span className="font-bold">{percentageOff?.toFixed(0)}% off</span> your next bet!
              </p>
              <button
                className="mt-2 px-4 py-2 border border-gray-400 text-white font-semibold rounded-lg hover:bg-gray-700 hover:border-gray-500 transition bg-transparent"
                onClick={onActivateCoupon}
              >
                Activate Coupon
              </button>
            </div>
            {isNew && <span className="bg-red-500 w-3 h-3 rounded-full ml-2"></span>} {/* New notification indicator */}
          </div>
        );
      case 'gameStart':
        return (
          <div className="flex items-center bg-gray-800 p-4  shadow-md text-white">
            <IconComponent className="text-green-500 w-6 h-6 mr-4" />
            <div className="flex-1">
              <p className="text-sm">
                The game between <span className="font-bold">{teams?.home}</span> and <span className="font-bold">{teams?.away}</span> is about to start!
              </p>
            </div>
            {isNew && <span className="bg-red-500 w-3 h-3 rounded-full ml-2"></span>}
          </div>
        );
      case 'communityTraffic':
        if (communityCount && [5, 10, 20, 100].includes(communityCount)) {
          return (
            <div className="flex items-center bg-gray-800 p-4  shadow-md text-white">
              <IconComponent className="text-purple-500 w-6 h-6 mr-4" />
              <div className="flex-1">
                <p className="text-sm">
                  Your community <span className="font-bold">{communityName}</span> has reached <span className="font-bold">{communityCount} members!</span>
                </p>
              </div>
              {isNew && <span className="bg-red-500 w-3 h-3 rounded-full ml-2"></span>}
            </div>
          );
        }
        return null;
      case 'gameResult':
        return (
          <div className="flex items-center bg-gray-800 p-4  shadow-md text-white">
            <IconComponent className="text-yellow-500 w-6 h-6 mr-4" />
            <div className="flex-1">
              <p className="text-sm">
                The <span className="font-bold">{winningTeam}</span> have won the game!
              </p>
            </div>
            {isNew && <span className="bg-red-500 w-3 h-3 rounded-full ml-2"></span>}
          </div>
        );
      default:
        return null;
    }
  };

  return <>{renderNotification()}</>;
};

export default NotificationTileComponent;