# 🎯 面试刷题宝典 (Smart Interview Practice Hub)

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=flat-square&logo=next.design)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Gemini](https://img.shields.io/badge/Powered_by-Gemini_AI-6b11ff?style=flat-square&logo=google-gemini)](https://ai.google.dev/)

面试刷题宝典是一款**移动端首选设计**、多维能力聚合、支持离线/备份的 **全栈智能型面试练习/背题辅助系统**。系统采用模块化轻量架构，配以简洁优雅、高对比度的 **Cosmic Minimalist** 极简夜空蓝面板设计，提供极致流畅、沉浸式的答题与提效体验。

---

## ✨ 核心亮点优势

*   📱 **双端极致适配**：提供桌面端「高密表格视图」与移动端「智能卡片流视图」。在手机端按钮分布与布局经高精度重构设计，拥有舒适流畅的触控体感。
*   🚀 **Excel 格式宽容级秒导**：容错力超强的题库极感物理表格导入。支持自定义唯一判定项，一键增量合并/追加。
*   🤖 **Gemini 服务端 AI 解析**：接入谷歌原厂 Gemini 智能大模型。深度一键秒解任何晦涩代码要点，为您的刷题思路保驾护航。
*   💾 **全生命周期冷热备份**：支持高保真单库 Excel 二进制物理大表与系统级全链 JSON 配置文件的一键导出和合并覆盖恢复。
*   🏠 **零配置 SQLite 运行**：本地调试无外置服务器依赖，一键运行生成数据库，简单高效。
*   ☁️ **多目标平台高保真发布**：完美支持一键部署到标准 Linux 虚拟机（PM2 + Nginx）以及 Vercel + Supabase 云端轻量数据库平台。

---

## 🛠️ 技术栈蓝图

*   **前端大盘**：React 19 + Next.js 15 (App Router)
*   **开发语言**：TypeScript
*   **页面美学**：Tailwind CSS v4 (高对比度暗黑 & 优雅亮白主题)
*   **动态交互**：`motion/react` 极速自适应物理引擎
*   **交互图标**：`lucide-react` 精致感单色符号集
*   **数据库框架**：Prisma Client (通用型关系物理抽象)
*   **内置运行库**：`xlsx` 多制式物理大表解析工具
*   **安全认证**：本地/服务端 API 防御防护，Gemini 密钥防泄漏代理架构

---

## 📂 Excel 智能智能表头列名映射规范

系统提供超高的字段容错性能。导入时它会优先扫描 Excel 的 **首张工作表** (或标签名为 **「题库」**) 并依照如下对应名自动接管并入库：

| Excel 物理表头名称 | 动作类型 | 类型与特性 | 映射到系统属性及回退 |
| :--- | :--- | :--- | :--- |
| **题目** | **核心必填** | 文本 `string` | 面试考题的核心提问或代码题面。 |
| **一级分类** | **核心必填** | 文本 `string` | 专项练习和宏观看板汇总的重要面包屑（如：*Java基础*）。 |
| **题目ID** | 可选属性 | 文本 `string` | 判定该题库中考题唯一性的关键 ID。**如遇同 ID 数据，将执行覆盖重写！** |
| **二级分类** | 可选属性 | 文本 `string` | 微观考点（如：*多态*、*JVM垃圾收集*）。 |
| **参考答案** | 可选属性 | 长文本 `text` | 正确解题路径与大段文字，若缺省将显示 **「待补答案」** 并挂起。 |
| **题型** | 可选属性 | 单选文本 | 默认判定为 `问答题`，支持选择单选、多选等。 |
| **重要程度** | 可选属性 | 指定评级 | 普通、重要、极为重要（默认值为 `普通`）。 |
| **难度** | 可选属性 | 指定评级 | 简单、普通、困难（默认值为 `普通`）。 |
| **标签** | 可选属性 | 列表文本 | 半角/全角分词分割（如：*多线程, 锁机制*）。 |
| **说明页码** | 可选属性 | 引用字段 | 原书/原文定位参考（如：*《现代操作系统》142页*）。 |

---

## 🪐 模块总览与精美视图划分

1.  **宏观控制中心 / 首页看板 (Dashboard)**
    拥有宏观多维度的刷题完成率汇总、自适应模糊题星空图表、各科目专项熟练度雷达与快捷功能传送门。
2.  **题库高级工作仓 (Question Banks)**
    全题库清单，支持一键清空专项库、整库物理擦除、一键 Excel 数据重叠追加及自建空白题库。
3.  **极速导入控制台 (Data Import)**
    双导入模式（支持整库直接覆盖重建，或选择指向已有库执行差异化覆盖更新），提供精准的异常校验提示。
4.  **题目列表与检索看板 (Questions Explorer)**
    支持多选、跨库联动、关键词模糊瞬时过滤，支持星标收藏、添加错题、删除、一键跳转深度解析等。
5.  **极致卡片速记通道 (Review Deck)**
    专门用于冲刺速记的卡片展示页。不折叠答案，方便刷题人目光快速扫描，支持一键切换掌握等级。
6.  **物理滑块历练刷题 (Practice Playground)**
    单题沉浸突破。支持点击展开答案页、输入个人私密笔记、触发错误频率统计与多色掌握状态评估。
7.  **温故错题本 (Errata Booklet)**
    收录所有 `错误频次 > 0` 的疑难案件。支持按错频倒序排序并能伴随突破复工自动调降、一键清零。
8.  **星标收藏夹 (Bookmarks Drawer)**
    高频重难点与常备冷门知识库一站集结，支持直接提取本章节进行针对性重点操练。
9.  **全链路时序轴 (Time Trace)**
    以毫秒级时间线绘制学习流水，全天答题、收藏、做错操作一目了然，科学量化日常努力。
10. **多核备份重置核心 (System Management)**
    高级备份控制舱。支持多 Sheets 融合导出下载标准 Excel 文件，或直接导出高压缩全库 JSON 存档，防丢防丢。

---

## 🛠️ 项目本地部署与 SQLite 轻量化详解

### 💡 我们是否需要单独下载安装 SQLite 数据库？
**答：完全不需要！** 
SQLite 是进程内型数据库，无需配置任何 Windows 服务或者 Linux 守护进程（无需像 MySQL 般设置一长串启动项和物理端口），它仅仅是当前工程文件夹中的一个物理文件。
只要依靠本系统自带的 Prisma ORM 以及 Node.js 底层，在运行安装指令并生成表后即可，彻底免去繁复的环境搭建时间。

### 🔧 SQLite 出现 "Malformed" 表结构损坏的极速应急机制
若因系统断电、进程强制杀灭导致 SQLite 的写锁卡死或出现 `Database image is malformed` 时：
1.  **清空损坏的空壳文件**：直接在终端执行 `rm prisma/dev.db`（Windows 系统中可以直接手动删除 `prisma/dev.db` 物理文件）。
2.  **重构纯净关系骨骼**：执行下列指令，一毫秒内系统数据库文件就会重生并同步就绪：
    ```bash
    npx prisma db push
    ```
3.  **重新填充**：在系统的 **「备份恢复」** 页面，重新导入您之前下载到本地的备用 Excel 或系统 JSON，即可毫秒级无损归位所有操作链和刷题进度！

---

## 🌐 经典 Linux 物理服务器一站部署

本指引适用于 Ubuntu/Debian/CentOS 等各种标准 Linux 虚拟或物理机：

### Step 1. 拉取代码
```bash
cd /var/www
git clone https://github.com/li010116/shuati.git
cd shuati
```

### Step 2. 软件运行环境前置
Next.js v15 推荐使用 **Node.js v18 或最新 v20 版本**。
```bash
# Nginx 网站主服务
sudo apt-get update && sudo apt-get install -y nginx

# PM2 进程守护
sudo npm install -g pm2
```

### Step 3. 环境变量拼装
将 `.env.example` 复制为物理 `.env`，并在此持久装载密钥：
```bash
cp .env.example .env
nano .env
```
写入配置参数：
```env
# Google Gemini 极速分析 AI 大模型凭证
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# 本地 SQLite 文件物理路由，不修改使用默认项即可
DATABASE_URL="file:./dev.db"
```

### Step 4. 依赖装填与 SQLite 通道畅通
```bash
# 1. 自动执行依赖安装
npm install

# 2. 刷新同步本地 SQLite 数据表结构
npx prisma db push
```

### Step 5. 极致体积物理编译
```bash
# 对整个全栈工程进行一键流式优化打包
npm run build
```

### Step 6. 使用 PM2 进行后台无缝值守
```bash
# 1. 在后台拉起 Next 进程并命名为 "interview-hub"
pm2 start npm --name "interview-hub" -- run start -- -p 3000

# 2. 开机与自启动保存
pm2 save
pm2 startup
```

---

## ⚡ Nginx 反向代理配置

编辑 `/etc/nginx/sites-available/default` 站点文件：
```nginx
server {
    listen 80;
    server_name your-domain.com; # 填入您的专属域名或者服务器物理公网 IP

    # 放宽 Excel 物理大表的上传限制
    client_max_body_size 64m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
热重载 Nginx：
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 终极 SSL (HTTPS) 证书装填

### Let's Encrypt 证书一键全托管（推荐，终身免费，到期自动续）
```bash
# 运行安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 运行一键配置并绑定证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 腾讯云/阿里云 SSL 物理证书手动 Nginx 贴图方式
如需手动安装云供应商免费下载的 `Nginx` 配套证书和 `.key` 密钥，可按照以下配置直接重构站点逻辑（支持 301 自动强制重定向），参考自 **[腾讯云官方 Nginx 部署指引](https://cloud.tencent.com/document/product/400/35244)**：
```nginx
# 1. 强制重定向 HTTP 到安全 HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$host$request_uri;
}

# 2. HTTPS 安全处理核心
server {
    listen 443 ssl;
    server_name your-domain.com www.your-domain.com;

    client_max_body_size 64m;

    # 证书绝密路径配置
    ssl_certificate /etc/nginx/ssl/your-domain.com_bundle.crt;
    ssl_certificate_key /etc/nginx/ssl/your-domain.com.key;

    # 官方推荐的安全隔离属性
    ssl_session_timeout 5m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```
保存好后运行 `nginx -t && systemctl reload nginx` 即时生效。

---

## ☁️ Vercel + Supabase (PostgreSQL) 极客极速云端部署

如果您不希望维护服务器、域名以及数据库硬件，此处的极客方式将是极好的方案。

### 1. 激活 Supabase 专属 PostgreSQL 数据实例
1.  登录 [Supabase 官方网站](https://supabase.com/) 自建一个纯空实例。
2.  进入 **Project Settings -> Database -> Connection Strings** 拷贝出 URI。
    *   **DATABASE_URL** (Pooler 模式，默认 `6543` 端口，带有 `?pgbouncer=true` 参数) —— 配置到环境变量中。
    *   **DIRECT_URL** (直连 Session 模式，默认 `5432` 端口) —— 用于建表和 ORM 脚本流。

### 2. 向云数据库同步表及主骨架
本地终端上填好这对应两项：
```env
DATABASE_URL="postgresql://postgres.xxx:[YOUR-PASS]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:[YOUR-PASS]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
```
随后，在项目根目录快速运行表结构刷新同步指令：
```bash
npx prisma db push
```

### 3. Vercel 开发者端一键发布
1.  在 GitHub 新建您的仓库代码，并将当前代码 push 上去。
2.  进入 [Vercel](https://vercel.com/) 控制台，点击 **Import** 您的这个仓库。
3.  在 **Environment Variables** 选项下输入这三个配置，系统便会自动打包并接管上线：
    *   `DATABASE_URL` (Supabase Pooler 连接链接)
    *   `DIRECT_URL` (Supabase 直连连接链接)
    *   `GEMINI_API_KEY` (您的谷歌 AI Gemini API key)
4.  一切就绪后点击 **Deploy**，片刻之后应用即可实现真正的终身免费快速托管！

---

## 🔒 隐私与许可

本项目完全开源，代码遵循 MIT 协议。本刷题系统在本地/单容器全链路处理您的数据，不会以任何方式泄露您的私钥和面试题库，让您可以安心刷题，成功拿下满意 Offer！
