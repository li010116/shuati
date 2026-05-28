# 面试刷题宝典 (Interview Practice Companion)

一款支持多题库管理、Excel 极速批量导入的 **全栈移动端优先面试刷题 / 背题辅助系统**。采用模块化轻量架构，配以简洁优雅的极简白蓝面板设计，移动端与桌面端均可流畅使用。

---

## 🚀 核心技术架构

| 层级 | 技术选型 |
| :--- | :--- |
| **前端框架** | React 19 + Next.js 15 (App Router) + TypeScript |
| **样式方案** | Tailwind CSS 4 |
| **动效 & 图标** | `motion` (Framer Motion) + `lucide-react` 精致图标集 |
| **数据库** | PostgreSQL（Supabase 云托管），通过 Prisma ORM 访问 |
| **数据导入** | `xlsx` 工作表极速流计算提取库 |
| **AI 辅导** | Google Gemini API（题目详情页 AI 考点解析与辅导） |

---

## 📂 项目目录结构

```
shuati/
├── app/                     # Next.js App Router 页面与 API 路由
│   ├── page.tsx             # 首页看板 (Dashboard)
│   ├── layout.tsx           # 根布局
│   ├── globals.css          # 全局样式
│   ├── question-banks/      # 题库管理页
│   ├── questions/           # 题目列表页 & 题目详情页
│   │   └── [id]/            # 单题详情页（含 AI 辅导）
│   ├── review/              # 背题模式页
│   ├── practice/            # 刷题模式页
│   ├── wrong/               # 错题集页
│   ├── favorites/           # 收藏夹页
│   ├── import/              # Excel 导入页
│   ├── backup/              # 备份恢复中心
│   └── api/                 # API 路由
│       ├── questions/       #   题目 CRUD
│       ├── question-banks/  #   题库 CRUD & 导入
│       ├── statistics/      #   统计数据（概览、分类、难度、导入批次）
│       └── backup/          #   备份导出 & 导入恢复
├── components/              # 可复用组件
│   └── Layout.tsx           # 全局布局（顶栏 + 侧栏 + 移动端底部导航）
├── src/api/                 # 前端 API 客户端封装
├── lib/                     # 工具函数 & Prisma 客户端
├── hooks/                   # 自定义 React Hooks
├── prisma/
│   └── schema.prisma        # Prisma 数据模型定义
├── .env.example             # 环境变量模板
└── package.json
```

---

## 🎨 核心功能模块

| # | 模块名称 | 路由 | 功能说明 |
| :---: | :--- | :--- | :--- |
| 1 | **首页看板** | `/` | 全局统计仪表盘：掌握率、今日复习、错题留存、各题库卡片与进度 |
| 2 | **题库管理** | `/question-banks` | 新建 / 编辑 / 删除题库，查看各库统计，追加导入 Excel |
| 3 | **Excel 导入** | `/import` | 创建新题库并一次性载入，或为已有题库增量追加（同 ID 覆盖更新） |
| 4 | **题目列表** | `/questions` | 高级联合过滤器（分类 / 难度 / 掌握状态 / 星标 / 错题），支持直接操作 |
| 5 | **题目详情** | `/questions/[id]` | 单题详情查看，含 AI 考点解析辅导 |
| 6 | **背题模式** | `/review` | 卡片速背通道，不折叠答案，一键标记掌握状态 |
| 7 | **刷题模式** | `/practice` | 逐题攻破：折叠答案、掌握反馈、私有备注、星标错题 |
| 8 | **错题集** | `/wrong` | 错题频率倒序排列，一键清空攻破指标 |
| 9 | **收藏夹** | `/favorites` | 星标高频知识点集合，直通专项刷题 |
| 10 | **备份恢复** | `/backup` | JSON 全状态备份 / 多 Sheet Excel 备份；支持「合并追加」与「覆写还原」两种恢复模式 |

---

## 📋 Excel 表头列名映射规范

系统支持灵活的外部题库 Excel 导入。**首张工作表**或标签页名为 **「题库」** 的将被优先加载。

| Excel 列名 | 必填 | 类型 | 说明 |
| :--- | :---: | :--- | :--- |
| **题目** | ✅ | 文本 | 面试题内容 |
| **一级分类** | ✅ | 文本 | 专项训练一级分类（如：*Java 基础*） |
| **题目ID** | | 字符串 | 同一题库内唯一标识，同 ID 覆盖更新 |
| **二级分类** | | 字符串 | 细分二级考点目录 |
| **参考答案** | | 文本 | 详细答案，留空则标记为 *【待补充解答】* |
| **题型** | | 文本 | 单选题 / 多选题 / 问答题（默认：`问答题`） |
| **重要程度** | | 级别 | 普通 / 重要 / 极为重要（默认：`普通`） |
| **难度** | | 级别 | 简单 / 普通 / 困难（默认：`普通`） |
| **标签** | | 文本 | 逗号分隔的标签（如：*锁, 线程池*） |
| **说明页码** | | 文本 | 来源出处（如：*凤凰架构 185 页*） |

---

## 🛠️ 本地开发快速启动

### 前置条件

- **Node.js** v18 或更高版本
- **npm**（随 Node.js 自带）
- 一个 **Supabase** PostgreSQL 数据库实例（或其他 PostgreSQL 数据库）

### Step 1. 克隆项目

```bash
git clone https://github.com/li010116/shuati.git
cd shuati
```

### Step 2. 安装依赖

```bash
npm install
```

### Step 3. 配置环境变量

复制模板并填入您的配置：

```bash
cp .env.example .env
```

在 `.env` 文件中填入以下内容：

```env
# Gemini AI API Key（用于题目详情页的 AI 辅导解析）
GEMINI_API_KEY="your-gemini-api-key"

# Supabase PostgreSQL 连接串（Pooler 模式，端口 6543）
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase PostgreSQL 直连串（用于 Schema 迁移，端口 5432）
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

> **💡 提示**：`DATABASE_URL` 使用带 pgbouncer 的连接池模式，`DIRECT_URL` 使用直连模式供 Prisma 执行 schema 变更。两者均可在 Supabase 控制台 → Project Settings → Database → Connection Strings 中获取。

### Step 4. 同步数据库表结构

```bash
npx prisma db push
```

该命令会根据 `prisma/schema.prisma` 自动在云端 PostgreSQL 中创建所有数据表。

### Step 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可开始使用。

---

## 🌐 生产环境部署

### 方案一：Linux 服务器 + PM2 + Nginx

适用于自行维护的 VPS / 云服务器（Ubuntu / Debian / CentOS）。

#### 1. 服务器环境准备

```bash
# 安装 Node.js v18+（Ubuntu/Debian）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2 进程守护
sudo npm install -g pm2
```

#### 2. 拉取代码并安装

```bash
cd /var/www
git clone https://github.com/li010116/shuati.git
cd shuati
npm install
```

#### 3. 配置环境变量

```bash
cp .env.example .env
nano .env
# 填入 GEMINI_API_KEY、DATABASE_URL、DIRECT_URL
```

#### 4. 同步数据库 & 构建项目

```bash
# 同步表结构到远程 PostgreSQL
npx prisma db push

# 生产构建（内部会执行 prisma generate + next build）
npm run build
```

#### 5. PM2 后台运行

```bash
# 启动服务并命名为 interview-companion
pm2 start npm --name "interview-companion" -- run start -- -p 3000

# 检查运行状态
pm2 list

# 配置开机自启
pm2 save
pm2 startup
```

#### 6. Nginx 反向代理

安装并配置 Nginx 将外网请求转发至内网 3000 端口：

```bash
sudo apt-get install -y nginx
sudo nano /etc/nginx/sites-available/default
```

**基础 HTTP 配置**：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    client_max_body_size 50m;

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

```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. 配置 SSL (HTTPS)

**方案 A — Let's Encrypt（推荐，免费自动续期）**：

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
sudo certbot renew --dry-run  # 测试自动续期
```

**方案 B — 手动 SSL 证书**（腾讯云等云厂商证书）：

```nginx
# HTTP 强制跳转 HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$host$request_uri;
}

# HTTPS 站点
server {
    listen 443 ssl;
    server_name your-domain.com www.your-domain.com;

    client_max_body_size 50m;

    ssl_certificate /etc/nginx/ssl/your-domain.com_bundle.crt;
    ssl_certificate_key /etc/nginx/ssl/your-domain.com.key;
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

#### PM2 常用运维命令

```bash
pm2 list                            # 查看服务列表
pm2 monit                           # 实时监控仪表盘
pm2 show interview-companion        # 查看应用详情
pm2 restart interview-companion     # 重启应用
pm2 stop interview-companion        # 停止应用
pm2 delete interview-companion      # 从 PM2 中移除
pm2 logs interview-companion        # 查看实时日志
pm2 logs interview-companion --lines 100  # 查看最近 100 行
pm2 flush                           # 清空日志缓存
```

---

### 方案二：Vercel + Supabase 云原生部署

零运维、自动扩缩容的现代化托管方案。

#### 1. 获取 Supabase 数据库凭证

1. 登录 [Supabase](https://supabase.com/)，创建 PostgreSQL 实例
2. 进入 **Project Settings → Database → Connection Strings**
3. 获取两个连接串：
   - **Transaction mode pooler**（端口 `6543`，带 `?pgbouncer=true`）→ `DATABASE_URL`
   - **Session mode / Direct**（端口 `5432`）→ `DIRECT_URL`

#### 2. 同步表结构

在本地终端中配置好 `.env` 后执行：

```bash
npx prisma db push
```

#### 3. 部署到 Vercel

1. 将项目推送到 **GitHub / GitLab** 仓库
2. 登录 [Vercel](https://vercel.com/)，选择 **Add New → Project** 导入仓库
3. 配置 **Environment Variables**：
   - `DATABASE_URL` — Supabase pooler 连接串
   - `DIRECT_URL` — Supabase 直连串
   - `GEMINI_API_KEY` — Google Gemini API Key
4. 点击 **Deploy**，等待构建完成

> `npm run build` 会自动执行 `prisma db push && prisma generate && next build`，无需额外配置。

#### 4. 数据恢复

部署完成后访问 **「备份恢复」** 页面，导入先前备份的 JSON 或 Excel 文件，即可恢复所有刷题数据与学习轨迹。

---

## 🔧 常见问题

### 数据库连接失败怎么办？

1. 检查 `.env` 中 `DATABASE_URL` 和 `DIRECT_URL` 是否正确填写
2. 确认 Supabase 项目是否处于活跃状态（免费套餐会在不活跃时暂停）
3. 确认密码中的特殊字符已正确编码

### 如何重置数据库？

```bash
# 清空所有数据并重建表结构
npx prisma db push --force-reset

# 重新生成 Prisma 客户端
npx prisma generate
```

之后可通过 **「备份恢复」** 页面重新导入备份数据。

### 如何更新已部署的项目？

**Linux 服务器**：
```bash
cd /var/www/shuati
git pull
npm install
npm run build
pm2 restart interview-companion
```

**Vercel**：推送代码到 GitHub，Vercel 会自动触发重新部署。

---

## 📄 开源许可

本项目仅供学习交流使用。
