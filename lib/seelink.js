"use strict";
import puppeteer from "puppeteer-extra";
import fetch from "node-fetch";
import stealthPluginPuppeteer from "puppeteer-extra-plugin-stealth";
import getUrls from "get-urls";
import * as contentGetter from "./content_getters.js";

/**
 *
 * @param {string} url
 */
export const seelink = async (url) => {
  puppeteer.use(stealthPluginPuppeteer());

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // For the sake of debugging
  page.on("console", (msg) => {
    for (let i = 0; i < msg._args.length; ++i)
      console.log(`${i}: ${msg._args[i]}`);
  });

  await page.setUserAgent(
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
  );
  
  const urls = getUrls(url);
  await page.goto(urls.values().next().value);

  await page.exposeFunction("isURLImageAccessible", contentGetter.isURLImageAccessible);
  await page.exposeFunction("fetch", fetch);

  console.log(await contentGetter.getTitle(page));
  console.log(await contentGetter.getDescription(page));
  console.log(await contentGetter.getImage(page));
  console.log(await contentGetter.getDomainName(page));

  await browser.close();
};
