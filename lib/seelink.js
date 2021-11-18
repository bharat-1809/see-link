"use strict";
import puppeteer from "puppeteer";
import isBase64 from "is-base64";
import getUrls from "get-urls";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://bharatsharma.me");

  await page.setUserAgent(
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
  );

  page.evaluate(() => {
    document.addEventListener("DOMContentLoaded", async () => { 
      console.log(await getTitle(page));
      console.log(await getDescription(page));
      console.log(await getImage(page, "https://google.com"));  
    });
  });

  await browser.close();
})();

/**
 * 
 * @param {string} element
 * @param {string} attributeName
 * @returns the content of the `element` or `null` if not found
 */
const getContent = (element) => {
  const contentEl = document.querySelector(element);
  const content = contentEl?.getAttribute(attributeName);

  if (content != null && content.length > 0) {
    return content;
  } else {
    return null;
  }
};

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
    const ogTitle = getContent("meta[property='og:title']");
    if (ogTitle != null) {
      return ogTitle;
    }

    const twitterTitle = getContent("meta[name='twitter:title']");
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
 * 
 * @param {puppeteer.Page} page 
 */
export const getDescription = async (page) => {
  const url = page.url();
  if (url == "https://www.google.com/") {
    return "Search the world's information, including webpages, images, videos and more.";
  }

  const description = await page.evaluate(() => {
    const ogDescription = getContent("meta[property='og:description']");
    if (ogDescription != null) {
      return ogDescription;
    }

    const twitterDescription = getContent("meta[name='twitter:description']");
    if (twitterDescription != null) {
      return twitterDescription;
    }
    
    const metaDescription = getContent("meta[name='description']");
    if (metaDescription != null) {
      return metaDescription;
    }
    
    const paragraphs = document.querySelectorAll('p');
    for (var i = 0; i < paragraphs.length; ++i) { // Get first un-hidden paragraph
      if (paragraphs[i].offsetParent !== null && !paragraphs[i].childElementCount != 0) {
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
    const contentType = urlResponse.headers["content-type"];
    return RegExp("image/").test(contentType);
  }
};

/**
 * 
 * @param {puppeteer.Page} page 
 * @param {string} url 
 */
export const getImage = async (page, url) => {
  const img = await page.evaluate(async () => {
    const ogImg = getContent("meta[property='og:image']");
    if (ogImg != null && await isURLImageAccessible(ogImg)) {
      return ogImg;
    }

    const relImgLink = getContent("link[rel='image_src']", "href");
    if (relImgLink != null && await isURLImageAccessible(relImgLink)) {
      return relImgLink;
    }

    const twitterImg = getContent("meta[name='twitter:image']");
    if (twitterImg != null && await isURLImageAccessible(twitterImg)) {
      return twitterImg;
    }

    var imgList = Array.from(document.getElementsByTagName("img"));
    if (imgList.length > 0) {
      imgList.filter((img) => {
        var addImg = false;
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
        imgUrl = imgUrl.indexOf("//") === -1 ? ('${URL(url).origin}/${imgUrl}') : imgUrl;
        return imgUrl;
      }
    }

    return null;
  });
  return img;
};