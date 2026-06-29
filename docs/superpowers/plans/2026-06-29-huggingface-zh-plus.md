# Hugging Face 中文化增强脚本 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a GitHub repository containing a Hugging Face Chinese localization userscript with a split main script and dictionary.

**Architecture:** `main.user.js` owns Tampermonkey metadata, DOM scanning, mutation handling, URL change detection, menu switches, and safe execution. `locals.js` owns the `I18N` dictionary, page rules, ignore rules, static translations, regular expression rules, selector rules, and title translations.

**Tech Stack:** Plain JavaScript userscript, Tampermonkey-compatible metadata, Node.js syntax checks, Git, GitHub CLI.

---

## File Structure

- Create: `test/locals-smoke.test.cjs`
  - Lightweight Node smoke test for the dictionary shape and required welcome page terms.
- Create: `locals.js`
  - Defines `var I18N = {}` and stores all rules used by the userscript.
- Create: `main.user.js`
  - Tampermonkey userscript that requires `locals.js` and applies translations.
- Create: `README.md`
  - Plain-language project description, installation steps, maintenance notes, and only one reference project: `maboloshi/github-chinese`.
- Create: `LICENSE`
  - MIT License.
- Modify: Git metadata through normal `git add`, `git commit`, remote setup, and push.

### Task 1: Add Dictionary Smoke Test

**Files:**
- Create: `test/locals-smoke.test.cjs`

- [ ] **Step 1: Write the failing smoke test**

```js
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
```

- [ ] **Step 2: Run the test to verify it fails because `locals.js` is missing**

Run: `node test/locals-smoke.test.cjs`

Expected: FAIL with an `ENOENT` message for `locals.js`.

- [ ] **Step 3: Commit the failing test**

```bash
git add test/locals-smoke.test.cjs
git commit -m "test: add locals smoke coverage"
```

### Task 2: Add `locals.js`

**Files:**
- Create: `locals.js`
- Test: `test/locals-smoke.test.cjs`

- [ ] **Step 1: Create dictionary with public and welcome page rules**

`locals.js` must define:

```js
var I18N = {};

I18N.conf = {
  characterDataPages: ["welcome", "models", "datasets", "spaces", "settings", "public"],
  ignoreSelectors: {
    "*": [
      "pre",
      "code",
      "textarea",
      ".markdown-body",
      ".model-card-content",
      ".blog-content",
      ".prose-doc",
      ".prose-card",
      ".hf-sanitized",
      "relative-time",
      '[data-testid="breadcrumb"]',
    ],
  },
};

I18N["zh-CN"] = {
  public: {
    static: {
      Models: "模型",
      Datasets: "数据集",
      Spaces: "应用空间",
      Docs: "文档",
      Pricing: "定价",
      Enterprise: "企业版",
      Tasks: "任务",
      Collections: "收藏集",
      Blog: "博客",
      Posts: "帖子",
      Papers: "论文",
      Organizations: "组织",
      "Log In": "登录",
      "Sign Up": "注册",
      Settings: "设置",
      Profile: "个人资料",
      New: "新建",
      Search: "搜索",
      Upload: "上传",
      Cancel: "取消",
      Save: "保存",
      Submit: "提交",
      Continue: "继续",
      Back: "返回",
      Next: "下一步",
      Done: "完成",
      Edit: "编辑",
      Delete: "删除",
      Create: "创建",
      Learn: "学习",
      Forum: "论坛",
      "Getting Started": "开始使用",
      "Get started": "开始使用",
      "Read the documentation": "阅读文档",
      "Create new Space": "创建新应用空间",
      "Ask HuggingChat": "向 HuggingChat 提问",
      "Data Studio": "数据工作室",
      "Inference Endpoints": "推理端点",
      "Inference Providers": "推理供应商",
      "Daily Papers": "每日论文",
      "The AI community building the future.": "构建未来的 AI 社区。",
    },
    regexp: [
      [/^Updated (.+) ago$/, "$1 前更新"],
      [/^Created (.+) ago$/, "$1 前创建"],
      [/^([\\d,.]+) likes?$/, "$1 个点赞"],
      [/^([\\d,.]+) downloads?$/, "$1 次下载"],
      [/^Browse ([\\d,.]+[kKmM+]*) models$/, "浏览 $1 个模型"],
      [/^Browse ([\\d,.]+[kKmM+]*) datasets$/, "浏览 $1 个数据集"],
      [/^Browse ([\\d,.]+[kKmM+]*) applications$/, "浏览 $1 个应用"],
    ],
    selector: [
      ["a[href='/models']", "模型"],
      ["a[href='/datasets']", "数据集"],
      ["a[href='/spaces']", "应用空间"],
      ["a[href='/docs']", "文档"],
      ["a[href='/pricing']", "定价"],
      ["a[href='/enterprise']", "企业版"],
      ["a[href='/blog']", "博客"],
      ["a[href='/posts']", "帖子"],
      ["a[href='/papers']", "每日论文"],
      ["a[href='/login']", "登录"],
      ["a[href='/signup']", "注册"],
    ],
    title: {
      static: {
        "Welcome - Hugging Face": "欢迎 - Hugging Face",
        "Models - Hugging Face": "模型 - Hugging Face",
        "Datasets - Hugging Face": "数据集 - Hugging Face",
        "Spaces - Hugging Face": "应用空间 - Hugging Face",
        "Pricing - Hugging Face": "定价 - Hugging Face",
      },
      regexp: [[/^(.+) - Hugging Face$/, "$1 - Hugging Face"]],
    },
  },
  welcome: {
    static: {
      "Welcome to Hugging Face": "欢迎来到 Hugging Face",
      "What are you interested in?": "你对什么感兴趣？",
      Explorer: "探索者",
      "App Builder": "应用构建者",
      Engineer: "工程师",
      Researcher: "研究者",
      "Explore models, datasets, papers and applications.": "探索模型、数据集、论文和应用。",
      "Build and share AI applications.": "构建并分享 AI 应用。",
      "Use open source libraries and production tools.": "使用开源库和生产工具。",
      "Discover research papers and state-of-the-art models.": "发现研究论文和前沿模型。",
      "Open source libraries": "开源库",
      "HF Spaces": "HF Spaces",
      HuggingChat: "HuggingChat",
      LeRobot: "LeRobot",
      "Train a model": "训练模型",
      "Local Models": "本地模型",
      "Inference Playground": "推理体验区",
      DeepSite: "DeepSite",
      "Data Studio": "数据工作室",
      "Dedicated Endpoints": "专用端点",
      Leaderboard: "排行榜",
      Smolagents: "Smolagents",
      "Get started with Hugging Face": "开始使用 Hugging Face",
      "Start exploring": "开始探索",
      "Start building": "开始构建",
      "View documentation": "查看文档",
      "Join the community": "加入社区",
    },
    title: {
      static: {
        "Welcome - Hugging Face": "欢迎 - Hugging Face",
      },
    },
  },
};
```

- [ ] **Step 2: Run the test to verify it passes**

Run: `node test/locals-smoke.test.cjs`

Expected: PASS and print `locals smoke test passed`.

- [ ] **Step 3: Commit dictionary**

```bash
git add locals.js test/locals-smoke.test.cjs
git commit -m "feat: add localization dictionary"
```

### Task 3: Add `main.user.js`

**Files:**
- Create: `main.user.js`
- Test: syntax check with Node.

- [ ] **Step 1: Create Tampermonkey main script**

`main.user.js` must include:

- Userscript metadata for `https://huggingface.co/*` and `https://hf-mirror.com/*`.
- `@require ./locals.js` for local development.
- Safe wrapper.
- Page detection for `/welcome`, `/models`, `/datasets`, `/spaces`, `/docs`, `/pricing`, `/settings`, and public fallback.
- DOM traversal with ignore selectors.
- Static, regex, selector, title, and attribute translation.
- MutationObserver and URL change detection.
- Menu switches for regex and attribute translation.

- [ ] **Step 2: Run syntax check**

Run: `node --check main.user.js`

Expected: PASS with exit code 0.

- [ ] **Step 3: Commit main script**

```bash
git add main.user.js
git commit -m "feat: add userscript translator"
```

### Task 4: Add README and License

**Files:**
- Create: `README.md`
- Create: `LICENSE`

- [ ] **Step 1: Add README**

README must explain:

- This is a Hugging Face Chinese localization userscript.
- Install Tampermonkey.
- Install `main.user.js`.
- `locals.js` is where missing translations are added.
- Reference project only: `maboloshi/github-chinese`.

- [ ] **Step 2: Add MIT License**

Use MIT License with copyright holder:

```text
Copyright (c) 2026 Alin
```

- [ ] **Step 3: Verify README reference scope**

Run: `rg -n "1cyber|huggingface-zh|maboloshi/github-chinese" README.md`

Expected: only `maboloshi/github-chinese` appears.

- [ ] **Step 4: Commit docs**

```bash
git add README.md LICENSE
git commit -m "docs: add readme and license"
```

### Task 5: Final Verification and GitHub Push

**Files:**
- Modify: Git history and remote config.

- [ ] **Step 1: Run full local verification**

Run:

```bash
node test/locals-smoke.test.cjs
node --check main.user.js
git status --short
```

Expected:

- Smoke test prints `locals smoke test passed`.
- Syntax check exits 0.
- Git status is clean after any final commit.

- [ ] **Step 2: Create GitHub repository**

Run:

```bash
gh repo create huggingface-zh-plus --public --source . --remote origin --push
```

Expected:

- GitHub creates a repository named `huggingface-zh-plus`.
- Local remote `origin` points to the new repository.
- Current branch is pushed.

- [ ] **Step 3: Confirm remote**

Run:

```bash
git remote -v
gh repo view --json name,visibility,url
```

Expected:

- Name is `huggingface-zh-plus`.
- Visibility is shown by GitHub.
- URL is shown for the new repository.
