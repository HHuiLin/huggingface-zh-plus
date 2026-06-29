# Hugging Face 中文化增强脚本

这是一个用于 Hugging Face 网页界面中文化的用户脚本项目。

第一版重点补齐新用户欢迎页的汉化内容：

- `https://huggingface.co/welcome`

项目当前先作为私有仓库维护。等词库和脚本稳定后，可以再改成公开仓库。

## 功能

- 中文化 Hugging Face 的导航、按钮、标题、提示文字。
- 重点补齐新用户欢迎页的引导内容。
- 支持页面动态加载后的自动补翻。
- 支持翻译 `placeholder`、`title`、`aria-label` 等常见属性。
- 尽量跳过代码块、模型名、数据集名、用户名和用户生成内容，减少误翻。

## 安装

1. 安装 Tampermonkey 或 Violentmonkey 浏览器扩展。
2. 打开仓库里的 `main.user.js`。
3. 在用户脚本管理器中安装这个脚本。
4. 刷新 Hugging Face 页面。

如果是本地调试，需要让 `main.user.js` 能加载同目录的 `locals.js`。

## 文件说明

- `main.user.js`：主脚本，负责监听页面变化并执行翻译。
- `locals.js`：词库文件，负责保存英文和中文的对应关系。
- `test/locals-smoke.test.cjs`：词库体检脚本，用来检查关键词条是否存在。

## 添加漏翻

如果看到页面上还有英文没翻，通常只需要改 `locals.js`。

最常见的是在 `I18N["zh-CN"].public.static` 或 `I18N["zh-CN"].welcome.static` 里添加一行：

```js
"English text": "中文翻译",
```

注意：

- 英文要和网页上的原文完全一致。
- 不要翻译模型名、数据集名、用户名。
- 不要翻译代码、模型卡、数据集卡等用户自己写的内容。

## 验证

修改后可以运行：

```bash
node test/locals-smoke.test.cjs
node --check main.user.js
```

看到 `locals smoke test passed`，并且语法检查没有报错，就说明基础检查通过。

## 参考

项目结构和维护方式参考：

- [maboloshi/github-chinese](https://github.com/maboloshi/github-chinese)

## 许可证

MIT License

