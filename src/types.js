/**
 * @file Shared JSDoc type definitions for zy-stats.
 *
 * This module contains no runtime code. It only holds `@typedef` declarations
 * that are referenced from other source files via
 * `@type {import("../types.js").TypeName}` (or `"./types.js"` from `src/`).
 */

// ---------------------------------------------------------------------------
// Cellwan Status API – response types
// ---------------------------------------------------------------------------

/**
 * Secondary Component Carrier (SCC) entry returned by the Zyxel
 * `cellwan_status` API.
 *
 * @typedef {Object} SCCInfo
 * @property {boolean}  Enable            - Whether this carrier is active.
 * @property {number}   PhysicalCellID    - Physical Cell ID.
 * @property {number}   RFCN              - Radio Frequency Channel Number.
 * @property {string}   Band              - Band identifier (e.g. `"B3"`, `"B20"`).
 * @property {number}   RSSI              - Received Signal Strength Indicator (dBm).
 * @property {number}   RSRP              - Reference Signal Received Power (dBm).
 * @property {number}   RSRQ              - Reference Signal Received Quality (dB).
 * @property {number}   SINR              - Signal-to-Interference-plus-Noise Ratio (dB).
 * @property {string}   UplinkBandwidth   - Uplink bandwidth (e.g. `"20M"` or `""`).
 * @property {string}   DownlinkBandwidth - Downlink bandwidth (e.g. `"20M"` or `""`).
 * @property {string}   CC_Type           - Component carrier type (e.g. `"SCC"`).
 * @property {number}   RSCP              - Received Signal Code Power.
 * @property {number}   EcNo              - Energy per chip to noise ratio.
 * @property {number}   CQI               - Channel Quality Indicator.
 * @property {number}   MCS               - Modulation and Coding Scheme.
 * @property {number}   RI                - Rank Indicator.
 * @property {number}   PMI               - Precoding Matrix Indicator.
 */

/**
 * Main data object inside the Zyxel `cellwan_status` API response.
 *
 * @typedef {Object} CellwanStatusData
 *
 * @property {boolean}        CELL_Roaming_Enable
 * @property {string}         CELL_Roaming_Status
 * @property {string}         Antenna_Status
 *
 * @property {string}         INTF_Status                   - Interface status (e.g. `"Up"`).
 * @property {string}         INTF_IMEI
 * @property {string}         INTF_Current_Access_Technology - Access technology (e.g. `"NR5G-NSA"`, `"LTE"`).
 * @property {string}         INTF_Network_In_Use            - Network descriptor (e.g. `"Current_WINDTRE_NR5G-NSA_22288"`).
 * @property {number}         INTF_RSSI                      - RSSI (dBm).
 * @property {string}         INTF_Supported_Bands
 * @property {string}         INTF_Current_Band              - Current band (e.g. `"B7"`, `"LTE_BC7"`).
 * @property {number}         INTF_Cell_ID                   - Cell ID.
 * @property {number}         INTF_PhyCell_ID                - Physical Cell ID.
 * @property {string|number}  INTF_Uplink_Bandwidth          - Uplink bandwidth (string like `"20M"` or numeric index).
 * @property {string|number}  INTF_Downlink_Bandwidth        - Downlink bandwidth (string like `"20M"` or numeric index).
 * @property {string}         INTF_RFCN                      - Radio Frequency Channel Number.
 * @property {number}         INTF_RSRP                      - RSRP (dBm).
 * @property {number}         INTF_RSRQ                      - RSRQ (dB).
 * @property {number}         INTF_RSCP
 * @property {number}         INTF_EcNo
 * @property {number}         INTF_TAC                       - Tracking Area Code.
 * @property {number}         INTF_LAC
 * @property {number}         INTF_RAC
 * @property {number}         INTF_BSIC
 * @property {number}         INTF_SINR                      - SINR (dB).
 * @property {number}         INTF_CQI
 * @property {number}         INTF_MCS
 * @property {number}         INTF_RI
 * @property {number}         INTF_PMI
 * @property {string}         INTF_Module_Software_Version
 *
 * @property {string}         USIM_Status
 * @property {string}         USIM_IMSI
 * @property {string}         USIM_ICCID
 * @property {boolean}        USIM_PIN_Protection
 * @property {number}         USIM_PIN_Remaining_Attempts
 *
 * @property {boolean}        Passthru_Enable
 * @property {string}         Passthru_Mode
 * @property {string}         Passthru_MacAddr
 *
 * @property {boolean}        NSA_Enable              - Whether 5G NSA is active.
 * @property {string}         NSA_MCC                 - Mobile Country Code.
 * @property {string}         NSA_MNC                 - Mobile Network Code.
 * @property {number}         NSA_PhyCellID           - 5G Physical Cell ID.
 * @property {number}         NSA_RFCN                - 5G RFCN.
 * @property {string}         NSA_Band                - 5G band (e.g. `"N78"`).
 * @property {number}         NSA_RSSI                - 5G RSSI (dBm).
 * @property {string}         NSA_UplinkBandwidth     - 5G uplink bandwidth (e.g. `"60M"`).
 * @property {string}         NSA_DownlinkBandwidth   - 5G downlink bandwidth (e.g. `"60M"`).
 * @property {number}         NSA_RSRP                - 5G RSRP (dBm).
 * @property {number}         NSA_RSRQ                - 5G RSRQ (dB).
 * @property {number}         NSA_SINR                - 5G SINR (dB).
 * @property {SCCInfo[]}      SCC_Info                - Carrier aggregation SCC entries.
 */

/**
 * Full response from the Zyxel `cellwan_status` API endpoint
 * (`/cgi-bin/DAL?oid=cellwan_status`).
 *
 * @typedef {Object} CellwanStatusResponse
 * @property {string}               result           - Result code (e.g. `"ZCFG_SUCCESS"`).
 * @property {string}               ReplyMsg
 * @property {string}               ReplyMsgMultiLang
 * @property {CellwanStatusData[]}  Object           - Array of status data objects (typically one element).
 */

// ---------------------------------------------------------------------------
// Stats output types
// ---------------------------------------------------------------------------

/**
 * 5G NSA stats sub-object included in the JSON output of `generateStats`.
 *
 * @typedef {Object} StatsNsa
 * @property {boolean}       enabled
 * @property {string}        band
 * @property {number|string} pci
 * @property {number|string} arfcn
 * @property {number}        [rsrp]
 * @property {number}        [rsrq]
 * @property {number}        [sinr]
 * @property {number}        [rssi]
 */

/**
 * Structured JSON output returned by `generateStats` when the format is
 * `"json"`.
 *
 * @typedef {Object} StatsJsonOutput
 * @property {string}        technology
 * @property {string}        plmn
 * @property {number|string} enbId
 * @property {number|string} cellId
 * @property {number|string} pci
 * @property {number|string} earfcn
 * @property {string}        lteItalyLink
 * @property {string}        currentBand
 * @property {string}        caInfo
 * @property {number}        [rsrp]
 * @property {number}        [rsrq]
 * @property {number}        [sinr]
 * @property {number}        [rssi]
 * @property {StatsNsa}      nsa
 * @property {string}        timestamp
 */

// ---------------------------------------------------------------------------
// CLI / App types
// ---------------------------------------------------------------------------

/**
 * Options object passed to the main application function from Commander.
 *
 * @typedef {Object} AppOptions
 * @property {boolean} headless  - Whether to run the browser in headless mode.
 * @property {string}  serverUrl - Zyxel router base URL.
 * @property {string}  username  - Login username.
 * @property {string}  password  - Login password.
 * @property {number}  interval  - Polling interval in seconds.
 * @property {boolean} log       - Whether to log stats to a file.
 */

export {};
