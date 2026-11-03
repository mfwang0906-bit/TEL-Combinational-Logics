// ================= Multiplexer =================
const DATA_OPTIONS = ["0", "1", "c", "c'"];
const MUX_IDS = ["mux-i0", "mux-i1", "mux-i2", "mux-i3"];
let mq = {};   // the current MUX question

// Fill each dropdown with: choose / 0 / 1 / c / c'
MUX_IDS.forEach(id => {
  document.getElementById(id).innerHTML =
    `<option value="">choose</option>` + DATA_OPTIONS.map(o => `<option>${o}</option>`).join("");
});

// The value a data-input choice gives for a particular c
function dataValue(option, c) {
  if (option === "0") return 0;
  if (option === "1") return 1;
  if (option === "c") return c;
  return 1 - c;   // c'
}

function muxTableHTML() {
  let html = "<table><tr><th>S1</th><th>S0</th><th>Y</th></tr>";
  for (let k = 0; k < 4; k++) html += `<tr><td>${(k >> 1) & 1}</td><td>${k & 1}</td><td>I${k}</td></tr>`;
  return html + "</table>";
}

function newMux() {
  const terms = randomTerms(8, 2 + Math.floor(Math.random() * 5));   // 2 to 6 minterms
  const target = [0, 1, 2, 3, 4, 5, 6, 7].map(r => terms.includes(r) ? 1 : 0);

  // Data input Ik covers two rows: 2k (c = 0) and 2k + 1 (c = 1)
  const answer = [0, 1, 2, 3].map(k => {
    const f0 = target[2 * k], f1 = target[2 * k + 1];
    if (f0 === f1) return String(f0);   // same in both rows: constant 0 or 1
    return f1 === 1 ? "c" : "c'";       // follows c, or the opposite of c
  });
  mq = { terms, target, answer };

  document.getElementById("mux-text").textContent =
    `Implement f(a, b, c) = Σm(${terms.join(", ")}) with the 4-to-1 multiplexer given in the function table below. Connect a to S1 and b to S0, and choose what to connect to each data input: 0, 1, c or c'.`;
  document.getElementById("mux-table").innerHTML = muxTableHTML();
  MUX_IDS.forEach(id => document.getElementById(id).value = "");
  document.getElementById("mux-feedback").textContent = "";
  document.getElementById("mux-solution").hidden = true;
}

function checkMux() {
  const chosen = MUX_IDS.map(id => document.getElementById(id).value);
  const feedback = document.getElementById("mux-feedback");
  if (chosen.includes("")) {
    feedback.textContent = "Choose a value for every data input.";
    return;
  }
  // Simulate the student's MUX on every row and compare with f
  const correct = allCombinations(3).every(([a, b, c], r) =>
    mux([a, b], chosen.map(o => dataValue(o, c))) === mq.target[r]);
  feedback.textContent = correct
    ? "Correct! Your multiplexer produces f for every input combination."
    : "Not quite. Your circuit gives the wrong output for at least one input combination.";
}

function showMuxSolution() {
  let html = "<p>With a on S1 and b on S0, each data input handles two rows of the truth table: one with c = 0 and one with c = 1. Compare f in each pair:</p>";
  html += "<ul><li>f = 0 in both rows → connect 0</li><li>f = 1 in both rows → connect 1</li>";
  html += "<li>f = 0 then 1 (f follows c) → connect c</li><li>f = 1 then 0 (f is opposite to c) → connect c'</li></ul>";

  html += "<table><tr><th>a</th><th>b</th><th>Data input</th><th>f when c = 0</th><th>f when c = 1</th><th>Connect</th></tr>";
  for (let k = 0; k < 4; k++) {
    html += `<tr><td>${(k >> 1) & 1}</td><td>${k & 1}</td><td>I${k}</td>`;
    html += `<td>${mq.target[2 * k]}</td><td>${mq.target[2 * k + 1]}</td><td><strong>${mq.answer[k]}</strong></td></tr>`;
  }
  html += "</table>";
  html += `<p><strong>Answer:</strong> I0 = ${mq.answer[0]}, I1 = ${mq.answer[1]}, I2 = ${mq.answer[2]}, I3 = ${mq.answer[3]}</p>`;

  const box = document.getElementById("mux-solution");
  box.innerHTML = html;
  box.hidden = false;
}

// ================= Demultiplexer =================
const DMX_IDS = ["dmx-y0", "dmx-y1", "dmx-y2", "dmx-y3"];
let dq = {};   // the current DMUX question

function newDemux() {
  const d = Math.random() < 0.75 ? 1 : 0;   // mostly D = 1, sometimes 0
  const sel = allCombinations(2)[Math.floor(Math.random() * 4)];
  dq = { d, sel, outputs: demux(d, sel) };

  document.getElementById("dmx-text").textContent =
    `A 1-to-4 demultiplexer has data input D = ${d} and select lines S1 S0 = ${sel.join("")}. Find the outputs Y0, Y1, Y2 and Y3.`;
  DMX_IDS.forEach(id => document.getElementById(id).value = "");
  document.getElementById("dmx-feedback").textContent = "";
  document.getElementById("dmx-solution").hidden = true;
}

function checkDemux() {
  const given = DMX_IDS.map(id => document.getElementById(id).value.trim());
  const feedback = document.getElementById("dmx-feedback");
  if (given.some(g => g !== "0" && g !== "1")) {
    feedback.textContent = "Please enter 0 or 1 in every box.";
    return;
  }
  const correct = given.every((g, i) => Number(g) === dq.outputs[i]);
  feedback.textContent = correct ? "Correct!" : "Not quite. Try again, or show the solution.";
}

function showDemuxSolution() {
  const k = parseInt(dq.sel.join(""), 2);
  let html = `<p>S1 S0 = ${dq.sel.join("")} = ${k}, so the data is routed to Y${k}: Y${k} = D = ${dq.d}, and every other output is 0.</p>`;
  if (dq.d === 0) html += "<p>Because D = 0, the selected output carries a 0 as well, so all outputs are 0.</p>";
  html += "<p>A demultiplexer works like a decoder whose enable is driven by D: the select lines choose the output, and D decides whether it goes high.</p>";

  html += "<table><tr><th>S1</th><th>S0</th><th>Y0</th><th>Y1</th><th>Y2</th><th>Y3</th></tr>";
  for (let r = 0; r < 4; r++) {
    html += `<tr class="${r === k ? "highlight" : ""}"><td>${(r >> 1) & 1}</td><td>${r & 1}</td>`;
    for (let j = 0; j < 4; j++) html += `<td>${j === r ? "D" : "0"}</td>`;
    html += "</tr>";
  }
  html += "</table>";

  const box = document.getElementById("dmx-solution");
  box.innerHTML = html;
  box.hidden = false;
}

newMux();
newDemux();