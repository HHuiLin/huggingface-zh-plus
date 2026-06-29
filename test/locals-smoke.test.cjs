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

console.log("locals smoke test passed");
