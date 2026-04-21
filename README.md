# ALG Visualizer Site

一个可直接启动的算法可视化网站。

安装后，你可以在任意目录通过 `ALG` 或 `alg-visualizer` 启动本地服务，并自动在浏览器中打开页面。

## 安装

### 全局安装

```bash
npm install -g alg-visualizer-site
```

安装完成后可直接运行：

```bash
ALG
```

或者：

```bash
alg-visualizer
```

默认访问地址：

```text
http://localhost:4173
```

### 使用 npx 直接运行

```bash
npx alg-visualizer-site
```

### 本地开发时注册全局命令

在项目根目录执行：

```bash
npm link
```

之后即可在任意路径直接运行：

```bash
ALG
```

## 使用方式

### 启动站点

```bash
ALG
```

### 指定端口

```bash
ALG --port=8080
```

### 直接打开某个算法页面

```bash
ALG --algorithm=sort-bubble
```

### 直接打开纯动画页

```bash
ALG --algorithm=sort-bubble --embed
```

`--embed` 会打开 `/#/embed/:id` 路由，只渲染算法动画本体，不带侧边栏和说明区。

### 查看帮助

```bash
ALG --help
```

## CLI 参数

```text
--port=<number>   指定本地服务端口，默认 4173
--algorithm=<id>  直接打开指定算法
--embed           打开纯动画页（不带侧边栏和说明区）
--help, -h        显示帮助
```

## 适用场景

- 本地学习算法可视化
- 快速分享一个可运行的网站给同事或同学
- 不进入源码目录，直接启动站点

## 开发

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

构建生产版本：

```bash
npm run build
```

检查打包内容：

```bash
npm run pack:check
```
