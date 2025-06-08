async function mergePDFs() {
  const file1 = document.getElementById('file1').files[0];
  const file2 = document.getElementById('file2').files[0];

  if (!file1 || !file2) {
    alert("Please select two PDF files.");
    return;
  }

  const pdfBytes1 = await file1.arrayBuffer();
  const pdfBytes2 = await file2.arrayBuffer();

  const mergedPdf = await PDFLib.PDFDocument.create();

  for (const pdfBytes of [pdfBytes1, pdfBytes2]) {
    const pdf = await PDFLib.PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach(p => mergedPdf.addPage(p));
  }

  const mergedPdfBytes = await mergedPdf.save();
  const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "merged.pdf";
  a.click();
}
