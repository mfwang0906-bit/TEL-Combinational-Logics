let minterms = [];
let activeLow = false;

function newSynthesis() {
  minterms = randomTerms(8, 3 + Math.floor(Math.random() * 3));  // 3 to 5 terms
  activeLow = Math.random() < 0.5;
  const polarity = activeLow ? "active-low" : "active-high";
  document.getElementById("synth-text").textContent =
    `Implement f(a, b, c) = Σm(${minterms.join(", ")}) using a 3-to-8 decoder with ${polarity} outputs and one logic gate.`;
  document.getElementById("synth-solution").hidden = true;
}

function showSolution() {
  const gate = activeLow ? "NAND" : "OR";
  const ys = minterms.map(m => "Y" + m).join(", ");
  let html = `<p>Connect a, b, c to the decoder inputs (a as MSB). Feed ${ys} into a ${minterms.length}-input ${gate} gate.</p>`;

  html += "<table><tr><th>a</th><th>b</th><th>c</th>";
  for (let y = 7; y >= 0; y--) html += `<th>Y${y}</th>`;
  html += "<th>f</th></tr>";

  allCombinations(3).forEach(bits => {
    const out = decoder(bits, activeLow);
    const gateInputs = minterms.map(m => out[m]);
    // Simulate the gate itself, rather than reading f off the minterm list
    const f = activeLow ? (gateInputs.includes(0) ? 1 : 0)   // NAND
                        : (gateInputs.includes(1) ? 1 : 0);  // OR
    html += `<tr class="${f ? "highlight" : ""}">`;
    bits.forEach(b => html += `<td>${b}</td>`);
    for (let y = 7; y >= 0; y--) html += `<td>${out[y]}</td>`;
    html += `<td>${f}</td></tr>`;
  });
  html += "</table>";

  const box = document.getElementById("synth-solution");
  box.innerHTML = html;
  box.hidden = false;
}

newSynthesis();  // show a question when the page loads