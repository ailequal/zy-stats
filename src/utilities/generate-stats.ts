import chalk from "chalk";
import type { CellwanStatusResponse, StatsJsonOutput } from "../types.ts";

/**
 * Parses a bandwidth string or number to a number in MHz.
 * Example: parseBandwidth("60M") -> 60
 *
 * @param bandwidth - The bandwidth value, e.g., `"60M"` or `60`.
 * @returns Bandwidth in MHz.
 */
const parseBandwidth = (bandwidth: string | number): number => {
  if (typeof bandwidth === "number") return bandwidth;
  if (typeof bandwidth === "string" && bandwidth.endsWith("M")) {
    return parseInt(bandwidth.slice(0, -1), 10) || 0;
  }
  return 0;
};

/**
 * Formats a band identifier into a human-readable string with bandwidth details.
 * Example: formatBandDetails("LTE_BC7", 20, 10) -> "B7 (20MHz/10MHz)"
 * Example: formatBandDetails("N78", 60, 60)      -> "N78 (60MHz/60MHz)"
 *
 * @param bandString - The band string, e.g., `"LTE_BC7"`, `"B1"`, or `"N78"`.
 * @param dlBandwidth - Downlink bandwidth in MHz.
 * @param ulBandwidth - Uplink bandwidth in MHz.
 * @returns Formatted band details string.
 */
const formatBandDetails = (bandString: string, dlBandwidth: number, ulBandwidth: number): string => {
  let output = "";

  if (bandString && bandString.length > 0) {
    // Handle 5G NR bands (N1, N78, etc.)
    if (bandString.startsWith("N") || bandString.startsWith("n")) {
      output += bandString.toUpperCase();
    } else {
      const bandNumber = bandString.includes("LTE_BC")
        ? bandString.slice(6)
        : bandString.startsWith("B")
          ? bandString.slice(1)
          : bandString;

      output += `B${bandNumber}`;
    }
  }

  if (dlBandwidth > 0 || ulBandwidth > 0) {
    output += ` (${dlBandwidth}MHz/${ulBandwidth}MHz)`;
  }

  return output.trim();
};

/**
 * Creates a text-based bar graph.
 *
 * @param value - The current value (may be `undefined` for missing signal data).
 * @param min - The minimum value of the range.
 * @param max - The maximum value of the range.
 * @param width - The width of the bar in characters.
 * @returns String representation of the bar.
 */
const createBar = (value: number | undefined, min: number, max: number, width = 20): string => {
  if (value === undefined || value === null || Number.isNaN(value)) return "[N/A]".padEnd(width + 2); // +2 for brackets.

  const clampedValue = Math.max(min, Math.min(max, value));
  const percentage = (clampedValue - min) / (max - min);
  const filledCount = Math.round(percentage * width);
  const emptyCount = width - filledCount;

  const filledBar = "█".repeat(filledCount);
  const emptyBar = " ".repeat(emptyCount);

  let coloredBar: string;
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
 * Generates formatted network statistics from a cellwan status API response.
 *
 * @param statsJson - The parsed cellwan status API response.
 * @param format - Output format: `"pretty"` for a coloured CLI string, `"json"` for a structured object.
 * @returns A formatted string when `format` is `"pretty"`, or a {@link StatsJsonOutput} object when `"json"`.
 * @throws {Error} If no valid stats data is available.
 */
function generateStats(statsJson: CellwanStatusResponse, format: "pretty"): string;
function generateStats(statsJson: CellwanStatusResponse, format: "json"): StatsJsonOutput;
function generateStats(statsJson: CellwanStatusResponse, format?: "pretty" | "json"): string | StatsJsonOutput;
function generateStats(
  statsJson: CellwanStatusResponse,
  format: "pretty" | "json" = "pretty"
): string | StatsJsonOutput {
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

  const cellId: number | "N/A" = data.INTF_Cell_ID !== undefined ? data.INTF_Cell_ID : "N/A";
  let enbId: number | string = "N/A";
  if (cellId !== "N/A") {
    enbId = Math.trunc(cellId / 256);
  }

  // Adjust PLMN for "22250" if enbId is available and has 6 digits (as per custom-hack.js logic).
  if (plmn === "22250" && enbId !== "N/A" && String(enbId).length === 6) {
    plmn = "22288";
  }

  const pci: number | string = data.INTF_PhyCell_ID !== undefined ? data.INTF_PhyCell_ID : "N/A";
  const earfcn: number | string = data.INTF_RFCN !== undefined ? data.INTF_RFCN : "N/A";

  const pccUlBw = data.INTF_Uplink_Bandwidth !== undefined ? 5 * (Number(data.INTF_Uplink_Bandwidth) - 1) : 0;
  const pccDlBw = data.INTF_Downlink_Bandwidth !== undefined ? 5 * (Number(data.INTF_Downlink_Bandwidth) - 1) : 0;
  const currentBand = data.INTF_Current_Band ? formatBandDetails(data.INTF_Current_Band, pccDlBw, pccUlBw) : "N/A";

  let caInfo = "None";
  if (Array.isArray(data.SCC_Info) && data.SCC_Info.length > 0) {
    caInfo = data.SCC_Info.filter((scc) => scc.Enable && scc.Band)
      .map((scc) => formatBandDetails(scc.Band, 0, 0))
      .join(" + ");

    if (!caInfo) caInfo = "None";
  }

  const rsrp = data.INTF_RSRP;
  const rsrq = data.INTF_RSRQ;
  const sinr = data.INTF_SINR;
  const rssi = data.INTF_RSSI;

  // 5G NSA data extraction.
  const nsaEnabled = data.NSA_Enable === true;
  const nsaPci: number | string = nsaEnabled && data.NSA_PhyCellID !== undefined ? data.NSA_PhyCellID : "N/A";
  const nsaRfcn: number | string = nsaEnabled && data.NSA_RFCN !== undefined ? data.NSA_RFCN : "N/A";
  const nsaUlBw = nsaEnabled ? parseBandwidth(data.NSA_UplinkBandwidth) : 0;
  const nsaDlBw = nsaEnabled ? parseBandwidth(data.NSA_DownlinkBandwidth) : 0;
  const nsaBand = nsaEnabled && data.NSA_Band ? formatBandDetails(data.NSA_Band, nsaDlBw, nsaUlBw) : "N/A";
  const nsaRsrp: number | undefined = nsaEnabled ? data.NSA_RSRP : undefined;
  const nsaRsrq: number | undefined = nsaEnabled ? data.NSA_RSRQ : undefined;
  const nsaSinr: number | undefined = nsaEnabled ? data.NSA_SINR : undefined;
  const nsaRssi: number | undefined = nsaEnabled ? data.NSA_RSSI : undefined;

  let lteItalyLink = "N/A";
  if (plmn !== "N/A" && enbId !== "N/A") {
    lteItalyLink = `https://lteitaly.it/internal/map.php#bts=${plmn}.${enbId}`;
  }

  if (format === "pretty") {
    const now = new Date();
    const formattedTimestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

    // TODO: Review the output format and content.
    return `

  ===========================================
  LTE Network Stats
  -------------------------------------------
  Technology: ${technology}
  PLMN:       ${plmn}
  ENB ID:     ${enbId}
  Cell ID:    ${cellId}
  PCI:        ${pci}
  EARFCN:     ${earfcn}
  LTEItaly:   ${lteItalyLink}
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
  5G NSA Status: ${nsaEnabled ? "Enabled" : "Disabled"}
  ${
    nsaEnabled
      ? `NR Band:      ${nsaBand}
  NR PCI:       ${nsaPci}
  NR ARFCN:     ${nsaRfcn}
  -------------------------------------------
  Signal Quality (5G NR)
  RSRP: ${nsaRsrp !== undefined ? `${String(nsaRsrp).padStart(4, " ")} dBm` : "N/A".padEnd(7)} ${createBar(nsaRsrp, -130, -60, 25)}
  RSRQ: ${nsaRsrq !== undefined ? `${String(nsaRsrq).padStart(4, " ")} dB ` : "N/A".padEnd(7)} ${createBar(nsaRsrq, -20, -3, 25)}
  SINR: ${nsaSinr !== undefined ? `${String(nsaSinr).padStart(4, " ")} dB ` : "N/A".padEnd(7)} ${createBar(nsaSinr, -5, 30, 25)}
  RSSI: ${nsaRssi !== undefined ? `${String(nsaRssi).padStart(4, " ")} dBm` : "N/A".padEnd(7)} ${createBar(nsaRssi, -110, -50, 25)}
  `
      : ""
  }-------------------------------------------
  Report generated at: ${formattedTimestamp}
  ===========================================
  `;
  }

  return {
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
    nsa: {
      enabled: nsaEnabled,
      band: nsaBand,
      pci: nsaPci,
      arfcn: nsaRfcn,
      rsrp: nsaRsrp,
      rsrq: nsaRsrq,
      sinr: nsaSinr,
      rssi: nsaRssi,
    },
    timestamp: new Date().toISOString(),
  };
}

export default generateStats;
