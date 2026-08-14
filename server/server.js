import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Memory cache for draw results
const drawCache = new Map();
let cachedLatestRound = null;
let lastLatestRoundCheck = 0;

// Helper: Calculate estimated latest round based on Lotto start date (2002-12-07 = Round 1)
function getEstimatedLatestRound() {
  const startDate = new Date('2002-12-07T21:00:00+09:00');
  const now = new Date();
  const diffMs = now - startDate;
  const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  return 1 + diffWeeks;
}

// Fetch single round data from dhlottery API
async function fetchRoundData(drwNo) {
  if (drawCache.has(drwNo)) {
    return drawCache.get(drwNo);
  }

  try {
    const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`;
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01'
      }
    });

    const data = response.data;
    if (data && data.returnValue === 'success') {
      const parsed = {
        drwNo: data.drwNo,
        drwNoDate: data.drwNoDate,
        numbers: [
          data.drwtNo1,
          data.drwtNo2,
          data.drwtNo3,
          data.drwtNo4,
          data.drwtNo5,
          data.drwtNo6
        ].sort((a, b) => a - b),
        bonusNo: data.bnusNo,
        firstWinamnt: data.firstWinamnt,
        firstPrzwnerCo: data.firstPrzwnerCo,
        firstAccumamnt: data.firstAccumamnt
      };
      drawCache.set(drwNo, parsed);
      return parsed;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching round ${drwNo}:`, error.message);
    return null;
  }
}

// Determine actual latest valid round
async function findLatestRound() {
  const now = Date.now();
  // Use cached latest round if refreshed within 10 minutes
  if (cachedLatestRound && (now - lastLatestRoundCheck < 10 * 60 * 1000)) {
    return cachedLatestRound;
  }

  let estimated = getEstimatedLatestRound();
  
  // Probe backwards if estimated is not valid, or forwards if it is valid
  let latestValid = null;
  for (let offset = 2; offset >= -5; offset--) {
    const roundToTest = estimated + offset;
    if (roundToTest < 1) continue;
    const data = await fetchRoundData(roundToTest);
    if (data) {
      latestValid = data.drwNo;
      break;
    }
  }

  // Fallback scan if needed
  if (!latestValid) {
    let testRound = estimated;
    while (testRound > 1) {
      const data = await fetchRoundData(testRound);
      if (data) {
        latestValid = data.drwNo;
        break;
      }
      testRound--;
    }
  }

  if (latestValid) {
    cachedLatestRound = latestValid;
    lastLatestRoundCheck = now;
  }

  return cachedLatestRound || estimated;
}

// GET /api/lotto/latest
app.get('/api/lotto/latest', async (req, res) => {
  try {
    const latestRoundNum = await findLatestRound();
    const data = await fetchRoundData(latestRoundNum);
    if (data) {
      return res.json({ success: true, data });
    }
    return res.status(404).json({ success: false, message: 'Latest round data not found' });
  } catch (err) {
    console.error('Failed to get latest lotto:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/lotto/stats?count=30
app.get('/api/lotto/stats', async (req, res) => {
  try {
    const countParam = parseInt(req.query.count, 10) || 30;
    const count = Math.min(Math.max(countParam, 5), 100); // 5 to 100 rounds limit

    const latestRoundNum = await findLatestRound();
    const startRound = Math.max(1, latestRoundNum - count + 1);

    // Fetch rounds in parallel (chunks of 10 to be gentle)
    const roundsToFetch = [];
    for (let r = latestRoundNum; r >= startRound; r--) {
      roundsToFetch.push(r);
    }

    const fetchedRounds = [];
    const chunkSize = 10;
    for (let i = 0; i < roundsToFetch.length; i += chunkSize) {
      const chunk = roundsToFetch.slice(i, i + chunkSize);
      const results = await Promise.all(chunk.map(r => fetchRoundData(r)));
      fetchedRounds.push(...results.filter(Boolean));
    }

    // Aggregate statistics for numbers 1..45
    const frequencies = {};
    const bonusFrequencies = {};
    for (let i = 1; i <= 45; i++) {
      frequencies[i] = 0;
      bonusFrequencies[i] = 0;
    }

    fetchedRounds.forEach(round => {
      round.numbers.forEach(num => {
        if (frequencies[num] !== undefined) {
          frequencies[num]++;
        }
      });
      if (bonusFrequencies[round.bonusNo] !== undefined) {
        bonusFrequencies[round.bonusNo]++;
      }
    });

    // Determine Hot numbers (most frequent) & Cold numbers (least frequent)
    const sortedByFreq = Object.entries(frequencies)
      .map(([num, freq]) => ({ num: parseInt(num, 10), count: freq }))
      .sort((a, b) => b.count - a.count || a.num - b.num);

    const hotNumbers = sortedByFreq.slice(0, 5);
    const coldNumbers = [...sortedByFreq].reverse().slice(0, 5);

    res.json({
      success: true,
      data: {
        latestRound: latestRoundNum,
        totalRoundsAnalyzed: fetchedRounds.length,
        startRound,
        endRound: latestRoundNum,
        frequencies,
        bonusFrequencies,
        hotNumbers,
        coldNumbers,
        drawHistory: fetchedRounds
      }
    });
  } catch (err) {
    console.error('Failed to get lotto stats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fallback Mock Endpoint in case external dhlottery network issue
app.get('/api/lotto/mock-stats', (req, res) => {
  const frequencies = {};
  const bonusFrequencies = {};
  for (let i = 1; i <= 45; i++) {
    frequencies[i] = Math.floor(Math.random() * 8) + 1;
    bonusFrequencies[i] = Math.floor(Math.random() * 3);
  }
  res.json({
    success: true,
    data: {
      latestRound: 1160,
      totalRoundsAnalyzed: 30,
      startRound: 1131,
      endRound: 1160,
      frequencies,
      bonusFrequencies,
      hotNumbers: [12, 27, 33, 5, 41].map(num => ({ num, count: frequencies[num] })),
      coldNumbers: [9, 14, 22, 38, 44].map(num => ({ num, count: frequencies[num] })),
      drawHistory: []
    }
  });
});

app.listen(PORT, () => {
  console.log(`Lotto Express Proxy Backend listening on port ${PORT}`);
});
