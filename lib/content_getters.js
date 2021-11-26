"use strict";
const isBase64 = require("is-base64");
const getUrls = require("get-urls");
const fetch = require("node-fetch");
const puppeteer = require("puppeteer");
const constants = require("./constants.js");

/**
 * Get the title of the given page. It finds the title from the
 * following elements (in order) and returns the first result it finds:
 * - `og:title`
 * - `twitter:title`
 * - `title`
 * - First `H1` element
 * - First `H2` element
 *
 * @param {puppeteer.Page} page
 */
exports.getTitle = async (page) => {
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
  }, constants.CONTENT_ATTRIBUTE);
  return title;
};

/**
 * Get the description of the given page. It finds the description from the
 * following elements (in order) and returns the very first result:
 * - `og:description`
 * - `twitter:description`
 * - `description`
 * - Paragraph (155 characters)
 *
 * @param {puppeteer.Page} page
 */
exports.getDescription = async (page) => {
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
  }, constants.CONTENT_ATTRIBUTE);
  return description;
};

/**
 * Checks whether the given url directs to an accessible media
 * asset or not.
 *
 * @param {string} url
 */
exports.isURLMediaAccessible = async (url, contentType) => {
  try {
    if (isBase64(url, { allowMime: true })) {
      return true;
    }

    const urls = getUrls(url);
    if (urls.size !== 0) {
      const urlResponse = await fetch(urls.values().next().value);
      const conType = urlResponse.headers.get("content-type");
      return RegExp(`${contentType}/`).test(conType);
    }

    return false;
  } catch (error) {
    console.error(
      `Error @ isURLMediaAccesible for (${contentType}): ${error}\nURL: ${url}`
    );
  }
};

/**
 * Normalize the given url.
 * 
 * @param {string} mediaUrl
 * @param {string} pageUrl
 * @returns Normalized media URL
 */
exports.normalizeMediaUrl = (mediaUrl, pageUrl) => {
  // TODO: Add more normalizers: relative links with '/' or '//'
  try {
    var url =
      mediaUrl.indexOf("//") === -1
        ? `${new URL(pageUrl).origin}/${mediaUrl}`
        : mediaUrl;
    return url;
  } catch (error) {
    console.log(`Error @ normalizeMediaUrl : ${error}`);
  }
};

/**
 * Get an image form the page. It finds the asset from the following
 * (in order) and returns the very first result:
 * - `og:image`
 * - `twitter:image`
 * - `rel='image_src'`
 * - Images in page (`<img>` tags)
 *
 * @param {puppeteer.Page} page
 */
exports.getImage = async (page) => {
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
    constants.CONTENT_ATTRIBUTE,
    constants.LINK_CONTENT_ATTRIBUTE,
    constants.CONTENT_TYPE_IMAGE
  );
  return img;
};

/**
 * Get the domain name of the page
 * Checks for the `canonical` link first and then element with property `og:Url`.
 * If nothing is found then it returns the name of the host from the page url.
 *
 * @param {puppeteer.Page} page
 */
exports.getDomainName = async (page) => {
  try {
    const domainName = await page.evaluate(
      (contentAttribute, linkContentAttribute) => {
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
      },
      constants.CONTENT_ATTRIBUTE,
      constants.LINK_CONTENT_ATTRIBUTE
    );

    if (domainName != null) {
      var domain = getUrls(domainName).values().next().value;
      return new URL(domain).hostname.replace("www.", "");
    } else {
      return new URL(page.url()).hostname.replace("www.", "");
    }
  } catch (error) {
    console.error(`Error @ getDomainName : ${error}`);
  }
};

/**
 *  Get the theme color of the page. Checks for the meta tag with
 *  property `theme-color` and returns the color as a hex string
 *
 * @param {puppeteer.Page} page
 */
exports.getThemeColor = async (page) => {
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
  }, constants.CONTENT_ATTRIBUTE);

  // TODO: Write a func to convert color to hex if in rgb/rgba form 

  return themeColor;
};

/**
 * Get the video on the page for preview. Looks for the tags with the following
 * attributes in order and returns the first match:
 * - `og:video`
 * - `twitter:player`
 * - `rel="video_src"`
 * - If the link itself points to a video
 * 
 * @param {puppeteer.Page} page
 */
exports.getVideo = async (page) => {
  try {
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
        const documentVideo =
          documentVideoEl?.getAttribute(linkContentAttribute);
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

        return null;
      },
      page.url(),
      constants.CONTENT_ATTRIBUTE,
      constants.LINK_CONTENT_ATTRIBUTE,
      constants.CONTENT_TYPE_VIDEO
    );
    return video;
  } catch (error) {
    console.log(`Error @ getVideo : ${error}`);
  }
};

/**
 * Get the favicon of the page. Looks for the following attributes in tags
 * in order:
 * - `rel='icon'`
 * - `rel='shortcut icon'`
 * - `rel='apple-touch-icon'`
 * 
 * @param {puppeteer.Page} page
 */
exports.getFavicon = async (page) => {
  const favIcon = await page.evaluate(
    async (linkAttributeName, contentType) => {
      try {
        const iconEl = document.querySelector("link[rel='icon']");
        const icon = iconEl?.getAttribute(linkAttributeName);
        if (icon != null && (await isURLMediaAccessible(icon, contentType))) {
          return icon;
        }

        const shortcutIconEl = document.querySelector(
          "link[rel='shortcut icon']"
        );
        const shortcutIcon = shortcutIconEl?.getAttribute(linkAttributeName);
        if (
          shortcutIcon != null &&
          (await isURLMediaAccessible(shortcutIcon, contentType))
        ) {
          return shortcutIcon;
        }

        const appleTouchIconEl = document.querySelector(
          "link[rel='apple-touch-icon']"
        );
        const appleTouchIcon =
          appleTouchIconEl?.getAttribute(linkAttributeName);
        if (
          appleTouchIcon != null &&
          (await isURLMediaAccessible(appleTouchIcon, contentType))
        ) {
          return appleTouchIcon;
        }

        return null;
      } catch (error) {
        console.log(`Error @ getFavicon : ${error}`);
      }
    },
    constants.LINK_CONTENT_ATTRIBUTE,
    constants.CONTENT_TYPE_IMAGE
  );
  return favIcon;
};

/**
 * Get the type of the page. Looks for `og:type` attribute in meta data
 * 
 * @param {puppeteer.Page} page 
 */
exports.getMediaType = async (page) => {
  const mediaType = await page.evaluate(async (contentAttribute) => {
    try {
      const ogTypeEl = document.querySelector("meta[property='og:type']");
      const ogType = ogTypeEl?.getAttribute(contentAttribute);
      if (ogType != null) {
        return ogType;
      }

      return null;
    } catch (error) {
      console.log(`Error @ getMediaType : ${error}`);
    }
  }, constants.CONTENT_ATTRIBUTE);
  return mediaType;
};
