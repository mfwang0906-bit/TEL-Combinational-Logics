let enc = {};   // the current encoder question

// Priority encoder function table (X = don't care), as in the lecture notes.
const PRIORITY_ROWS = [
  ["0", "0", "0", "0", "0", "0", "0"],
  ["0", "0", "0", "1", "0", "0", "1"],
  ["0", "0", "1", "X", "0", "1", "1"],
  ["0", "1", "X", "X", "1", "0", "1"],
  ["1", "X", "X", "X", "1", "1", "1"],
];

function priorityTableHTML(highlightRow) {
  let html = "<table><tr><th>D3</th><th>D2</th><th>D1</th><th>D0</th><th>A1</th><th>A0</th><th>V</th></tr>";
  PRIORITY_ROWS.forEach((r, i) => {
    html += `<tr class="${i === highlightRow ? "highlight" : ""}">` + r.map(x => `<td>${x}</td>`).join("") + "</tr>";
  });
  return html + "</table>";
}

function newEncoder() {
  const type = Math.random() < 0.5 ? "binary" : "priority";
  const inputs = allCombinations(4)[Math.floor(Math.random() * 16)];
  const outputs = type === "binary" ? binaryEncoder(inputs) : priorityEncoder(inputs);
  enc = { type, inputs, outputs };

  const inStr = inputs.join("");
  if (type === "binary") {
    document.getElementById("enc-text").textContent =
      `A 4-to-2 binary encoder is built from OR gates, with A1 = D3 + D2 and A0 = D3 + D1. Its inputs are D3 D2 D1 D0 = ${inStr}. Find the outputs A1 and A0.`;
    document.getElementById("enc-table").innerHTML = "";
    document.getElementById("enc-v-box").hidden = true;
  } else {
    document.getElementById("enc-text").textContent =
      `A 4-to-2 priority encoder has the function table below (D3 has the highest priority). Its inputs are D3 D2 D1 D0 = ${inStr}. Find the outputs A1, A0 and the valid bit V.`;
    document.getElementById("enc-table").innerHTML = priorityTableHTML(-1);
    document.getElementById("enc-v-box").hidden = false;
  }

  ["enc-a1", "enc-a0", "enc-v"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("enc-feedback").textContent = "";
  document.getElementById("enc-solution").hidden = true;
}

function checkEncoder() {
  const ids = enc.type === "binary" ? ["enc-a1", "enc-a0"] : ["enc-a1", "enc-a0", "enc-v"];
  const given = ids.map(id => document.getElementById(id).value.trim());
  const feedback = document.getElementById("enc-feedback");
  if (given.some(g => g !== "0" && g !== "1")) {
    feedback.textContent = "Please enter 0 or 1 in every box.";
    return;
  }
  const correct = given.every((g, i) => Number(g) === enc.outputs[i]);
  feedback.textContent = correct ? "Correct!" : "Not quite. Try again, or show the solution.";
}

function showEncoderSolution() {
  const [d3, d2, d1, d0] = enc.inputs;
  const active = enc.inputs.reduce((sum, x) => sum + x, 0);   // how many inputs are 1
  let html;

  if (enc.type === "binary") {
    const [a1, a0] = enc.outputs;
    html = `<p>A1 = D3 + D2 = ${d3} + ${d2} = ${a1}<br>A0 = D3 + D1 = ${d3} + ${d1} = ${a0}</p>`;
    if (active === 1) {
      const k = 3 - enc.inputs.indexOf(1);
      html += `<p>Only D${k} is active, so the output ${a1}${a0} is ${k} in binary, which is correct.</p>`;
    } else if (active === 0) {
      html += `<p>No input is active, yet the output 00 is the same as when only D0 is active. A binary encoder cannot tell these two cases apart.</p>`;
    } else {
      html += `<p>${active} inputs are active at once, so the output ${a1}${a0} does not identify any single input. This is the weakness of a binary encoder, and the reason priority encoders are used.</p>`;
    }
  } else {
    const [a1, a0, v] = enc.outputs;
    const firstOne = enc.inputs.indexOf(1);
    html = v
      ? `<p>The highest-priority active input is D${3 - firstOne}, so A1 A0 = ${a1}${a0} (${3 - firstOne} in binary) and V = 1. Any lower-priority inputs are ignored.</p>`
      : `<p>No input is active, so V = 0, which tells you the outputs A1 and A0 carry no meaning.</p>`;
    const row = v ? (3 - firstOne) + 1 : 0;
    html += priorityTableHTML(row) + "<p>The highlighted row is the one that applies. X means \"don't care\".</p>";
  }

  const box = document.getElementById("enc-solution");
  box.innerHTML = html;
  box.hidden = false;
}

newEncoder();