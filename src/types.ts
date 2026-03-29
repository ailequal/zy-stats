/**
 * @file Shared TypeScript type definitions for zy-stats.
 *
 * This module contains no runtime code. All exports are pure type declarations
 * that are erased by Node.js native type stripping at runtime.
 */

// ---------------------------------------------------------------------------
// Cellwan Status API – response types
// ---------------------------------------------------------------------------

/**
 * Secondary Component Carrier (SCC) entry returned by the Zyxel
 * `cellwan_status` API.
 */
export interface SCCInfo {
  /** Whether this carrier is active. */
  Enable: boolean;
  /** Physical Cell ID. */
  PhysicalCellID: number;
  /** Radio Frequency Channel Number. */
  RFCN: number;
  /** Band identifier (e.g. `"B3"`, `"B20"`). */
  Band: string;
  /** Received Signal Strength Indicator (dBm). */
  RSSI: number;
  /** Reference Signal Received Power (dBm). */
  RSRP: number;
  /** Reference Signal Received Quality (dB). */
  RSRQ: number;
  /** Signal-to-Interference-plus-Noise Ratio (dB). */
  SINR: number;
  /** Uplink bandwidth (e.g. `"20M"` or `""`). */
  UplinkBandwidth: string;
  /** Downlink bandwidth (e.g. `"20M"` or `""`). */
  DownlinkBandwidth: string;
  /** Component carrier type (e.g. `"SCC"`). */
  CC_Type: string;
  /** Received Signal Code Power. */
  RSCP: number;
  /** Energy per chip to noise ratio. */
  EcNo: number;
  /** Channel Quality Indicator. */
  CQI: number;
  /** Modulation and Coding Scheme. */
  MCS: number;
  /** Rank Indicator. */
  RI: number;
  /** Precoding Matrix Indicator. */
  PMI: number;
}

/**
 * Main data object inside the Zyxel `cellwan_status` API response.
 */
export interface CellwanStatusData {
  CELL_Roaming_Enable: boolean;
  CELL_Roaming_Status: string;
  Antenna_Status: string;

  /** Interface status (e.g. `"Up"`). */
  INTF_Status: string;
  INTF_IMEI: string;
  /** Access technology (e.g. `"NR5G-NSA"`, `"LTE"`). */
  INTF_Current_Access_Technology: string;
  /** Network descriptor (e.g. `"Current_WINDTRE_NR5G-NSA_22288"`). */
  INTF_Network_In_Use: string;
  /** RSSI (dBm). */
  INTF_RSSI: number;
  INTF_Supported_Bands: string;
  /** Current band (e.g. `"B7"`, `"LTE_BC7"`). */
  INTF_Current_Band: string;
  /** Cell ID. */
  INTF_Cell_ID: number;
  /** Physical Cell ID. */
  INTF_PhyCell_ID: number;
  /** Uplink bandwidth (string like `"20M"` or numeric index). */
  INTF_Uplink_Bandwidth: string | number;
  /** Downlink bandwidth (string like `"20M"` or numeric index). */
  INTF_Downlink_Bandwidth: string | number;
  /** Radio Frequency Channel Number. */
  INTF_RFCN: string;
  /** RSRP (dBm). */
  INTF_RSRP: number;
  /** RSRQ (dB). */
  INTF_RSRQ: number;
  INTF_RSCP: number;
  INTF_EcNo: number;
  /** Tracking Area Code. */
  INTF_TAC: number;
  INTF_LAC: number;
  INTF_RAC: number;
  INTF_BSIC: number;
  /** SINR (dB). */
  INTF_SINR: number;
  INTF_CQI: number;
  INTF_MCS: number;
  INTF_RI: number;
  INTF_PMI: number;
  INTF_Module_Software_Version: string;

  USIM_Status: string;
  USIM_IMSI: string;
  USIM_ICCID: string;
  USIM_PIN_Protection: boolean;
  USIM_PIN_Remaining_Attempts: number;

  Passthru_Enable: boolean;
  Passthru_Mode: string;
  Passthru_MacAddr: string;

  /** Whether 5G NSA is active. */
  NSA_Enable: boolean;
  /** Mobile Country Code. */
  NSA_MCC: string;
  /** Mobile Network Code. */
  NSA_MNC: string;
  /** 5G Physical Cell ID. */
  NSA_PhyCellID: number;
  /** 5G RFCN. */
  NSA_RFCN: number;
  /** 5G band (e.g. `"N78"`). */
  NSA_Band: string;
  /** 5G RSSI (dBm). */
  NSA_RSSI: number;
  /** 5G uplink bandwidth (e.g. `"60M"`). */
  NSA_UplinkBandwidth: string;
  /** 5G downlink bandwidth (e.g. `"60M"`). */
  NSA_DownlinkBandwidth: string;
  /** 5G RSRP (dBm). */
  NSA_RSRP: number;
  /** 5G RSRQ (dB). */
  NSA_RSRQ: number;
  /** 5G SINR (dB). */
  NSA_SINR: number;
  /** Carrier aggregation SCC entries. */
  SCC_Info: SCCInfo[];
}

/**
 * Full response from the Zyxel `cellwan_status` API endpoint
 * (`/cgi-bin/DAL?oid=cellwan_status`).
 */
export interface CellwanStatusResponse {
  /** Result code (e.g. `"ZCFG_SUCCESS"`). */
  result: string;
  ReplyMsg: string;
  ReplyMsgMultiLang: string;
  /** Array of status data objects (typically one element). */
  Object: CellwanStatusData[];
}

// ---------------------------------------------------------------------------
// Stats output types
// ---------------------------------------------------------------------------

/**
 * 5G NSA stats sub-object included in the JSON output of `generateStats`.
 */
export interface StatsNsa {
  enabled: boolean;
  band: string;
  pci: number | string;
  arfcn: number | string;
  rsrp?: number;
  rsrq?: number;
  sinr?: number;
  rssi?: number;
}

/**
 * Structured JSON output returned by `generateStats` when the format is
 * `"json"`.
 */
export interface StatsJsonOutput {
  technology: string;
  plmn: string;
  enbId: number | string;
  cellId: number | string;
  pci: number | string;
  earfcn: number | string;
  lteItalyLink: string;
  currentBand: string;
  caInfo: string;
  rsrp?: number;
  rsrq?: number;
  sinr?: number;
  rssi?: number;
  nsa: StatsNsa;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// CLI / App types
// ---------------------------------------------------------------------------

/**
 * Options object passed to the main application function from Commander.
 */
export interface AppOptions {
  /** Whether to run the browser in headless mode. */
  headless: boolean;
  /** Zyxel router base URL. */
  serverUrl: string;
  /** Login username. */
  username: string;
  /** Login password. */
  password: string;
  /** Polling interval in seconds. */
  interval: number;
  /** Whether to log stats to a file. */
  log: boolean;
}
