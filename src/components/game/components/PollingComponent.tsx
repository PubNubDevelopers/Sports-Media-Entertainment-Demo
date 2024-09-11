'use client';

import React, { useContext } from 'react';
import { PubNubConext, PubNubType } from '@/context/PubNubContext';
import Image from 'next/image';

const PollingComponent: React.FC = () => {
  const { pollResults, pollResultSubmitted, submitPollResult } = useContext(PubNubConext) as PubNubType;

  const totalCount = pollResults.Total === 0 ? 1 : pollResults.Total;
  const homePercentage = ((pollResults.Home / totalCount) * 100).toFixed(0);
  const awayPercentage = ((pollResults.Away / totalCount) * 100).toFixed(0);
  const tiePercentage = ((pollResults.Tie / totalCount) * 100).toFixed(0);

  const handleVote = async (option: 'Home' | 'Away' | 'Tie') => {
    if (!pollResultSubmitted) {
      await submitPollResult(option);
    }
  };

  return (
    <div className="bg-gray-800 p-2 rounded-lg shadow-md mt-4 text-gray-200">
      <h3 className="text-center font-bold text-xl mb-6 text-white">Vote for Your Team</h3>
      {!pollResultSubmitted && (
        <div>
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex items-center">
              <Image
                src="/logos/5.png" // Orlando team image
                alt="Orlando Magic"
                width={32}
                height={32}
                className="object-cover rounded-full"
              />
              <button
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition flex-grow mx-4"
                onClick={() => handleVote('Home')}
              >
                Orlando
              </button>
            </div>

            <div className="flex items-center">
              <Image
                src="/logos/8.png" // Brooklyn Nets team image
                alt="Brooklyn Nets"
                width={32}
                height={32}
                className="object-cover rounded-full"
              />
              <button
                className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-lg transition flex-grow mx-4"
                onClick={() => handleVote('Away')}
              >
                Brooklyn
              </button>
            </div>

            <div className="flex items-center justify-between">
              <Image
                src="/logos/5.png" // Orlando team image for tie
                alt="Orlando Magic"
                width={32}
                height={32}
                className="object-cover rounded-full"
              />
              <hr className="border-gray-400 mx-4 w-8" />
              <button
                className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-lg transition flex-grow mx-4"
                onClick={() => handleVote('Tie')}
              >
                Tie
              </button>
              <hr className="border-gray-400 mx-4 w-8" />
              <Image
                src="/logos/8.png" // Brooklyn Nets team image for tie
                alt="Brooklyn Nets"
                width={32}
                height={32}
                className="object-cover rounded-full"
              />
            </div>
          </div>

          <div className="bg-yellow-500 text-black font-bold p-4 rounded-lg shadow-inner mt-4 text-center">
            <p className="text-lg">Get ready for your next bet!</p>
            <p className="text-sm mt-2">
              If your chosen team scores more than <span className="text-red-600">5 points</span> in the next 5 minutes, you'll be eligible for a coupon on your next bet!
            </p>
          </div>
        </div>
      )}

      {pollResultSubmitted && (
        <div className="mt-6 text-center">
          <p className="text-green-500 font-semibold">Thank you for your vote!</p>
          <p className="text-yellow-400 mt-2">
            Keep an eye on the game! If your team scores more than 5 points in the next 5 minutes, you'll unlock a coupon for your next bet.
          </p>
        </div>
      )}

      <div className="mt-6">
        <h4 className="text-center font-semibold text-lg mb-4 text-gray-300">Poll Results</h4>
        <div className="flex justify-around items-center">
          <div className="flex items-center">
            <Image
              src="/logos/5.png" // Orlando team image
              alt="Orlando Magic"
              width={24} // Reduced size
              height={24}
              className="object-cover rounded-full"
            />
            <p className="text-xl font-bold text-blue-400 ml-2">{homePercentage}%</p> {/* Reduced text size */}
          </div>
          <div className="flex items-center">
            <Image
              src="/logos/8.png" // Brooklyn Nets team image
              alt="Brooklyn Nets"
              width={24} // Reduced size
              height={24}
              className="object-cover rounded-full"
            />
            <p className="text-xl font-bold text-red-400 ml-2">{awayPercentage}%</p> {/* Reduced text size */}
          </div>
          <div className="flex items-center">
            <Image
              src="/logos/5.png" // Orlando team image for tie
              alt="Orlando Magic"
              width={24} // Reduced size
              height={24}
              className="object-cover rounded-full"
            />
            <Image
              src="/logos/8.png" // Brooklyn Nets team image for tie
              alt="Brooklyn Nets"
              width={24} // Reduced size
              height={24}
              className="object-cover rounded-full ml-2"
            />
            <p className="text-xl font-bold text-green-400 ml-4">{tiePercentage}%</p> {/* Reduced text size */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollingComponent;