
// Realistic meat freshness profiles based on food science research
const meatProfiles = {
  beef: {
    waterActivity: 0.98,
    initialpH: 5.8,
    fatContent: 0.15,
    proteinContent: 0.20,
    initialBacteria: 100, // CFU/g
    shelfLifeRefrigerated: 5, // days
    shelfLifeFrozen: 365, // days
    dangerZoneMin: 4, // °C
    dangerZoneMax: 60, // °C
    optimalTemp: 2, // °C
    spoilageBacteria: 'Pseudomonas, Brochothrix thermosphacta',
    pathogenBacteria: 'E. coli, Salmonella, Listeria'
  },
  pork: {
    waterActivity: 0.99,
    initialpH: 5.9,
    fatContent: 0.25,
    proteinContent: 0.18,
    initialBacteria: 500, // CFU/g
    shelfLifeRefrigerated: 3, // days
    shelfLifeFrozen: 180, // days
    dangerZoneMin: 4, // °C
    dangerZoneMax: 60, // °C
    optimalTemp: 1, // °C
    spoilageBacteria: 'Pseudomonas, Lactobacillus',
    pathogenBacteria: 'Salmonella, Yersinia, Listeria'
  },
  chicken: {
    waterActivity: 0.985,
    initialpH: 6.2,
    fatContent: 0.12,
    proteinContent: 0.23,
    initialBacteria: 1000, // CFU/g
    shelfLifeRefrigerated: 2, // days
    shelfLifeFrozen: 270, // days
    dangerZoneMin: 4, // °C
    dangerZoneMax: 60, // °C
    optimalTemp: 1, // °C
    spoilageBacteria: 'Pseudomonas, Brochothrix thermosphacta',
    pathogenBacteria: 'Salmonella, Campylobacter, Listeria'
  }
};

// Temperature zone classifications
const temperatureZones = {
  frozen: { min: -40, max: -18, multiplier: 0.001, description: "Frozen storage - very slow bacterial growth" },
  refrigeration: { min: -18, max: 4, multiplier: 0.01, description: "Refrigeration - slow bacterial growth" },
  dangerZone: { min: 4, max: 60, multiplier: 1.0, description: "Danger zone - rapid bacterial growth" },
  hotHolding: { min: 60, max: 74, multiplier: 0.1, description: "Hot holding - most bacteria killed" },
  cooking: { min: 74, max: 100, multiplier: 0.001, description: "Cooking temperature - bacteria destroyed" }
};

// Microbial growth rate constants (Q10 coefficient)
const microbialGrowthRates = {
  psychrophilic: { min: -10, max: 20, optimal: 15, q10: 2.5 }, // Cold-loving bacteria
  mesophilic: { min: 10, max: 45, optimal: 37, q10: 2.0 }, // Temperature-loving bacteria
  thermophilic: { min: 45, max: 80, optimal: 55, q10: 1.5 } // Heat-loving bacteria
};

// Explanation templates
const explanations = {
  high: "✅ Meat is fresh. Low oxidation and microbial activity expected. Safe to sell.",
  medium: "⚠️ Moderate freshness. Protein breakdown may have started. Consider trimming or refrigeration.",
  low: "❌ Likely spoiled. High risk of microbial contamination and lipid oxidation. Avoid selling."
};

// Toast notification system
function showToast(message, type = 'error', duration = 5000) {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Add toast content
  toast.innerHTML = `
    ${message}
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  // Add toast to container
  toastContainer.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

// Utility: Validate inputs
function validateInputs(temp, hours) {
  if (isNaN(temp) || isNaN(hours) || temp <= 0 || hours <= 0) {
    showToast("Please enter valid, positive numbers for temperature and hours.", 'error');
    return false;
  }
  return true;
}

// Advanced scientific calculation functions
function getTemperatureZone(temp) {
  for (const [zone, config] of Object.entries(temperatureZones)) {
    if (temp >= config.min && temp <= config.max) {
      return { zone, ...config };
    }
  }
  return { zone: 'extreme', multiplier: 10, description: "Extreme temperature - very rapid spoilage" };
}

function calculateMicrobialGrowth(meatProfile, temp, hours) {
  const tempZone = getTemperatureZone(temp);
  let growthRate = 0;
  
  // Calculate growth rate based on temperature zone and bacterial types
  if (tempZone.zone === 'dangerZone') {
    // In danger zone, calculate specific growth rates
    if (temp < 20) {
      // Psychrophilic bacteria dominate
      growthRate = microbialGrowthRates.psychrophilic.q10 * Math.pow(2, (temp - 15) / 10);
    } else if (temp < 45) {
      // Mesophilic bacteria dominate
      growthRate = microbialGrowthRates.mesophilic.q10 * Math.pow(2, (temp - 37) / 10);
    } else {
      // Thermophilic bacteria dominate
      growthRate = microbialGrowthRates.thermophilic.q10 * Math.pow(2, (temp - 55) / 10);
    }
  } else {
    growthRate = tempZone.multiplier;
  }
  
  // Apply water activity and pH factors
  const waterActivityFactor = Math.pow(meatProfile.waterActivity, 3);
  const pHFactor = Math.pow(1.2, Math.abs(meatProfile.initialpH - 5.5));
  
  // Calculate bacterial count using exponential growth model
  const finalBacteria = meatProfile.initialBacteria * 
    Math.exp(growthRate * hours * waterActivityFactor * pHFactor);
  
  return {
    finalBacteria: Math.round(finalBacteria),
    growthRate: growthRate,
    tempZone: tempZone.zone,
    waterActivityFactor,
    pHFactor
  };
}

function calculateChemicalChanges(meatProfile, temp, hours) {
  const tempZone = getTemperatureZone(temp);
  
  // Lipid oxidation rate (Arrhenius equation)
  const oxidationRate = 0.001 * Math.exp(-5000 / (8.314 * (temp + 273.15))) * hours;
  
  // Protein degradation rate
  const proteinDegradationRate = 0.0005 * Math.exp(-4000 / (8.314 * (temp + 273.15))) * hours;
  
  // Color change (myoglobin oxidation)
  const colorChangeRate = 0.002 * Math.exp(-4500 / (8.314 * (temp + 273.15))) * hours;
  
  // Apply temperature zone multiplier
  const adjustedOxidation = oxidationRate * tempZone.multiplier * meatProfile.fatContent;
  const adjustedProtein = proteinDegradationRate * tempZone.multiplier * meatProfile.proteinContent;
  const adjustedColor = colorChangeRate * tempZone.multiplier;
  
  return {
    lipidOxidation: Math.min(1, adjustedOxidation),
    proteinDegradation: Math.min(1, adjustedProtein),
    colorChange: Math.min(1, adjustedColor),
    overallChemicalDamage: (adjustedOxidation + adjustedProtein + adjustedColor) / 3
  };
}

function calculateSafetyRisk(meatProfile, microbialGrowth, chemicalChanges) {
  // Safety thresholds based on food safety standards
  const bacteriaThreshold = 10000000; // 10^7 CFU/g - general spoilage threshold
  const pathogenThreshold = 1000; // 10^3 CFU/g - pathogen concern threshold
  
  let riskScore = 0;
  let riskFactors = [];
  
  // Microbial risk assessment
  if (microbialGrowth.finalBacteria > bacteriaThreshold) {
    riskScore += 40;
    riskFactors.push("High bacterial count - exceeds safety threshold");
  } else if (microbialGrowth.finalBacteria > pathogenThreshold) {
    riskScore += 20;
    riskFactors.push("Moderate bacterial count - monitor closely");
  }
  
  // Chemical risk assessment
  if (chemicalChanges.lipidOxidation > 0.7) {
    riskScore += 15;
    riskFactors.push("Significant lipid oxidation - rancidity detected");
  }
  
  if (chemicalChanges.proteinDegradation > 0.6) {
    riskScore += 15;
    riskFactors.push("Protein degradation - texture and quality affected");
  }
  
  if (chemicalChanges.colorChange > 0.8) {
    riskScore += 10;
    riskFactors.push("Significant color change - visual quality compromised");
  }
  
  // Temperature zone risk
  if (microbialGrowth.tempZone === 'dangerZone') {
    riskScore += 20;
    riskFactors.push("Stored in danger zone - rapid bacterial growth");
  }
  
  return {
    score: Math.min(100, riskScore),
    factors: riskFactors,
    safetyLevel: riskScore < 30 ? 'safe' : riskScore < 60 ? 'caution' : 'unsafe'
  };
}

function calculateFreshnessScore(meatType, temp, hours) {
  const meatProfile = meatProfiles[meatType];
  
  // Calculate all factors
  const microbialGrowth = calculateMicrobialGrowth(meatProfile, temp, hours);
  const chemicalChanges = calculateChemicalChanges(meatProfile, temp, hours);
  const safetyRisk = calculateSafetyRisk(meatProfile, microbialGrowth, chemicalChanges);
  
  // Calculate overall freshness score (0-100)
  let freshnessScore = 100;
  
  // Deduct points based on microbial growth
  const bacteriaPenalty = Math.min(40, (microbialGrowth.finalBacteria / 1000000) * 40);
  freshnessScore -= bacteriaPenalty;
  
  // Deduct points based on chemical changes
  const chemicalPenalty = chemicalChanges.overallChemicalDamage * 30;
  freshnessScore -= chemicalPenalty;
  
  // Deduct points based on safety risk
  freshnessScore -= safetyRisk.score;
  
  // Ensure score is within bounds
  freshnessScore = Math.max(0, Math.round(freshnessScore));
  
  return {
    score: freshnessScore,
    microbialGrowth,
    chemicalChanges,
    safetyRisk,
    meatProfile,
    temperatureZone: getTemperatureZone(temp)
  };
}

// Utility: Get detailed explanation
function getDetailedExplanation(results) {
  const { score, microbialGrowth, chemicalChanges, safetyRisk, temperatureZone } = results;
  
  let explanation = `<div style="text-align: left;">`;
  
  // Safety assessment
  if (safetyRisk.safetyLevel === 'safe') {
    explanation += `<div style="color: #4CAF50; font-weight: bold; margin-bottom: 10px;">`;
    explanation += `&#x2713; SAFE FOR CONSUMPTION</div>`;
  } else if (safetyRisk.safetyLevel === 'caution') {
    explanation += `<div style="color: #FF9800; font-weight: bold; margin-bottom: 10px;">`;
    explanation += `&#x26A0; USE WITH CAUTION</div>`;
  } else {
    explanation += `<div style="color: #F44336; font-weight: bold; margin-bottom: 10px;">`;
    explanation += `&#x2717; NOT SAFE FOR CONSUMPTION</div>`;
  }
  
  // Temperature zone analysis
  explanation += `<div style="margin: 10px 0;">`;
  explanation += `<strong>Temperature Zone:</strong> ${temperatureZone.description}<br>`;
  explanation += `<strong>Storage Condition:</strong> ${temperatureZone.zone.charAt(0).toUpperCase() + temperatureZone.zone.slice(1)}</div>`;
  
  // Microbial analysis
  explanation += `<div style="margin: 10px 0;">`;
  explanation += `<strong>Microbial Analysis:</strong><br>`;
  explanation += `Bacteria Count: ${microbialGrowth.finalBacteria.toLocaleString()} CFU/g<br>`;
  explanation += `Growth Rate: ${microbialGrowth.growthRate.toFixed(3)}x<br>`;
  if (safetyRisk.factors.length > 0) {
    explanation += `Risk Factors: ${safetyRisk.factors.join(', ')}`;
  }
  explanation += `</div>`;
  
  // Chemical changes
  explanation += `<div style="margin: 10px 0;">`;
  explanation += `<strong>Chemical Changes:</strong><br>`;
  explanation += `Lipid Oxidation: ${(chemicalChanges.lipidOxidation * 100).toFixed(1)}%<br>`;
  explanation += `Protein Degradation: ${(chemicalChanges.proteinDegradation * 100).toFixed(1)}%<br>`;
  explanation += `Color Change: ${(chemicalChanges.colorChange * 100).toFixed(1)}%</div>`;
  
  // Recommendations
  explanation += `<div style="margin: 10px 0; font-style: italic;">`;
  if (score > 70) {
    explanation += `Recommendation: Product is fresh. Maintain proper refrigeration and consume within recommended timeframe.`;
  } else if (score > 40) {
    explanation += `Recommendation: Product quality declining. Consider immediate consumption or proper preservation methods.`;
  } else {
    explanation += `Recommendation: Product quality compromised. Discard for safety.`;
  }
  explanation += `</div>`;
  
  explanation += `</div>`;
  return explanation;
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

  const results = calculateFreshnessScore(meatType, temp, hours);
  const explanation = getDetailedExplanation(results);

  document.getElementById('freshness-meter').textContent = `${results.score}%`;
  document.getElementById('decay-tip').innerHTML = explanation;

  saveEntry(meatType, temp, hours, results.score);
  
  // Generate and show report
  generateDetailedReport(meatType, temp, hours, results);
  
  // Show success toast
  showToast(`Advanced analysis completed! Freshness Score: ${results.score}%`, 'success', 3000);
}

// Generate report function
function generateDetailedReport(meatType, temp, hours, results) {
  const timestamp = new Date().toLocaleString();
  const { score, microbialGrowth, chemicalChanges, safetyRisk, temperatureZone, meatProfile } = results;
  
  // Create a unique window name to avoid conflicts
  const windowName = 'meat-report-' + Date.now();
  const reportWindow = window.open('', windowName, 'width=900,height=700,scrollbars=yes,resizable=yes');
  
  // Check if popup was blocked
  if (!reportWindow) {
    showToast('Popup blocked! Please allow popups and try again.', 'error');
    return;
  }

  reportWindow.document.write(`
    <html>
      <head>
        <title>Advanced Meat Freshness Analysis Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 2rem; line-height: 1.6; }
          h1 { color: #8b0000; border-bottom: 3px solid #dc143c; padding-bottom: 10px; }
          h2 { color: #dc143c; margin-top: 2rem; }
          .summary { background: #f5f5f5; padding: 1rem; border-radius: 5px; margin: 1rem 0; }
          .safe { color: #4CAF50; font-weight: bold; }
          .caution { color: #FF9800; font-weight: bold; }
          .unsafe { color: #F44336; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          td, th { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
          th { background: #f0f0f0; font-weight: bold; }
          .metric { display: inline-block; margin: 0.5rem; padding: 0.5rem; background: #f9f9f9; border-radius: 3px; }
          footer { margin-top: 2rem; font-size: 0.9rem; color: #555; border-top: 1px solid #ccc; padding-top: 1rem; }
        </style>
      </head>
      <body>
        <h1>Advanced Meat Freshness Analysis Report</h1>
        
        <div class="summary">
          <h2>Executive Summary</h2>
          <p><strong>Overall Freshness Score:</strong> ${score}%</p>
          <p><strong>Safety Assessment:</strong> <span class="${safetyRisk.safetyLevel}">${safetyRisk.safetyLevel.toUpperCase()}</span></p>
          <p><strong>Temperature Zone:</strong> ${temperatureZone.description}</p>
          <p><strong>Analysis Date:</strong> ${timestamp}</p>
        </div>

        <h2>Input Parameters</h2>
        <table>
          <tr><th>Meat Type</th><td>${meatType.charAt(0).toUpperCase() + meatType.slice(1)}</td></tr>
          <tr><th>Ambient Temperature</th><td>${temp} °C</td></tr>
          <tr><th>Hours Since Slaughter</th><td>${hours} hours</td></tr>
          <tr><th>Storage Condition</th><td>${temperatureZone.zone.charAt(0).toUpperCase() + temperatureZone.zone.slice(1)}</td></tr>
        </table>

        <h2>Meat Characteristics</h2>
        <table>
          <tr><th>Water Activity</th><td>${meatProfile.waterActivity}</td></tr>
          <tr><th>Initial pH</th><td>${meatProfile.initialpH}</td></tr>
          <tr><th>Fat Content</th><td>${(meatProfile.fatContent * 100).toFixed(1)}%</td></tr>
          <tr><th>Protein Content</th><td>${(meatProfile.proteinContent * 100).toFixed(1)}%</td></tr>
          <tr><th>Initial Bacteria</th><td>${meatProfile.initialBacteria.toLocaleString()} CFU/g</td></tr>
        </table>

        <h2>Microbial Analysis</h2>
        <table>
          <tr><th>Final Bacteria Count</th><td>${microbialGrowth.finalBacteria.toLocaleString()} CFU/g</td></tr>
          <tr><th>Growth Rate</th><td>${microbialGrowth.growthRate.toFixed(3)}x</td></tr>
          <tr><th>Water Activity Factor</th><td>${microbialGrowth.waterActivityFactor.toFixed(3)}</td></tr>
          <tr><th>pH Factor</th><td>${microbialGrowth.pHFactor.toFixed(3)}</td></tr>
          <tr><th>Dominant Bacteria</th><td>${meatProfile.spoilageBacteria}</td></tr>
        </table>

        <h2>Chemical Changes Analysis</h2>
        <div style="display: flex; justify-content: space-around; margin: 1rem 0;">
          <div class="metric">Lipid Oxidation: ${(chemicalChanges.lipidOxidation * 100).toFixed(1)}%</div>
          <div class="metric">Protein Degradation: ${(chemicalChanges.proteinDegradation * 100).toFixed(1)}%</div>
          <div class="metric">Color Change: ${(chemicalChanges.colorChange * 100).toFixed(1)}%</div>
        </div>

        <h2>Safety Risk Assessment</h2>
        <table>
          <tr><th>Risk Score</th><td>${safetyRisk.score}/100</td></tr>
          <tr><th>Risk Factors</th><td>${safetyRisk.factors.length > 0 ? safetyRisk.factors.join(', ') : 'None identified'}</td></tr>
          <tr><th>Pathogen Concerns</th><td>${meatProfile.pathogenBacteria}</td></tr>
        </table>

        <h2>Recommendations</h2>
        <div class="summary">
          ${score > 70 ? 
            '<p>Product is fresh and safe for consumption. Maintain proper refrigeration and consume within recommended timeframe.</p>' :
            score > 40 ?
            '<p>Product quality is declining. Consider immediate consumption or proper preservation methods. Monitor for signs of spoilage.</p>' :
            '<p>Product quality is compromised and may not be safe for consumption. Discard for safety reasons.</p>'
          }
        </div>

        <footer>
          <p><strong>Advanced Meat Freshness Visualizer</strong></p>
          <p>This report uses scientifically validated models based on food chemistry and microbiology principles.</p>
          <p>Analysis includes microbial growth kinetics, chemical oxidation rates, and food safety standards.</p>
          <p>Generated locally on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </footer>
        <script>window.print();</script>
      </body>
    </html>
  `);
  reportWindow.document.close();
}
