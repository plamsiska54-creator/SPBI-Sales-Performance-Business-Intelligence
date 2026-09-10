// ════════════════════════════════════════
// TARGET DATA 2024 — from Target.xlsx (Target 2024 sheet)
// ════════════════════════════════════════
// monthly: [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]

var TARGET_2024 = {
  mt: {
    CJ:      {total:242305496, monthly:[19496496,16393000,15908000,14938000,19400000,21340000,21340000,21340000,22310000,22310000,23280000,24250000]},
    BigC:    {total:146602200, monthly:[9682200,11540400,10562400,10171200,11736000,11736000,12714000,12714000,13692000,13692000,13692000,14670000]},
    Top:     {total:4996000,   monthly:[402000,338000,328000,308000,400000,440000,440000,440000,460000,460000,480000,500000]},
    Makro:   {total:1049300,   monthly:[69300,82600,75600,72800,84000,84000,91000,91000,98000,98000,98000,105000]},
    Aeon:    {total:2498000,   monthly:[201000,169000,164000,154000,200000,220000,220000,220000,230000,230000,240000,250000]},
    TheMall: {total:749500,    monthly:[49500,59000,54000,52000,60000,60000,65000,65000,70000,70000,70000,75000]},
    MM:      {total:1499000,   monthly:[99000,118000,108000,104000,120000,120000,130000,130000,140000,140000,140000,150000]}
  },
  mtTotal: {total:399699496, monthly:[29999496,28700000,27200000,25800000,32000000,34000000,35000000,35000000,37000000,37000000,38000000,40000000]},

  amazon: {
    'BKK1_Amazon':   {label:'BKK 1 (ปทุมธานี) Amazon',       total:13033333, monthly:[538333,538333,566667,538333,1133333,1133333,1133333,1275000,1275000,1416667,1700000,1785000]},
    'BKK1_Souvenir': {label:'BKK 1 (ปทุมธานี) ร้านของฝาก',   total:2300000,  monthly:[95000,95000,100000,95000,200000,200000,200000,225000,225000,250000,300000,315000]},
    'BKK2_Amazon':   {label:'BKK 2 (นนทบุรี) Amazon',        total:13033333, monthly:[538333,538333,566667,538333,1133333,1133333,1133333,1275000,1275000,1416667,1700000,1785000]},
    'BKK2_Souvenir': {label:'BKK 2 (นนทบุรี) ร้านของฝาก',    total:2300000,  monthly:[95000,95000,100000,95000,200000,200000,200000,225000,225000,250000,300000,315000]},
    'BKK3_Amazon':   {label:'BKK 3 (สมุทรปราการ) Amazon',     total:13033333, monthly:[538333,538333,566667,538333,1133333,1133333,1133333,1275000,1275000,1416667,1700000,1785000]},
    'BKK3_Souvenir': {label:'BKK 3 (สมุทรปราการ) ร้านของฝาก', total:2300000,  monthly:[95000,95000,100000,95000,200000,200000,200000,225000,225000,250000,300000,315000]},
    'North':         {label:'North (เหนือ)',                  total:20400000, monthly:[1100000,1000000,1200000,1300000,1500000,1500000,1800000,2000000,2000000,2000000,2500000,2500000]},
    'NE_Upper':      {label:'Northeast (อีสานบน)',            total:10750000, monthly:[600000,550000,650000,700000,750000,750000,900000,1000000,1100000,1250000,1250000,1250000]},
    'NE_Lower':      {label:'Northeast (อีสานล่าง)',          total:10750000, monthly:[600000,550000,650000,700000,750000,750000,900000,1000000,1100000,1250000,1250000,1250000]},
    'Central':       {label:'Central (กลาง)',                 total:21750000, monthly:[1200000,1100000,1150000,1250000,1750000,1750000,1750000,2100000,2250000,2400000,2400000,2650000]},
    'CentralEast':   {label:'Central&East (ตะวันออก)',        total:21750000, monthly:[1200000,1100000,1150000,1250000,1750000,1750000,1750000,2100000,2250000,2400000,2400000,2650000]},
    'South':         {label:'South (ใต้)',                    total:28600000, monthly:[800000,800000,800000,900000,13000000,1300000,1500000,1500000,1500000,2000000,2000000,2500000]}
  },
  amazonTotal: {total:160000000, monthly:[7400000,7000000,7600000,8000000,23500000,11800000,12600000,14200000,14700000,16300000,17800000,19100000]},

  booth: {
    'ลำพยา3_ใหม่':     {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]},
    'ปตท_คุณาวรรณ':    {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]},
    'หน้ามอ':          {total:1550000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,150000,150000]},
    'ลำพยา3_เก่า':     {total:1550000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,150000,150000]},
    'ไทวัสดุ':          {total:1550000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,150000,150000]},
    'แก้วมณีกาญ':      {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]},
    'ลำพยา2_ใหม่':     {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]},
    'ธรรมศาลา':        {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]},
    'ตลาดดิโอโซน':     {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]},
    'ปตท_ราชบุรี':      {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]},
    'ชัยพฤกษ์_นนทบุรี': {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]},
    'ศาลายา_กม26':     {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]}
  },
  boothTotal: {total:15900000, monthly:[1500000,1500000,1500000,1500000,1500000,1500000,1500000,1500000,1500000,1500000,450000,450000]},

  online: {
    'Tiktok':   {total:12600000, monthly:[1050000,1050000,1050000,1050000,1050000,1050000,1050000,1050000,1050000,1050000,1050000,1050000]},
    'Facebook': {total:7200000,  monthly:[600000,600000,600000,600000,600000,600000,600000,600000,600000,600000,600000,600000]},
    'Shopee':   {total:5400000,  monthly:[450000,450000,450000,450000,450000,450000,450000,450000,450000,450000,450000,450000]},
    'Lazada':   {total:10800000, monthly:[900000,900000,900000,900000,900000,900000,900000,900000,900000,900000,900000,900000]}
  },
  onlineTotal: {total:36000000, monthly:[3000000,3000000,3000000,3000000,3000000,3000000,3000000,3000000,3000000,3000000,3000000,3000000]},

  grandTotal: {total:611599496, monthly:[41899496,40200000,39300000,38300000,60000000,50300000,52100000,53700000,56200000,57800000,59250000,62550000]},

  MONTHS_TH: ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],
  MONTHS_EN: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
};

// ════════════════════════════════════════
// TARGET DATA 2025 — from Target 2025.xlsx
// ════════════════════════════════════════
// monthly: [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]

var TARGET_2025 = {
  mt: {
    CJ:      {total:242306000, monthly:[19497000,16393000,15908000,14938000,19400000,21340000,21340000,21340000,22310000,22310000,23280000,24250000]},
    BigC:    {total:146602200, monthly:[9682200,11540400,10562400,10171200,11736000,11736000,12714000,12714000,13692000,13692000,13692000,14670000]},
    Top:     {total:4996000,   monthly:[402000,338000,328000,308000,400000,440000,440000,440000,460000,460000,480000,500000]},
    Makro:   {total:1049300,   monthly:[69300,82600,75600,72800,84000,84000,91000,91000,98000,98000,98000,105000]},
    Aeon:    {total:2498000,   monthly:[201000,169000,164000,154000,200000,220000,220000,220000,230000,230000,240000,250000]},
    TheMall: {total:749500,    monthly:[49500,59000,54000,52000,60000,60000,65000,65000,70000,70000,70000,75000]},
    MM:      {total:1499000,   monthly:[99000,118000,108000,104000,120000,120000,130000,130000,140000,140000,140000,150000]}
  },
  mtTotal: {total:399700000, monthly:[30000000,28700000,27200000,25800000,32000000,34000000,35000000,35000000,37000000,37000000,38000000,40000000]},

  amazon: {
    'BKK1_Amazon':   {label:'BKK 1 (ปทุมธานี) Amazon',       total:13033333, monthly:[538333,538333,566667,538333,1133333,1133333,1133333,1275000,1275000,1416667,1700000,1785000]},
    'BKK1_Souvenir': {label:'BKK 1 (ปทุมธานี) ร้านของฝาก',   total:2300000,  monthly:[95000,95000,100000,95000,200000,200000,200000,225000,225000,250000,300000,315000]},
    'BKK2_Amazon':   {label:'BKK 2 (นนทบุรี) Amazon',        total:13033333, monthly:[538333,538333,566667,538333,1133333,1133333,1133333,1275000,1275000,1416667,1700000,1785000]},
    'BKK2_Souvenir': {label:'BKK 2 (นนทบุรี) ร้านของฝาก',    total:2300000,  monthly:[95000,95000,100000,95000,200000,200000,200000,225000,225000,250000,300000,315000]},
    'BKK3_Amazon':   {label:'BKK 3 (สมุทรปราการ) Amazon',     total:13033333, monthly:[538333,538333,566667,538333,1133333,1133333,1133333,1275000,1275000,1416667,1700000,1785000]},
    'BKK3_Souvenir': {label:'BKK 3 (สมุทรปราการ) ร้านของฝาก', total:2300000,  monthly:[95000,95000,100000,95000,200000,200000,200000,225000,225000,250000,300000,315000]},
    'North':         {label:'North (เหนือ)',                  total:20400000, monthly:[1100000,1000000,1200000,1300000,1500000,1500000,1800000,2000000,2000000,2000000,2500000,2500000]},
    'NE_Upper':      {label:'Northeast (อีสานบน)',            total:10750000, monthly:[600000,550000,650000,700000,750000,750000,900000,1000000,1100000,1250000,1250000,1250000]},
    'NE_Lower':      {label:'Northeast (อีสานล่าง)',          total:10750000, monthly:[600000,550000,650000,700000,750000,750000,900000,1000000,1100000,1250000,1250000,1250000]},
    'Central':       {label:'Central (กลาง)',                 total:21750000, monthly:[1200000,1100000,1150000,1250000,1750000,1750000,1750000,2100000,2250000,2400000,2400000,2650000]},
    'CentralEast':   {label:'Central&East (ตะวันออก)',        total:21750000, monthly:[1200000,1100000,1150000,1250000,1750000,1750000,1750000,2100000,2250000,2400000,2400000,2650000]},
    'South':         {label:'South (ใต้)',                    total:28600000, monthly:[800000,800000,800000,900000,13000000,1300000,1500000,1500000,1500000,2000000,2000000,2500000]}
  },
  amazonTotal: {total:160000000, monthly:[7400000,7000000,7600000,8000000,23500000,11800000,12600000,14200000,14700000,16300000,17800000,19100000]},

  booth: {
    'ลำพยา3_ใหม่':     {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]},
    'ปตท_คุณาวรรณ':    {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]},
    'หน้ามอ':          {total:1550000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,150000,150000]},
    'ลำพยา3_เก่า':     {total:1550000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,150000,150000]},
    'ไทวัสดุ':          {total:1550000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,150000,150000]},
    'แก้วมณีกาญ':      {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]},
    'ลำพยา2_ใหม่':     {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]},
    'ธรรมศาลา':        {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]},
    'ตลาดดิโอโซน':     {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]},
    'ปตท_ราชบุรี':      {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]},
    'ชัยพฤกษ์_นนทบุรี': {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]},
    'ศาลายา_กม26':     {total:1250000,  monthly:[125000,125000,125000,125000,125000,125000,125000,125000,125000,125000,0,0]}
  },
  boothTotal: {total:15900000, monthly:[1500000,1500000,1500000,1500000,1500000,1500000,1500000,1500000,1500000,1500000,450000,450000]},

  online: {
    'Tiktok':   {total:12600000, monthly:[1050000,1050000,1050000,1050000,1050000,1050000,1050000,1050000,1050000,1050000,1050000,1050000]},
    'Facebook': {total:7200000,  monthly:[600000,600000,600000,600000,600000,600000,600000,600000,600000,600000,600000,600000]},
    'Shopee':   {total:5400000,  monthly:[450000,450000,450000,450000,450000,450000,450000,450000,450000,450000,450000,450000]},
    'Lazada':   {total:10800000, monthly:[900000,900000,900000,900000,900000,900000,900000,900000,900000,900000,900000,900000]}
  },
  onlineTotal: {total:36000000, monthly:[3000000,3000000,3000000,3000000,3000000,3000000,3000000,3000000,3000000,3000000,3000000,3000000]},

  grandTotal: {total:611600000, monthly:[41900000,40200000,39300000,38300000,60000000,50300000,52100000,53700000,56200000,57800000,59250000,62550000]},

  MONTHS_TH: ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],
  MONTHS_EN: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
};

// ════════════════════════════════════════
// TARGET DATA 2026 — from Target 2026.xlsx
// ════════════════════════════════════════
// monthly: [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]

var TARGET_2026 = {
  mt: {
    CJ:      {total:416375000, monthly:[29630000,32630000,32300000,33000000,33000000,33000000,34705000,35105000,35005000,36000000,40000000,42000000]},
    BigC:    {total:200000000, monthly:[10000000,13000000,13500000,14000000,15000000,15000000,17000000,17000000,18000000,19500000,23000000,25000000]},
    Top:     {total:7000000,   monthly:[30000,30000,80000,250000,400000,400000,700000,700000,700000,1000000,1000000,1710000]},
    Makro:   {total:13740000,  monthly:[70000,70000,700000,1000000,1000000,1000000,1200000,1400000,1500000,1800000,2000000,2000000]},
    Aeon:    {total:2000000,   monthly:[80000,80000,80000,100000,100000,100000,160000,200000,200000,300000,300000,300000]},
    TheMall: {total:995000,    monthly:[50000,50000,50000,80000,80000,80000,95000,95000,95000,100000,100000,120000]},
    MM:      {total:500000,    monthly:[10000,10000,10000,20000,20000,20000,50000,50000,50000,80000,80000,100000]}
  },
  mtTotal: {total:640610000, monthly:[39870000,45870000,46720000,48450000,49600000,49600000,53910000,54550000,55550000,58780000,66480000,71230000]},

  amazon: {
    'BKK1_Amazon':   {label:'BKK 1 (ปทุมธานี) Amazon',       total:15050000, monthly:[840000,910000,980000,1050000,1120000,1120000,1260000,1260000,1330000,1610000,1680000,1890000]},
    'BKK1_Souvenir': {label:'BKK 1 (ปทุมธานี) ร้านของฝาก',   total:6450000,  monthly:[360000,390000,420000,450000,480000,480000,540000,540000,570000,690000,720000,810000]},
    'BKK2_Amazon':   {label:'BKK 2 (นนทบุรี) Amazon',        total:12250000, monthly:[560000,595000,665000,700000,770000,770000,980000,980000,1050000,1610000,1680000,1890000]},
    'BKK2_Souvenir': {label:'BKK 2 (นนทบุรี) ร้านของฝาก',    total:5250000,  monthly:[240000,255000,285000,300000,330000,330000,420000,420000,450000,690000,720000,810000]},
    'BKK3_Amazon':   {label:'BKK 3 (สมุทรปราการ) Amazon',     total:12635000, monthly:[455000,525000,525000,560000,630000,630000,1365000,1365000,1400000,1680000,1750000,1750000]},
    'BKK3_Souvenir': {label:'BKK 3 (สมุทรปราการ) ร้านของฝาก', total:5415000,  monthly:[195000,225000,225000,240000,270000,270000,585000,585000,600000,720000,750000,750000]},
    'North':         {label:'North (เหนือ)',                  total:22450000, monthly:[1550000,1600000,1600000,1700000,1700000,1700000,1950000,1950000,2000000,2000000,2200000,2500000]},
    'NE_Upper':      {label:'Northeast (อีสานบน)',            total:15700000, monthly:[700000,800000,800000,900000,1000000,1000000,1350000,1350000,1400000,1800000,2100000,2500000]},
    'NE_Lower':      {label:'Northeast (อีสานล่าง)',          total:20450000, monthly:[1100000,1300000,1300000,1400000,1500000,1500000,1750000,1750000,1800000,2000000,2550000,2500000]},
    'Central':       {label:'Central (กลาง)',                 total:38550000, monthly:[2250000,2400000,2550000,3000000,3000000,3000000,3350000,3350000,3300000,3500000,4050000,4800000]},
    'CentralEast':   {label:'Central&East (ตะวันออก)',        total:19800000, monthly:[1100000,1250000,1300000,1350000,1400000,1400000,1750000,1750000,1750000,2000000,2250000,2500000]},
    'South':         {label:'South (ใต้)',                    total:20500000, monthly:[1200000,1300000,1400000,1450000,1500000,1500000,1750000,1750000,1750000,2000000,2400000,2500000]}
  },
  amazonTotal: {total:194500000, monthly:[10550000,11550000,12050000,13100000,13700000,13700000,17050000,17050000,17400000,20300000,22850000,25200000]},

  booth: {
    'คุณาวรรณ':  {total:6525000,  monthly:[95000,95000,95000,160000,325000,490000,655000,820000,820000,850000,980000,1140000]},
    'หน้ามอ':    {total:6525000,  monthly:[95000,95000,95000,160000,325000,490000,655000,820000,820000,850000,980000,1140000]},
    'ลำพญา3':   {total:6525000,  monthly:[95000,95000,95000,160000,325000,490000,655000,820000,820000,850000,980000,1140000]},
    'บูธฝากขาย': {total:425000,   monthly:[15000,15000,15000,20000,25000,30000,35000,40000,40000,50000,60000,80000]}
  },
  boothTotal: {total:20000000, monthly:[300000,300000,300000,500000,1000000,1500000,2000000,2500000,2500000,2600000,3000000,3500000]},

  online: {
    'Tiktok':   {total:73100000, monthly:[3500000,3800000,3800000,4000000,4000000,4000000,8000000,8000000,8000000,8000000,8000000,10000000]},
    'Facebook': {total:7000000,  monthly:[300000,350000,350000,400000,400000,400000,800000,800000,800000,800000,800000,800000]},
    'Shopee':   {total:6600000,  monthly:[100000,250000,250000,400000,400000,400000,800000,800000,800000,800000,800000,800000]},
    'Lazada':   {total:3300000,  monthly:[100000,100000,100000,200000,200000,200000,400000,400000,400000,400000,400000,400000]}
  },
  onlineTotal: {total:90000000, monthly:[4000000,4500000,4500000,5000000,5000000,5000000,10000000,10000000,10000000,10000000,10000000,12000000]},

  trading: {
    'F&N': {total:6600000, monthly:[0,0,0,100000,200000,300000,1000000,2000000,3000000,0,0,0]}
  },

  grandTotal: {total:951710000, monthly:[54720000,62220000,63570000,67150000,69500000,70100000,83960000,86100000,88450000,91680000,102330000,111930000]},

  MONTHS_TH: ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],
  MONTHS_EN: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
};

// Helper: get target object for a given CE year
function getTargetByYear(year) {
  if (year === 2024) return TARGET_2024;
  if (year === 2025) return TARGET_2025;
  return TARGET_2026;
}

// Helper: get YTD target (up to given month index, 0-based)
function getTargetYTD(monthlyArr, upToMonth) {
  var sum = 0;
  for (var i = 0; i <= upToMonth && i < monthlyArr.length; i++) sum += monthlyArr[i];
  return sum;
}

// Helper: format number to M (millions) string
function fmtTargetM(v) {
  if (v >= 1000000) return (v / 1000000).toFixed(2) + ' M';
  if (v >= 1000) return (v / 1000).toFixed(1) + ' K';
  return v.toLocaleString();
}

// ══════════════════════════════════════
// Admin Panel: Target 2026 — CRUD
// ══════════════════════════════════════
var _TARGET_LS_KEY='adminTarget2026';

// Deep clone helper
function _tgtClone(obj){return JSON.parse(JSON.stringify(obj));}

// Load merged target data (base + overrides)
function _getTargetData(){
  var base={
    mt:_tgtClone(TARGET_2026.mt),
    amazon:_tgtClone(TARGET_2026.amazon),
    booth:_tgtClone(TARGET_2026.booth),
    online:_tgtClone(TARGET_2026.online),
    trading:_tgtClone(TARGET_2026.trading)
  };
  var ov;
  try{ov=JSON.parse(localStorage.getItem(_TARGET_LS_KEY));}catch(e){}
  if(!ov) return base;
  ['mt','amazon','booth','online','trading'].forEach(function(sec){
    if(!ov[sec]) return;
    Object.keys(ov[sec]).forEach(function(k){
      var entry=ov[sec][k];
      if(entry._deleted){delete base[sec][k];return;}
      base[sec][k]=entry;
    });
  });
  return base;
}

// Save override for one section+key
function _saveTargetItem(section,key,item,deleted){
  var ov;
  try{ov=JSON.parse(localStorage.getItem(_TARGET_LS_KEY))||{};}catch(e){ov={};}
  if(!ov[section]) ov[section]={};
  if(deleted){
    ov[section][key]={_deleted:true};
  } else {
    ov[section][key]=_tgtClone(item);
  }
  localStorage.setItem(_TARGET_LS_KEY,JSON.stringify(ov));
}

// Recalc totals in TARGET_2026 from current data
function _tgtRecalcTotals(data){
  var secs={mt:'mtTotal',amazon:'amazonTotal',booth:'boothTotal',online:'onlineTotal'};
  var grandMonthly=new Array(12).fill(0),grandTotal=0;
  Object.keys(secs).forEach(function(sec){
    var totalKey=secs[sec];
    var secMonthly=new Array(12).fill(0),secTotal=0;
    Object.keys(data[sec]).forEach(function(k){
      var item=data[sec][k];
      for(var i=0;i<12;i++) secMonthly[i]+=item.monthly[i];
      var t=0;for(var i=0;i<12;i++) t+=item.monthly[i];
      secTotal+=t;
    });
    TARGET_2026[totalKey]={total:secTotal,monthly:secMonthly};
    for(var i=0;i<12;i++) grandMonthly[i]+=secMonthly[i];
    grandTotal+=secTotal;
  });
  // trading
  Object.keys(data.trading).forEach(function(k){
    var item=data.trading[k];
    for(var i=0;i<12;i++) grandMonthly[i]+=item.monthly[i];
    var t=0;for(var i=0;i<12;i++) t+=item.monthly[i];
    grandTotal+=t;
  });
  TARGET_2026.grandTotal={total:grandTotal,monthly:grandMonthly};
  // sync section objects
  TARGET_2026.mt=_tgtClone(data.mt);
  TARGET_2026.amazon=_tgtClone(data.amazon);
  TARGET_2026.booth=_tgtClone(data.booth);
  TARGET_2026.online=_tgtClone(data.online);
  TARGET_2026.trading=_tgtClone(data.trading);
}

// Edit a cell inline
function _tgtEditCell(section,key,monthIdx,cellEl){
  var data=_getTargetData();
  var item=data[section][key];
  if(!item) return;
  var oldVal=item.monthly[monthIdx];
  var inp=document.createElement('input');
  inp.type='number';inp.value=oldVal;
  inp.style.cssText='width:90px;padding:3px 6px;font-size:12px;text-align:right;border:2px solid #4f46e5;border-radius:6px;outline:none;background:#eef2ff';
  cellEl.innerHTML='';cellEl.appendChild(inp);
  inp.focus();inp.select();
  function commit(){
    var v=parseFloat(inp.value)||0;
    item.monthly[monthIdx]=v;
    var total=0;for(var i=0;i<12;i++) total+=item.monthly[i];
    item.total=total;
    _saveTargetItem(section,key,item);
    _tgtRecalcTotals(_getTargetData());
    renderAdminTarget();
  }
  inp.addEventListener('blur',commit);
  inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();commit();}if(e.key==='Escape'){renderAdminTarget();}});
}

// Edit label inline
function _tgtEditLabel(section,key,cellEl){
  var data=_getTargetData();
  var item=data[section][key];
  if(!item) return;
  var oldLabel=item.label||key;
  var inp=document.createElement('input');
  inp.type='text';inp.value=oldLabel;
  inp.style.cssText='width:160px;padding:3px 6px;font-size:12px;border:2px solid #4f46e5;border-radius:6px;outline:none;background:#eef2ff';
  cellEl.innerHTML='';cellEl.appendChild(inp);
  inp.focus();inp.select();
  function commit(){
    var v=inp.value.trim();
    if(v&&v!==oldLabel){item.label=v;_saveTargetItem(section,key,item);}
    renderAdminTarget();
  }
  inp.addEventListener('blur',commit);
  inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();commit();}if(e.key==='Escape'){renderAdminTarget();}});
}

// Delete item
function _tgtDeleteItem(section,key){
  var data=_getTargetData();
  var item=data[section][key];
  var label=item?(item.label||key):key;
  if(!confirm('ลบ "'+label+'" ออกจาก Target?')) return;
  _saveTargetItem(section,key,null,true);
  _tgtRecalcTotals(_getTargetData());
  renderAdminTarget();
}

// Add new item
function _tgtAddItem(section){
  var name=prompt('ชื่อช่องทาง/สาขาใหม่:');
  if(!name||!name.trim()) return;
  name=name.trim();
  var data=_getTargetData();
  var key=name.replace(/\s+/g,'_');
  if(data[section][key]||data[section][name]){alert('มีชื่อนี้อยู่แล้ว');return;}
  var item={total:0,monthly:[0,0,0,0,0,0,0,0,0,0,0,0]};
  if(section==='amazon') item.label=name;
  data[section][key]=item;
  _saveTargetItem(section,key,item);
  _tgtRecalcTotals(_getTargetData());
  renderAdminTarget();
}

// Reset all overrides
function _tgtResetAll(){
  if(!confirm('รีเซ็ตข้อมูล Target ทั้งหมดกลับค่าเดิม?')) return;
  localStorage.removeItem(_TARGET_LS_KEY);
  // Restore original totals
  TARGET_2026.mt=_tgtClone({
    CJ:{total:415000000,monthly:[29000000,32000000,32300000,33000000,33000000,33000000,34700000,35000000,35000000,36000000,40000000,42000000]},
    BigC:{total:200000000,monthly:[10000000,13000000,13500000,14000000,15000000,15000000,17000000,17000000,18000000,19500000,23000000,25000000]},
    Top:{total:7000000,monthly:[30000,30000,80000,250000,400000,400000,700000,700000,700000,1000000,1000000,1710000]},
    Makro:{total:13740000,monthly:[70000,70000,700000,1000000,1000000,1000000,1200000,1400000,1500000,1800000,2000000,2000000]},
    Aeon:{total:2000000,monthly:[80000,80000,80000,100000,100000,100000,160000,200000,200000,300000,300000,300000]},
    TheMall:{total:995000,monthly:[50000,50000,50000,80000,80000,80000,95000,95000,95000,100000,100000,120000]},
    MM:{total:500000,monthly:[10000,10000,10000,20000,20000,20000,50000,50000,50000,80000,80000,100000]}
  });
  _tgtRecalcTotals(_getTargetData());
  renderAdminTarget();
}

// ── Main render ──
function renderAdminTarget(){
  var el=document.getElementById('adminTargetBody');
  if(!el||typeof TARGET_2026==='undefined') return;
  var data=_getTargetData();
  _tgtRecalcTotals(data);
  var TH=TARGET_2026.MONTHS_TH;
  var hasOverrides=!!localStorage.getItem(_TARGET_LS_KEY);
  var html='';

  function _tbl(title,icon,section,labelFn){
    var secData=data[section];
    var keys=Object.keys(secData);
    var h='<div style="margin-top:24px">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px">';
    h+='<div style="font-size:14px;font-weight:700;color:#1d4ed8">'+icon+' '+title+' ('+keys.length+')</div>';
    h+='<button class="admin-btn add" onclick="_tgtAddItem(\''+section+'\')" style="font-size:11px;padding:4px 12px">➕ เพิ่ม</button>';
    h+='</div>';
    h+='<div class="table-wrap"><table><thead><tr><th style="min-width:100px">ช่องทาง</th>';
    for(var i=0;i<12;i++) h+='<th style="text-align:right;font-size:11px;min-width:70px">'+TH[i]+'</th>';
    h+='<th style="text-align:right;font-weight:800;min-width:80px">รวมปี</th><th style="width:40px"></th></tr></thead><tbody>';
    var grandMonthly=new Array(12).fill(0),grandTotal=0;
    keys.forEach(function(k){
      var item=secData[k];
      var label=labelFn?labelFn(k,item):k;
      h+='<tr>';
      h+='<td style="white-space:nowrap;cursor:pointer" onclick="_tgtEditLabel(\''+section+'\',\''+k.replace(/'/g,"\\'")+'\',this)" title="คลิกเพื่อแก้ไขชื่อ"><strong>'+label+'</strong> <span style="font-size:9px;color:#94a3b8">✏️</span></td>';
      for(var i=0;i<12;i++){
        var v=item.monthly[i];
        grandMonthly[i]+=v;
        h+='<td style="text-align:right;font-size:11px;cursor:pointer;padding:4px 6px" onclick="_tgtEditCell(\''+section+'\',\''+k.replace(/'/g,"\\'")+'\','+i+',this)" title="คลิกเพื่อแก้ไข">'+Math.round(v).toLocaleString('th-TH')+'</td>';
      }
      var rowTotal=0;for(var i=0;i<12;i++) rowTotal+=item.monthly[i];
      grandTotal+=rowTotal;
      h+='<td style="text-align:right;font-weight:700;font-size:12px">'+fmtTargetM(rowTotal)+'</td>';
      h+='<td style="text-align:center"><button onclick="_tgtDeleteItem(\''+section+'\',\''+k.replace(/'/g,"\\'")+'\')\" style="background:none;border:none;cursor:pointer;font-size:14px;color:#dc2626;padding:2px" title="ลบ">🗑️</button></td>';
      h+='</tr>';
    });
    h+='<tr class="tr-total"><td>รวม</td>';
    for(var i=0;i<12;i++) h+='<td style="text-align:right;font-size:11px">'+Math.round(grandMonthly[i]).toLocaleString('th-TH')+'</td>';
    h+='<td style="text-align:right;font-weight:800">'+fmtTargetM(grandTotal)+'</td><td></td></tr>';
    h+='</tbody></table></div></div>';
    return h;
  }

  // Grand total summary
  html+='<div style="margin:16px 0;padding:16px 20px;background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:12px;color:#fff">';
  html+='<div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:10px">';
  html+='<div>';
  html+='<div style="font-size:13px;opacity:.8">เป้าหมายรวมทั้งปี 2026</div>';
  html+='<div style="font-size:28px;font-weight:800;margin-top:4px">'+fmtTargetM(TARGET_2026.grandTotal.total)+'</div>';
  html+='<div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:10px;font-size:12px">';
  html+='<span>MT: '+fmtTargetM(TARGET_2026.mtTotal.total)+'</span>';
  html+='<span>Amazon: '+fmtTargetM(TARGET_2026.amazonTotal.total)+'</span>';
  html+='<span>Booth: '+fmtTargetM(TARGET_2026.boothTotal.total)+'</span>';
  html+='<span>Online: '+fmtTargetM(TARGET_2026.onlineTotal.total)+'</span>';
  var tradingTotal=0;Object.keys(data.trading).forEach(function(k){for(var i=0;i<12;i++) tradingTotal+=data.trading[k].monthly[i];});
  html+='<span>Trading: '+fmtTargetM(tradingTotal)+'</span>';
  html+='</div></div>';
  if(hasOverrides){
    html+='<button onclick="_tgtResetAll()" style="background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);color:#fff;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600">↺ รีเซ็ตกลับค่าเดิม</button>';
  }
  html+='</div></div>';

  if(hasOverrides){
    html+='<div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:8px 14px;margin-bottom:8px;font-size:12px;color:#92400e">⚠️ มีการแก้ไขข้อมูล Target — การเปลี่ยนแปลงจะถูกเก็บใน localStorage</div>';
  }
  html+='<div style="font-size:11px;color:var(--muted);margin-bottom:4px">💡 <strong>คลิกที่ตัวเลข</strong>เพื่อแก้ไข | คลิกชื่อเพื่อเปลี่ยนชื่อ | 🗑️ ลบรายการ | ➕ เพิ่มรายการใหม่</div>';

  html+=_tbl('Modern Trade','🏪','mt');
  html+=_tbl('Amazon & ร้านของฝาก','📦','amazon',function(k,item){return item.label||k;});
  html+=_tbl('Booth','🏬','booth');
  html+=_tbl('Online','🌐','online');
  html+=_tbl('Trading','🤝','trading');

  el.innerHTML=html;
}

// ══════════════════════════════════════
// Overview: Target Dashboard (ov-target)
// ══════════════════════════════════════
function _ovTargetToggleFilter(hide){
  var sel='[data-preset="thismonth"],[data-preset="lastmonth"],[data-preset="3months"],#quarterDropdown';
  var seps=document.querySelectorAll('#quickPeriodBtns .filter-sep');
  document.querySelectorAll(sel).forEach(function(b){b.style.display=hide?'none':'';});
  if(seps[0]) seps[0].style.display=hide?'none':'';
}

function renderOvTarget(){
  _ovTargetToggleFilter(true);
  var el=document.getElementById('ovTargetContent');
  if(!el||typeof TARGET_2026==='undefined') return;

  var yr=typeof _currentYearCE!=='undefined'?_currentYearCE:2026;
  var tgt;
  if(yr===2026){
    tgt=_getTargetData();
    _tgtRecalcTotals(tgt);
  } else {
    var raw=getTargetByYear(yr);
    tgt={mt:raw.mt,amazon:raw.amazon,booth:raw.booth,online:raw.online,trading:raw.trading||{}};
  }
  var base=getTargetByYear(yr);
  var TH=TARGET_2026.MONTHS_TH;
  var MONTHS_12=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var yearBE=yr+543;

  // Period filter — use currentMonth from app.js
  var selMonths=(typeof _resolveMonths==='function')?_resolveMonths():MONTHS_12.slice(0,6);
  var selIndices=selMonths.map(function(m){return MONTHS_12.indexOf(m);}).filter(function(i){return i>=0;});
  var isYTD=(typeof currentMonth!=='undefined'&&currentMonth==='YTD');

  // Period label
  var periodLabel;
  if(isYTD){
    periodLabel='YTD ('+TH[selIndices[0]]+'–'+TH[selIndices[selIndices.length-1]]+')';
  } else if(selIndices.length===1){
    periodLabel=TH[selIndices[0]];
  } else if(selIndices.length===12){
    periodLabel='ทั้งปี';
  } else {
    periodLabel=TH[selIndices[0]]+'–'+TH[selIndices[selIndices.length-1]];
  }

  var sections=[
    {key:'mt',title:'Modern Trade',icon:'🏪',color:'#4f46e5',total:base.mtTotal},
    {key:'amazon',title:'Amazon & ร้านของฝาก',icon:'📦',color:'#0891b2',total:base.amazonTotal},
    {key:'booth',title:'Booth',icon:'🏬',color:'#f56e00',total:base.boothTotal},
    {key:'online',title:'Online',icon:'🌐',color:'#10b981',total:base.onlineTotal}
  ];
  if(tgt.trading&&Object.keys(tgt.trading).length) sections.push({key:'trading',title:'Trading',icon:'🤝',color:'#8b5cf6',total:null});

  // Full year monthly totals (for chart)
  var grandMonthly=new Array(12).fill(0);
  sections.forEach(function(sec){
    var d=tgt[sec.key]||{};
    Object.keys(d).forEach(function(k){
      for(var i=0;i<12;i++) grandMonthly[i]+=(d[k].monthly[i]||0);
    });
  });
  var grandTotalYear=grandMonthly.reduce(function(s,v){return s+v;},0);

  // Period-filtered sum helper
  function _sumPeriod(monthlyArr){
    var s=0;
    selIndices.forEach(function(i){s+=(monthlyArr[i]||0);});
    return s;
  }

  // Period-filtered grand total
  var grandTotalPeriod=_sumPeriod(grandMonthly);
  var avgPerMonth=selIndices.length?Math.round(grandTotalPeriod/selIndices.length):0;

  var html='';

  // Header
  html+='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">';
  html+='<div>';
  html+='<h2 style="margin:0;font-size:20px;color:var(--text)">🎯 เป้าหมายยอดขาย ปี '+yearBE+'</h2>';
  html+='<p style="margin:4px 0 0;font-size:13px;color:var(--text2)">ข้อมูลเป้าหมายรายช่องทาง รายเดือน — ซิงค์กับแผงแอดมิน</p>';
  html+='</div>';
  var badges='';
  if(yr===2026&&localStorage.getItem(_TARGET_LS_KEY)){
    badges+='<span style="background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;border:1px solid #fbbf24;margin-right:6px">✏️ แก้ไขจากแอดมิน</span>';
  }
  badges+='<span style="background:#eff6ff;color:#1e40af;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;border:1px solid #93c5fd">📅 '+periodLabel+'</span>';
  html+=badges;
  html+='</div>';

  // Grand KPI cards
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:24px">';
  html+='<div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:14px;padding:18px;color:#fff">';
  html+='<div style="font-size:12px;opacity:.8">เป้าหมายช่วงเลือก</div>';
  html+='<div style="font-size:26px;font-weight:800;margin-top:4px">'+fmtTargetM(grandTotalPeriod)+'</div>';
  html+='<div style="font-size:11px;opacity:.7;margin-top:4px">'+periodLabel+' '+yearBE+' ('+selIndices.length+' เดือน)</div>';
  html+='</div>';
  html+='<div style="background:linear-gradient(135deg,#f56e00,#fb923c);border-radius:14px;padding:18px;color:#fff">';
  html+='<div style="font-size:12px;opacity:.8">เป้าหมายรวมทั้งปี</div>';
  html+='<div style="font-size:26px;font-weight:800;margin-top:4px">'+fmtTargetM(grandTotalYear)+'</div>';
  html+='<div style="font-size:11px;opacity:.7;margin-top:4px">'+yearBE+' (12 เดือน)</div>';
  html+='</div>';
  html+='<div style="background:linear-gradient(135deg,#0891b2,#22d3ee);border-radius:14px;padding:18px;color:#fff">';
  html+='<div style="font-size:12px;opacity:.8">เฉลี่ยต่อเดือน</div>';
  html+='<div style="font-size:26px;font-weight:800;margin-top:4px">'+fmtTargetM(avgPerMonth)+'</div>';
  html+='<div style="font-size:11px;opacity:.7;margin-top:4px">เป้าช่วงเลือก ÷ '+selIndices.length+' เดือน</div>';
  html+='</div>';

  // Per-channel mini KPIs (period-filtered)
  sections.forEach(function(sec){
    var secData=tgt[sec.key]||{};
    var st=0;
    Object.keys(secData).forEach(function(k){st+=_sumPeriod(secData[k].monthly);});
    var pct=grandTotalPeriod?(st/grandTotalPeriod*100):0;
    html+='<div style="background:var(--surface);border-radius:14px;padding:18px;border:1px solid var(--border);border-left:4px solid '+sec.color+'">';
    html+='<div style="font-size:12px;color:var(--text2)">'+sec.icon+' '+sec.title+'</div>';
    html+='<div style="font-size:22px;font-weight:800;color:var(--text);margin-top:4px">'+fmtTargetM(st)+'</div>';
    html+='<div style="font-size:11px;color:'+sec.color+';margin-top:4px;font-weight:600">'+pct.toFixed(1)+'% ของเป้าช่วงเลือก</div>';
    html+='</div>';
  });
  html+='</div>';

  // Monthly bar chart via canvas
  html+='<div style="background:var(--surface);border-radius:14px;padding:20px;border:1px solid var(--border);margin-bottom:20px">';
  html+='<h3 style="margin:0 0 14px;font-size:15px;color:var(--text)">📊 เป้าหมายรายเดือน</h3>';
  html+='<canvas id="ovTargetMonthlyChart" height="260" style="width:100%"></canvas>';
  html+='</div>';

  // Breakdown tables per section
  sections.forEach(function(sec){
    var secData=tgt[sec.key]||{};
    var keys=Object.keys(secData);
    if(!keys.length) return;

    html+='<div style="background:var(--surface);border-radius:14px;padding:18px;border:1px solid var(--border);margin-bottom:16px">';
    html+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">';
    html+='<span style="font-size:18px">'+sec.icon+'</span>';
    html+='<h3 style="margin:0;font-size:15px;color:var(--text)">'+sec.title+' <span style="font-size:12px;color:var(--text2);font-weight:400">('+keys.length+' ช่องทาง)</span></h3>';
    html+='</div>';
    html+='<div style="overflow-x:auto"><table class="data-table"><thead><tr>';
    html+='<th style="min-width:120px;text-align:left">ช่องทาง</th>';
    for(var i=0;i<12;i++) html+='<th style="text-align:right;font-size:11px;min-width:75px">'+TH[i]+'</th>';
    html+='<th style="text-align:right;font-weight:800;min-width:85px">รวมปี</th>';
    html+='</tr></thead><tbody>';

    var secMonthly=new Array(12).fill(0), secTotal=0;
    keys.forEach(function(k){
      var item=secData[k];
      var label=item.label||k;
      var rowTotal=0;
      html+='<tr><td style="font-weight:600;white-space:nowrap">'+label+'</td>';
      for(var i=0;i<12;i++){
        var v=item.monthly[i]||0;
        secMonthly[i]+=v;
        rowTotal+=v;
        var isSelected=selIndices.indexOf(i)>=0;
        var cellStyle='text-align:right;font-size:11px;font-variant-numeric:tabular-nums';
        if(!isSelected) cellStyle+=';opacity:0.35';
        html+='<td style="'+cellStyle+'">'+Math.round(v).toLocaleString('th-TH')+'</td>';
      }
      secTotal+=rowTotal;
      html+='<td style="text-align:right;font-weight:700;color:'+sec.color+'">'+fmtTargetM(rowTotal)+'</td></tr>';
    });

    html+='<tr style="background:var(--surface2);font-weight:700"><td>รวม '+sec.title+'</td>';
    for(var i=0;i<12;i++){
      var isSelected=selIndices.indexOf(i)>=0;
      var sumStyle='text-align:right;font-size:11px';
      if(!isSelected) sumStyle+=';opacity:0.35';
      html+='<td style="'+sumStyle+'">'+Math.round(secMonthly[i]).toLocaleString('th-TH')+'</td>';
    }
    html+='<td style="text-align:right;font-weight:800;color:'+sec.color+'">'+fmtTargetM(secTotal)+'</td></tr>';
    html+='</tbody></table></div></div>';
  });

  // Grand total monthly summary
  html+='<div style="background:linear-gradient(135deg,#eff6ff,#f0f9ff);border-radius:14px;padding:18px;border:1px solid #93c5fd;margin-bottom:16px">';
  html+='<h3 style="margin:0 0 12px;font-size:15px;color:#1e40af">📋 สรุปเป้าหมายรวมรายเดือน</h3>';
  html+='<div style="overflow-x:auto"><table class="data-table"><thead><tr><th style="text-align:left">ช่องทาง</th>';
  for(var i=0;i<12;i++) html+='<th style="text-align:right;font-size:11px">'+TH[i]+'</th>';
  html+='<th style="text-align:right;font-weight:800">รวมปี</th></tr></thead><tbody>';

  sections.forEach(function(sec){
    var secData=tgt[sec.key]||{};
    var sm=new Array(12).fill(0), st=0;
    Object.keys(secData).forEach(function(k){for(var i=0;i<12;i++){sm[i]+=(secData[k].monthly[i]||0);}});
    st=sm.reduce(function(s,v){return s+v;},0);
    html+='<tr><td style="font-weight:600">'+sec.icon+' '+sec.title+'</td>';
    for(var i=0;i<12;i++){
      var isSelected=selIndices.indexOf(i)>=0;
      var smStyle='text-align:right;font-size:11px;font-variant-numeric:tabular-nums';
      if(!isSelected) smStyle+=';opacity:0.35';
      html+='<td style="'+smStyle+'">'+fmtTargetM(sm[i])+'</td>';
    }
    html+='<td style="text-align:right;font-weight:700;color:'+sec.color+'">'+fmtTargetM(st)+'</td></tr>';
  });

  html+='<tr style="background:#dbeafe;font-weight:800"><td>🏆 รวมทั้งหมด</td>';
  for(var i=0;i<12;i++){
    var isSelected=selIndices.indexOf(i)>=0;
    var tdStyle='text-align:right;font-size:12px';
    if(!isSelected) tdStyle+=';opacity:0.35';
    html+='<td style="'+tdStyle+'">'+fmtTargetM(grandMonthly[i])+'</td>';
  }
  html+='<td style="text-align:right;font-size:14px;color:#4f46e5">'+fmtTargetM(grandTotalYear)+'</td></tr>';
  html+='</tbody></table></div></div>';

  el.innerHTML=html;

  // Draw monthly chart with period highlighting
  _ovTargetDrawChart(grandMonthly, sections, tgt, TH, selIndices);
}

function _ovTargetDrawChart(grandMonthly, sections, tgt, TH, selIndices){
  var canvas=document.getElementById('ovTargetMonthlyChart');
  if(!canvas) return;
  var ctx=canvas.getContext('2d');
  var w=canvas.width=canvas.parentElement.clientWidth-40;
  var h=canvas.height=260;
  ctx.clearRect(0,0,w,h);

  var maxVal=Math.max.apply(null,grandMonthly)||1;
  maxVal=Math.ceil(maxVal/10000000)*10000000;
  var chartH=h-50, startX=55, chartW=w-startX-10;
  var barGroupW=chartW/12;
  var colors=['#4f46e5','#0891b2','#f56e00','#10b981','#8b5cf6'];
  var textColor=getComputedStyle(document.documentElement).getPropertyValue('--text2')||'#666';
  var gridColor=getComputedStyle(document.documentElement).getPropertyValue('--border')||'#ddd';

  // Grid lines
  ctx.strokeStyle=gridColor; ctx.lineWidth=1;
  for(var g=0;g<=5;g++){
    var y=10+chartH-chartH*g/5;
    ctx.beginPath(); ctx.moveTo(startX,y); ctx.lineTo(w-10,y); ctx.stroke();
    ctx.fillStyle=textColor; ctx.font='10px sans-serif'; ctx.textAlign='right';
    ctx.fillText(fmtTargetM(Math.round(maxVal*g/5)),startX-5,y+3);
  }

  // Stacked bars
  var allSelected=!selIndices||selIndices.length===12;
  for(var m=0;m<12;m++){
    var x=startX+m*barGroupW;
    var barW=barGroupW*0.6;
    var bx=x+(barGroupW-barW)/2;
    var yBottom=10+chartH;
    var isSel=allSelected||(selIndices&&selIndices.indexOf(m)>=0);
    ctx.globalAlpha=isSel?1:0.25;
    sections.forEach(function(sec,si){
      var secData=tgt[sec.key]||{};
      var val=0;
      Object.keys(secData).forEach(function(k){val+=(secData[k].monthly[m]||0);});
      var barH=(val/maxVal)*chartH;
      ctx.fillStyle=colors[si%colors.length];
      ctx.fillRect(bx,yBottom-barH,barW,barH);
      yBottom-=barH;
    });
    ctx.globalAlpha=1;
    // Month label
    ctx.fillStyle=textColor; ctx.font='11px sans-serif'; ctx.textAlign='center';
    ctx.fillText(TH[m],bx+barW/2,h-5);
  }

  // Legend
  var lx=startX;
  sections.forEach(function(sec,si){
    ctx.fillStyle=colors[si%colors.length];
    ctx.fillRect(lx,h-25,10,10);
    ctx.fillStyle=textColor; ctx.font='10px sans-serif'; ctx.textAlign='left';
    ctx.fillText(sec.title,lx+14,h-16);
    lx+=ctx.measureText(sec.title).width+28;
  });
}
