import React, { useContext, useState } from 'react';
import NotificationTileComponent from './NotificationTile';
import { PubNubConext, PubNubType } from '@/context/PubNubContext';

const NotificationMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // Get the notifications from the context
  const { notifications } = useContext(PubNubConext) as PubNubType;

  const [activeTab, setActiveTab] = useState<'All' | 'Following' | 'Archive'>('All');

  return (
    <div className="fixed top-0 right-0 h-full w-72 sm:w-96 bg-gray-900 shadow-lg p-0 transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto sm:max-w-sm sm:top-0 sm:right-0 sm:w-full sm:h-screen">
      {/* Header with tabs */}
      <div className="bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <button onClick={onClose} className="text-white hover:text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        {/* <div className="flex justify-around mt-4">
          <button
            className={`text-sm ${activeTab === 'All' ? 'text-blue-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('All')}
          >
            All <span className="bg-gray-600 text-white rounded-full px-2 py-0.5 ml-1">{notifications.length}</span>
          </button>
          <button
            className={`text-sm ${activeTab === 'Following' ? 'text-blue-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('Following')}
          >
            Following <span className="bg-gray-600 text-white rounded-full px-2 py-0.5 ml-1">6</span>
          </button>
          <button
            className={`text-sm ${activeTab === 'Archive' ? 'text-blue-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('Archive')}
          >
            Archive
          </button>
        </div> */}
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-700">
        {notifications.length === 0 ? (
          <div className="p-4 text-gray-400 text-center">
            No notifications
          </div>
        ) : (
          notifications.map((notification, index) => (
            <React.Fragment key={index}>
              <NotificationTileComponent {...notification} />
              {/* Divider (instead of padding) */}
              {index < notifications.length - 1 && <hr className="border-gray-700" />}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationMenu;