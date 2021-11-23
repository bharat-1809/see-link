"use strict";
import puppeteer from "puppeteer-extra";
import fetch from "node-fetch";
import stealthPluginPuppeteer from "puppeteer-extra-plugin-stealth";
import getUrls from "get-urls";
import * as contentGetter from "./content_getters.js";

/**
 *
 * @param {string} url
 * @param  {...any} options
 * @returns
 */
export const seeLink = async (url, ...options) => {
  try {
    puppeteer.use(stealthPluginPuppeteer());

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // For the sake of debugging
    page.on("console", (msg) => {
      for (let i = 0; i < msg._args.length; ++i) console.log(msg.text());
    });

    await page.setUserAgent(
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
    );

    const urls = getUrls(url);
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

    const opt = options;

    if (opt.includes("detailed")) {
      previewObj.icon = await contentGetter.getFavicon(page);
      previewObj.type = await contentGetter.getMediaType(page);
    }

    if (opt.includes("video") || opt.includes("detailed")) {
      previewObj.video = await contentGetter.getVideo(page);
    }

    if (opt.includes("theme") || opt.includes("detailed")) {
      previewObj.themeColor = await contentGetter.getThemeColor(page);
    }

    await browser.close();
    return previewObj;
  } catch (error) {
    console.log(`Error @ seeLink : ${error}`);
  }
};
