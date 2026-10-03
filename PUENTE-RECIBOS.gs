/**********************************************************************
 * NUMMEROS by CONTAX — PUENTE DE RECIBOS (Orden de Recepción)  ·  v2
 * --------------------------------------------------------------------
 * Genera la "Orden de Recepción" en PDF (igual al formato de CONTAX)
 * y la envía al correo del cliente desde la cuenta de Gmail de CONTAX.
 *
 * PUBLICARLO (con la cuenta de Gmail de CONTAX, ej. info@contaxbolivia.com):
 *   1. https://script.google.com  ->  Nuevo proyecto
 *   2. Pega TODO este archivo.  Nómbralo "PUENTE RECIBOS CONTAX".
 *   3. Implementar -> Nueva implementación -> Aplicación web
 *        Ejecutar como: Yo    ·    Acceso: Cualquier usuario
 *   4. Autoriza (Gmail + crear PDF). Copia la URL que termina en /exec.
 *   5. Panel -> Configuración -> "Recibos por correo": pega la URL.
 *
 *   Al cambiar el código, crea una NUEVA implementación (o nueva versión)
 *   para que tome los cambios.
 **********************************************************************/

var EMPRESA = {
  nombre:    "CONTAX",
  direccion: "Urbanización El Palmar Calle Zafiro Nro. S/N Zona Sur - 6to Anillo Av. Bolivia",
  contacto:  "690-21969",
  correo:    "info@contaxbolivia.com",
  navy:      "#16233f"
};
var DISCLAIMER = "\"CONTAX no asume responsabilidad alguna por declaraciones presentadas fuera de plazo o multas derivadas de la falta de entrega oportuna de documentación por parte del cliente. Tampoco nos responsabilizamos por facturas que no sean válidas para la actividad registrada, o por cualquier otro motivo que pueda afectar el proceso. Es responsabilidad del cliente garantizar la entrega correcta y a tiempo de toda la documentación necesaria.\"";

function doGet(e) {
  return ContentService.createTextOutput("PUENTE DE RECIBOS CONTAX activo. Usa POST para enviar una Orden de Recepción.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  var out = { ok: false };
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.action === "recibo") { enviarRecibo(d); out.ok = true; }
    else out.error = "accion_desconocida";
  } catch (err) { out.error = String(err); }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function enviarRecibo(d) {
  var para = (d.to || "").trim();
  if (!para) throw new Error("sin_correo");
  var empresaNombre = d.empresa || EMPRESA.nombre;
  var html = buildOrdenHTML(d, empresaNombre);
  var blob = Utilities.newBlob(html, "text/html", "orden.html")
                      .getAs("application/pdf")
                      .setName("Orden-Recepcion-" + (d.nroRecepcion || "CONTAX") + ".pdf");
  var asunto = "Orden de Recepción N° " + (d.nroRecepcion || "") + " — " + empresaNombre;
  var cuerpo =
      "Estimado/a " + (d.nombre || "cliente") + ",\n\n" +
      "Adjuntamos su Orden de Recepción.\n" +
      "Servicio: " + (d.tipoServicio || "") + (d.detalleServicio ? " — " + d.detalleServicio : "") + "\n" +
      "Mes: " + (d.mes || "") + "   ·   Importe: " + money(d.importe) + "   ·   Forma de pago: " + (d.formaPago || "") + "\n\n" +
      "Gracias por confiar en " + empresaNombre + ".\n\n— " + empresaNombre;
  GmailApp.sendEmail(para, asunto, cuerpo, { name: empresaNombre, attachments: [blob] });
}

function buildOrdenHTML(d, empresaNombre) {
  var navy = EMPRESA.navy;
  var cli = [
    ["Nombre del Cliente:", d.nombre],
    ["NIT:", d.nit],
    ["ID Cliente:", d.idCliente],
    ["Celular:", d.celular],
    ["Correo:", d.correo],
    ["Tipo de Contribuyente:", d.tipoContribuyente],
    ["Rubro:", d.rubro],
    ["Actividad:", d.actividad],
    ["Apertura de NIT:", d.aperturaNit],
    ["Matrícula de Comercio:", d.matricula]
  ];
  var rec = [
    ["Nro Recepción", d.nroRecepcion, true],
    ["Nro Recibo:", d.nroRecibo, true],
    ["Día:", d.dia, false],
    ["Fecha:", d.fecha, false],
    ["Hora:", d.hora, false]
  ];
  var cliRows = cli.map(function (x) {
    return '<tr><td class="k">' + esc(x[0]) + '</td><td class="v">' + esc(x[1] || "") + '</td></tr>';
  }).join("");
  var recRows = rec.map(function (x) {
    return '<tr><td class="k">' + esc(x[1 - 1]) + '</td><td class="v" style="' + (x[2] ? "font-weight:700" : "") + '">' + esc(x[1] || "") + '</td></tr>';
  }).join("");

  return '' +
  '<!doctype html><html><head><meta charset="utf-8"><style>' +
  '@page{size:A4 landscape;margin:0}' +
  '*{box-sizing:border-box;font-family:Helvetica,Arial,sans-serif;color:#1f2a3a}' +
  'body{margin:0;padding:0}' +
  '.band{background:' + navy + ';color:#fff;text-align:center;padding:26px 0 22px}' +
  '.band .t{font-size:40px;letter-spacing:.22em;font-weight:400}' +
  '.sub{text-align:center;font-size:22px;color:#2b3952;margin:18px 0 6px;font-weight:400}' +
  '.wrap{padding:0 46px}' +
  '.cols{display:table;width:100%;margin-top:10px;border-top:1px solid #dfe3ea;padding-top:14px}' +
  '.col{display:table-cell;width:50%;vertical-align:top;padding:0 14px}' +
  '.col.r{border-left:1px solid #e4e7ee}' +
  '.ch{text-align:center;font-size:16px;color:#2b3952;margin:0 0 10px}' +
  'table.kv{width:100%;border-collapse:collapse}' +
  'table.kv td{padding:3px 4px;font-size:12px;vertical-align:top}' +
  'table.kv td.k{color:#55617a;white-space:nowrap;width:1%;padding-right:12px}' +
  'table.kv td.v{color:#1f2a3a}' +
  '.sdoc{text-align:center;font-size:22px;color:#2b3952;margin:26px 0 8px;font-weight:400}' +
  'table.serv{width:100%;border-collapse:collapse;margin-top:6px}' +
  'table.serv th{border-top:1px solid #cfd4de;border-bottom:1px solid #cfd4de;padding:9px 6px;font-size:12px;color:#2b3952;text-align:left}' +
  'table.serv th.r,table.serv td.r{text-align:right}' +
  'table.serv td{padding:14px 6px;font-size:12px;border-bottom:1px solid #eef0f4}' +
  '.tot{margin-top:16px;text-align:right;font-size:13px;line-height:1.9}' +
  '.tot b{color:#1f2a3a}' +
  '.disc{margin:40px 46px 0;font-size:10.5px;color:#55617a;font-style:italic;text-align:center;line-height:1.6}' +
  '.foot{margin-top:40px;background:' + navy + ';color:#cdd4e2;font-size:10px;padding:9px 46px;display:flex;justify-content:space-between}' +
  '</style></head><body>' +
  '<div class="band"><div class="t">' + esc(empresaNombre) + '</div></div>' +
  '<div class="sub">Orden de Recepción</div>' +
  '<div class="wrap">' +
    '<div class="cols">' +
      '<div class="col"><div class="ch">Datos del Cliente</div><table class="kv">' + cliRows + '</table></div>' +
      '<div class="col r"><div class="ch">Datos de Recepción</div><table class="kv">' + recRows + '</table></div>' +
    '</div>' +
    '<div class="sdoc">Datos del Servicio</div>' +
    '<table class="serv"><tr><th>Mes</th><th>Tipo de Servicio</th><th>Nro Recepción</th><th class="r">Importe</th></tr>' +
      '<tr><td>' + esc(d.mes || "") + '</td><td>' + esc(d.tipoServicio || "") + (d.detalleServicio ? '<br><span style="color:#55617a">' + esc(d.detalleServicio) + '</span>' : '') + '</td><td>' + esc(d.nroRecepcion || "") + '</td><td class="r">' + esc(numero(d.importe)) + '</td></tr>' +
    '</table>' +
    '<div class="tot">' +
      'Total: <b>' + money(d.importe) + '</b><br>' +
      'Forma de Pago: <b>' + esc(d.formaPago || "") + '</b><br>' +
      'Atención: <b>' + esc(d.atencion || "") + '</b>' +
      (d.comentarios ? '<br><span style="color:#55617a;font-size:11px">' + esc(d.comentarios) + '</span>' : '') +
    '</div>' +
  '</div>' +
  '<div class="disc">' + esc(DISCLAIMER) + '</div>' +
  '<div class="foot"><span>Dir.: ' + esc(EMPRESA.direccion) + '</span><span>Contacto: ' + esc(EMPRESA.contacto) + '</span><span>Correo: ' + esc(EMPRESA.correo) + '</span></div>' +
  '</body></html>';
}

function numero(v) { var n = Number(v); return isNaN(n) ? (v || "0") : n.toLocaleString("es-BO", { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }
function money(v) { var n = Number(v); return "Bs" + (isNaN(n) ? (v || "0") : n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })); }
function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
