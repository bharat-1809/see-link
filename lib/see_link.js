"use strict";
const puppeteer = require("puppeteer-extra");
const fetch = require("node-fetch");
const stealthPluginPuppeteer = require("puppeteer-extra-plugin-stealth");
const getUrls = require("get-urls");
const contentGetter = require("./content_getters.js");
const { FACEBOOK_USER_AGENT } = require("./constants.js");

/**
 * Get the preview metadata of the provided URL
 *
 * @param {string} url
 * @param  {seeLink.Options} options
 * @returns the preview metadata as `LinkPrevRes`
 *
 * @type {import ("./see_link")}
 */
module.exports = async (url, options) => {
  try {
    if (typeof url !== 'string') {
      throw new TypeError(`The \`url\` argument should be a string, got ${typeof url}`);
    }

    puppeteer.use(stealthPluginPuppeteer());

    var params = {};
    if (options != null) {
      if (options.args != null) params.args = options.args;
      if (options.executablePath != null) params.executablePath = options.executablePath;
      if (options.headless != null) params.headless = options.headless;
      if (options.timeout != null) params.timeout = options.timeout;
    }

    const browser = await puppeteer.launch(params);
    const page = await browser.newPage();

    // For the sake of debugging
    page.on("console", (msg) => {
      for (let i = 0; i < msg._args.length; ++i) console.log(msg.text());
    });

    await page.setUserAgent(options?.userAgent ?? FACEBOOK_USER_AGENT);

    const urls = getUrls(url);
    await page.goto(urls.values().next().value);

    await page.exposeFunction("isURLMediaAccessible", contentGetter.isURLMediaAccessible);
    await page.exposeFunction("normalizeMediaUrl", contentGetter.normalizeMediaUrl);
    await page.exposeFunction("fetch", fetch);

    var previewObj = {};

    previewObj.title = await contentGetter.getTitle(page);
    previewObj.description = await contentGetter.getDescription(page);
    previewObj.image = await contentGetter.getImage(page);
    previewObj.domainName = await contentGetter.getDomainName(page);

    if (options != null) {
      if (options.detailedPreview) {
        previewObj.icon = await contentGetter.getFavicon(page);
        previewObj.type = await contentGetter.getMediaType(page);
      }

      if (options.getVideo || options.detailedPreview) {
        previewObj.video = await contentGetter.getVideo(page);
      }

      if (options.getThemeColor || options.detailedPreview) {
        previewObj.themeColor = await contentGetter.getThemeColor(page);
      }
    }

    await browser.close();
    return previewObj;
  } catch (error) {
    console.log(`Error @ seeLink : ${error}`);
    throw error;
  }
};