# Hugging Face 中文化增强脚本设计

日期：2026-06-29

## 目标

创建一个新的 GitHub 仓库 `huggingface-zh-plus`，先设为私有，后续稳定后可改为公开。

项目提供一个 Hugging Face 中文化用户脚本，用来补齐 Hugging Face 页面里还没有汉化的内容，第一版重点覆盖新用户欢迎页：

- `https://huggingface.co/welcome`

项目 README 的参考项目只写：

- `maboloshi/github-chinese`

## 用户使用方式

用户安装 `main.user.js`。脚本通过 Tampermonkey 或 Violentmonkey 等用户脚本管理器运行。

脚本打开 Hugging Face 页面后会自动：

1. 判断当前页面类型。
2. 扫描页面里的英文界面文字。
3. 从 `locals.js` 里查找对应中文。
4. 把匹配到的英文替换成中文。
5. 页面局部刷新或切换时继续补翻。

## 仓库结构

采用“主脚本 + 词库分离”的结构：

```text
huggingface-zh-plus/
  main.user.js
  locals.js
  README.md
  LICENSE
  docs/superpowers/specs/2026-06-29-huggingface-zh-plus-design.md
```

各文件职责：

- `main.user.js`：负责脚本入口、监听页面变化、调用翻译逻辑。
- `locals.js`：负责存放英文到中文的词库、正则翻译规则、选择器翻译规则、忽略规则。
- `README.md`：用大白话说明安装、用途、维护方式，只写 `maboloshi/github-chinese` 作为参考项目。
- `LICENSE`：使用 MIT License，方便以后公开。

## 汉化范围

第一版覆盖：

- Hugging Face 通用导航。
- 常见按钮、输入框占位文字、标题、提示文字。
- `https://huggingface.co/welcome` 新用户欢迎页的主要引导内容。
- 页面标题，例如 `Welcome - Hugging Face`。

第一版明确不翻译：

- 模型名称。
- 数据集名称。
- 用户名、组织名。
- 代码块。
- Markdown 正文和用户生成内容。
- 文章、模型卡、数据集卡等长内容。

这样可以避免“把不该翻的专业名词或用户内容也翻掉”。

## 页面识别

脚本根据网址判断页面类型。

第一版至少支持：

- `/welcome`：新用户欢迎页。
- `/models`：模型列表页。
- `/datasets`：数据集列表页。
- `/spaces`：应用空间列表页。
- `/docs`：文档页入口。
- `/pricing`：定价页。
- `/settings`：设置页。
- 其他 Hugging Face 页面：走公共词库。

## 翻译机制

翻译按三层处理：

1. 精确词库：英文完全一样时替换。
2. 正则词库：处理动态文本，例如包含数字、日期、数量的句子。
3. 选择器词库：某些页面固定位置的文字，用 CSS 选择器直接替换。

脚本还会翻译常见属性：

- `placeholder`
- `title`
- `aria-label`
- 按钮类 input 的 `value`

## 动态页面处理

Hugging Face 是现代网页，很多内容不是一次性加载完的。

因此脚本需要：

- 页面刚打开时扫描一次。
- 页面内容变化时自动补扫。
- 网址变化但没有整页刷新时重新判断页面类型。
- 延迟补扫几次，处理慢加载出来的内容。

## 忽略规则

脚本要跳过这些区域：

- `pre`
- `code`
- `textarea`
- `.markdown-body`
- `.model-card-content`
- `.hf-sanitized`
- `relative-time`
- 面包屑里容易包含模型名和用户名的区域

目的是减少误翻。

## 开关和安全

脚本提供 Tampermonkey 菜单：

- 启用或禁用正则翻译。
- 启用或禁用属性翻译。

脚本内部用安全包装函数处理异常。如果某个翻译规则出错，只记录到控制台，不影响 Hugging Face 正常打开。

## 验证方式

第一版完成后验证：

1. 检查 JavaScript 语法是否能通过 Node 解析。
2. 检查 `main.user.js` 是否能看到 `I18N` 词库。
3. 检查欢迎页词条是否在 `locals.js` 中存在。
4. 检查 Git 状态干净，并确认代码已推送到私有 GitHub 仓库。

## GitHub 发布策略

仓库创建时使用私有仓库。

后续公开前需要确认：

- README 中没有私人信息。
- 代码中没有账号 Token 或密钥。
- README 只写 `maboloshi/github-chinese` 作为参考项目。
- LICENSE 使用 MIT。

