const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const localsPath = path.join(root, "locals.js");
const source = fs.readFileSync(localsPath, "utf8");
const context = {};

vm.createContext(context);
vm.runInContext(source, context, { filename: localsPath });

assert.ok(context.I18N, "locals.js should define I18N");
assert.ok(context.I18N.conf, "I18N.conf should exist");
assert.ok(context.I18N["zh-CN"], "zh-CN dictionary should exist");

const zh = context.I18N["zh-CN"];
assert.equal(zh.public.static.Models, "模型");
assert.equal(zh.public.static.Datasets, "数据集");
assert.equal(zh.public.static.Spaces, "应用空间");
assert.equal(zh.public.title.static["Welcome - Hugging Face"], "欢迎 - Hugging Face");

const welcome = zh.welcome.static;
assert.equal(welcome["Welcome to Hugging Face"], "欢迎来到 Hugging Face");
assert.equal(welcome.Explorer, "探索者");
assert.equal(welcome["App Builder"], "应用构建者");
assert.equal(welcome.Engineer, "工程师");
assert.equal(welcome.Researcher, "研究者");
assert.equal(welcome["Open source libraries"], "开源库");
assert.equal(welcome["HF Spaces"], "HF Spaces");
assert.equal(welcome.HuggingChat, "HuggingChat");

const docs = zh.docs.static;
assert.equal(docs.Documentation, "文档");
assert.equal(docs["Search documentation"], "搜索文档");
assert.equal(docs["Getting Started"], "开始使用");
assert.equal(docs.Quickstart, "快速开始");
assert.equal(docs.Installation, "安装");
assert.equal(docs.Tutorials, "教程");
assert.equal(docs["How-to guides"], "操作指南");
assert.equal(docs["API reference"], "API 参考");
assert.equal(docs["Edit this page"], "编辑此页面");
assert.equal(docs["Open in Colab"], "在 Colab 中打开");

const learn = zh.learn.static;
assert.equal(learn["Hugging Face Learn"], "Hugging Face 学习");
assert.equal(learn["LLM Course"], "大语言模型课程");
assert.equal(learn["Agents Course"], "智能体课程");
assert.equal(learn["Diffusion Course"], "扩散模型课程");
assert.equal(learn["Computer Vision Course"], "计算机视觉课程");
assert.equal(learn.Prerequisites, "前置要求");
assert.equal(learn.Setup, "设置");
assert.equal(learn.Authenticate, "身份验证");
assert.equal(learn["Create a repository"], "创建仓库");
assert.equal(learn["Upload files"], "上传文件");

console.log("locals smoke test passed");
