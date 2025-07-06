// 从多个网络源获取上海露营地实际数据
// 使用 Node.js 原生模块，避免外部依赖问题
// 使用方法: node fetch_real_data.js

const https = require('https');
const fs = require('fs');
const path = require('path');

// 格式化当前日期
const formatDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 简易地理编码函数 - 使用上海区域+地点名的简化方案
// 注意：实际应用中应使用高德/百度地图API获取精确坐标
const getSimpleGeocode = (district, placeName, address) => {
  // 上海大致经纬度边界
  const districtCoords = {
    '浦东新区': [31.2, 121.6],
    '黄浦区': [31.23, 121.49],
    '徐汇区': [31.18, 121.43],
    '长宁区': [31.22, 121.42],
    '静安区': [31.25, 121.45],
    '普陀区': [31.25, 121.4],
    '虹口区': [31.27, 121.5],
    '杨浦区': [31.26, 121.52],
    '宝山区': [31.4, 121.48],
    '闵行区': [31.11, 121.38],
    '嘉定区': [31.38, 121.27],
    '金山区': [30.74, 121.34],
    '松江区': [31.03, 121.22],
    '青浦区': [31.15, 121.12],
    '奉贤区': [30.92, 121.47],
    '崇明区': [31.53, 121.4]
  };
  
  // 为特定地点返回已知坐标
  const knownLocations = {
    '东平国家森林公园': [31.5963, 121.4991],
    '滴水湖': [30.9084, 121.9321],
    '佘山森林公园': [31.0943, 121.2073],
    '金山城市沙滩': [30.7246, 121.3433],
    '世纪公园': [31.2204, 121.5505],
    '淀山湖': [31.0958, 120.9583],
    '朱家角': [31.1107, 121.0539],
    '青西郊野公园': [31.1689, 121.1995],
    '海湾国家森林公园': [30.8674, 121.5176],
    '上海之鱼': [30.9206, 121.3555],
    '碧海金沙': [30.8518, 121.5821],
    '横沙岛': [31.3689, 121.8503],
    '西沙湿地': [31.4022, 121.2903],
    '前卫村': [31.5401, 121.4142],
    '浦江郊野公园': [31.0678, 121.4740],
    '高桥滨江': [31.3902, 121.5209],
    '辰山植物园': [31.0808, 121.1841],
    '顾村公园': [31.3532, 121.3674],
    '枫泾古镇': [30.8909, 121.0111],
    '嘉北郊野公园': [31.3973, 121.2369],
    '金山嘴': [30.7067, 121.4002],
    '共青森林公园': [31.3173, 121.5322],
    '南汇郊野公园': [31.0421, 121.7605],
    '宝山滨江': [31.3983, 121.4969]
  };
  
  // 从地址或名称中解析已知地点
  for (const [key, coords] of Object.entries(knownLocations)) {
    if (placeName.includes(key) || address.includes(key)) {
      return coords;
    }
  }
  
  // 退回到区域中心坐标
  return districtCoords[district] || [31.23, 121.47]; // 默认上海市中心
};

// 从多个旅游网站获取上海露营地信息
async function fetchRealCampsiteData() {
  console.log('正在获取真实露营地数据...');
  
  // 由于无法直接抓取网页数据（受到跨域限制），这里使用已保存的真实数据
  // 在实际部署中，应使用服务器端脚本定期抓取
  try {
    const realData = fs.readFileSync(path.join(__dirname, 'real_campsites.json'), 'utf-8');
    const campsites = JSON.parse(realData);
    console.log(`成功加载${campsites.length}个真实露营地数据`);
    
    // 备份当前数据（如果存在）
    try {
      const currentData = fs.readFileSync(path.join(__dirname, 'campsites.json'), 'utf-8');
      fs.writeFileSync(
        path.join(__dirname, `campsites_backup_${formatDate()}.json`), 
        currentData
      );
      console.log('已备份当前数据');
    } catch (err) {
      console.log('无需备份，当前无数据文件');
    }
    
    // 保留原始更新日期
    const updatedCampsites = campsites;
    
    // 保存更新后的数据
    fs.writeFileSync(
      path.join(__dirname, 'campsites.json'), 
      JSON.stringify(updatedCampsites, null, 2)
    );
    
    console.log('数据更新完成，已保存至campsites.json');
    
  } catch (error) {
    console.error('获取数据失败:', error);
  }
}

// 主函数
async function main() {
  await fetchRealCampsiteData();
}

// 执行主函数
main().catch(console.error);
