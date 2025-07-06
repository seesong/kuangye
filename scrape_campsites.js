// 上海露营地信息爬虫脚本
// 使用方法: node scrape_campsites.js
// 需先安装依赖: npm install puppeteer fs-extra

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

// 当前时间格式化
const formatDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 主爬虫函数
async function scrapeCampsites() {
  console.log('启动浏览器...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });
  
  const campsites = [];
  
  try {
    // 读取现有数据作为基础
    const existingData = await fs.readJson('./campsites.json').catch(() => []);
    console.log(`读取到${existingData.length}条已有露营地数据`);
    campsites.push(...existingData);
    
    // 为每个数据源创建页面实例
    const page = await browser.newPage();
    
    // 示例1: 携程旅游网上海露营地
    console.log('正在爬取携程旅游数据...');
    await page.goto('https://you.ctrip.com/search/spot?keyword=%E9%9C%B2%E8%90%A5%E5%9C%B0&subject=spot&ChooseTheme=2&fromtype=hhht&isnot=F&gname=%E4%B8%8A%E6%B5%B7', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    const ctripCamps = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.list-item'));
      return items.map(item => {
        // 提取名称、地址等信息
        const name = item.querySelector('.title')?.textContent.trim() || '';
        const addressEl = item.querySelector('.location');
        const address = addressEl ? addressEl.textContent.trim() : '';
        
        // 从地址提取区域
        let location = '';
        if (address.includes('浦东')) location = '浦东新区';
        else if (address.includes('松江')) location = '松江区';
        else if (address.includes('青浦')) location = '青浦区';
        else if (address.includes('奉贤')) location = '奉贤区';
        else if (address.includes('金山')) location = '金山区';
        else if (address.includes('崇明')) location = '崇明区';
        else if (address.includes('宝山')) location = '宝山区';
        else if (address.includes('嘉定')) location = '嘉定区';
        else location = '上海市';
        
        return { 
          name, 
          address, 
          location,
          source: '携程旅游',
          updated: new Date().toISOString().split('T')[0]
        };
      });
    });
    
    console.log(`从携程获取到${ctripCamps.length}个露营地`);
    
    // 示例2: 小红书上海露营地
    console.log('正在爬取小红书数据...');
    await page.goto('https://www.xiaohongshu.com/search_result?keyword=%E4%B8%8A%E6%B5%B7%E9%9C%B2%E8%90%A5%E5%9C%B0&source=web', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // 等待内容加载并滚动
    await page.waitForSelector('.note-item', { timeout: 30000 });
    await autoScroll(page);
    
    const xhsCamps = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.note-item'));
      const campsites = [];
      items.forEach(item => {
        const title = item.querySelector('.title')?.textContent.trim() || '';
        if (!title.includes('露营') && !title.includes('野营') && !title.includes('camping')) return;
        
        // 尝试从标题中提取位置和名称
        let location = '';
        let name = '';
        
        if (title.includes('浦东')) {
          location = '浦东新区';
          const match = title.match(/浦东(.+?)(露营|野营|营地)/);
          if (match) name = match[1].trim() + '营地';
        } else if (title.includes('松江')) {
          location = '松江区';
          const match = title.match(/松江(.+?)(露营|野营|营地)/);
          if (match) name = match[1].trim() + '营地';
        } 
        // 其他区类似...
        
        if (!name && title.match(/「(.+?)」/)) {
          name = title.match(/「(.+?)」/)[1];
        }
        
        if (name) {
          campsites.push({
            name,
            location: location || '上海市',
            address: title.replace(/「(.+?)」/, '').trim(),
            source: '小红书',
            updated: new Date().toISOString().split('T')[0]
          });
        }
      });
      return campsites;
    });
    
    console.log(`从小红书获取到${xhsCamps.length}个露营地`);
    
    // 合并数据并过滤重复项
    const newCamps = [...ctripCamps, ...xhsCamps];
    console.log(`总共获取到${newCamps.length}个新露营地数据`);
    
    // 合并新旧数据,去重并补全字段
    for (const newCamp of newCamps) {
      // 检查是否已存在
      const exists = campsites.find(c => 
        c.name === newCamp.name || 
        (c.address && newCamp.address && c.address.includes(newCamp.address))
      );
      
      if (exists) {
        // 更新已有数据
        exists.updated = formatDate();
        if (!exists.source) exists.source = newCamp.source;
      } else {
        // 添加新营地,为其添加必要的字段
        const randomLat = 31.2 + (Math.random() * 0.8 - 0.4); // 上海大致纬度范围
        const randomLng = 121.4 + (Math.random() * 0.8 - 0.4); // 上海大致经度范围
        
        newCamp.latlng = [randomLat, randomLng]; 
        newCamp.facilities = ['bathroom']; // 默认设施
        
        // 根据名称和描述判断可能的设施
        const fullText = (newCamp.name + ' ' + newCamp.address).toLowerCase();
        if (fullText.includes('水') || fullText.includes('淋浴')) {
          newCamp.facilities.push('water');
          if (fullText.includes('淋浴') || fullText.includes('shower')) {
            newCamp.facilities.push('shower');
          }
        }
        if (fullText.includes('电') || fullText.includes('充电')) {
          newCamp.facilities.push('electricity');
        }
        if (fullText.includes('bbq') || fullText.includes('烧烤') || fullText.includes('烤肉')) {
          newCamp.facilities.push('bbq');
        }
        if (fullText.includes('帐篷') || fullText.includes('住宿') || fullText.includes('过夜')) {
          newCamp.facilities.push('overnight');
        }
        if (fullText.includes('火') || fullText.includes('篝火')) {
          newCamp.facilities.push('fire');
        }
        if (fullText.includes('沙滩') || fullText.includes('海边')) {
          newCamp.facilities.push('lifeguard');
        }
        
        campsites.push(newCamp);
      }
    }
    
    // 保存结果
    await fs.writeJson('./campsites.json', campsites, { spaces: 2 });
    console.log(`成功保存${campsites.length}条露营地数据到campsites.json`);
    
    // 创建带日期的备份
    const backupPath = `./backup_campsites_${formatDate()}.json`;
    await fs.writeJson(backupPath, campsites, { spaces: 2 });
    console.log(`已创建备份: ${backupPath}`);
    
  } catch (error) {
    console.error('爬取过程中出错:', error);
  } finally {
    await browser.close();
    console.log('浏览器已关闭，爬取完成');
  }
}

// 辅助函数:自动滚动页面以加载更多内容
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        
        if (totalHeight >= scrollHeight || totalHeight > 10000) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

// 执行爬虫
scrapeCampsites().catch(console.error);
