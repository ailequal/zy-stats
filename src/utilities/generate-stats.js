import chalk from "chalk";

/**
 * Formats band details string.
 * Example: formatBandDetails("LTE_BC7", 20, 10) -> "B7 (20MHz/10MHz)"
 *
 * @param {string} bandString - The band string, e.g., "LTE_BC7" or "B1".
 * @param {number} dlBandwidth - Downlink bandwidth in MHz.
 * @param {number} ulBandwidth - Uplink bandwidth in MHz.
 * @returns {string} Formatted band details.
 */
const formatBandDetails = (bandString, dlBandwidth, ulBandwidth) => {
  let output = "";

  if (bandString && bandString.length > 0) {
    const bandNumber = bandString.includes("LTE_BC")
      ? bandString.slice(6)
      : bandString.startsWith("B")
        ? bandString.slice(1)
        : bandString;

    output += `B${bandNumber}`;
  }

  if (dlBandwidth > 0 || ulBandwidth > 0) {
    output += ` (${dlBandwidth}MHz/${ulBandwidth}MHz)`;
  }

  return output.trim();
};

/**
 * Creates a text-based bar graph.
 *
 * @param {number} value - The current value.
 * @param {number} min - The minimum value of the range.
 * @param {number} max - The maximum value of the range.
 * @param {number} [width=20] - The width of the bar in characters.
 * @returns {string} String representation of the bar.
 */
const createBar = (value, min, max, width = 20) => {
  if (value === undefined || value === null || Number.isNaN(value)) return "[N/A]".padEnd(width + 2); // +2 for brackets.

  const clampedValue = Math.max(min, Math.min(max, value));
  const percentage = (clampedValue - min) / (max - min);
  const filledCount = Math.round(percentage * width);
  const emptyCount = width - filledCount;

  const filledBar = "█".repeat(filledCount);
  const emptyBar = " ".repeat(emptyCount);

  let coloredBar;
  const pc = percentage * 100;

  if (pc < 50) {
    coloredBar = chalk.yellow(filledBar);
  } else if (pc < 85) {
    coloredBar = chalk.green(filledBar);
  } else {
    coloredBar = chalk.red(filledBar);
  }

  return `[${coloredBar}${emptyBar}]`;
};

/**
 * Displays 4G statistics in a CLI-friendly format.
 *
 * @param {object} statsJson - The parsed JSON object containing the stats.
 * @param {string} [format='pretty'] - The format of the output: 'pretty' or 'json'.
 * @returns {string} The formatted output string.
 * @throws {Error} If no valid stats data is available.
 */
export default (statsJson, format = "pretty") => {
  if (!statsJson || !statsJson.Object || !statsJson.Object[0]) {
    throw new Error("No valid stats data available to display.");
  }

  const data = statsJson.Object[0];

  const technology = data.INTF_Current_Access_Technology || "N/A";
  let plmn = "N/A";
  if (data.INTF_Network_In_Use) {
    const parts = data.INTF_Network_In_Use.split("_");

    if (parts.length > 3) {
      plmn = parts[3];
      if (plmn === "22201") plmn = "2221";
      else if (plmn === "22299") plmn = "22288";
      // The custom-hack.js had a rule for "22250" based on enbid length,
      // which is slightly more complex to replicate directly here without knowing enbid first.
      // So it's handled after enbId is calculated.
    }
  }

  const cellId = data.INTF_Cell_ID !== undefined ? data.INTF_Cell_ID : "N/A";
  let enbId = "N/A";
  if (cellId !== "N/A") {
    enbId = Math.trunc(cellId / 256);
  }

  // Adjust PLMN for "22250" if enbId is available and has 6 digits (as per custom-hack.js logic).
  if (plmn === "22250" && enbId !== "N/A" && String(enbId).length === 6) {
    plmn = "22288";
  }

  const pci = data.INTF_PhyCell_ID !== undefined ? data.INTF_PhyCell_ID : "N/A";
  const earfcn = data.INTF_RFCN !== undefined ? data.INTF_RFCN : "N/A";

  const pccUlBw = data.INTF_Uplink_Bandwidth !== undefined ? 5 * (data.INTF_Uplink_Bandwidth - 1) : 0;
  const pccDlBw = data.INTF_Downlink_Bandwidth !== undefined ? 5 * (data.INTF_Downlink_Bandwidth - 1) : 0;
  const currentBand = data.INTF_Current_Band ? formatBandDetails(data.INTF_Current_Band, pccDlBw, pccUlBw) : "N/A";

  let caInfo = "None";
  if (Array.isArray(data.SCC_Info) && data.SCC_Info.length > 0) {
    caInfo = data.SCC_Info.filter((scc) => scc.Enable && scc.Band)
      .map((scc) => {
        return formatBandDetails(scc.Band, 0, 0);
      })
      .join(" + ");

    if (!caInfo) caInfo = "None";
  }

  const rsrp = data.INTF_RSRP;
  const rsrq = data.INTF_RSRQ;
  const sinr = data.INTF_SINR;
  const rssi = data.INTF_RSSI;

  let lteItalyLink = "N/A";
  if (plmn !== "N/A" && enbId !== "N/A") {
    lteItalyLink = `https://lteitaly.it/internal/map.php#bts=${plmn}.${enbId}`;
  }

  let output;
  if (format === "pretty") {
    const now = new Date();
    const formattedTimestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

    output = `
  ${chalk.blue("########")}
  ${chalk.blue("zy-stats")}
  ${chalk.blue("########")}

  ===========================================
  LTE Network Stats
  -------------------------------------------
  Technology:   ${technology}
  PLMN:         ${plmn}
  ENB ID:       ${enbId}
  Cell ID:      ${cellId}
  PCI:          ${pci}
  EARFCN:       ${earfcn}
  LTEItaly:     ${lteItalyLink}
  -------------------------------------------
  Primary Band: ${currentBand}
  CA Bands:     ${caInfo}
  -------------------------------------------
  Signal Quality (4G LTE)
  RSRP: ${rsrp !== undefined ? `${String(rsrp).padStart(4, " ")} dBm` : "N/A".padEnd(7)} ${createBar(rsrp, -130, -60, 25)}
  RSRQ: ${rsrq !== undefined ? `${String(rsrq).padStart(4, " ")} dB ` : "N/A".padEnd(7)} ${createBar(rsrq, -20, -3, 25)}
  SINR: ${sinr !== undefined ? `${String(sinr).padStart(4, " ")} dB ` : "N/A".padEnd(7)} ${createBar(sinr, -5, 30, 25)}
  RSSI: ${rssi !== undefined ? `${String(rssi).padStart(4, " ")} dBm` : "N/A".padEnd(7)} ${createBar(rssi, -110, -50, 25)}
  -------------------------------------------
  Report generated at: ${formattedTimestamp}
  ===========================================
  `;
  } else {
    output = {
      technology,
      plmn,
      enbId,
      cellId,
      pci,
      earfcn,
      lteItalyLink,
      currentBand,
      caInfo,
      rsrp,
      rsrq,
      sinr,
      rssi,
      timestamp: new Date().toISOString(),
    };
  }

  return output;
};
