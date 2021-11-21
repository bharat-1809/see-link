"use strict";
import isBase64 from "is-base64";
import getUrls from "get-urls";
import fetch from "node-fetch";

const ATTRIBUTE_NAME = "content"; 

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
  const title = await page.evaluate((attributeName) => {
    const ogTitleEl = document.querySelector("meta[property='og:title']"); 
    const ogTitle = ogTitleEl?.getAttribute(attributeName);
    if (ogTitle != null) {
      return ogTitle;
    }

    const twitterTitleEl = document.querySelector("meta[name='twitter:title']");
    const twitterTitle = twitterTitleEl?.getAttribute(attributeName);
    if (twitterTitle != null) {
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
  }, ATTRIBUTE_NAME);
  return title;
};

/**
 * Get the description of the given page. It finds the description from the
 * following elements (in order) and returns the first result if finds:
 * - open graph description
 * - twitter description
 * - meta description
 * - paragraph (155 characters)
 *
 * @param {puppeteer.Page} page
 */
export const getDescription = async (page) => {
  const url = new URL(page.url()).hostname;
  if (url == "www.google.com") {
    return "Search the world's information, including webpages, images, videos and more.";
  }

  const description = await page.evaluate(() => {
    const ogDescriptionEl = document.querySelector("meta[property='og:description']");
    const ogDescription = ogDescriptionEl?.getAttribute("content");
    if (ogDescription != null) {
      return ogDescription;
    }

    const twitterDescriptionEl = document.querySelector("meta[name='twitter:description']");
    const twitterDescription = twitterDescriptionEl?.getAttribute("content");
    if (twitterDescription != null) {
      return twitterDescription;
    }

    const metaDescriptionEl = document.querySelector("meta[name='description']");
    const metaDescription = metaDescriptionEl?.getAttribute("content");
    if (metaDescription != null) {
      return metaDescription;
    }

    const paragraphs = document.querySelectorAll("p");
    for (var i = 0; i < paragraphs.length; ++i) {
      // Get first un-hidden paragraph
      if (
        paragraphs[i].offsetParent !== null &&
        !paragraphs[i].childElementCount != 0
      ) {
        return paragraphs[i].textContent.substring(0, 155);
      }
    }
  });
  return description;
};

/**
 * Checks whether the given url directs to an accessible image asset
 *
 * @param {string} url
 */
export const isURLImageAccessible = async (url) => {
  if (isBase64(url, { mime: true })) {
    return true;
  }

  const urls = getUrls(url);
  if (urls.size !== 0) {
    const urlResponse = await fetch(urls.values().next().value);
    const contentType = urlResponse.headers.get('content-type');
    return RegExp("image/").test(contentType);
  }

  return false;
};

/**
 *
 * @param {puppeteer.Page} page
 */
export const getImage = async (page) => {
  const img = await page.evaluate(async (url) => {
    const ogImgEl = document.querySelector("meta[property='og:image']");
    const ogImg = ogImgEl?.getAttribute("content");
    if (ogImg != null && (await isURLImageAccessible(ogImg))) {
      return ogImg;
    }

    const relImgLinkEl = document.querySelector("link[rel='image_src']");
    const relImgLink = relImgLinkEl?.getAttribute("href");
    if (relImgLink != null && (await isURLImageAccessible(relImgLink))) {
      return relImgLink;
    }

    const twitterImgEl = document.querySelector("meta[name='twitter:image']");
    const twitterImg = twitterImgEl?.getAttribute("content");
    if (twitterImg != null && (await isURLImageAccessible(twitterImg))) {
      return twitterImg;
    }

    var imgList = Array.from(document.getElementsByTagName("img"));
    if (imgList.length > 0) {
      imgList.filter((img) => {
        var addImg = true;
        var height = img.naturalHeight;
        var width = img.naturalWidth;

        if (height < 50 || width < 50) {
          addImg = false;
        }

        if (height > width) {
          if (height / width > 3) {
            addImg = false;
          }
        } else {
          if (width / height > 3) {
            addImg = false;
          }
        }

        return addImg;
      });

      if (imgList.length > 0) {
        var imgUrl = imgList[0].src;
        
          if (imgUrl.indexOf("//") === -1) {
            var firstPart = new URL(url).origin + '/';
            imgUrl = firstPart.concat(imgUrl);
          }
        return imgUrl;
      }
    }

    return null;
  }, page.url());
  return img;
};

/**
 * 
 * @param {puppeteer.Page} page 
 */
export const getDomainName = async (page) => {
  const domainName = await page.evaluate(() => {
    const canonicalLinkEl = document.querySelector("link[rel='canonical']");
    const canonicalLink = canonicalLinkEl?.getAttribute("href");
    if (canonicalLink != null) {
      return canonicalLink;
    }

    const ogUrlEl = document.querySelector("meta[property='og:url']");
    const ogUrl = ogUrlEl?.getAttribute("content");
    if (ogUrl != null) {
      return ogUrl;
    }
  });

  if (domainName != null) {
    return new URL(domainName).hostname.replace("www.", "");
  } else {
    return new URL(page.url()).hostname.replace("www.", "");
  }
} 