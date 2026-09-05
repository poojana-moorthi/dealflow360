// Utility for document / report export representations
function generatePdfSummary({ title, data, headers }) {
  return {
    title,
    generatedAt: new Date().toISOString(),
    headers,
    rows: data,
    format: 'PDF-EXPORT-READY'
  };
}

module.exports = { generatePdfSummary };
