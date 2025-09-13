
// Decay constants based on meat type and ambient sensitivity
const decayProfiles = {
  beef: { baseK: 0.3, sensitivity: 0.02 },
  pork: { baseK: 0.5, sensitivity: 0.03 },
  chicken: { baseK: 0.8, sensitivity: 0.05 },
};

// Explanation templates
const explanations = {
  high: "✅ Meat is fresh. Low oxidation and microbial activity expected. Safe to sell.",
  medium: "⚠️ Moderate freshness. Protein breakdown may have started. Consider trimming or refrigeration.",
  low: "❌ Likely spoiled. High risk of microbial contamination and lipid oxidation. Avoid selling."
};

// Utility: Validate inputs
function validateInputs(temp, hours) {
  if (isNaN(temp) || isNaN(hours) || temp <= 0 || hours <= 0) {
    alert("Please enter valid, positive numbers for temperature and hours.");
    return false;
  }
  return true;
}

// Utility: Calculate freshness score
function calculateFreshnessScore(meatType, temp, hours) {
  const profile = decayProfiles[meatType];
  const k = profile.baseK + (profile.sensitivity * temp); // Adjust decay rate based on ambient temp
  const score = Math.max(0, Math.round(100 - (k * temp * hours)));
  return score;
}

// Utility: Get explanation
function getExplanation(score) {
  if (score > 70) return explanations.high;
  if (score > 40) return explanations.medium;
  return explanations.low;
}

// Utility: Save to localStorage
function saveEntry(meatType, temp, hours, score) {
  const entry = {
    meatType,
    temperature: temp,
    hoursSinceSlaughter: hours,
    freshnessScore: score,
    timestamp: new Date().toISOString()
  };
  let history = JSON.parse(localStorage.getItem("freshnessHistory")) || [];
  history.push(entry);
  localStorage.setItem("freshnessHistory", JSON.stringify(history));
}

// Main function
function calculateFreshness() {
  const meatType = document.getElementById('meat-type').value;
  const temp = parseFloat(document.getElementById('temperature').value);
  const hours = parseFloat(document.getElementById('hours').value);

  if (!validateInputs(temp, hours)) return;

  const score = calculateFreshnessScore(meatType, temp, hours);
  const explanation = getExplanation(score);

  document.getElementById('freshness-meter').textContent = `${score}%`;
  document.getElementById('decay-tip').textContent = explanation;

  saveEntry(meatType, temp, hours, score);
}

//PRinting the report//
function calculateFreshness() {
  const meatType = document.getElementById('meat-type').value;
  const temp = parseFloat(document.getElementById('temperature').value);
  const hours = parseFloat(document.getElementById('hours').value);

  if (!validateInputs(temp, hours)) return;

  const score = calculateFreshnessScore(meatType, temp, hours);
  const explanation = getExplanation(score);

  document.getElementById('freshness-meter').textContent = `${score}%`;
  document.getElementById('decay-tip').textContent = explanation;

  saveEntry(meatType, temp, hours, score);
  generateReport(meatType, temp, hours, score, explanation);
}

// 🖨️ Generate printable report
function generateReport(meatType, temp, hours, score, explanation) {
  const timestamp = new Date().toLocaleString();
  const reportWindow = window.open('', '', 'width=800,height=600');

  reportWindow.document.write(`
    <html>
      <head>
        <title>Meat Freshness Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 2rem; }
          h1 { color: #d32f2f; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          td, th { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
          footer { margin-top: 2rem; font-size: 0.9rem; color: #555; }
        </style>
      </head>
      <body>
        <h1>Meat Freshness Report</h1>
        <table>
          <tr><th>Meat Type</th><td>${meatType}</td></tr>
          <tr><th>Ambient Temperature</th><td>${temp} °C</td></tr>
          <tr><th>Hours Since Slaughter</th><td>${hours} hrs</td></tr>
          <tr><th>Freshness Score</th><td>${score}%</td></tr>
          <tr><th>Explanation</th><td>${explanation}</td></tr>
          <tr><th>Timestamp</th><td>${timestamp}</td></tr>
        </table>
        <footer>
          Powered by industrial chemistry logic. This report is generated locally and can be printed or saved as PDF.
        </footer>
        <script>window.print();</script>
      </body>
    </html>
  `);
  reportWindow.document.close();
}