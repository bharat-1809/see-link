"use strict";
import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://bharatsharma.me/");

  await page.setUserAgent(
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
  );

  console.log(await getTitle(page));
  console.log(await getDescription(page));

  await browser.close();
})();

/**
 * Get the title of the given page. It finds the title from the
 * following elements (in order) and returns the first result it finds:
 * - open graph title
 * - twitter title
 * - document title
 * - First H1 element
 * - First H2 element
 *
 * @param {puppeteer.Page} page - Webpage to get title from
 */
export const getTitle = async (page) => {
  const title = await page.evaluate(() => {
    const ogTitleEl = document.querySelector('meta[property="og:title"]');
    const ogTitle = ogTitleEl?.getAttribute('content');
    if (ogTitle != null && ogTitle.length > 0) {
      return ogTitle;
    }

    const twitterTitleEl = document.querySelector('meta[name="twitter:title"]');
    const twitterTitle = twitterTitleEl?.getAttribute('content');
    if (twitterTitle != null && twitterTitle > 0) {
      return twitterTitle;
    }

    const documentTitle = document.title;
    if (documentTitle != null && documentTitle.length > 0) {
      return documentTitle;
    }

    const h1Element = document.querySelector("h1");
    const h1 = h1Element ? h1Element.innerHTML : null;
    if (h1 != null && h1.length > 0) {
      return h1;
    }

    const h2Element = document.querySelector("h2");
    const h2 = h2Element ? h2Element.innerHTML : null;
    if (h2 != null && h2.length > 0) {
      return h2;
    }

    return null;
  });
  return title;
};

/**
 * Get the description of the given page. It finds the description from the
 * following elements (in order) and returns the first result if finds:
 * - open graph description
 * - twitter description
 * - meta description
 * - paragraph (155 characters)
 * - body (155 characters)
 * 
 * @param {puppeteer.Page} page 
 */
export const getDescription = async (page) => {
  const description = await page.evaluate(() => {
    const ogDescriptionEl = document.querySelector('meta[property="og:description"]');
    const ogDescription = ogDescriptionEl?.getAttribute('content');
    if (ogDescription != null && ogDescription.length > 0) {
      return ogDescription;
    }

    const twitterDescriptionEl = document.querySelector('meta[name="twitter:description"]');
    const twitterDescription = twitterDescriptionEl?.getAttribute('content');
    if (twitterDescription != null && twitterDescription.length > 0) {
      return twitterDescription;
    }
    
    const metaDescriptionEl = document.querySelector('meta[name="description"]');
    const metaDescription = metaDescriptionEl?.getAttribute('content');
    if (metaDescription != null && metaDescription.length > 0) {
      return metaDescription;
    }
    
    const paragraphs = document.querySelectorAll('p');
    for (var i = 0; i < paragraphs.length; ++i) { // Get first un-hidden paragraph
      if (paragraphs[i].offsetParent !== null && !paragraphs[i].childElementCount != 0) {
        return paragraphs[i].textContent.substring(0, 155);
      }
    }

    const bodyText = document.body.textContent;
    return bodyText.substring(0, 155);
  });
  return description;
};