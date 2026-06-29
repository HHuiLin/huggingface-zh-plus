// ==UserScript==
// @name         Hugging Face 中文化增强脚本
// @namespace    https://github.com/HHuiLin/huggingface-zh-plus
// @description  中文化 Hugging Face 界面，重点补齐新用户欢迎页等漏翻内容。
// @version      0.1.0
// @author       Alin
// @license      MIT
// @match        https://huggingface.co/*
// @match        https://hf-mirror.com/*
// @require      https://raw.githubusercontent.com/HHuiLin/huggingface-zh-plus/main/locals.js
// @run-at       document-start
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @supportURL   https://github.com/HHuiLin/huggingface-zh-plus/issues
// ==/UserScript==

(function (window, document) {
  "use strict";

  const CONFIG = {
    LANG: "zh-CN",
    PAGE_PATTERNS: [
      ["welcome", /^\/welcome(\/|$)/],
      ["settings", /^\/settings(\/|$)/],
      ["pricing", /^\/pricing(\/|$)/],
      ["datasets", /^\/datasets(\/|$)/],
      ["spaces", /^\/spaces(\/|$)/],
      ["models", /^\/models(\/|$)/],
      ["docs", /^\/docs(\/|$)/],
      ["learn", /^\/learn(\/|$)/],
    ],
    OBSERVER_CONFIG: {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["value", "placeholder", "aria-label", "title"],
    },
  };

  const State = {
    pageConfig: null,
    currentURL: window.location.href,
    observer: null,
    titleObserver: null,
    menuIds: [],
    features: {
      enableRegExp: gmGet("hf_plus_enable_regexp", true),
      enableTransAttr: gmGet("hf_plus_enable_attr", true),
    },
  };

  function gmGet(key, fallback) {
    try {
      if (typeof GM_getValue === "function") return GM_getValue(key, fallback);
    } catch (_) {}
    return fallback;
  }

  function gmSet(key, value) {
    try {
      if (typeof GM_setValue === "function") GM_setValue(key, value);
    } catch (_) {}
  }

  function safe(fn, label) {
    return function (...args) {
      try {
        return fn.apply(this, args);
      } catch (error) {
        console.error(`[HF 中文化增强] ${label} 出错:`, error);
      }
    };
  }

  function init() {
    if (typeof I18N === "undefined") {
      console.error("[HF 中文化增强] locals.js 未加载，脚本停止运行。");
      return;
    }

    setLang();
    setupMenuCommands();
    setupUrlDetection();
    setupWhenBodyReady();
  }

  function setLang() {
    try {
      document.documentElement.lang = CONFIG.LANG;
    } catch (_) {}
  }

  function setupWhenBodyReady() {
    const start = safe(() => {
      updatePageConfig("首次载入");
      setupMutationObserver();
      setupTitleObserver();
      runFullTranslation("首次翻译");
      setTimeout(() => runFullTranslation("延迟补扫1"), 800);
      setTimeout(() => runFullTranslation("延迟补扫2"), 2500);
      setTimeout(() => runFullTranslation("延迟补扫3"), 5000);
    }, "初始化");

    if (document.body) {
      start();
      return;
    }

    const waitBody = () => {
      if (document.body) {
        start();
        return;
      }
      window.requestAnimationFrame(waitBody);
    };

    window.requestAnimationFrame(waitBody);
  }

  function setupMenuCommands() {
    for (const id of State.menuIds) {
      try {
        if (typeof GM_unregisterMenuCommand === "function") GM_unregisterMenuCommand(id);
      } catch (_) {}
    }
    State.menuIds = [];

    registerMenu(`${State.features.enableRegExp ? "禁用" : "启用"} 正则翻译`, () => {
      State.features.enableRegExp = !State.features.enableRegExp;
      gmSet("hf_plus_enable_regexp", State.features.enableRegExp);
      setupMenuCommands();
      runFullTranslation("切换正则翻译");
    });

    registerMenu(`${State.features.enableTransAttr ? "禁用" : "启用"} 属性翻译`, () => {
      State.features.enableTransAttr = !State.features.enableTransAttr;
      gmSet("hf_plus_enable_attr", State.features.enableTransAttr);
      setupMenuCommands();
      runFullTranslation("切换属性翻译");
    });
  }

  function registerMenu(label, handler) {
    try {
      if (typeof GM_registerMenuCommand === "function") {
        State.menuIds.push(GM_registerMenuCommand(label, safe(handler, label)));
      }
    } catch (_) {}
  }

  function setupUrlDetection() {
    window.addEventListener("popstate", safe(handleURLChange, "popstate URL变化"));

    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);
      handleURLChange();
      return result;
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);
      handleURLChange();
      return result;
    };
  }

  function handleURLChange() {
    const nextURL = window.location.href;
    if (nextURL === State.currentURL) return;
    State.currentURL = nextURL;
    updatePageConfig("URL变化");
    setupMutationObserver();
    setupTitleObserver();
    runFullTranslation("URL变化翻译");
  }

  function detectPageType() {
    const pathname = window.location.pathname;
    for (const [type, pattern] of CONFIG.PAGE_PATTERNS) {
      if (pattern.test(pathname)) return type;
    }
    return "public";
  }

  function updatePageConfig(trigger) {
    const pageType = detectPageType();
    State.pageConfig = buildPageConfig(pageType);
    console.log(`[HF 中文化增强] ${trigger}: 页面类型 = ${pageType}`);
  }

  function buildPageConfig(pageType) {
    const lang = I18N[CONFIG.LANG] || {};
    const publicConfig = lang.public || {};
    const pageConfig = lang[pageType] || {};
    const globalIgnore = I18N.conf?.ignoreSelectors?.["*"] || [];
    const pageIgnore = I18N.conf?.ignoreSelectors?.[pageType] || [];

    return {
      pageType,
      staticDict: { ...(publicConfig.static || {}), ...(pageConfig.static || {}) },
      regexpRules: [...(pageConfig.regexp || []), ...(publicConfig.regexp || [])],
      selectorRules: [...(publicConfig.selector || []), ...(pageConfig.selector || [])],
      titleStatic: {
        ...(publicConfig.title?.static || {}),
        ...(pageConfig.title?.static || {}),
      },
      titleRegexp: [...(pageConfig.title?.regexp || []), ...(publicConfig.title?.regexp || [])],
      ignoreSelector: [...globalIgnore, ...pageIgnore].join(", "),
      characterData: Boolean(I18N.conf?.characterDataPages?.includes(pageType)),
    };
  }

  function setupMutationObserver() {
    if (!document.body) return;
    if (State.observer) State.observer.disconnect();

    State.observer = new MutationObserver(
      safe((mutations) => {
        if (window.location.href !== State.currentURL) handleURLChange();
        if (!State.pageConfig) return;
        processMutations(mutations);
      }, "MutationObserver"),
    );

    State.observer.observe(document.body, CONFIG.OBSERVER_CONFIG);
  }

  function setupTitleObserver() {
    if (State.titleObserver) State.titleObserver.disconnect();
    const title = document.querySelector("title");
    if (!title) return;

    State.titleObserver = new MutationObserver(safe(translateTitle, "标题变化"));
    State.titleObserver.observe(title, { childList: true, subtree: true });
  }

  function processMutations(mutations) {
    const targets = new Set();

    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          addMutationTarget(targets, node);
        }
      }

      if (mutation.type === "attributes") {
        addMutationTarget(targets, mutation.target);
      }

      if (mutation.type === "characterData" && State.pageConfig.characterData) {
        addMutationTarget(targets, mutation.target);
      }
    }

    for (const node of pruneNestedTargets(targets)) {
      translateNode(node);
    }
    translateBySelector();
    translateTitle();
  }

  function addMutationTarget(targets, node) {
    if (!node) return;
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (isIgnored(element)) return;
    targets.add(node);
  }

  function pruneNestedTargets(targets) {
    const result = [];
    for (const node of targets) {
      let parent = node.parentElement;
      let hasAncestor = false;
      while (parent) {
        if (targets.has(parent)) {
          hasAncestor = true;
          break;
        }
        parent = parent.parentElement;
      }
      if (!hasAncestor) result.push(node);
    }
    return result;
  }

  function runFullTranslation(label) {
    safe(() => {
      if (!document.body || !State.pageConfig) return;
      translateNode(document.body);
      translateBySelector();
      translateTitle();
      console.log(`[HF 中文化增强] ${label} 完成`);
    }, label)();
  }

  function translateNode(root) {
    if (!root || !State.pageConfig) return;

    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root);
      return;
    }

    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE && isIgnored(root)) return;

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (node.nodeType === Node.ELEMENT_NODE && isIgnored(node)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    handleElementNode(root);

    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
      if (node.nodeType === Node.ELEMENT_NODE) handleElementNode(node);
    }
  }

  function isIgnored(element) {
    if (!element || !State.pageConfig?.ignoreSelector) return false;
    try {
      return element.matches?.(State.pageConfig.ignoreSelector) || element.closest?.(State.pageConfig.ignoreSelector);
    } catch (_) {
      return false;
    }
  }

  function translateTextNode(node) {
    if (!node || node.nodeValue.length > 3000) return;
    const translated = translateText(node.nodeValue);
    if (translated !== false) node.nodeValue = translated;
  }

  function handleElementNode(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
    const tag = element.tagName;

    if (tag === "INPUT" || tag === "TEXTAREA") {
      if (["button", "submit", "reset"].includes(element.type)) translateAttribute(element, "value");
      translateAttribute(element, "placeholder");
    }

    translateAttribute(element, "title");
    translateAttribute(element, "aria-label");
  }

  function translateAttribute(element, attr) {
    if (!State.features.enableTransAttr || !element?.getAttribute) return;
    const value = element.getAttribute(attr);
    if (!value) return;
    const translated = translateText(value);
    if (translated !== false) element.setAttribute(attr, translated);
  }

  function translateText(text) {
    if (!text || typeof text !== "string") return false;
    if (!/[A-Za-z]/.test(text)) return false;
    if (/^[\s0-9.,:;!?()[\]{}'"<>/\\|@#$%^&*+=_-]+$/.test(text)) return false;

    const trimmed = text.trim();
    if (!trimmed) return false;

    const normalized = trimmed.replace(/[\s\u00a0]+/g, " ");
    const result = fetchTranslation(normalized);
    if (!result || result === normalized) return false;

    return text.replace(trimmed, result);
  }

  function fetchTranslation(text) {
    if (!State.pageConfig) return false;

    const exact = State.pageConfig.staticDict[text];
    if (typeof exact === "string") return exact;

    if (State.features.enableRegExp) {
      for (const [pattern, replacement] of State.pageConfig.regexpRules) {
        const result = text.replace(pattern, replacement);
        if (result !== text) return result;
      }
    }

    return false;
  }

  function translateBySelector() {
    if (!State.pageConfig?.selectorRules) return;

    for (const [selector, translation] of State.pageConfig.selectorRules) {
      try {
        for (const element of document.querySelectorAll(selector)) {
          if (!isIgnored(element) && element.textContent.trim() !== translation) {
            element.textContent = translation;
          }
        }
      } catch (_) {}
    }
  }

  function translateTitle() {
    if (!State.pageConfig) return;
    const current = document.title;
    if (!current) return;

    const exact = State.pageConfig.titleStatic[current];
    if (exact) {
      document.title = exact;
      return;
    }

    if (State.features.enableRegExp) {
      for (const [pattern, replacement] of State.pageConfig.titleRegexp) {
        const result = current.replace(pattern, replacement);
        if (result !== current) {
          document.title = result;
          return;
        }
      }
    }
  }

  init();
})(window, document);
