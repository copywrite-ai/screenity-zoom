# Screenity 项目分析报告

> 生成时间: 2025-11-11
> 项目版本: v4.0.5-zoom
> 分析工具: Claude Code

## 项目概述

Screenity 是一个功能强大、注重隐私的 Chrome 浏览器屏幕录制扩展程序。它提供了免费的屏幕录制、视频编辑、注释标注等功能，无需登录即可使用。

### 基本信息
- **项目名称**: Screenity
- **版本**: 4.0.5
- **类型**: Chrome Extension (Manifest V3)
- **开发者**: Alyssa X
- **许可证**: GPLv3
- **主要技术栈**: React 18, TypeScript, Webpack, SCSS

## 项目架构

### 目录结构
```
screenity/
├── src/
│   ├── pages/                    # 主要页面组件
│   │   ├── Background/          # 后台服务脚本
│   │   ├── Content/             # 内容脚本和UI组件
│   │   ├── Recorder/            # 录制功能
│   │   ├── Editor/              # 视频编辑器
│   │   ├── Camera/              # 摄像头和AI背景
│   │   ├── Region/              # 区域选择
│   │   ├── CloudRecorder/       # 云录制功能
│   │   └── ...                  # 其他组件
│   ├── assets/                  # 静态资源
│   │   ├── fonts/              # 字体文件
│   │   ├── img/                # 图标和图片
│   │   ├── vendor/             # 第三方库
│   │   └── selfieSegmentation/ # AI分割模型
│   ├── messaging/               # 消息传递系统
│   └── _locales/               # 多语言支持
├── utils/                       # 构建工具
├── patches/                     # NPM包补丁
└── build/                       # 构建输出
```

### 技术架构
- **前端框架**: React 18 + TypeScript
- **UI组件库**: Radix UI
- **构建工具**: Webpack 5
- **样式**: SCSS + CSS Modules
- **状态管理**: React Context API
- **存储**: Chrome Storage API + IndexedDB (localForage)
- **媒体处理**: MediaRecorder API + Web Audio API
- **AI功能**: TensorFlow.js + Body Segmentation
- **视频编辑**: FFmpeg.js

## 核心功能分析

### 1. 录制功能

#### 录制类型
- **全屏录制**: 使用 `desktopCapture` API 录制整个屏幕
- **标签页录制**: 使用 `tabCapture` API 录制特定浏览器标签页
- **区域录制**: 录制用户自定义的屏幕区域
- **摄像头录制**: 直接录制摄像头输入
- **应用录制**: 录制桌面上的任何应用程序

#### 音频录制
- **麦克风音频**: 外部麦克风输入录制
- **系统音频**: 内部系统声音录制
- **音频混合**: 多音源混合功能
- **对讲键**: Alt+Shift+U 控制的按键通话功能

**技术实现位置**:
- `/src/pages/Background/recording/recordingHelpers.js` - 录制配置
- `/src/pages/Recorder/audioManager.js` - 音频管理
- `/src/pages/Recorder/recorderConfig.js` - 录制设置

### 2. 注释和绘制工具

#### 绘制工具
- **画笔工具**: 自由绘制，可调节笔触宽度和颜色
- **荧光笔**: 半透明叠加绘制
- **橡皮擦**: 擦除已绘制的注释

#### 形状工具
- **矩形工具**: 绘制矩形，支持填充/描边选项
- **圆形工具**: 绘制圆形
- **三角形工具**: 绘制三角形
- **箭头工具**: 绘制方向箭头

#### 文本和图像工具
- **文本工具**: 添加文本注释
- **图像工具**: 插入图片文件
- **选择工具**: 移动和修改现有注释

**技术实现**:
- 使用 **Fabric.js** 作为画布库
- `/src/pages/Content/canvas/modules/History.jsx` - 历史记录管理
- `/src/pages/Content/toolbar/layout/DrawingToolbar.jsx` - 工具栏UI

### 3. AI驱动功能

#### 摄像头背景效果
- **背景虚化**: 基于 TensorFlow.js 的 AI 背景虚化
- **自定义背景**: 用自定义图片替换背景
- **实时处理**: 使用身体分割进行实时视频处理

#### AI实现
- **TensorFlow.js 集成**: 使用 `@tensorflow-models/body-segmentation` 进行人物分割
- **MediaPipe Selfie Segmentation**: 高级身体分割用于背景移除
- **基于画布的处理**: 使用透明度遮罩进行实时视频帧处理

**技术实现位置**:
- `/src/assets/selfieSegmentation/` - AI模型文件
- `/src/pages/Camera/components/Background.js` - 背景处理
- `/src/pages/Camera/utils/effects.js` - 效果工具

### 4. 视频编辑功能

#### 基础编辑
- **视频裁剪**: 移除录制的片段
- **视频裁剪**: 移除视频中的不需要区域
- **音频添加/移除**: 添加外部音频或静音现有音频
- **视频静音**: 禁用录制中的音轨

#### 高级处理
- **格式转换**: 在不同格式间转换录制
- **质量设置**: 多种分辨率选项 (240p 到 4K)
- **GIF制作**: 将视频转换为动画GIF

**技术实现位置**:
- `/src/assets/vendor/ffmpeg-core.js` - FFmpeg.js 集成
- `/src/pages/Editor/utils/` - 编辑工具集

### 5. 导出和分享选项

#### 导出格式
- **MP4**: 标准视频格式
- **WebM**: Web优化视频格式
- **GIF**: 动画格式

#### 云存储
- **Google Drive 集成**: 直接上传到 Google Drive
- **自动文件夹创建**: 在 Drive 中创建 "Screenity" 文件夹
- **分享链接**: 为上传的视频生成可分享链接

**技术实现位置**:
- `/src/pages/Background/drive/handleSaveToDrive.js` - Google Drive 上传
- `/src/pages/CloudRecorder/bunnyTusUploader.js` - 云存储上传器

### 6. 键盘快捷键和UI控制

#### 键盘快捷键
- **开始录制**: Alt+Shift+G (或 Ctrl+Shift+1)
- **停止录制**: Alt+Shift+X (或 Ctrl+Shift+2)
- **暂停/恢复**: Alt+Shift+M (或 Ctrl+Shift+3)
- **对讲键**: Alt+Shift+U

#### UI定制
- **工具栏隐藏**: 可隐藏录制工具栏的选项
- **工具栏定位**: 可移动的工具栏界面
- **设置面板**: 可折叠的设置菜单
- **弹出界面**: 用于录制控件的模态弹出窗口

### 7. 隐私和安全功能

#### 隐私控制
- **无数据收集**: 扩展程序本地运行，不收集数据
- **自托管选项**: 可以完全离线运行
- **可选权限**: 只请求必要的权限
- **内容安全**: 沙盒化编辑器环境

#### 安全措施
- **权限管理**: 细粒度权限控制
- **身份验证**: 云功能的可选用户身份验证
- **令牌管理**: 安全处理 OAuth 令牌
- **HTTPS 通信**: 安全的 API 通信

## 依赖分析

### 主要依赖包

#### 核心框架
- `react: ^18.2.0` - React 核心库
- `react-dom: ^18.2.0` - React DOM 渲染器
- `typescript: ^4.9.3` - TypeScript 编译器

#### UI组件库
- `@radix-ui/*` - 多个 Radix UI 组件包，提供无样式、可访问的UI组件
- `@uiw/react-color-wheel: ^1.2.2` - 颜色选择器组件

#### 媒体处理
- `fabric: ^5.3.0` - Canvas 操作库，用于绘制和注释功能
- `wavesurfer.js: ^7.4.2` - 音频波形可视化
- `plyr: ^3.7.8` - 媒体播放器
- `fix-webm-duration: ^1.0.5` - WebM 时长修复
- `webm-duration-fix: ^1.0.4` - WebM 时长修复

#### AI/ML
- `@tensorflow-models/body-segmentation: ^1.0.2` - 身体分割模型
- `@tensorflow/tfjs-*` - TensorFlow.js 生态
- `@mediapipe/selfie_segmentation: ^0.1.1675465747` - MediaPipe 自拍分割

#### 工具库
- `axios: ^1.6.2` - HTTP 客户端
- `jszip: ^3.10.1` - ZIP 文件处理
- `localforage: ^1.10.0` - 离线存储
- `react-hotkeys-hook: ^4.4.1` - React 快捷键钩子

### 开发依赖
- `webpack: ^5.x` - 模块打包器
- `babel-loader: ^9.1.3` - Babel 加载器
- `sass-loader: ^13.2.0` - SCSS 加载器
- `copy-webpack-plugin: ^7.0.0` - 文件复制插件
- `html-webpack-plugin: ^5.5.0` - HTML 生成插件

### 补丁文件
项目使用 `patch-package` 对以下依赖打了补丁：
- `@radix-ui+react-use-callback-ref+1.0.1.patch`
- `fabric+5.3.0.patch`
- `plyr+3.7.8.patch`

## 构建配置

### Webpack 配置特点
1. **多入口点配置**: 支持 background script、content script、recorder 等多个入口
2. **HTML 自动生成**: 为每个页面自动生成 HTML 文件
3. **环境变量配置**: 支持开发和生产环境的不同配置
4. **资源处理**: 支持图片、字体、CSS、SCSS 等资源
5. **代码分割**: 支持代码分割和优化

### 构建脚本
- `npm run build`: 生产环境构建
- `npm run start`: 开发环境服务器
- `npm run hot-reload`: 热重载开发
- `npm run package`: 打包为扩展程序 zip 文件

### 环境变量
- `SCREENITY_APP_BASE`: 应用基础URL
- `SCREENITY_WEBSITE_BASE`: 网站基础URL
- `SCREENITY_API_BASE_URL`: API基础URL
- `SCREENITY_ENABLE_CLOUD_FEATURES`: 启用云功能
- `MAX_RECORDING_DURATION`: 最大录制时长（默认3600秒）
- `RECORDING_WARNING_THRESHOLD`: 录制警告阈值（默认60秒）

## 消息传递系统

### 架构设计
Screenity 使用 Chrome Extension 的消息传递API进行组件间通信：

1. **Background Script**: 中央消息路由器
2. **Content Scripts**: 页面内容脚本
3. **Offscreen Documents**: 后台处理文档
4. **Popup Pages**: 弹出页面

### 消息类型
- 录制控制消息
- 状态同步消息
- 权限请求消息
- 数据传输消息

### 实现位置
- `/src/messaging/` - 消息传递系统
- `/src/pages/Background/messaging/messageRouter.js` - 消息路由器
- `/src/pages/Content/context/messaging/` - 内容脚本消息处理

## 国际化支持

### 支持语言
项目支持 20+ 种语言，包括：
- 英语 (en)
- 中文简体 (zh_CN)
- 中文繁体 (zh_TW)
- 日语 (ja)
- 德语 (de)
- 法语 (fr)
- 西班牙语 (es)
- 等等...

### 实现方式
- 使用 Chrome Extension 的国际化API
- 翻译文件位于 `/src/_locales/` 目录
- 每种语言都有独立的 `messages.json` 文件

## 隐私和安全考虑

### 隐私保护
1. **本地处理**: 所有录制和编辑都在本地完成
2. **无数据收集**: 不收集用户数据
3. **离线可用**: 可以完全离线使用
4. **可选云功能**: 云功能完全可选

### 安全措施
1. **最小权限原则**: 只请求必要的权限
2. **内容安全策略**: 严格的 CSP 配置
3. **沙盒化**: 编辑器运行在沙盒环境中
4. **安全通信**: 所有网络通信使用 HTTPS

### 权限列表
- `identity`: 身份验证（Google Drive）
- `activeTab`: 活动标签页访问
- `storage`: 本地存储
- `unlimitedStorage`: 无限存储空间
- `downloads`: 下载管理
- `tabs`: 标签页管理
- `tabCapture`: 标签页捕获
- `scripting`: 脚本注入
- `system.display`: 系统显示信息
- `offscreen`: 后台文档（可选）
- `desktopCapture`: 桌面捕获（可选）
- `alarms`: 定时器（可选）
- `clipboardWrite`: 剪贴板写入（可选）

## 性能优化

### 主要优化策略
1. **代码分割**: 按需加载组件
2. **资源优化**: 图片压缩、字体优化
3. **缓存策略**: 合理的缓存配置
4. **异步处理**: 使用 Web Workers 和 Offscreen Documents
5. **内存管理**: 及时清理录制数据和资源

### 技术实现
- 使用 Webpack 进行代码分割和优化
- Offscreen Documents 用于后台处理
- IndexedDB 用于大容量数据存储
- Canvas 优化用于实时绘制

## 扩展性设计

### 模块化架构
每个功能模块都有清晰的边界：
- 录制模块独立于编辑模块
- AI功能可以独立启用/禁用
- 云功能作为可选模块

### 插件系统
虽然当前版本没有公开的插件系统，但架构支持：
- 工具扩展
- 效果滤镜
- 导出格式扩展

### 配置系统
- 用户设置持久化
- 功能开关配置
- 性能参数调节

## 开发和维护

### 代码质量
- TypeScript 类型检查
- ESLint 代码检查
- Prettier 代码格式化
- 模块化设计

### 测试策略
虽然代码库中没有看到完整的测试套件，但架构支持：
- 单元测试
- 集成测试
- E2E 测试

### 文档
- README 提供基本的使用和开发指南
- 代码中有适当的注释
- 组件和函数命名清晰

## 商业模式

### 免费版本
- 完整的本地录制功能
- 基础编辑功能
- 注释工具
- 导出功能

### Screenity Pro (付费版本)
- 云存储和分享
- 多场景项目
- 高级编辑功能
- 变焦关键帧
- 字幕功能
- 协作功能

### 技术实现
Pro 功能通过环境变量 `SCREENITY_ENABLE_CLOUD_FEATURES` 控制，相关代码：
- `/src/pages/CloudRecorder/` - 云录制功能
- `/src/pages/Background/backup/` - 备份系统
- 与 screenity.io 的 API 集成

## 总结

Screenity 是一个设计良好、功能全面的屏幕录制 Chrome 扩展。其代码架构体现了现代 Web 开发的最佳实践：

### 优势
1. **模块化设计**: 清晰的组件分离和职责划分
2. **技术栈现代**: 使用 React 18、TypeScript、Webpack 等现代技术
3. **功能丰富**: 涵盖录制、编辑、AI、云存储等完整功能链
4. **隐私友好**: 本地处理、无数据收集
5. **用户体验**: 直观的界面和丰富的快捷键
6. **国际化**: 支持 20+ 种语言
7. **可扩展**: 良好的架构支持未来功能扩展

### 技术亮点
1. **AI集成**: TensorFlow.js 用于背景处理
2. **媒体处理**: FFmpeg.js 用于视频编辑
3. **Canvas技术**: Fabric.js 用于高级绘制功能
4. **Chrome API**: 充分利用浏览器扩展能力
5. **性能优化**: Offscreen Documents、Web Workers 等技术

### 代码质量
- 遵循现代前端开发最佳实践
- 良好的错误处理和边界情况考虑
- 清晰的代码结构和命名规范
- 合理的配置管理和环境变量使用

这个项目展示了如何构建一个专业级的浏览器扩展，平衡了功能丰富性、性能优化和用户体验。