export function mount(container) {
  container.innerHTML = `
    <div style="max-width:960px;margin:0 auto;padding:24px 16px;">
      <h2 style="margin:0 0 8px;font-size:1.5rem;">📚 แหล่งที่มาข้อมูล — Health Bento</h2>
      <p style="color:var(--text-secondary,#666);margin:0 0 28px;font-size:.95rem;">
        สรุปว่าแต่ละส่วนของแดชบอร์ดค้นคว้าและรวบรวมข้อมูลมาจากไหน (อัปเดตล่าสุด: สิงหาคม 2569)
      </p>

      <!-- ไฟล์ข้อมูลหลัก -->
      <div class="src-card">
        <h3>📁 ไฟล์ข้อมูลหลัก (12 ไฟล์)</h3>
        <table class="src-table">
          <thead><tr><th>ไฟล์</th><th>เนื้อหา</th><th>ที่มา</th></tr></thead>
          <tbody>
            <tr><td><code>overview.json</code></td><td>KPI, ยอดขายรายเดือนตามแผน, แนวคิดธุรกิจ</td><td>แผนธุรกิจภายใน</td></tr>
            <tr><td><code>market.json</code></td><td>ขนาดตลาด TAM/SAM/SOM, การเติบโต, คู่แข่ง, Persona</td><td>ประมาณการ + สำรวจจาก Wongnai, Goodcal</td></tr>
            <tr><td><code>survey.json</code></td><td>สำรวจราคาตลาดจริง 10+ แบรนด์</td><td>6 แหล่งสาธารณะ (ดูรายละเอียดด้านล่าง)</td></tr>
            <tr><td><code>lowcarb.json</code></td><td>กลุ่มลูกค้า High-protein / Low-carb / Keto</td><td>DITP, Healthline, Goodcal, Easy Health</td></tr>
            <tr><td><code>product.json</code></td><td>เมนู 18 รายการ พร้อมโภชนาการ ราคา ต้นทุน</td><td>แผนธุรกิจภายใน (ค่าประมาณการ)</td></tr>
            <tr><td><code>ops.json</code></td><td>กำลังผลิต, ซัพพลายเออร์, โซนจัดส่ง</td><td>แผนปฏิบัติการภายใน</td></tr>
            <tr><td><code>marketing.json</code></td><td>แผนการตลาดปีที่ 1, งบ, ช่องทาง, CAC</td><td>แผนการตลาดภายใน</td></tr>
            <tr><td><code>retail.json</code></td><td>ข้อมูลห้าง/Modern Trade, GP, จำนวนสาขา</td><td>7 แหล่งสาธารณะ (ดูรายละเอียดด้านล่าง)</td></tr>
            <tr><td><code>finance.json</code></td><td>งบการเงิน 3 ปี, เงินลงทุน, จุดคุ้มทุน</td><td>สมมติฐานทางการเงินภายใน</td></tr>
            <tr><td><code>plan.json</code></td><td>แผนปฏิบัติการ 12 เดือน, เป้าหมาย, ความเสี่ยง</td><td>แผนธุรกิจภายใน</td></tr>
            <tr><td><code>bizplan.json</code></td><td>Business Model, SWOT, วิสัยทัศน์/พันธกิจ</td><td>แผนธุรกิจภายใน</td></tr>
            <tr><td><code>menus.json</code></td><td>รายละเอียดเมนู วัตถุดิบ สารก่อภูมิแพ้</td><td>แผนธุรกิจภายใน</td></tr>
          </tbody>
        </table>
      </div>

      <!-- ภาพรวมธุรกิจ -->
      <div class="src-card">
        <h3>📊 ภาพรวมธุรกิจ</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> overview.json</li>
          <li><strong>ที่มา:</strong> แผนธุรกิจภายใน — KPI เป้าหมาย, ยอดขายรายเดือนตามแผนรุก (ramp-up)</li>
          <li><strong>หมายเหตุ:</strong> ตัวเลขเป็นประมาณการตามแผนธุรกิจ ยังไม่ใช่ยอดขายจริง</li>
        </ul>
      </div>

      <!-- ตลาด & ลูกค้า -->
      <div class="src-card">
        <h3>📈 ตลาด & ลูกค้า</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> market.json, survey.json, lowcarb.json</li>
        </ul>
        <h4 style="margin:12px 0 6px;font-size:.95rem;">แหล่งอ้างอิงสำรวจราคาตลาด (survey.json)</h4>
        <table class="src-table">
          <thead><tr><th>รหัส</th><th>แหล่งที่มา</th><th>เนื้อหา</th></tr></thead>
          <tbody>
            <tr><td>M1</td><td>Wongnai</td><td>รายชื่อร้านอาหาร Clean Food / Delivery</td></tr>
            <tr><td>M2</td><td>Goodcal</td><td>สรุปร้านข้าวกล่องเพื่อสุขภาพ</td></tr>
            <tr><td>M3</td><td>Krungsri Research</td><td>แนวโน้มอุตสาหกรรมอาหารพร้อมรับประทาน 2567–2569</td></tr>
            <tr><td>M4</td><td>Post Today (SME)</td><td>มูลค่าตลาดอาหารพร้อมรับประทาน 35,949 ล้านบาท (2568)</td></tr>
          </tbody>
        </table>
        <h4 style="margin:12px 0 6px;font-size:.95rem;">แหล่งอ้างอิง Low-carb / Keto (lowcarb.json)</h4>
        <table class="src-table">
          <thead><tr><th>รหัส</th><th>แหล่งที่มา</th><th>เนื้อหา</th></tr></thead>
          <tbody>
            <tr><td>L1</td><td>DITP (กรมส่งเสริมการค้าระหว่างประเทศ)</td><td>รายงานเทรนด์อาหาร 2569</td></tr>
            <tr><td>L2</td><td>Easy Health Blog</td><td>บทความข้าวกล่อง Keto Delivery</td></tr>
            <tr><td>L3</td><td>Healthline</td><td>มาตรฐานโภชนาการ Keto Meal</td></tr>
            <tr><td>L4</td><td>Goodcal</td><td>ราคาคู่แข่ง</td></tr>
          </tbody>
        </table>
        <p class="src-note">หมายเหตุ: ขนาดตลาด TAM/SAM/SOM เป็นค่าประมาณการจากแผนธุรกิจ ส่วนราคาคู่แข่งสำรวจจริงจากแหล่งสาธารณะ ข้อมูลยอดขายรายร้านต้องสำรวจภาคสนามเพิ่มเติม</p>
      </div>

      <!-- เมนู & ราคา -->
      <div class="src-card">
        <h3>🍱 เมนู & ราคา</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> product.json</li>
          <li><strong>ที่มา:</strong> แผนธุรกิจภายใน — เมนู 18 รายการ (อาหารไทย + สากล หมุนเวียน 3 สัปดาห์)</li>
          <li><strong>หมายเหตุ:</strong> ราคา, ต้นทุนวัตถุดิบ, ค่าโภชนาการ เป็นค่าประมาณการจากแผนธุรกิจ</li>
        </ul>
      </div>

      <!-- ผลิต & จัดส่ง -->
      <div class="src-card">
        <h3>🏭 ผลิต & จัดส่ง</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> ops.json</li>
          <li><strong>ที่มา:</strong> แผนปฏิบัติการภายใน</li>
          <li><strong>รายละเอียด:</strong> ครัวกลางย่านพระราม 9 (180 ตร.ม. มาตรฐาน GMP) 2 กะ/800 กล่อง/วัน, ซัพพลายเออร์ (ฟาร์มไก่, ตลาดไท, สหกรณ์ผักนครปฐม, โรงสี), โซนจัดส่งในกรุงเทพฯ ชั้นใน</li>
        </ul>
      </div>

      <!-- การตลาด & ช่องทาง -->
      <div class="src-card">
        <h3>📣 การตลาด & ช่องทาง</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> marketing.json</li>
          <li><strong>ที่มา:</strong> แผนการตลาดภายในปีที่ 1</li>
          <li><strong>รายละเอียด:</strong> งบ 1.32 ล้านบาท (~6.3% ของรายได้) ช่องทาง LINE OA, Grab/LINE MAN/Robinhood, จัดเลี้ยงองค์กร, พันธมิตรฟิตเนส</li>
        </ul>
      </div>

      <!-- ห้าง / Modern Trade -->
      <div class="src-card">
        <h3>🏪 ห้าง / Modern Trade</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> retail.json</li>
          <li><strong>ที่มา:</strong> 7 แหล่งสาธารณะที่ตรวจสอบแล้ว</li>
        </ul>
        <table class="src-table">
          <thead><tr><th>รหัส</th><th>แหล่งที่มา</th><th>ข้อมูลที่ได้</th></tr></thead>
          <tbody>
            <tr><td>S1</td><td>Wikipedia</td><td>Tops Supermarket — 235 สาขา</td></tr>
            <tr><td>S2</td><td>Marketing Oops</td><td>Tops ครบรอบ 28 ปี — 702 สาขาใน 46 จังหวัด, เป้า 1,000 สาขา ปี 2570</td></tr>
            <tr><td>S3</td><td>PN Store Retailer</td><td>ประวัติไฮเปอร์มาร์เก็ต — CP ซื้อ Tesco Lotus 338,000 ล้านบาท</td></tr>
            <tr><td>S4</td><td>Asia Pro Distribution</td><td>จำนวนสาขา: Lotus's 2,000+, Big C 140+, 7-Eleven 14,000+, Makro 140+</td></tr>
            <tr><td>S5</td><td>ไทยรัฐ</td><td>7-Eleven 14,545 สาขา, Modern Trade 20,000+ สาขา, ค้าปลีก 2.8 ล้านล้านบาท = 15.7% GDP</td></tr>
            <tr><td>S6</td><td>CP Axtra (Wealthplus Today)</td><td>FY2024 รายได้ 512,000 ล้านบาท, Lotus's 2,520 สาขา, Makro 170 สาขา</td></tr>
            <tr><td>S7</td><td>Marketing Oops</td><td>Central Retail FY2024 รายได้ 262,800 ล้านบาท</td></tr>
          </tbody>
        </table>
        <p class="src-note">หมายเหตุ: อัตรา GP, ค่า Listing Fee, เงื่อนไขเครดิต เป็นค่าอ้างอิงตลาด — ต้องยืนยันกับฝ่ายจัดซื้อของแต่ละห้างก่อนเจรจาจริง</p>
      </div>

      <!-- การเงิน -->
      <div class="src-card">
        <h3>💰 การเงิน</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> finance.json</li>
          <li><strong>ที่มา:</strong> สมมติฐานทางการเงินภายใน (แผนธุรกิจ)</li>
          <li><strong>รายละเอียด:</strong> งบการเงิน 3 ปี (Base Case), เงินลงทุน 4 ล้านบาท (62.5% ทุนตัวเอง + 37.5% สินเชื่อ ดอกเบี้ย 7%)</li>
          <li><strong>หมายเหตุ:</strong> ราคาวัตถุดิบและค่าเช่าจริงต้องยืนยันก่อนตัดสินใจลงทุน</li>
        </ul>
      </div>

      <!-- แผนดำเนินงาน -->
      <div class="src-card">
        <h3>📋 แผนดำเนินงาน</h3>
        <ul>
          <li><strong>ข้อมูลที่ใช้:</strong> plan.json + bizplan.json</li>
          <li><strong>ที่มา:</strong> แผนธุรกิจภายใน</li>
          <li><strong>รายละเอียด:</strong> แผนปฏิบัติการ 12 เดือน 4 เฟส (เตรียม, เปิดตัว, เติบโต, ขยาย) พร้อม SWOT, Business Model Canvas, วิสัยทัศน์/พันธกิจ</li>
        </ul>
      </div>

      <!-- สรุป -->
      <div class="src-card src-summary">
        <h3>📊 สรุปประเภทแหล่งข้อมูล</h3>
        <table class="src-table">
          <thead><tr><th>ประเภท</th><th>รายละเอียด</th></tr></thead>
          <tbody>
            <tr><td>แผนธุรกิจภายใน</td><td>KPI, เมนู, ต้นทุน, งบการเงิน, แผนปฏิบัติการ, การตลาด, ผลิต & จัดส่ง</td></tr>
            <tr><td>สำรวจจริงจากแหล่งสาธารณะ</td><td>ราคาคู่แข่ง 10+ แบรนด์ (Wongnai, Goodcal), จำนวนสาขาห้าง (ไทยรัฐ, Marketing Oops, CP Axtra)</td></tr>
            <tr><td>รายงานอุตสาหกรรม</td><td>ขนาดตลาดอาหารพร้อมรับประทาน (Krungsri Research, Post Today), เทรนด์อาหาร (DITP)</td></tr>
            <tr><td>แหล่งความรู้สากล</td><td>มาตรฐานโภชนาการ Keto (Healthline)</td></tr>
          </tbody>
        </table>
      </div>

    </div>

    <style>
      .src-card{background:var(--card-bg,#fff);border-radius:12px;padding:20px 24px;margin-bottom:16px;border:1px solid var(--border,#e5e7eb);box-shadow:0 1px 3px rgba(0,0,0,.04)}
      .src-card h3{margin:0 0 12px;font-size:1.1rem;color:var(--text-primary,#1a1a2e)}
      .src-card h4{color:var(--text-primary,#1a1a2e)}
      .src-card ul{margin:0;padding-left:20px;line-height:1.8}
      .src-card li{font-size:.9rem;color:var(--text-secondary,#444)}
      .src-card li strong{color:var(--text-primary,#1a1a2e)}
      .src-note{font-size:.82rem;color:var(--text-muted,#888);margin:10px 0 0;padding:8px 12px;background:var(--bg-subtle,#f8f9fa);border-radius:8px;border-left:3px solid var(--accent,#4caf50)}
      .src-table{width:100%;border-collapse:collapse;font-size:.88rem}
      .src-table th{text-align:left;padding:8px 10px;background:var(--bg-subtle,#f1f3f5);font-weight:600;border-bottom:2px solid var(--border,#dee2e6)}
      .src-table td{padding:8px 10px;border-bottom:1px solid var(--border,#eee)}
      .src-table code{background:var(--bg-subtle,#f0f0f0);padding:2px 6px;border-radius:4px;font-size:.82rem}
      .src-summary{border-left:4px solid var(--accent,#4caf50)}
      [data-theme="dark"] .src-card{background:var(--card-bg,#1e2330);border-color:var(--border,#2d3348)}
      [data-theme="dark"] .src-note{background:var(--bg-subtle,#262d3f)}
      [data-theme="dark"] .src-table th{background:var(--bg-subtle,#262d3f)}
      [data-theme="dark"] .src-table code{background:var(--bg-subtle,#2a3040)}
    </style>
  `;
}
