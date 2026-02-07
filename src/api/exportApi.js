import api from "./axios";

const dlBlob = (url, filename) =>
  api.get(url, { responseType: "blob" }).then((res) => {
    const href = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(href);
  });

export const exportApi = {
  excelClients:      () => dlBlob("/export/excel/clients",       "clients.xlsx"),
  excelProduits:     () => dlBlob("/export/excel/produits",      "produits.xlsx"),
  excelFactures:     () => dlBlob("/export/excel/factures",      "factures.xlsx"),
  excelAlertes:      () => dlBlob("/export/excel/alertes-stock", "alertes-stock.xlsx"),
  excelBons:         () => dlBlob("/export/excel/bons-commande", "bons-commande.xlsx"),
  pdfStock:          () => dlBlob("/export/pdf/stock",           "rapport-stock.pdf"),
};