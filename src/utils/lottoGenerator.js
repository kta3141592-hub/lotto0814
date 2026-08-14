/**
 * Lotto Weighted Random Sampling Algorithm (With Bonus Number)
 * 
 * Formula: Weight(n) = Count(n) + Base Weight
 * 
 * Steps:
 * 1. Pre-fill fixed numbers into game set (Max 5).
 * 2. Exclude excluded numbers (Max 10) and fixed numbers from sampling pool (1..45).
 * 3. Calculate weights for remaining pool.
 * 4. Draw without replacement using weighted probability until set size reaches 6.
 * 5. Sort each game set's 6 main numbers in ascending order.
 * 6. Draw 1 additional Bonus Number from remaining pool using weighted probability.
 * 7. Generate 5 sets (A, B, C, D, E).
 */

export function generateLottoGames({
  frequencies = {},
  bonusFrequencies = {},
  fixedNumbers = [],
  excludedNumbers = [],
  baseWeight = 1,
  numGames = 5
}) {
  const fixedSet = new Set(fixedNumbers.map(Number));
  const excludedSet = new Set(excludedNumbers.map(Number));

  // Build candidate pool (1..45 excluding fixed & excluded)
  const candidatePool = [];
  for (let i = 1; i <= 45; i++) {
    if (!fixedSet.has(i) && !excludedSet.has(i)) {
      candidatePool.push(i);
    }
  }

  // Weight formula for main numbers
  const getWeight = (num) => {
    const count = frequencies[num] || 0;
    return Math.max(0.1, count + baseWeight);
  };

  // Weight formula for bonus number (bonus appearance count + total count)
  const getBonusWeight = (num) => {
    const totalCount = frequencies[num] || 0;
    const bonusCount = bonusFrequencies[num] || 0;
    return Math.max(0.1, totalCount + (bonusCount * 2) + baseWeight);
  };

  const gameLabels = ['A', 'B', 'C', 'D', 'E'];
  const games = [];

  for (let g = 0; g < numGames; g++) {
    const currentSet = new Set(fixedSet);
    let currentCandidates = [...candidatePool];

    // 1. Pick 6 Main Numbers
    while (currentSet.size < 6 && currentCandidates.length > 0) {
      const currentWeights = currentCandidates.map(num => getWeight(num));
      const totalWeight = currentWeights.reduce((acc, w) => acc + w, 0);

      let randomVal = Math.random() * totalWeight;
      let selectedIdx = 0;

      for (let i = 0; i < currentCandidates.length; i++) {
        randomVal -= currentWeights[i];
        if (randomVal <= 0) {
          selectedIdx = i;
          break;
        }
      }

      const selectedNum = currentCandidates[selectedIdx];
      currentSet.add(selectedNum);
      currentCandidates.splice(selectedIdx, 1);
    }

    const sortedMainNumbers = Array.from(currentSet).sort((a, b) => a - b);

    // 2. Pick 1 Bonus Number from remaining pool (excluding the 6 main numbers and excluded numbers)
    let bonusCandidatePool = [];
    for (let i = 1; i <= 45; i++) {
      if (!currentSet.has(i) && !excludedSet.has(i)) {
        bonusCandidatePool.push(i);
      }
    }

    let bonusNumber = null;
    if (bonusCandidatePool.length > 0) {
      const bonusWeights = bonusCandidatePool.map(num => getBonusWeight(num));
      const totalBonusWeight = bonusWeights.reduce((acc, w) => acc + w, 0);

      let randomVal = Math.random() * totalBonusWeight;
      let selectedIdx = 0;

      for (let i = 0; i < bonusCandidatePool.length; i++) {
        randomVal -= bonusWeights[i];
        if (randomVal <= 0) {
          selectedIdx = i;
          break;
        }
      }
      bonusNumber = bonusCandidatePool[selectedIdx];
    }
    
    games.push({
      label: gameLabels[g] || `Game ${g + 1}`,
      numbers: sortedMainNumbers,
      bonusNumber: bonusNumber,
      fixedNumbersUsed: sortedMainNumbers.filter(n => fixedSet.has(n)),
    });
  }

  return games;
}
