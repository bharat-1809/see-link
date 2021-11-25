"use strict";
const puppeteer = require("puppeteer-extra");
const fetch = require("node-fetch");
const stealthPluginPuppeteer = require("puppeteer-extra-plugin-stealth");
const getUrls = require("get-urls");
const contentGetter = require("./content_getters.js");
const {
  PREVIEW_DETAILED,
  PREVIEW_VIDEO,
  PREVIEW_THEME_COLOR,
  FACEBOOK_USER_AGENT,
} = require("./constants.js");

/**
 * Get the preview metadata of the provided URL
 *
 * @param {string} uri
 * @param  {string[]} linkPrevOptions
 * @returns the preview metadata as `LinkPrevRes`
 * 
 * @type {import ("./see_link")}
 */
module.exports = async (uri, linkPrevOptions) => {
  try {
    puppeteer.use(stealthPluginPuppeteer());

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // For the sake of debugging
    page.on("console", (msg) => {
      for (let i = 0; i < msg._args.length; ++i) console.log(msg.text());
    });

    await page.setUserAgent(FACEBOOK_USER_AGENT);

    const urls = getUrls(uri);
    await page.goto(urls.values().next().value);

    await page.exposeFunction(
      "isURLMediaAccessible",
      contentGetter.isURLMediaAccessible
    );
    await page.exposeFunction(
      "normalizeMediaUrl",
      contentGetter.normalizeMediaUrl
    );
    await page.exposeFunction("fetch", fetch);

    var previewObj = {};

    previewObj.title = await contentGetter.getTitle(page);
    previewObj.description = await contentGetter.getDescription(page);
    previewObj.image = await contentGetter.getImage(page);
    previewObj.domainName = await contentGetter.getDomainName(page);

    const options = linkPrevOptions;
    if (options != null) {
      if (options.includes(PREVIEW_DETAILED)) {
        previewObj.icon = await contentGetter.getFavicon(page);
        previewObj.type = await contentGetter.getMediaType(page);
      }

      if (
        options.includes(PREVIEW_VIDEO) ||
        options.includes(PREVIEW_DETAILED)
      ) {
        previewObj.video = await contentGetter.getVideo(page);
      }

      if (
        options.includes(PREVIEW_THEME_COLOR) ||
        options.includes(PREVIEW_DETAILED)
      ) {
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