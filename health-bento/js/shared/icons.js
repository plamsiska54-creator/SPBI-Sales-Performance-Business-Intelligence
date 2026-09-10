/**
 * icons.js — ไอคอน SVG สำหรับเมนูด้านซ้าย
 * แต่ละไอคอนเป็นฟังก์ชันที่คืนค่า SVG string (24x24, เส้น 2px, ใช้ currentColor)
 */

const wrap = (paths) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

export const icons = {
  // ภาพรวมธุรกิจ
  layoutDashboard: () => wrap('<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>'),

  // ตลาดและลูกค้า
  trendingUp: () => wrap('<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>'),

  // เมนูและราคา
  salad: () => wrap('<path d="M7 21h10"/><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7"/><path d="M13 12a2 2 0 0 0-2-2"/>'),

  // การผลิตและจัดส่ง
  chefHat: () => wrap('<path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" x2="18" y1="17" y2="17"/>'),

  // การตลาดและช่องทางขาย
  megaphone: () => wrap('<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>'),

  // การเงิน
  wallet: () => wrap('<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>'),

  // แผนดำเนินงาน
  calendarCheck: () => wrap('<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>'),

  // แหล่งที่มาข้อมูล
  bookOpen: () => wrap('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'),

  // ห้าง / Modern Trade
  store: () => wrap('<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63l-.41-.37a2 2 0 0 0-2.66 0l-.41.37a2.7 2.7 0 0 1-1.59.63a2.7 2.7 0 0 1-1.59-.63l-.41-.37a2 2 0 0 0-2.66 0l-.41.37A2.7 2.7 0 0 1 6 12a2 2 0 0 1-2-2V7"/>'),

  // ออเดอร์/การขาย
  shoppingBag: () => wrap('<path d="M6.331 8h11.338a2 2 0 0 1 1.977 2.304l-1.255 8.152a3 3 0 0 1-2.966 2.544H8.575a3 3 0 0 1-2.966-2.544L4.354 10.304A2 2 0 0 1 6.331 8z"/><path d="M9 11V6a3 3 0 0 1 6 0v5"/>'),

  // UI
  chevronLeft: () => wrap('<path d="m15 18-6-6 6-6"/>'),
  menu: () => wrap('<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>')
};
