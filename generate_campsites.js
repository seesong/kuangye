// 露营地数据生成脚本 - 无需外部依赖
// 使用方法：node generate_campsites.js
const fs = require('fs');

// 格式化当前日期
const formatDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 预定义的上海各区名称
const districts = [
  '浦东新区', '黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', 
  '虹口区', '杨浦区', '宝山区', '闵行区', '嘉定区', '金山区', 
  '松江区', '青浦区', '奉贤区', '崇明区'
];

// 预定义的设施类型
const allFacilities = [
  'bathroom', 'shower', 'electricity', 'water', 
  'bbq', 'fire', 'overnight', 'shade', 'lifeguard'
];

// 营地名称模板
const campNameTemplates = [
  '{district}森林公园营地',
  '{district}湖畔露营基地',
  '{district}郊野公园营地',
  '{district}帐篷露营地',
  '{location}露营公园',
  '{location}野奢露营',
  '{location}星空营地',
  '{location}度假营地',
  '{district}亲子露营基地',
  '{district}自然营地'
];

// 每个区域的具体地点及其经纬度
const districtLocations = {
  '浦东新区': [
    { name: '滴水湖', address: '浦东新区南汇新城镇环湖西三路', latlng: [30.9084, 121.9321] },
    { name: '高桥滨江', address: '浦东新区高桥镇扬高路滨江段', latlng: [31.3902, 121.5209] },
    { name: '世纪公园', address: '浦东新区锦绣路1001号', latlng: [31.2204, 121.5505] },
    { name: '南汇郊野公园', address: '浦东新区惠南镇拱极路2000号', latlng: [31.0421, 121.7605] }
  ],
  '松江区': [
    { name: '佘山森林公园', address: '松江区佘山林荫大道900号', latlng: [31.0943, 121.2073] },
    { name: '辰山植物园', address: '松江区辰花公路3888号', latlng: [31.0808, 121.1841] },
    { name: '醉白池公园', address: '松江区人民北路2号', latlng: [31.0234, 121.2271] }
  ],
  '金山区': [
    { name: '金山城市沙滩', address: '金山区山阳镇海波路333号', latlng: [30.7246, 121.3433] },
    { name: '金山嘴渔村', address: '金山区漕泾镇金山嘴村', latlng: [30.7067, 121.4002] },
    { name: '枫泾古镇', address: '金山区枫泾镇兴枫路', latlng: [30.8909, 121.0111] }
  ],
  '青浦区': [
    { name: '淀山湖', address: '青浦区金商公路333号', latlng: [31.0958, 120.9583] },
    { name: '朱家角古镇', address: '青浦区朱家角镇西井街82号', latlng: [31.1107, 121.0539] },
    { name: '青西郊野公园', address: '青浦区华新镇嘉松中路4665号', latlng: [31.1689, 121.1995] }
  ],
  '奉贤区': [
    { name: '海湾国家森林公园', address: '奉贤区海湾镇随塘河路1677号', latlng: [30.8674, 121.5176] },
    { name: '上海之鱼生态园', address: '奉贤区庄行镇光明村', latlng: [30.9206, 121.3555] },
    { name: '碧海金沙', address: '奉贤区海湾旅游区海湾路', latlng: [30.8518, 121.5821] }
  ],
  '崇明区': [
    { name: '东平国家森林公园', address: '崇明区东平镇东平林场', latlng: [31.5963, 121.4991] },
    { name: '前卫村', address: '崇明区庙镇前卫村', latlng: [31.5401, 121.4142] },
    { name: '横沙岛生态营地', address: '崇明区横沙乡星月村', latlng: [31.3689, 121.8503] },
    { name: '西沙湿地', address: '崇明区新河镇陈家镇滨江大道', latlng: [31.4022, 121.2903] }
  ],
  '闵行区': [
    { name: '浦江郊野公园', address: '闵行区浦江镇江月路2578号', latlng: [31.0678, 121.4740] },
    { name: '马桥郊野公园', address: '闵行区马桥镇马环路2000号', latlng: [31.0297, 121.3255] }
  ],
  '宝山区': [
    { name: '顾村公园', address: '宝山区顾村镇沪太路4788号', latlng: [31.3532, 121.3674] },
    { name: '宝山滨江', address: '宝山区淞滨路2800号', latlng: [31.3983, 121.4969] }
  ],
  '嘉定区': [
    { name: '嘉定嘉北郊野公园', address: '嘉定区嘉北郊野公园', latlng: [31.3973, 121.2369] },
    { name: '马陆葡萄园', address: '嘉定区马陆镇丰产支路18号', latlng: [31.3284, 121.2606] }
  ]
};

// 为其他区域生成一些默认位置
districts.forEach(district => {
  if (!districtLocations[district]) {
    districtLocations[district] = [
      { name: `${district}公园`, address: `${district}某街道`, latlng: [31.1 + Math.random() * 0.6, 121.2 + Math.random() * 0.8] }
    ];
  }
});

// 生成随机经纬度 (上海大致范围)
const randomLatLng = () => {
  const lat = 31.1 + Math.random() * 0.6; // 上海纬度范围约 31.1-31.7
  const lng = 121.2 + Math.random() * 0.8; // 上海经度范围约 121.2-122.0
  return [parseFloat(lat.toFixed(4)), parseFloat(lng.toFixed(4))];
};

// 随机选择数组元素
const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 随机选择 n 个不同的元素
const randomPickN = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

// 生成新的露营地数据 - 更新版本，提供更准确的地理信息
const generateCampsite = () => {
  // 随机选择区域
  const district = randomPick(districts);
  
  // 从该区域选择实际地点
  const locationInfo = randomPick(districtLocations[district]);
  const { name: location, address, latlng } = locationInfo;
  
  // 生成完整地址，添加详细门牌号或地标
  const fullAddress = `${address}${Math.random() > 0.5 ? ` ${Math.floor(Math.random() * 300 + 1)}号附近` : ''}`;
  
  // 生成名称
  let template = randomPick(campNameTemplates);
  let name = template
    .replace('{district}', district)
    .replace('{location}', location);
  
  // 确保名称唯一
  if (Math.random() > 0.7) {
    name = location + randomPick(['露营地', '野营基地', '营地公园', '自驾营']);
  }
  
  // 为每个区域选择更合理的设施
  let facilities = [];
  
  // 基础设施大多数营地都会有
  if (Math.random() > 0.1) facilities.push('bathroom');
  if (Math.random() > 0.3) facilities.push('water');
  
  // 根据位置特点添加不同设施
  if (district === '金山区' || location.includes('沙滩') || location.includes('海')) {
    if (Math.random() > 0.3) facilities.push('lifeguard');
  }
  
  if (district === '崇明区' || location.includes('森林') || location.includes('郊野')) {
    if (Math.random() > 0.4) facilities.push('fire');
    if (Math.random() > 0.3) facilities.push('bbq');
  }
  
  // 高端场所更可能有淋浴和电力设施
  if (location.includes('公园') || location.includes('度假') || location.includes('野奢')) {
    if (Math.random() > 0.3) facilities.push('shower');
    if (Math.random() > 0.2) facilities.push('electricity');
  }
  
  // 露营基地一般可以过夜
  if (location.includes('营地') || location.includes('基地') || Math.random() > 0.5) {
    facilities.push('overnight');
  }
  
  // 如果设施太少，随机添加一些
  if (facilities.length < 3) {
    const additionalFacilities = randomPickN(
      allFacilities.filter(f => !facilities.includes(f)), 
      3 - facilities.length
    );
    facilities = [...facilities, ...additionalFacilities];
  }
  
  // 数据来源和日期
  const source = district.substring(0, 2) + "文旅";
  
  // 生成随机日期 (近30天内)
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const updated = formatDate(date);
  
  // 生成联系方式
  const contactType = Math.random() > 0.3 ? '电话' : '微信';
  let contact;
  
  if (contactType === '电话') {
    // 生成上海座机或手机号
    if (Math.random() > 0.5) {
      // 上海座机号 021-XXXXXXXX
      const officeNum = Math.floor(10000000 + Math.random() * 90000000).toString();
      contact = `021-${officeNum}`;
    } else {
      // 手机号 13/15/17/18/19XXXXXXXXX
      const prefixes = ['13', '15', '17', '18', '19'];
      const prefix = randomPick(prefixes);
      const mobileNum = Math.floor(100000000 + Math.random() * 900000000).toString();
      contact = `${prefix}${mobileNum}`;
    }
  } else {
    // 生成微信号
    const wxPrefixes = ['wx_', 'WX', 'camping_', ''];
    const wxPrefix = randomPick(wxPrefixes);
    const wxNum = Math.floor(10000 + Math.random() * 90000).toString();
    const wxSuffixes = ['', '_sh', '_camping', district.substring(0, 2)];
    const wxSuffix = randomPick(wxSuffixes);
    contact = `${wxPrefix}${location.substring(0, 2)}${wxNum}${wxSuffix}`;
  }

  return {
    name,
    location: district,
    address: fullAddress,
    latlng,
    facilities,
    source,
    updated,
    contact: `${contactType}: ${contact}`
  };
};

// 主函数 - 生成新数据并与现有数据合并
async function generateCampsites() {
  try {
    // 读取现有数据
    let existingData = [];
    try {
      const data = fs.readFileSync('./campsites.json', 'utf8');
      existingData = JSON.parse(data);
      console.log(`读取到${existingData.length}条已有露营地数据`);
    } catch (err) {
      console.log('未找到现有数据文件或解析错误，将创建新文件');
    }
    
    // 获取现有营地名称，避免重复
    const existingNames = new Set(existingData.map(camp => camp.name));
    
    // 生成10-15个新营地
    const newCount = Math.floor(Math.random() * 6) + 10;
    const newCampsites = [];
    
    console.log(`正在生成${newCount}个新露营地数据...`);
    
    for (let i = 0; i < newCount; i++) {
      let newCamp;
      do {
        newCamp = generateCampsite();
      } while (existingNames.has(newCamp.name)); // 确保名称不重复
      
      newCampsites.push(newCamp);
      existingNames.add(newCamp.name);
    }
    
    // 合并数据
    const allCampsites = [...existingData, ...newCampsites];
    
    // 检查和转换数据格式
    const normalizedCampsites = allCampsites.map(camp => {
      // 确保所有关键字段存在
      if (!camp.name || !camp.latlng || !camp.location) {
        console.warn('警告: 发现不完整的营地数据', camp);
      }
      
      // 确保facilities是数组
      if (!Array.isArray(camp.facilities)) {
        camp.facilities = [];
      }
      
      // 检查并移除fire/overnight为单独属性的旧格式
      if (camp.fire === true && !camp.facilities.includes('fire')) {
        camp.facilities.push('fire');
      }
      if (camp.overnight === true && !camp.facilities.includes('overnight')) {
        camp.facilities.push('overnight');
      }
      
      // 删除旧的布尔属性
      const { fire, overnight, ...rest } = camp;
      return rest;
    });
    
    // 备份旧数据
    if (existingData.length > 0) {
      fs.writeFileSync(
        `./campsites_backup_${formatDate()}.json`, 
        JSON.stringify(existingData, null, 2)
      );
      console.log('原数据已备份');
    }
    
    // 保存新数据
    fs.writeFileSync(
      './campsites.json', 
      JSON.stringify(normalizedCampsites, null, 2)
    );
    
    console.log(`成功生成并保存了${normalizedCampsites.length}条露营地数据`);
    console.log(`其中新增了${newCampsites.length}个营地`);
    
  } catch (error) {
    console.error('生成过程中出错:', error);
  }
}

// 执行主函数
generateCampsites();
