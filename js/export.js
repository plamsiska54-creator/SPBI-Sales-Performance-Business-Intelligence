// ============================================================
// EXPORT.JS — Download menu handlers (Excel, PDF, Image)
// ============================================================
function exportPickExcel() {
  if (typeof exportCurrentTabExcel === 'function') {
    exportCurrentTabExcel();
  } else {
    alert('ฟังก์ชัน Export Excel ยังไม่พร้อมใช้งาน');
  }
}

function exportPickPDF() {
  if (typeof exportCurrentTabPDF === 'function') {
    exportCurrentTabPDF();
  } else {
    alert('ฟังก์ชัน Export PDF ยังไม่พร้อมใช้งาน');
  }
}

function exportPickImage() {
  if (typeof exportCurrentTabImage === 'function') {
    exportCurrentTabImage();
  } else {
    alert('ฟังก์ชัน Export Image ยังไม่พร้อมใช้งาน');
  }
}
