document.getElementById('merge-btn').addEventListener('click', () => {
  const files = document.getElementById('file-input').files;
  if (!files.length) {
    alert('Please select PDF files.');
    return;
  }

  const isMobile = window.innerWidth <= 600;
  console.log(isMobile ? 'Mobile view' : 'Desktop view');

  // Placeholder merge process
  document.getElementById('output').textContent = 
    `Merging ${files.length} files on ${isMobile ? 'mobile' : 'desktop'}...`;
});
