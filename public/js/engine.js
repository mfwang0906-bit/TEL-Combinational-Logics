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
// Output of a logic gate for a list of 0/1 inputs.
function gate(type, inputs) {
  const and = inputs.every(x => x === 1) ? 1 : 0;
  const or  = inputs.some(x => x === 1) ? 1 : 0;
  if (type === "AND")  return and;
  if (type === "NAND") return 1 - and;
  if (type === "OR")   return or;
  if (type === "NOR")  return 1 - or;
}
// 4-to-2 binary encoder built from OR gates: A1 = D3 + D2, A0 = D3 + D1.
// inputs = [D3, D2, D1, D0]. Only gives a meaningful code when exactly one input is 1.
function binaryEncoder(inputs) {
  const [d3, d2, d1] = inputs;
  return [d3 | d2, d3 | d1];
}

// 4-to-2 priority encoder. inputs = [D3, D2, D1, D0]; D3 has the highest priority.
// Returns [A1, A0, V]. V = 0 when no input is active (A1, A0 then shown as 0).
function priorityEncoder(inputs) {
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i] === 1) {
      const index = inputs.length - 1 - i;      // position 0 in the array is D3
      return [(index >> 1) & 1, index & 1, 1];
    }
  }
  return [0, 0, 0];
}