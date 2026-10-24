// Every input combination for n variables, MSB first.
// allCombinations(3) -> [[0,0,0], [0,0,1], ..., [1,1,1]]
function allCombinations(n) {
  const rows = [];
  for (let i = 0; i < (1 << n); i++) {
    const bits = [];
    for (let b = n - 1; b >= 0; b--) bits.push((i >> b) & 1);
    rows.push(bits);
  }
  return rows;
}

// n-to-2^n decoder: returns outputs Y0..Y(2^n - 1) for one input combination.
function decoder(bits, activeLow) {
  const selected = parseInt(bits.join(""), 2);
  const outputs = [];
  for (let y = 0; y < (1 << bits.length); y++) {
    const on = (y === selected) ? 1 : 0;
    outputs.push(activeLow ? 1 - on : on);
  }
  return outputs;
}

// k distinct random numbers from 0..max-1, sorted (Fisher-Yates shuffle).
function randomTerms(max, k) {
  const pool = [...Array(max).keys()];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, k).sort((a, b) => a - b);
}