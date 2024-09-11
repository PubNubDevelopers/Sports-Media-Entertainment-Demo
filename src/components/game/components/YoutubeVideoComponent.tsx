import React, { useEffect, useRef, useState, useContext } from 'react';
import { PubNubConext, PubNubType } from "@/context/PubNubContext";

const YoutubeVideoComponent = () => {
  const { playbyplayState, isIntermission } = useContext(PubNubConext) as PubNubType;

  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const [previousVideoSyncData, setPreviousVideoSyncData] = useState<{ startTimeInSeconds: number | null }>({ startTimeInSeconds: null });
  const [countdown, setCountdown] = useState<number>(120); // 2 minutes in seconds
  const [isPlayerReady, setIsPlayerReady] = useState(false); // Track player readiness
  const [isPlayerInitialized, setIsPlayerInitialized] = useState(false); // Track player initialization
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false); // Control countdown activity
  const [intermissionHandled, setIntermissionHandled] = useState<boolean>(false); // Track if intermission has been handled
  const [syncPerformed, setSyncPerformed] = useState<boolean>(false); // Prevent constant syncing

  // Handle intermission state and countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isIntermission && playerRef.current && isPlayerReady) {
      setIsCountdownActive(true); // Start countdown when intermission starts
      setIntermissionHandled(false); // Reset handling when entering intermission

      interval = setInterval(() => {
        setCountdown((prevCountdown) => (prevCountdown > 0 ? prevCountdown - 1 : 0));
      }, 1000);

      // Destroy the player during intermission to "remove" it from view
      if (playerRef.current) {
        console.log("Destroying player during intermission");
        playerRef.current.destroy();
        playerRef.current = null; // Set to null so we can re-initialize later
        setIsPlayerInitialized(false); // Mark player as uninitialized
        setSyncPerformed(false); // Allow re-sync after intermission
      }
    }

    // Clean up the interval when intermission ends or component unmounts
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isIntermission, isPlayerReady]);

  useEffect(() => {
    // Get the latest play from playbyplayState list
    const latestPlay = playbyplayState?.[playbyplayState.length - 1];

    // Re-create the YouTube player after the countdown finishes and intermission ends
    if (!isIntermission && countdown === 0 && playerContainerRef.current && !isPlayerInitialized) {
      if (latestPlay?.videoTimeMinutes !== undefined && latestPlay?.videoTimeSeconds !== undefined) {
        console.log('Initializing player with:', latestPlay.videoTimeMinutes, latestPlay.videoTimeSeconds);
        initializePlayer(latestPlay.videoTimeMinutes, latestPlay.videoTimeSeconds);
      }

      setIsCountdownActive(false); // Disable countdown once it's done
      setIntermissionHandled(true); // Mark intermission as handled to prevent re-sync
    }
  }, [isIntermission, countdown, playbyplayState]);

  // YouTube player initialization function
  const initializePlayer = (videoTimeMinutes: number, videoTimeSeconds: number) => {
    const startTimeInSeconds = videoTimeMinutes * 60 + videoTimeSeconds;

    if (playerContainerRef.current) {
      console.log('Creating new YT Player at:', startTimeInSeconds);
      playerRef.current = new (window as any).YT.Player(playerContainerRef.current, {
        videoId: '4Pc01w1n9Mg',
        playerVars: {
          autoplay: 1,
          controls: 0,
          enablejsapi: 1,
          start: startTimeInSeconds, // Initialize with the correct start time
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      });

      setIsPlayerInitialized(true); // Mark player as initialized
    }
  };

  const onPlayerReady = () => {
    playerRef.current.setVolume(0);
    setIsPlayerReady(true); // Player is ready
    console.log('Player ready, calling syncVideoWithGameState');
    syncVideoWithGameState();  // Ensure this is called
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === (window as any).YT.PlayerState.ENDED) {
      console.log('Video has ended');
    }
  };

  const onPlayerError = (error: any) => {
    console.error('YouTube Player Error:', error);
  };

  const syncVideoWithGameState = () => {
    const latestPlay = playbyplayState?.[playbyplayState.length - 1];

    if (!latestPlay) {
      console.log('latestPlay is undefined or empty, sync will not proceed');
      return;
    }

    if (
      playerRef.current &&
      latestPlay.videoTimeMinutes !== undefined &&
      latestPlay.videoTimeSeconds !== undefined &&
      isPlayerReady
    ) {
      const startTimeInSeconds = latestPlay.videoTimeMinutes * 60 + latestPlay.videoTimeSeconds;
      const currentVideoTime = playerRef.current.getCurrentTime();

      // Calculate the minute difference between the current video time and the play-by-play data
      const currentVideoMinutes = Math.floor(currentVideoTime / 60);
      const playByPlayMinutes = latestPlay.videoTimeMinutes;

      console.log('currentVideoMinutes:', currentVideoMinutes);
      console.log('playByPlayMinutes:', playByPlayMinutes);

      // Sync only if there is a minute difference and sync has not already been performed
      if (
        !syncPerformed &&
        (previousVideoSyncData.startTimeInSeconds === null || // Sync on first play
          (!isIntermission && !intermissionHandled) || // Sync once after intermission ends
          Math.abs(currentVideoMinutes - playByPlayMinutes) >= 1) // Sync if the minute difference is 1 or more
      ) {
        try {
          console.log('Syncing video to', startTimeInSeconds);
          playerRef.current.seekTo(startTimeInSeconds, true);
          playerRef.current.playVideo(); // Ensure video is playing
        } catch (error) {
          console.error('Error during seek:', error);
        }

        // Update the previous sync data to prevent redundant syncing
        setPreviousVideoSyncData({ startTimeInSeconds });

        // Ensure we only sync once after intermission ends
        setIntermissionHandled(false);
        setSyncPerformed(true); // Set flag to prevent constant syncing
      }
    }
  };

  // Load YouTube player API and handle syncing video with game state
  useEffect(() => {
    const loadYouTubeIframeAPI = () => {
      if (!(window as any).YT) {
        const scriptTag = document.createElement('script');
        scriptTag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(scriptTag);
        console.log('YouTube API script added');
      } else {
        const latestPlay = playbyplayState?.[playbyplayState.length - 1];
        if (latestPlay?.videoTimeMinutes !== undefined && latestPlay?.videoTimeSeconds !== undefined) {
          console.log('Calling initializePlayer with:', latestPlay.videoTimeMinutes, latestPlay.videoTimeSeconds);
          initializePlayer(latestPlay.videoTimeMinutes, latestPlay.videoTimeSeconds);
        }
      }
    };

    loadYouTubeIframeAPI();

    const syncInterval = setInterval(() => {
      console.log('Calling syncVideoWithGameState from interval');
      syncVideoWithGameState();
    }, 10000);

    return () => {
      clearInterval(syncInterval);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null; // Ensure cleanup
        setIsPlayerInitialized(false); // Mark player as uninitialized on cleanup
      }
    };
  }, [playbyplayState, previousVideoSyncData, isPlayerReady]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="w-full h-[700px] youtube-container relative">
      {isCountdownActive && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl mb-4">Intermission</h1>
          <p className="text-2xl">Game resumes in {formatTime(countdown)}</p>
        </div>
      )}
      {/* Player container */}
      <div ref={playerContainerRef} className="w-full h-full"></div>
    </div>
  );
};

export default YoutubeVideoComponent;