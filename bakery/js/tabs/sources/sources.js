export function mount(container) {
  container.innerHTML = `
    <div style="max-width:960px;margin:0 auto;padding:24px 16px;">
      <h2 style="margin:0 0 8px;font-size:1.5rem;">📚 แหล่งที่มาข้อมูล — Bakery Analytics</h2>
      <p style="color:var(--text-secondary,#666);margin:0 0 28px;font-size:.95rem;">
        สรุปว่าแต่ละส่วนของแดชบอร์ดค้นคว้าและรวบรวมข้อมูลมาจากไหน (อัปเดตล่าสุด: สิงหาคม 2569)
      </p>

      <!-- ไฟล์ข้อมูลหลัก -->
      <div class="src-card">
        <h3>📁 ไฟล์ข้อมูลหลัก</h3>
        <table class="src-table">
          <thead><tr><th>ไฟล์</th><th>เนื้อหา</th><th>ช่วงเวลา</th><th>ที่มา</th></tr></thead>
          <tbody>
            <tr><td><code>competitors.json</code></td><td>ข้อมูลคู่แข่ง ส่วนแบ่งตลาด ราคา คะแนนรีวิว กลยุทธ์การตลาด</td><td>W01–W26 / 2569</td><td>Web Research + AI Analysis</td></tr>
            <tr><td><code>trends.json</code></td><td>เทรนด์สินค้า หมวดหมู่ ยอด mentions ปริมาณการค้นหา ยอดขายโดยประมาณ</td><td>W01–W26 / 2569</td><td>Web Research + AI Analysis</td></tr>
            <tr><td><code>social.json</code></td><td>ข้อมูลโซเชียลมีเดีย (Facebook, IG, X, TikTok, Pantip) จำนวน mentions, sentiment</td><td>W01–W26 / 2569</td><td>Web Research + AI Analysis</td></tr>
          </tbody>
        </table>
        <p class="src-note">หมายเหตุ: "Web Research + AI Analysis" หมายถึงข้อมูลรวบรวมจากแหล่งสาธารณะบนอินเทอร์เน็ต แล้วนำมาประมวลผล/เสริมด้วย AI</p>
      </div>

      <!-- ภาพรวมผู้บริหาร -->
      <div class="src-card">
        <h3>📊 ภาพรวมผู้บริหาร</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> competitors.json + trends.json</li>
          <li><strong>ที่มา:</strong> รวบรวมส่วนแบ่งตลาดคู่แข่งและเทรนด์สินค้าเป็นสรุปภาพรวม KPI สำหรับผู้บริหาร</li>
          <li><strong>ส่วนที่เป็นประมาณการ:</strong> ค่า KPI บางตัวคำนวณจากค่าประมาณและค่าคงที่ภายใน</li>
        </ul>
      </div>

      <!-- เทรนด์ตลาด -->
      <div class="src-card">
        <h3>📈 เทรนด์ตลาด</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> trends.json + ข้อมูลวิจัยตลาดจริง</li>
          <li><strong>ภาพรวมตลาด:</strong> มูลค่าตลาดเบเกอรี่ ~47.3 พันล้านบาท (2567) — แหล่ง: The Business Plus, Thansettakij, 6W Research, Precision Business Insights</li>
          <li><strong>การเติบโตตามหมวด:</strong> อัตราเติบโต MoM/YoY รายหมวด — แหล่ง: Euromonitor, Thai Bakery Entrepreneurs Association, NielsenIQ Thailand</li>
          <li><strong>เทรนด์ตามฤดูกาล:</strong> ตัวคูณเทศกาล/ฤดูกาล — วิเคราะห์จากข้อมูลเทศกาลไทยจริง (วาเลนไทน์ 2.5x, คริสต์มาส 2.8x, สงกรานต์ 0.7x)</li>
          <li><strong>การเติบโตตามช่องทาง:</strong> ออนไลน์ CAGR 10.9% — แหล่ง: 6W Research, Kantar Thailand</li>
          <li><strong>การเติบโตตามภูมิภาค:</strong> กรุงเทพฯ 25%, เชียงใหม่ 20%, ภูเก็ต 19% — แหล่ง: Thansettakij</li>
        </ul>
      </div>

      <!-- วิเคราะห์คู่แข่ง -->
      <div class="src-card">
        <h3>🔍 วิเคราะห์คู่แข่ง</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> competitors.json + ข้อมูลวิจัยราคา/โปรโมชันจริง</li>
          <li><strong>ภาพรวมคู่แข่ง:</strong> โปรไฟล์แบรนด์ ส่วนแบ่ง คะแนนรีวิว — แหล่ง: SET filings (SNP, PB, AU), The Business Plus, Thansettakij</li>
          <li><strong>เปรียบเทียบราคา:</strong> ราคาจริงจาก SaleHere, Priceza, Wongnai, Ryoii Review (อัปเดต 2568-2569)</li>
          <li><strong>เปรียบเทียบสินค้า:</strong> จำนวน SKU และส่วนแบ่งหมวดหมู่จากเว็บไซต์ทางการ/ข้อมูลสาขา</li>
          <li><strong>เปรียบเทียบโปรโมชัน:</strong> โปรโมชันจริง — S&P Joy Card, After You JCB B1G1, Farmhouse LINE coupons, Yamazaki store-level — แหล่ง: SaleHere, Maneedee, Punpromotion, JCB Special Offers</li>
        </ul>
      </div>

      <!-- เทรนด์สินค้า -->
      <div class="src-card">
        <h3>🧁 เทรนด์สินค้า</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> trends.json</li>
          <li><strong>ที่มา:</strong> ข้อมูล mentions, search volume, ยอดขายโดยประมาณ จากการค้นหาบนเว็บสาธารณะ</li>
          <li><strong>ครอบคลุม:</strong> สินค้าเทรนด์ / หมวดหมู่ / คีย์เวิร์ดที่กำลังมาแรง</li>
        </ul>
      </div>

      <!-- พฤติกรรมผู้บริโภค -->
      <div class="src-card">
        <h3>💜 พฤติกรรมผู้บริโภค</h3>
        <ul>
          <li><strong>โซเชียลมีเดีย:</strong> social.json — ข้อมูล mentions จาก 5 แพลตฟอร์ม (Web Research)</li>
          <li><strong>Sentiment:</strong> social.json — วิเคราะห์อารมณ์จากข้อความบนโซเชียล</li>
          <li><strong>พฤติกรรมซื้อ:</strong> ข้อมูลจริงจากงานวิจัย — แหล่ง: Kantar Worldpanel, Mintel Thailand, Ipsos Generations Report 2024, SCB EIC Consumer Survey</li>
          <li><strong>ช่องทางซื้อ:</strong> ร้านสะดวกซื้อ 35%, ร้านเบเกอรี่ 22%, ซูเปอร์ 20%, ออนไลน์ 8% — แหล่ง: Euromonitor, USDA GAIN Report, Kantar</li>
          <li><strong>เทรนด์คีย์เวิร์ด:</strong> ครัวซองต์พรีเมียม +42%, โปรตีนสูง 17→24%, Plant-based +12% — แหล่ง: Thansettakij, Mintel, Bakery & Snacks</li>
        </ul>
      </div>

      <!-- พื้นที่/ภูมิภาค -->
      <div class="src-card">
        <h3>📍 พื้นที่/ภูมิภาค</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> ข้อมูล demo ทั้งหมด (hardcoded)</li>
          <li><strong>ที่มา:</strong> ยอดขายรายภูมิภาค, ช่องทาง, ข้อมูลระดับจังหวัด — เป็นข้อมูลตัวอย่างสำหรับ prototype</li>
        </ul>
      </div>

      <!-- ติดตามคู่แข่ง -->
      <div class="src-card">
        <h3>🔔 ติดตามคู่แข่ง</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> ข้อมูล demo ทั้งหมด (hardcoded)</li>
          <li><strong>ที่มา:</strong> การเคลื่อนไหวคู่แข่ง, การเปลี่ยนราคา, สินค้าใหม่ — ข้อมูลตัวอย่างสำหรับ prototype</li>
        </ul>
      </div>

      <!-- AI วิเคราะห์ -->
      <div class="src-card">
        <h3>⚡ AI วิเคราะห์</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> ข้อมูล demo ทั้งหมด (hardcoded)</li>
          <li><strong>ที่มา:</strong> คะแนนสุขภาพตลาด, แนวโน้ม, คำแนะนำ, การพยากรณ์ — ข้อมูลตัวอย่าง ไม่ได้เชื่อมต่อ AI จริง</li>
        </ul>
      </div>

      <!-- ศูนย์แจ้งเตือน -->
      <div class="src-card">
        <h3>🔔 ศูนย์แจ้งเตือน</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> ข้อมูล demo ทั้งหมด (hardcoded)</li>
          <li><strong>ที่มา:</strong> การแจ้งเตือน, ประวัติ, การตั้งค่ากฎ — ข้อมูลตัวอย่างสำหรับ prototype</li>
        </ul>
      </div>

      <!-- ถาม-ตอบ สินค้า -->
      <div class="src-card">
        <h3>❓ ถาม-ตอบ สินค้า</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> ข้อมูล demo ทั้งหมด (hardcoded)</li>
          <li><strong>ที่มา:</strong> คลังคำถาม-คำตอบที่คัดสรรสำหรับธุรกิจเบเกอรี่ ช่วง ส.ค.–ก.ย. 2569</li>
        </ul>
      </div>

      <!-- แผนปฏิบัติการ -->
      <div class="src-card">
        <h3>📋 แผนปฏิบัติการ</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> ข้อมูล demo ทั้งหมด (hardcoded)</li>
          <li><strong>ที่มา:</strong> แผนงาน, KPI, ปฏิทิน — ข้อมูลตัวอย่างสำหรับ prototype</li>
        </ul>
      </div>

      <!-- สรุป -->
      <div class="src-card src-summary">
        <h3>📊 สรุปภาพรวมแหล่งข้อมูล</h3>
        <table class="src-table">
          <thead><tr><th>ส่วน</th><th>competitors.json</th><th>trends.json</th><th>social.json</th><th>Hardcoded</th></tr></thead>
          <tbody>
            <tr><td>ภาพรวมผู้บริหาร</td><td>✅</td><td>✅</td><td>—</td><td>บางส่วน</td></tr>
            <tr><td>เทรนด์ตลาด</td><td>—</td><td>✅</td><td>—</td><td>✅ ข้อมูลจริง (วิจัย)</td></tr>
            <tr><td>วิเคราะห์คู่แข่ง</td><td>✅</td><td>—</td><td>—</td><td>✅ ราคา/โปรโมจริง</td></tr>
            <tr><td>เทรนด์สินค้า</td><td>—</td><td>✅</td><td>—</td><td>—</td></tr>
            <tr><td>พฤติกรรมผู้บริโภค</td><td>—</td><td>—</td><td>✅ (2 แท็บ)</td><td>✅ ข้อมูลวิจัยจริง</td></tr>
            <tr><td>พื้นที่/ภูมิภาค</td><td>—</td><td>—</td><td>—</td><td>ทั้งหมด</td></tr>
            <tr><td>ติดตามคู่แข่ง</td><td>—</td><td>—</td><td>—</td><td>ทั้งหมด</td></tr>
            <tr><td>AI วิเคราะห์</td><td>—</td><td>—</td><td>—</td><td>ทั้งหมด</td></tr>
            <tr><td>ศูนย์แจ้งเตือน</td><td>—</td><td>—</td><td>—</td><td>ทั้งหมด</td></tr>
            <tr><td>ถาม-ตอบ สินค้า</td><td>—</td><td>—</td><td>—</td><td>ทั้งหมด</td></tr>
            <tr><td>แผนปฏิบัติการ</td><td>—</td><td>—</td><td>—</td><td>ทั้งหมด</td></tr>
          </tbody>
        </table>
      </div>

    </div>

    <style>
      .src-card{background:var(--card-bg,#fff);border-radius:12px;padding:20px 24px;margin-bottom:16px;border:1px solid var(--border,#e5e7eb);box-shadow:0 1px 3px rgba(0,0,0,.04)}
      .src-card h3{margin:0 0 12px;font-size:1.1rem;color:var(--text-primary,#1a1a2e)}
      .src-card ul{margin:0;padding-left:20px;line-height:1.8}
      .src-card li{font-size:.9rem;color:var(--text-secondary,#444)}
      .src-card li strong{color:var(--text-primary,#1a1a2e)}
      .src-note{font-size:.82rem;color:var(--text-muted,#888);margin:10px 0 0;padding:8px 12px;background:var(--bg-subtle,#f8f9fa);border-radius:8px;border-left:3px solid var(--accent,#e8a87c)}
      .src-table{width:100%;border-collapse:collapse;font-size:.88rem}
      .src-table th{text-align:left;padding:8px 10px;background:var(--bg-subtle,#f1f3f5);font-weight:600;border-bottom:2px solid var(--border,#dee2e6)}
      .src-table td{padding:8px 10px;border-bottom:1px solid var(--border,#eee)}
      .src-table code{background:var(--bg-subtle,#f0f0f0);padding:2px 6px;border-radius:4px;font-size:.82rem}
      .src-summary{border-left:4px solid var(--accent,#e8a87c)}
      [data-theme="dark"] .src-card{background:var(--card-bg,#1e2330);border-color:var(--border,#2d3348)}
      [data-theme="dark"] .src-note{background:var(--bg-subtle,#262d3f)}
      [data-theme="dark"] .src-table th{background:var(--bg-subtle,#262d3f)}
      [data-theme="dark"] .src-table code{background:var(--bg-subtle,#2a3040)}
    </style>
  `;
}
