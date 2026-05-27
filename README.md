# 面试刷题应用 (Interview Practice Companion)

这是一个支持多题库管理、极速 Excel 文件级批导的「全栈移动端优先面试刷题/背题辅助系统」。系统采用模块化轻量架构，配以简洁优雅、高对比度的 **Cosmic Minimalist** 极简夜空蓝面板设计。

---

## 🚀 核心技术架构

- **前端架构**：React (v19) + Next.js (v15 App Router) + TypeScript + Tailwind CSS
- **动效反馈**：`motion` + `lucide-react` 精致感图标集
- **数据存储**：SQLite、本地 Prisma Client ORM 框架，支持快速重构
- **解算媒介**：`xlsx` 工作表极速流计算提取库

---

## 📂 Excel 表头列名映射规范

为了支持多变的外部题库资源导入，本系统配备了强大的字段容错。Excel 的 **首张工作表** 或标签页名为 **「题库」** 将被优先加载，具体表头字段映射如下：

| Excel 列名名称 | 动作类型 | 类型与特性 | 映射到系统属性及回退 |
| :--- | :--- | :--- | :--- |
| **题目** | **必填项** | 文本 string | 对应面试题内容 |
| **一级分类** | **必填项** | 文本 string | 用于专项训练的一级面包屑（如：*Java基础*） |
| **题目ID** | 可选项 | 字符串 string | 系统在同一个题库内，以此 ID 判定唯一性。**同 ID 将覆盖更新！** |
| **二级分类** | 可选项 | 字符串 string | 细分二级考点目录 |
| **参考答案** | 可选项 | 文本 text | 核心考点详细答案。留空则标记为*【待补充解答】* |
| **题型** | 可选项 | 文本 | 单选题、多选题、问答题（默认 `问答题`） |
| **重要程度** | 可选项 | 级别 | 普通、重要、极为重要（默认 `普通`） |
| **难度** | 可选项 | 级别 | 简单、普通、困难（默认 `普通`） |
| **标签** | 可选项 | 文本 | 逗号/分词隔开的标签（如：*锁, 线程池*） |
| **说明页码** | 可选项 | 文本 | 书籍、文档出处（如：*凤凰架构 185 页*） |

---

## 🎨 核心模块与页面划分

1. **宏观控制中心 (Dashboard)**: 可见全部托管题库卡片、学习总完结率、模糊分布星空图、快速通关入口。
2. **工作仓配置中心 (Question Banks)**: 支持新建空仓库、手动级联擦除、单库专项统计、快速 Excel 追加合流。
3. **极速数据导入 (Excel Import)**: 支持两种入库模式：
   - *模式一*：创建全新特色题库并一次性载入数据；
   - *模式二*：为已有老题库进行增量追加（支持相同题目ID无缝覆盖）。
4. **题目检索控制台 (Questions List)**: 配置强大的极低延迟高级联合过滤器，支持星标、错题记录直接执行。
5. **卡片背题速背 (Review Deck)**: 快速通读专用通道。不折叠答案，助你高效背诵并做一键掌握标记。
6. **滑块历练刷题 (Interactive Practice)**: 单道题逐个攻破！支持点击折叠答案、多重掌握反馈、私有记忆备注、标记星标错题。
7. **温故错题本 (Errata Booklet)**: 所有错题频率 `&gt; 0` 的收留所。错误频率倒序排序，支持一键清空攻破指标。
8. **收藏夹雷达 (Bookmarks Radar)**: 星标高频知识点大本营，直通专项收藏大历练。
9. **追踪溯源轴 (Chronological Trace)**: 提供精细到毫秒级、全维度的学习历史流追踪图谱。
10. **备份恢复中心 (Backup & Restore Center)**: 提供高保真全状态 JSON 系统沙卡秒级备份、多 Sheet Excel 物理表格双向双击恢复。配置有「合并覆盖追加」与「格式化冷覆写还原」两套全方位安全运行机制。

---

## 🛠️ 项目本地自启与 SQLite 说明

### 💡 SQLite 是否需要安装？
**不需要单独安装。** SQLite 是一种**无服务器、零配置、本地单文件型**轻量数据库。
1. 不需要像 MySQL、PostgreSQL 一样在操作系统中运行独立的守护进程（Service）。
2. 项目底层通过 Prisma ORM 及 Node.js 驱动直接读写本地的 `.db` 文件。
3. 只要系统安装有 Node.js 运行环境，在执行依赖安装和数据库初始化指令（`npx prisma db push`）后，系统便会自动创建并读写 SQLite 数据库文件，无需额外干涉。

### 🔧 常见故障排查：SQLite "database disk image is malformed" 损坏如何处理？
在极少数情况下（如宿主机突然强杀容器/断电导致 SQLite 写入锁文件不完整），可能会抛出以下内置异常：
`ConnectorError: SqliteError { message: Some("database disk image is malformed") }`

**安全的一键修复指令：**
1. **物理清空损坏文件**：在控制台或终端执行 `rm prisma/dev.db`（Windows 系统中删除对应的 `prisma/dev.db` 实体文件）。
2. **零延时重新同步 Schema**：运行下述指令即可高保真、零压力重建纯净的空白数据库：
   ```bash
   npx prisma db push
   ```
3. **恢复备份**：进入系统的 **「备份恢复」** 页面，重新一键导入先前下载保存的 JSON 或 Excel 覆盖文件，即可满状态复原所有刷题轨迹与分类！

---

## 🌐 Linux 生产环境部署指南 (PM2 + Nginx)

在 Linux 服务器（如 Ubuntu/CentOS）上部署本系统的标准生产环境推荐步骤如下：

### 1. 安装基础运行环境
确保系统已安装 Node.js (推荐 v18 或更高版本) 进程管理器 `pm2`：
```bash
# 安装 Node.js (以 Ubuntu NVM 为例，或通过 NodeSource 安装)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 全局安装进程守护工具 pm2
sudo npm install -g pm2
```

### 2. 配置物理环境与密钥
克隆文件夹或上传项目打包产物至服务器，并在项目根目录下建立 `.env` 配置文件：
```bash
# 拷贝模板
cp .env.example .env
```
用编辑器编辑 `.env` 并在其中填入您的特定密钥：
```env
# 你的 Gemini API 密钥 (用于 AI 辅学助手，如不使用则留空)
GEMINI_API_KEY=your-gemini-key

# 本地 SQLite 默认路径 (生产环境通常保持默认 file:./dev.db)
DATABASE_URL="file:./dev.db"
```

### 3. 安装依赖与编译打包 (Production Build)
```bash
# 安装生产依赖
npm ci --only=production
# *注意：如果是全流程构建，可先进行完整编译*
npm install

# 初始化生成本地 SQLite 数据库及映射文件
npx prisma db push

# 进行 Next.js 生产包编译
npm run build
```

### 4. 使用 PM2 启动和守护进程
在生产环境中，Next.js 服务需要于后台持续执行，推荐使用 `pm2` 进行生命周期托管：
```bash
# 使用 PM2 运行生产服务器，项目命名为 interview-app
pm2 start npm --name "interview-app" -- run start -- -p 3000

# 检查当前进程状态
pm2 list

# 如果需要设置开机自启守护
pm2 save
pm2 startup
```

### 5. 配置 Nginx 端口转发
为通过标准的 `80` (HTTP) 或 `443` (HTTPS) 端口访问应用，推荐在其上层挂载 Nginx 反向代理。

编辑您的 Nginx 站点配置文件 (例如 `/etc/nginx/sites-available/default`)：
```nginx
server {
    listen 80;
    server_name your_domain_or_ip; # 您的域名或服务器公网 IP

    # 如果有大文件导入需要，建议放宽上传包限制
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
测试配置并重起 Nginx：
```bash
sudo nginx -t
sudo systemctl restart nginx
```
此时即可通过外网安全、稳定、流畅地访问您的极速面试刷题应用！
