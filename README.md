# 旷野 - 上海露营地查找

一个简单易用的网页应用，用于查找上海及周边地区的露营地信息。

## 功能特点

- 搜索露营地名称或位置
- 根据设施类型（明火、过夜、洗手间等）筛选露营地
- 显示每个露营地的详细信息，包括地址、设施和网址链接
- 数据每天自动更新

## 技术栈

- 前端：HTML, CSS, JavaScript
- 数据抓取：Node.js, Puppeteer
- 部署选项：GitHub Pages, Netlify, Render (服务端支持)

## 本地运行

1. 克隆仓库
2. 安装依赖：
   ```
   npm install
   ```
3. 启动服务器：
   ```
   npm start
   ```
   或使用开发模式（仅静态文件）：
   ```
   npm run dev
   ```
4. 访问 http://localhost:3000

## 数据更新

数据通过以下脚本更新：
- `scrape_campsites.js` - 从旅游网站抓取露营地信息
- `fetch_real_data.js` - 从已保存的真实数据集更新信息

数据每天凌晨1点自动更新。

## 部署到Render

1. 注册 [Render](https://render.com) 账户
2. 连接您的GitHub仓库
3. 点击 "New Web Service"
4. 选择仓库并使用以下设置：
   - 环境: Node
   - 构建命令: `npm install`
   - 启动命令: `npm start`
   - 实例类型: Free
5. 点击 "Create Web Service"

部署完成后，您可以通过分配的URL访问您的网站。服务器会自动运行数据爬取脚本并每天更新数据。
