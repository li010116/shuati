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

## 🌐 生产环境极速部署指南 (从零拉取到正式上线)

本指南针对标准的 Linux 服务器（如 Ubuntu/Debian/CentOS），手把手教您如何从零拉取代码，一直配置到搭载 PM2 守护以及 Nginx 反向代理。

---

### Step 1. 拉取代码 (Code Cloning)
首先，通过 SSH 终端进入您指定的服务器目录，执行以下命令将项目代码拉取到本地：
```bash
# 1. 切换到您存放 Web 服务的根目录下
cd /var/www

# 2. 从 Git 仓库克隆本项目代码
git clone https://github.com/li010116/shuati.git

# 3. 进入项目根目录下
cd shuati
```

---

### Step 2. 安装 Node.js 与 PM2 进程管理器
Next.js 15 推荐使用 **Node.js v18 或更高版本**。我们通过标准包管理器或 NVM 进行安装：

#### 在 Ubuntu/Debian 系统中：
```bash
# 导入 NodeSource 官方 v18.x 源
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 运行系统级 Node.JS 快速安装
sudo apt-get install -y nodejs

# 检查当前安装的版本号是否正确
node -v
npm -v
```

#### 全局安装 PM2 服务守护进程：
```bash
# PM2 可以保障您的 Next.js 进程在关闭终端、崩溃、或服务器意外重启时自动拉起
sudo npm install -g pm2
```

---

### Step 3. 创建物理环境变量配置文件 (.env)
复制系统提供的 `.env.example` 环境变量模板，并填入您的相关配置：
```bash
# 复制示例模板
cp .env.example .env

# 使用 vim 或 nano 进行快捷编辑
nano .env
```
在 `.env` 文件内填入以下核心内容并保存：
```env
# 1. 您的高级 AI 助理 Gemini API Key (用于刷题详情页的 AI 辅导与解析)
GEMINI_API_KEY="your-gemini-key-here"

# 2. 本地轻量级无服务器 SQLite 数据库物理定位 (使用相对路径存储在 prisma 目录下即可)
DATABASE_URL="file:./dev.db"
```

---

### Step 4. 安全载入依赖包 (Dependencies Installation)
在项目根目录中，载入 Next.js 构建和 SQLite 通信所需的必要 NPM 模块：
```bash
# 在生产环境下提效，建议直接执行 ci。如果开发调试请直接运行 npm install
npm install
```

---

### Step 5. 自动合成并映射 SQLite 本地数据库 (Prisma Push)
SQLite 是基于本地单一物理文件运转的特型绿色数据库，不需要您单独在操作系统安装任何外部 MySQL 或守护服务。我们通过 Prisma schema 自动一键高保真重建数据表：
```bash
# 依据 prisma/schema.prisma 快速渲染并生成物理数据库 dev.db 实体
npx prisma db push
```
*(如果该步骤输出：✔ Generated Prisma Client 并且 SQLite database created at ... 即代表本地数据库管道完全接通！)*

---

### Step 6. Next.js 生产环境打包编译 (Production Build)
运行打包指令对页面、路由进行极致优化和动静结合代码压缩：
```bash
# 开始执行 NextJS 编译主任务
npm run build
```
*(编译成功后会在根目录下产生打包产物，可以安心在独立生产端高保真还原。)*

---

### Step 7. 利用 PM2 挂载后台长时守护
千万不要在终端直接运行 `npm run dev` 或者是 `npm start` 挂载，因为这样在断开终端后网站就会断联。推荐使用 PM2 注册后台托管：
```bash
# 在后台将程序命名为 "interview-companion" 并在 3000 端口持续监听运行
pm2 start npm --name "interview-companion" -- run start -- -p 3000

# 观察当前后台服务列表状态，确认 Status 为 online 状态
pm2 list

# 让 PM2 托管自启动。这样在服务器断电重新开机时，服务也会毫秒级自动带起
pm2 save
pm2 startup
```

---

### 💡 PM2 常用运维管理命令

在服务器日常维护中，您可能需要对进程进行重启、查看日志或停止操作。以下是 PM2 最常用的运维指令：

#### 1. 状态查看与监控
```bash
# 查看所有正在运行的 PM2 应用列表（包含 CPU、内存、状态等占用情况）
pm2 list

# 实时仪表盘监控（查看更精细的 CPU、内存和日志流，非常酷炫）
pm2 monit

# 查看特定应用的详细配置与元信息
pm2 show interview-companion
```

#### 2. 进程控制
```bash
# 重新启动应用（当您更新了 .env 配置或数据库后触发）
pm2 restart interview-companion

# 停止应用（不删除守护列表）
pm2 stop interview-companion

# 从 PM2 托管列表中彻底删除该应用
pm2 delete interview-companion
```

#### 3. 运维日志查看 (最常用)
```bash
# 实时滚动查看最新的核心系统日志与报错
pm2 logs interview-companion

# 仅查看最后 100 行日志
pm2 logs interview-companion --lines 100

# 清空历史日志缓存文件
pm2 flush
```

---

### Step 8. 配置 Nginx 实现外网域名/端口安全分发
生产环境建议在上层部署 Nginx 反向代理，将外网对 `80` (HTTP) 或 `443` (HTTPS) 端口的网页请求平滑转发至内网 `3000` 端口。

#### 1. 安装 Nginx 
```bash
sudo apt-get install -y nginx
```

#### 2. 修改默认站点配置文件
编辑虚拟主机配置文件（例如 `/etc/nginx/sites-available/default`）：
```bash
sudo nano /etc/nginx/sites-available/default
```
在 Server 节点内部填入以下精准路由转发定义：
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com; # 填入您的申请域名或者外网公网 IP

    # 放宽 Excel 题库大包上传容量限制
    client_max_body_size 50m;

    location / {
        # 顺滑转发到本地 PM2 运行的 3000 端口内网映射
        proxy_pass http://127.0.0.1:3000;
        
        # 完美配置协议升级 WebSocket 链路转发，保持状态通道流畅
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

#### 3. 校验并热重载 Nginx 服务
```bash
# 检验语法是否有误
sudo nginx -t

# 热重启 Nginx 服务使配置彻底生效
sudo systemctl restart nginx
```

---

### Step 9. 配置 SSL 安全证书 (HTTPS)

为了保障刷题过程中传输数据的保密性并提升品牌形象，强烈建议为您的域名配置 SSL 证书。以下为您提供两种最主流的配置方案：

#### 方案 A：使用 Let's Encrypt 自动申请和维护（推荐，免费且全自动）
使用 `Certbot` 客户端，您可以一键申请免费的 SSL 证书，它会自动识别您的 Nginx 配置、注入密匙，并配置 90 天自动后台续期。

1. **安装 Certbot 客户端**：
   ```bash
   sudo apt-get update
   sudo apt-get install -y certbot python3-certbot-nginx
   ```

2. **一键获取并自动配置证书**（将 `your-domain.com` 替换为您的真实域名）：
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```
   *执行过程中，会提示您输入邮箱（用来接收证书过期警告）、接受服务条款、并选择是否**自动将所有 HTTP 流量强制重定向到 HTTPS**（推荐选择此项，即输入 `2` 或选择 Redirect）。*

3. **测试自动续期任务是否工作正常**：
   ```bash
   sudo certbot renew --dry-run
   ```

---

#### 方案 B：使用腾讯云 SSL 证书手动配置（参考腾讯云官方文档 Nginx SSL 配置）
如果您在腾讯云（或其他云服务商）申请并下载了适用于 Nginx 服务的 SSL 证书包，您会获得一个 ZIP 压缩包，解压后包含以下核心文件：
- `your-domain.com_bundle.crt`（证书文件，包含完整证书链）
- `your-domain.com.key`（私钥文件）

请按照以下步骤，参考 **[腾讯云官方 Nginx SSL 证书配置指南](https://cloud.tencent.com/document/product/400/35244)** 进行手动部署：

1. **将证书文件上传到服务器指定安全目录**：
   ```bash
   sudo mkdir -p /etc/nginx/ssl
   # 将已解压的 your-domain.com_bundle.crt 和 your-domain.com.key 手动安全上传/移动至该目录下
   # 并设定安全访问权限
   sudo chmod 600 /etc/nginx/ssl/*
   ```

2. **使用文本编辑器（如 vim 或 nano）编辑您的 Nginx 站点配置文件** /etc/nginx/sites-available/default：
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```
   **根据腾讯云官方标准，填入以下优化的双站点配置定义（支持 HTTP 自动重定向至 HTTPS，并适配 Next.js 反向代理）：**
   ```nginx
   # 1. 强制将所有 HTTP 80 端口流量永久重定向至安全加密的 HTTPS
   server {
       # SSL 证书绑定域名
       listen 80;
       server_name your-domain.com www.your-domain.com; # 替换为您的真实域名
       
       # 腾讯云官方推荐的 HTTP 重定向 HTTPS 机制
       return 301 https://$host$request_uri;
   }

   # 2. HTTPS 443 安全接收与反向代理端
   server {
       # 腾讯云建议：同时监听 443 端口并开启 SSL 加密
       listen 443 ssl;
       server_name your-domain.com www.your-domain.com; # 替换为您的真实域名

       # 放宽 Excel 题库大包上传容量限制
       client_max_body_size 50m;

       # 腾讯云证书物理文件绝对定位
       ssl_certificate /etc/nginx/ssl/your-domain.com_bundle.crt; # 证书文件路径
       ssl_certificate_key /etc/nginx/ssl/your-domain.com.key;     # 私钥文件路径

       # 腾讯云官方推荐的安全优化参数
       ssl_session_timeout 5m;                                    # 会话超时时间
       ssl_protocols TLSv1.2 TLSv1.3;                             # 开启安全协议版本
       ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE; # 配置加密套件
       ssl_prefer_server_ciphers on;                              # 优先使用服务器端的加密套件

       location / {
           # 将外网请求安全、高保真转发到本地 PM2 运行的 NextJS 内网 3000 端口
           proxy_pass http://127.0.0.1:3000;
           
           # 协议升级与标准反代包头配置
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto https; # 明确通知 Next.js 上层服务已开启 HTTPS
       }
   }
   ```

3. **保存配置并测试、重载 Nginx 服务**：
   ```bash
   # 1. 检查修改后的配置文件语法是否完整正确
   sudo nginx -t

   # 2. 如果显示 successful，直接热加载 Nginx 使证书与站点立即生效
   sudo systemctl reload nginx
   ```

---

至此，大功告成！您现在可以在浏览器中输入服务器域名或公网外网 IP，即可享受本应用提供的高效刷题、轻松背题和完美的双向数据备份与恢复体验！
