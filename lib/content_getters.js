"use strict";
import isBase64 from "is-base64";
import getUrls from "get-urls";
import fetch from "node-fetch";
import puppeteer from "puppeteer";

/**
 * The attribute name for getting the content of elements
 */
const CONTENT_ATTRIBUTE = "content";
const LINK_CONTENT_ATTRIBUTE = "href";

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
  }, CONTENT_ATTRIBUTE);
  return title;
};

/**
 * Get the description of the given page. It finds the description from the
 * following elements (in order) and returns the very first result:
 * - Open graph description
 * - Twitter description
 * - Meta description
 * - Paragraph (155 characters)
 *
 * @param {puppeteer.Page} page
 */
export const getDescription = async (page) => {
  const url = new URL(page.url()).hostname;
  if (url == "www.google.com") {
    return "Search the world's information, including webpages, images, videos and more.";
  }

  const description = await page.evaluate((attributeName) => {
    const ogDescriptionEl = document.querySelector("meta[property='og:description']");
    const ogDescription = ogDescriptionEl?.getAttribute(attributeName);
    if (ogDescription != null) {
      return ogDescription;
    }

    const twitterDescriptionEl = document.querySelector("meta[name='twitter:description']");
    const twitterDescription = twitterDescriptionEl?.getAttribute(attributeName);
    if (twitterDescription != null) {
      return twitterDescription;
    }

    const metaDescriptionEl = document.querySelector("meta[name='description']");
    const metaDescription = metaDescriptionEl?.getAttribute(attributeName);
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
  }, CONTENT_ATTRIBUTE);
  return description;
};

/**
 * Checks whether the given url directs to an accessible image
 * asset or not.
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
 * Get an image form the page. It finds the asset from the following
 * (in order) and returns the very first result:
 * - Open graph image
 * - Twitter image
 * - Relational img (rel link)
 * - Images in page (img tags)
 * 
 * @param {puppeteer.Page} page
 */
export const getImage = async (page) => {
  const img = await page.evaluate(async (url, attributeName, linkAttributeName) => {
    const ogImgEl = document.querySelector("meta[property='og:image']");
    const ogImg = ogImgEl?.getAttribute(attributeName);
    if (ogImg != null && (await isURLImageAccessible(ogImg))) {
      return ogImg;
    }

    const twitterImgEl = document.querySelector("meta[name='twitter:image']");
    const twitterImg = twitterImgEl?.getAttribute(attributeName);
    if (twitterImg != null && (await isURLImageAccessible(twitterImg))) {
      return twitterImg;
    }

    const relImgLinkEl = document.querySelector("link[rel='image_src']");
    const relImgLink = relImgLinkEl?.getAttribute(linkAttributeName);
    if (relImgLink != null && (await isURLImageAccessible(relImgLink))) {
      return relImgLink;
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
  }, page.url(), CONTENT_ATTRIBUTE, LINK_CONTENT_ATTRIBUTE);
  return img;
};

/**
 * Get the domain name of the page
 * 
 * @param {puppeteer.Page} page 
 */
export const getDomainName = async (page) => {
  const domainName = await page.evaluate((contentAttribute, linkContentAttribute) => {
    const canonicalLinkEl = document.querySelector("link[rel='canonical']");
    const canonicalLink = canonicalLinkEl?.getAttribute(linkContentAttribute);
    if (canonicalLink != null) {
      return canonicalLink;
    }

    const ogUrlEl = document.querySelector("meta[property='og:url']");
    const ogUrl = ogUrlEl?.getAttribute(contentAttribute);
    if (ogUrl != null) {
      return ogUrl;
    }
  }, CONTENT_ATTRIBUTE, LINK_CONTENT_ATTRIBUTE);

  if (domainName != null) {
    return new URL(domainName).hostname.replace("www.", "");
  } else {
    return new URL(page.url()).hostname.replace("www.", "");
  }
} 