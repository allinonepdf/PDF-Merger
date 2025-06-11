// Tab navigation
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

// Utility: Read file as ArrayBuffer
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

// Merge PDFs
document.getElementById('merge-btn').addEventListener('click', async () => {
    const input = document.getElementById('merge-files');
    if (!input.files.length) return alert('Please select PDF files to merge.');
    const pdfLib = window.PDFLib;
    const mergedPdf = await pdfLib.PDFDocument.create();

    for (const file of input.files) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await pdfLib.PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged.pdf';
    a.click();
    URL.revokeObjectURL(url);
});

// Split PDF
document.getElementById('split-btn').addEventListener('click', async () => {
    const input = document.getElementById('split-file');
    const pagesInput = document.getElementById('split-pages').value.trim();
    if (!input.files.length) return alert('Please select a PDF file to split.');
    if (!pagesInput) return alert('Please enter pages to extract.');
    const pdfLib = window.PDFLib;

    const arrayBuffer = await readFileAsArrayBuffer(input.files[0]);
    const pdf = await pdfLib.PDFDocument.load(arrayBuffer);
    const allPages = pdf.getPageIndices();

    // Parse pages input like "1-3,5"
    let pagesToExtract = [];
    const parts = pagesInput.split(',');
    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(x => parseInt(x) - 1);
            for (let i = start; i <= end; i++) pagesToExtract.push(i);
        } else {
            pagesToExtract.push(parseInt(part) - 1);
        }
    }
    pagesToExtract = pagesToExtract.filter(p => p >= 0 && p < allPages.length);

    const newPdf = await pdfLib.PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdf, pagesToExtract);
    copiedPages.forEach(page => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'split.pdf';
    a.click();
    URL.revokeObjectURL(url);
});

// Compress PDF (basic: remove metadata)
document.getElementById('compress-btn').addEventListener('click', async () => {
    const input = document.getElementById('compress-file');
    if (!input.files.length) return alert('Please select a PDF file to compress.');
    const pdfLib = window.PDFLib;
    const arrayBuffer = await readFileAsArrayBuffer(input.files[0]);
    const pdf = await pdfLib.PDFDocument.load(arrayBuffer);

    // Simple compression: Remove metadata
    pdf.setTitle('');
    pdf.setAuthor('');
    pdf.setSubject('');
    pdf.setKeywords([]);
    pdf.setProducer('');
    pdf.setCreator('');

    const compressedBytes = await pdf.save();
    const blob = new Blob([compressedBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compressed.pdf';
    a.click();
    URL.revokeObjectURL(url);
});

// Protect PDF with password (basic)
// Note: pdf-lib does NOT support encryption, so we do a fake placeholder alert
// Real password protection requires server-side or special libs.
// We'll notify user about this limitation.
document.getElementById('protect-btn').addEventListener('click', () => {
    alert('Password protection requires backend processing or advanced libraries. This feature is a placeholder.');
});

// Convert images to PDF
document.getElementById('convert-btn').addEventListener('click', async () => {
    const input = document.getElementById('convert-files');
    if (!input.files.length) return alert('Please select image files to convert.');
    const pdfLib = window.PDFLib;
    const pdfDoc = await pdfLib.PDFDocument.create();

    for (const file of input.files) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        let image;
        if (file.type === 'image/png') {
            image = await pdfDoc.embedPng(arrayBuffer);
        } else if (file.type === 'image/jpeg') {
            image = await pdfDoc.embedJpg(arrayBuffer);
        } else {
            alert('Unsupported image type: ' + file.type);
            return;
        }
        const page = pdfDoc.addPage();
        const { width, height } = image.scale(1);
        // Fit page size to image size (max 600x800)
        const maxWidth = 600;
        const maxHeight = 800;
        let scale = Math.min(maxWidth / width, maxHeight / height, 1);
        page.setSize(width * scale, height * scale);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: width * scale,
            height: height * scale,
        });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.pdf';
    a.click();
    URL.revokeObjectURL(url);
});