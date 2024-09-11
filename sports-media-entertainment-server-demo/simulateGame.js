const fs = require('fs');
const { PromiseTimeout, sendMessage } = require('./utils');

const simulateGame = async (channel) => {
  const gameData = JSON.parse(fs.readFileSync('nets_vs_magic_2022/Play by Play_Nets_Magic_3.15.2022.json', 'utf8'));
  const plays = gameData['Plays'];
  const homeID = gameData['Game']['HomeTeamID'];
  const awayID = gameData['Game']['AwayTeamID'];

  const syncDuration = 1000;
  const timeoutDuration = 1000;

  let gameState = {};
  let simulatedElapsedTime = 0;

  const updateGameState = (currentGameState, play) => {
    let newGameState = { ...currentGameState };

    const type = play['Type'];
    switch (type) {
      case 'FieldGoalMade':
        const points = play['Points'];
        if (points == 2) {
          newGameState.twoPoints[play['TeamID'] == homeID ? 'home' : 'visitor'] += 1;
        } else {
          newGameState.threePoints[play['TeamID'] == homeID ? 'home' : 'visitor'] += 1;
        }
        break;
      case 'Timeout':
        newGameState.timeouts[play['TeamID'] == homeID ? 'home' : 'visitor'] += 1;
        break;
      case 'PersonalFoul':
      case 'ShootingFoul':
      case 'LooseBallFoul':
      case 'TechnicalFoul':
      case 'OffensiveFoul':
      case 'FlagrantFoul':
        newGameState.fouls[play['TeamID'] == homeID ? 'home' : 'visitor'] += 1;
        break;
      default:
        break;
    }

    return newGameState;
  };

  while (true) {
    gameState = {
      sequence: 0,
      homeID,
      awayID,
      fouls: {
        home: 0,
        visitor: 0
      },
      timeouts: {
        home: 0,
        visitor: 0
      },
      threePoints: {
        home: 0,
        visitor: 0
      },
      twoPoints: {
        home: 0,
        visitor: 0
      }
    };

    simulatedElapsedTime = 0;

    for (let i = 0; i < plays.length; i++) {
      const play = plays[i];
      // const playTimeRemaining = (play['TimeRemainingMinutes'] * 60) + play['TimeRemainingSeconds'];

      const message = {
        play,
        gameState,
        simulatedElapsedTime
      };
      await sendMessage(channel, message);

      gameState = updateGameState(gameState, play);

      if (i < plays.length - 1) {
        const nextPlay = plays[i + 1];

        const currentPlayTimeInSeconds = (play['videoTimeMinutes'] * 60) + play['videoTimeSeconds'];
        const nextPlayTimeInSeconds = (nextPlay['videoTimeMinutes'] * 60) + nextPlay['videoTimeSeconds'];

        // Calculate the delay between current play and the next play
        const delayBetweenPlays = nextPlayTimeInSeconds - currentPlayTimeInSeconds;

        simulatedElapsedTime += delayBetweenPlays;

        await PromiseTimeout(delayBetweenPlays * syncDuration);
      }
    }

    // Intermission logic
    console.log("INTERMISSION REACHED");

    // Restarting the game in 2 minutes
    await sendMessage(channel, { restart: true });

    await PromiseTimeout(2 * 60 * timeoutDuration);
    // After intermission, reset `i` to start the game again
  }
};

module.exports = { simulateGame };