// Removed the 5G stats, since they are not available on the `Zyxel LTE5398-M904`.

javascript: ftb();

function dxc(r, n, i) {
  var a = CryptoJS.enc.Base64.parse(i),
    t = CryptoJS.enc.Base64.parse(n);
  return CryptoJS.AES.decrypt(r, t, {
    iv: a,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString(CryptoJS.enc.Utf8);
}

function adj(r, n, i) {
  return (
    (t = ""),
    r.length > 0 &&
      (t = '<span style="color:#a00;">B' + r.slice(6) + "</span>"),
    n > 0 && (t += "(" + n + "MHz/" + i + "MHz)"),
    t
  );
}

function getStatus() {
  (boxcar = gw / (gt + 1)),
    $.ajax({
      type: "GET",
      url: "/cgi-bin/DAL?oid=cellwan_status",
      dataType: "json",
      success: function (r) {
        try {
          var n = dxc(r.content, localStorage.AesKey, r.iv);
          (v = JSON.parse(n)), (b = !0), (signal = v.Object[0]);
        } catch (n) {
          signal = r.Object[0];
        }
        for (
          vars = [
            "NSA_PCI",
            "NSA_RFCN",
            "NSA_Band",
            "NSA_RSSI",
            "NSA_RSRP",
            "NSA_RSRQ",
            "NSA_SINR",
            "INTF_PhyCell_ID",
            "INTF_RFCN",
            "INTF_Cell_ID",
            "INTF_RSRP",
            "INTF_RSRQ",
            "INTF_Current_Band",
            "INTF_SINR",
            "INTF_RSSI",
            "INTF_Network_In_Use",
            "INTF_Current_Access_Technology",
            "SCC_Info",
            "INTF_Uplink_Bandwidth",
            "INTF_Downlink_Bandwidth",
          ],
            i = 0;
          i < vars.length;
          i++
        )
          window[vars[i]] = signal[vars[i]];
        barGraph("rsrp", INTF_RSRP, -130, -60),
          barGraph("rsrq", INTF_RSRQ, -16, -3),
          barGraph("sinr", INTF_SINR, 0, 24),
          (cell_id = INTF_Cell_ID),
          (rsrp = INTF_RSRP),
          (rsrq = INTF_RSRQ),
          (sinr = INTF_SINR),
          (rssi = INTF_RSSI),
          (nr5rsrp = NSA_RSRP),
          (nr5rsrq = NSA_RSRQ),
          (nr5sinr = NSA_SINR),
          (nr5rssi = NSA_RSSI),
          $(".nr").toggle("" != NSA_Band),
          (enbid = Math.trunc(cell_id / 256)),
          (pcc_ul_bw = 5 * (INTF_Uplink_Bandwidth - 1)),
          (pcc_dl_bw = 5 * (INTF_Downlink_Bandwidth - 1)),
          (Current_Band = adj(INTF_Current_Band, pcc_dl_bw, pcc_ul_bw)),
          (plmn = INTF_Network_In_Use.split("_")[3]),
          "22201" == plmn && (plmn = "2221"),
          "22299" == plmn && (plmn = "22288"),
          "22250" == plmn && 6 == enbid.length && (plmn = "22288"),
          (link_lte =
            "https://lteitaly.it/internal/map.php#bts=" + plmn + "." + enbid),
          $("#lteitaly").attr("href", link_lte),
          "LTE-A" == INTF_Current_Access_Technology
            ? $("#ca").parent().parent().css("border-color", "red")
            : $("#ca").parent().parent().css("border-color", "#bbb"),
          (ca_txt = "");
        for (var i = 0; i < SCC_Info.length; i++)
          ca_txt += adj(SCC_Info[i].Band) + "+";
        for (
          NSA_Band &&
            (ca_txt +=
              '<span style="padding:5px;border-radius:3px;font-size:1.2em;background-color:#eef;color:red;font-weight:bold;">' +
              NSA_Band +
              "</span>"),
            ca_txt = ca_txt.slice(0, -1),
            dervars = [
              "cell_id",
              "sinr",
              "rssi",
              "rsrp",
              "rsrq",
              "nr5sinr",
              "nr5rssi",
              "nr5rsrp",
              "nr5rsrq",
              "ca_txt",
              "enbid",
              "INTF_Current_Access_Technology",
              "Current_Band",
            ],
            i = 0;
          i < dervars.length;
          i++
        )
          $("#" + dervars[i]).html(window[dervars[i]]);
      },
    });
}

function i() {
  if (
    ((ca_txt =
      INTF_Current_Band + " - PCI,EARFCN:" + INTF_PhyCell_ID + "," + INTF_RFCN),
    "" != SCC_Info)
  ) {
    for (var r = 0; r < SCC_Info.length; r++)
      ca_txt +=
        "\n" +
        SCC_Info[r].Band +
        " - PCI,EARFCN:" +
        SCC_Info[r].PhysicalCellID +
        "," +
        SCC_Info[r].RFCN;
    NSA_Band && (ca_txt += "\n\nNSA RFCN: " + NSA_RFCN);
  }
  alert(ca_txt);
}

function barGraph(r, n, i, a) {
  for (
    n > a && (n = a),
      n < i && (n = i),
      ap = "a" + r,
      window[ap].unshift(n),
      window[ap].length > boxcar && window[ap].pop(),
      html =
        '<svg version="1.1" viewBox="0 0 ' +
        gw +
        " " +
        gh +
        '" width="' +
        gw +
        '" height="' +
        gh +
        '" preserveAspectRatio="xMaxYMax slice" style="border:1px solid #ccc;padding:1px;margin-top:-6px;width: ' +
        gw +
        'px;">',
      x = 0;
    x < window[ap].length;
    x++
  )
    (pax = (gt + 1) * (x + 1)),
      (pay = gh - 1),
      (pby = gh - ((window[ap][x] - i) / (a - i)) * gh),
      (pc = ((window[ap][x] - i) / (a - i)) * 100),
      pc < 50
        ? (color = "yellow")
        : pc < 85
        ? (color = "green")
        : (color = "orange"),
      (html +=
        '<line x1="' +
        pax +
        '" y1="' +
        pay +
        '" x2="' +
        pax +
        '" y2="' +
        pby +
        '" stroke="' +
        color +
        '" stroke-width="' +
        gt +
        '"></line>');
  (html += "</svg>"), $("#b" + r).html(html);
}

function ftb() {
  $("body").prepend(
    '<style>.clear{clear:both}li span{margin-left:5px}.action{background-color:#448;padding:10px;border-radius:10px;color:#fff;font-weight:bolder;margin-right:5px;margin-left:5px}.action:hover{color:#fff}#cell_id,#enbid,#nr5rsrp,#nr5rsrq,#nr5rssi,#nr5sinr,#rsrp,#rsrq,#rssi,#sinr{color:#b00;font-weight:strong}.f{float:left;border:1px solid #bbb;border-radius:5px;padding:10px;line-height:2em;margin:5px}.f ul{margin:0;padding:0}.f ul li{display:inline;margin-right:5px;margin-left:5px}#enbid{font-weight:700;text-decoration:underline}.p{border-bottom:1px solid #ccc;width:auto;height:20px}.v{height:100%25;border-right:1px solid #ccc;padding-left:20px}</style><div style="display:block;overflow:auto"><div class="f">RSRP:<span id="rsrp"></span>dBm<div id="brsrp"></div>RSRQ:<span id="rsrq"></span>dB<div id="brsrq"></div>SINR:<span id="sinr"></span>dB<div id="bsinr"></div></div></div><div class="f"><ul><li id="INTF_Current_Access_Technology">Hello world!! &#9829;</li></ul></div><div class="f"><ul><li>ENB ID:<a id="lteitaly" target="lteitaly" href="#"><span id="enbid">#</span></a></li><li>CELL ID:<span id="cell_id">#</span></li></ul></div><div class="f"><ul><li>MAIN:<span id="Current_Band"></span></li><li id="ca">CA:<span id="ca_txt"></span></li></ul></div><div class="f"><ul><li><a class="action" href="#" onclick="i()">INFO</a></li></ul></div></div>'
  );
}
(gw = 500),
  (gh = 30),
  (gt = 3),
  (signal = ""),
  (version = "zyxel Family-v2.0"),
  ([arsrp, arsrq, asinr, anr5rsrp, anr5rsrq, anr5sinr] = [
    [],
    [],
    [],
    [],
    [],
    [],
  ]),
  console.log("Code by ailequal - " + version),
  console.log("type: signal"),
  window.setInterval(getStatus, 2e3);
