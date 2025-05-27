  function toggleDropdown() {
    const panel = document.getElementById("dropdownContent");
    panel.style.display = panel.style.display === "block" ? "none" : "block";
  }

function calculateSignalLoss() {
  const txPower = parseFloat(document.getElementById("txPower").value);
  const distance = parseFloat(document.getElementById("distance").value);
  const attenuation = parseFloat(document.getElementById("attenuation").value); // dB/m

  if (isNaN(txPower) || isNaN(distance) || isNaN(attenuation)) {
    document.getElementById("inverseOutput").innerHTML = "<span style='color:red;'>Please fill in all fields correctly.</span>";
    return;
  }

  // Stałe symulacyjne (sieciowo-przyziemne)
  const baseLoss = 40; // bazowa strata w dB (np. przez powietrze)
  const wallLoss = 5; // strata przez typową ścianę
  const walls = Math.floor(distance / 10); // zakładamy 1 ścianę co 10m
  const interference = Math.random() * 5; // losowa interferencja (0-5 dB)

  // Całkowita strata
  const pathLoss = baseLoss + (attenuation * distance) + (walls * wallLoss) + interference;

  // Szacowany RSSI (odbierana siła sygnału)
  const rssi = txPower - pathLoss;

  // Interpretacja RSSI
  let status;
  if (rssi >= -60) {
    status = "Excellent 📶";
  } else if (rssi >= -70) {
    status = "Good ✅";
  } else if (rssi >= -80) {
    status = "Weak ⚠️";
  } else {
    status = "No signal ❌";
  }

  document.getElementById("inverseOutput").innerHTML = `
    <p><strong>Estimated RSSI:</strong> ${rssi.toFixed(1)} dBm</p>
    <p><strong>Signal Status:</strong> ${status}</p>
    <p><em>(includes air loss, ${walls} wall(s), and interference)</em></p>
  `;
}
function ipToInt(ip) {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct), 0);
}

function intToIp(int) {
  return `${(int >>> 24)}.${(int >> 16 & 255)}.${(int >> 8 & 255)}.${int & 255}`;
}

function calculateCIDR() {
  const ip = document.getElementById("cidrIp").value;
  const prefix = parseInt(document.getElementById("cidrPrefix").value);
  if (!ip || isNaN(prefix) || prefix < 1 || prefix > 32) {
    document.getElementById("cidrOutput").textContent = "Invalid input.";
    return;
  }

  const ipInt = ipToInt(ip);
  const mask = -1 << (32 - prefix);
  const network = ipInt & mask;
  const broadcast = network + Math.pow(2, 32 - prefix) - 1;
  const hostCount = Math.pow(2, 32 - prefix) - 2;

  document.getElementById("cidrOutput").textContent =
    `Network: ${intToIp(network)}\n` +
    `Broadcast: ${intToIp(broadcast)}\n` +
    `Mask: ${intToIp(mask >>> 0)}\n` +
    `Hosts: ${hostCount}`;
}

function calculateSubnets() {
  const subnetInput = document.getElementById("subnetIp").value;
  const count = parseInt(document.getElementById("subnetCount").value);
  if (!subnetInput.includes('/') || isNaN(count)) {
    document.getElementById("subnetOutput").textContent = "Invalid input.";
    return;
  }

  const [baseIp, prefixStr] = subnetInput.split('/');
  const prefix = parseInt(prefixStr);
  const baseInt = ipToInt(baseIp);
  const newBits = Math.ceil(Math.log2(count));
  const newPrefix = prefix + newBits;

  if (newPrefix > 32) {
    document.getElementById("subnetOutput").textContent = "Too many subnets.";
    return;
  }

  const step = Math.pow(2, 32 - newPrefix);
  let result = '';
  for (let i = 0; i < count; i++) {
    const net = baseInt + (i * step);
    const bc = net + step - 1;
    result += `Subnet ${i + 1}:\n  Network: ${intToIp(net)}\n  Broadcast: ${intToIp(bc)}\n\n`;
  }

  document.getElementById("subnetOutput").textContent = result.trim();
}

function calculateLagJitter() {
  const input = document.getElementById("lagInput").value;
  const samples = input.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));

  if (samples.length < 2) {
    document.getElementById("lagOutput").textContent = "Enter at least 2 samples.";
    return;
  }

  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance = samples.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / samples.length;
  const stdDev = Math.sqrt(variance);

  const jitter = samples.slice(1).reduce((acc, val, i) => acc + Math.abs(val - samples[i]), 0) / (samples.length - 1);

  document.getElementById("lagOutput").textContent =
    `Samples: ${samples.length}\n` +
    `Average Lag: ${avg.toFixed(2)} ms\n` +
    `Std Dev (Jitter): ${stdDev.toFixed(2)} ms\n` +
    `Mean Jitter: ${jitter.toFixed(2)} ms`;
}

function calculateETA() {
  const sizeMB = parseFloat(document.getElementById("fileSize").value);
  const speedMbps = parseFloat(document.getElementById("downloadSpeed").value);
  const output = document.getElementById("etaOutput");

  if (isNaN(sizeMB) || isNaN(speedMbps) || sizeMB <= 0 || speedMbps <= 0) {
    output.textContent = "Please enter valid file size and speed.";
    return;
  }

  const sizeMb = sizeMB * 8; // MB to Megabits
  const timeSeconds = sizeMb / speedMbps;

  const hours = Math.floor(timeSeconds / 3600);
  const minutes = Math.floor((timeSeconds % 3600) / 60);
  const seconds = Math.floor(timeSeconds % 60);

  output.textContent =
    `Download Time Estimate:\n` +
    `${hours}h ${minutes}m ${seconds}s\n` +
    `(for ${sizeMB} MB @ ${speedMbps} Mbps)`;
}
