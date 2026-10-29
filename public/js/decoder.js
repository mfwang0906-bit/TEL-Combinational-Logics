let q = {};   // the current synthesis question

// Decoder function table, like Table 1 in the exam papers.
function decoderTableHTML(activeLow) {
  let html = "<table><tr><th>I2</th><th>I1</th><th>I0</th>";
  for (let y = 7; y >= 0; y--) html += `<th>Y${y}</th>`;
  html += "</tr>";
  allCombinations(3).forEach(bits => {
    const out = decoder(bits, activeLow);
    html += "<tr>" + bits.map(b => `<td>${b}</td>`).join("");
    for (let y = 7; y >= 0; y--) html += `<td>${out[y]}</td>`;
    html += "</tr>";
  });
  return html + "</table>";
}

function newSynthesis() {
  const form = Math.random() < 0.5 ? "sum" : "product";
  const activeLow = Math.random() < 0.5;
  const terms = randomTerms(8, 3 + Math.floor(Math.random() * 3));   // 3 to 5 terms

  // The required output f for each row 0..7
  const target = [];
  for (let r = 0; r < 8; r++) {
    const listed = terms.includes(r);
    target.push(form === "sum" ? (listed ? 1 : 0) : (listed ? 0 : 1));
  }
  q = { form, activeLow, terms, target };

  const expr = form === "sum" ? `Σm(${terms.join(", ")})` : `ΠM(${terms.join(", ")})`;
  document.getElementById("synth-text").textContent =
    `Implement f(a, b, c) = ${expr} with the 3-to-8 decoder given in the function table below and one logic gate. Inputs a, b and c are connected to I2, I1 and I0.`;
  document.getElementById("synth-table").innerHTML = decoderTableHTML(activeLow);

  document.getElementById("synth-outputs").value = "";
  document.getElementById("synth-gate").value = "";
  document.getElementById("synth-feedback").textContent = "";
  document.getElementById("synth-solution").hidden = true;
}

// "1, 3,5" -> [1, 3, 5]. Returns null if anything is not a whole number from 0 to 7.
function parseOutputs(text) {
  const parts = text.split(",").map(s => s.trim()).filter(s => s !== "");
  const nums = parts.map(Number);
  if (nums.length === 0 || nums.some(n => !Number.isInteger(n) || n < 0 || n > 7)) return null;
  return [...new Set(nums)];   // remove duplicates
}

function checkSynthesis() {
  const feedback = document.getElementById("synth-feedback");
  const gateType = document.getElementById("synth-gate").value;
  const outs = parseOutputs(document.getElementById("synth-outputs").value);
  if (!gateType || !outs) {
    feedback.textContent = "Choose a gate, and enter the outputs as numbers from 0 to 7 separated by commas.";
    return;
  }
  // Simulate the student's circuit on every row and compare with the required f.
  const correct = allCombinations(3).every((bits, r) => {
    const y = decoder(bits, q.activeLow);
    return gate(gateType, outs.map(i => y[i])) === q.target[r];
  });
  feedback.textContent = correct
    ? "Correct! Your circuit produces f for every input combination."
    : "Not quite. Your circuit gives the wrong output for at least one input combination.";
}

function modelGate() {
  if (q.form === "sum") return q.activeLow ? "NAND" : "OR";
  return q.activeLow ? "AND" : "NOR";
}

function showSolution() {
  const g = modelGate();
  const rowsText = q.terms.join(", ");
  const reasons = {
    OR:   `The outputs are active-high: each Yk is 1 only on row k. An OR gate outputs 1 when any input is 1, so f = 1 exactly on rows ${rowsText}.`,
    NAND: `The outputs are active-low: each Yk is 0 only on row k. A NAND gate outputs 1 when any input is 0, so f = 1 exactly on rows ${rowsText}.`,
    NOR:  `f must be 0 on rows ${rowsText}. The outputs are active-high: each Yk is 1 only on row k. A NOR gate outputs 0 when any input is 1, so f = 0 exactly on those rows.`,
    AND:  `f must be 0 on rows ${rowsText}. The outputs are active-low: each Yk is 0 only on row k. An AND gate outputs 0 when any input is 0, so f = 0 exactly on those rows.`,
  };

  let html = `<p><strong>Model answer:</strong> connect ${q.terms.map(m => "Y" + m).join(", ")} to a ${q.terms.length}-input ${g} gate.</p>`;
  html += `<p>${reasons[g]}</p>`;
  html += "<p>Other functionally correct answers are also accepted by the checker.</p>";

  html += "<table><tr><th>a</th><th>b</th><th>c</th>";
  for (let y = 7; y >= 0; y--) html += `<th>Y${y}</th>`;
  html += "<th>f</th></tr>";
  allCombinations(3).forEach((bits, r) => {
    const out = decoder(bits, q.activeLow);
    const f = gate(g, q.terms.map(m => out[m]));   // simulate the model answer
    html += `<tr class="${q.terms.includes(r) ? "highlight" : ""}">`;
    bits.forEach(b => html += `<td>${b}</td>`);
    for (let y = 7; y >= 0; y--) html += `<td>${out[y]}</td>`;
    html += `<td>${f}</td></tr>`;
  });
  html += "</table><p>Highlighted rows are the terms listed in the question.</p>";

  const box = document.getElementById("synth-solution");
  box.innerHTML = html;
  box.hidden = false;
}

newSynthesis();