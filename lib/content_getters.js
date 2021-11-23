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
const CONTENT_TYPE_IMAGE = "image";
const CONTENT_TYPE_VIDEO = "video";

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
    try {
      const ogTitleEl = document.querySelector("meta[property='og:title']");
      const ogTitle = ogTitleEl?.getAttribute(attributeName);
      if (ogTitle != null) {
        return ogTitle;
      }

      const twitterTitleEl = document.querySelector(
        "meta[name='twitter:title']"
      );
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
    } catch (error) {
      console.error(`Error @ getTitle() : ${error}`);
    }
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
    try {
      const ogDescriptionEl = document.querySelector(
        "meta[property='og:description']"
      );
      const ogDescription = ogDescriptionEl?.getAttribute(attributeName);
      if (ogDescription != null) {
        return ogDescription;
      }

      const twitterDescriptionEl = document.querySelector(
        "meta[name='twitter:description']"
      );
      const twitterDescription =
        twitterDescriptionEl?.getAttribute(attributeName);
      if (twitterDescription != null) {
        return twitterDescription;
      }

      const metaDescriptionEl = document.querySelector(
        "meta[name='description']"
      );
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
    } catch (error) {
      console.error(`Error @ getDescription() : ${error}`);
    }
  }, CONTENT_ATTRIBUTE);
  return description;
};

/**
 * Checks whether the given url directs to an accessible media
 * asset or not.
 *
 * @param {string} url
 */
export const isURLMediaAccessible = async (url, contentType) => {
  try {
    if (isBase64(url, { allowMime: true })) {
      return true;
    }

    const urls = getUrls(url);
    if (urls.size !== 0) {
      const urlResponse = await fetch(urls.values().next().value);
      console.log(urlResponse);
      const conType = urlResponse.headers.get("content-type");
      return RegExp(`${contentType}/`).test(conType);
    }

    return false;
  } catch (error) {
    console.error(`Error @ isURLMediaAccesible for (${contentType}): ${error}\nURL: ${url}`);
  }
};

/**
 * 
 * @param {string} mediaUrl 
 * @param {string} pageUrl 
 * @returns Normalized media URL
 */
export const normalizeMediaUrl = (mediaUrl, pageUrl) => {
  var  url = mediaUrl.indexOf("//") === -1 ? `${new URL(pageUrl).origin}/${mediaUrl}` : mediaUrl;
  return url;
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
  const img = await page.evaluate(
    async (url, attributeName, linkAttributeName, contentType) => {
      try {
        const ogImgEl = document.querySelector("meta[property='og:image']");
        const ogImg = ogImgEl?.getAttribute(attributeName);
        if (ogImg != null && (await isURLMediaAccessible(ogImg, contentType))) {
          return ogImg;
        }

        const twitterImgEl = document.querySelector(
          "meta[name='twitter:image']"
        );
        const twitterImg = twitterImgEl?.getAttribute(attributeName);
        if (
          twitterImg != null &&
          (await isURLMediaAccessible(twitterImg, contentType))
        ) {
          return twitterImg;
        }

        const relImgLinkEl = document.querySelector("link[rel='image_src']");
        const relImgLink = relImgLinkEl?.getAttribute(linkAttributeName);
        if (
          relImgLink != null &&
          (await isURLMediaAccessible(relImgLink, contentType))
        ) {
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
            return normalizeMediaUrl(imgUrl, url);
          }
        }

        return null;
      } catch (error) {
        console.error(`Error @ getImage : ${error}`);
      }
    },
    page.url(),
    CONTENT_ATTRIBUTE,
    LINK_CONTENT_ATTRIBUTE,
    CONTENT_TYPE_IMAGE
  );
  return img;
};

/**
 * Get the domain name of the page
 *
 * @param {puppeteer.Page} page
 */
export const getDomainName = async (page) => {
  const domainName = await page.evaluate(
    (contentAttribute, linkContentAttribute) => {
      try {
        const canonicalLinkEl = document.querySelector("link[rel='canonical']");
        const canonicalLink =
          canonicalLinkEl?.getAttribute(linkContentAttribute);
        if (canonicalLink != null) {
          return canonicalLink;
        }

        const ogUrlEl = document.querySelector("meta[property='og:url']");
        const ogUrl = ogUrlEl?.getAttribute(contentAttribute);
        if (ogUrl != null) {
          return ogUrl;
        }
      } catch (error) {
        console.error(`Error @ getDomainName : ${error}`);
      }
    },
    CONTENT_ATTRIBUTE,
    LINK_CONTENT_ATTRIBUTE
  );

  if (domainName != null) {
    return new URL(domainName).hostname.replace("www.", "");
  } else {
    return new URL(page.url()).hostname.replace("www.", "");
  }
};

/**
 *
 * @param {puppeteer.Page} page
 */
export const getThemeColor = async (page) => {
  const themeColor = await page.evaluate(async (attributeName) => {
    try {
      const themeColorEl = document.querySelector("meta[name='theme-color']");
      const themeColor = themeColorEl?.getAttribute(attributeName);
      if (themeColor != null) {
        return themeColor;
      }

      // TODO: Write a method to figure out the dominant color in the page

      return null;
    } catch (error) {
      console.error(`Error @ getThemeColor : ${error}`);
    }
  }, CONTENT_ATTRIBUTE);
  return themeColor;
};

/**
 *
 * @param {puppeteer.Page} page
 */
export const getVideo = async (page) => {
  const video = await page.evaluate(
    async (url, contentAttribute, linkContentAttribute, contentType) => {
      const ogVideoEl = document.querySelector("meta[property='og:video']");
      const ogVideo = ogVideoEl?.getAttribute(contentAttribute);
      if (
        ogVideo != null &&
        (await isURLMediaAccessible(ogVideo, contentType))
      ) {
        return ogVideo;
      }

      const twitterVideoEl = document.querySelector(
        "meta[name='twitter:player']"
      );
      const twitterVideo = twitterVideoEl?.getAttribute(contentAttribute);
      if (
        twitterVideo != null &&
        (await isURLMediaAccessible(twitterVideo, contentType))
      ) {
        return twitterVideo;
      }

      const documentVideoEl = document.querySelector("link[rel='video_src']");
      const documentVideo = documentVideoEl?.getAttribute(linkContentAttribute);
      if (
        documentVideo != null &&
        (await isURLMediaAccessible(documentVideo, contentType))
      ) {
        return documentVideo;
      }

      const isUrlVideo = await isURLMediaAccessible(url, contentType);
      if (isUrlVideo) {
        return url;
      }

      var videoList = Array.from(document.getElementsByTagName("video"));
      if (videoList.length != 0) {
        videoList = videoList.filter(async (video) => {
          var videoUrl = video.src;
          videoUrl = normalizeMediaUrl(videoUrl, url); 
          
          var addVideo = await isURLMediaAccessible(string(videoUrl), contentType);
          return addVideo;
        });

        if (videoList.length != 0) {
          var videoUrl = videoList[0].src;
          return normalizeMediaUrl(videoUrl, url);
        }
      }
      return null;
    },
    page.url(),
    CONTENT_ATTRIBUTE,
    LINK_CONTENT_ATTRIBUTE,
    CONTENT_TYPE_VIDEO
  );
  return video;
};

/**
 * 
 * @param {puppeteer.Page} page 
 */
export const getFavIcon = async (page) => {
  const favIcon = await page.evaluate(async (content) => {

  });
};