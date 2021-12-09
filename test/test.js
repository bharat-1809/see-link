/**
 * see-link
 * by Bharat Sharma - https ://www.bharatsharma.me
 * 
 * License
 * -------
 * Copyright (c) Bharat Sharma
 * Released under the MIT License
 * https://raw.githubusercontent.com/bharat-1809/see-link/main/LICENSE
 */

const seeLink = require("../index");
const expect = require("chai").expect;
const { PORT } = require("../test_setup/config");
const expectedPrev = require("../test_setup/preview");

const baseURL = `http://localhost:${PORT}/test:`;

const compareExpectations = (
  actual,
  {
    title = true,
    description = true,
    image = true,
    favIcon = true,
    themeColor = true,
    type = true,
    video = true,
  }
) => {
  expect(actual.title).to.equal(title ? expectedPrev["title"] : null);
  expect(actual.description).to.equal(description ? expectedPrev["description"] : null);
  expect(actual.image).to.equal(image ? expectedPrev["image"] : null);
  expect(actual.domainName).to.equal(expectedPrev.domainName);
  expect(actual.favIcon ?? null).to.equal(favIcon ? expectedPrev["favIcon"] : null);
  expect(actual.themeColor ?? null).to.equal(themeColor ? expectedPrev["themeColor"] : null);
  expect(actual.type ?? null).to.equal(type ? expectedPrev["type"] : null);
  expect(actual.video ?? null).to.equal(video ? expectedPrev["video"] : null);
};

describe("see-link : link preview", () => {
  describe("works for all category tags", () => {
    it("should return metadata using open graph tags", async () => {
      const res = await seeLink(baseURL + "1", { detailedPreview: true, getDominantThemeColor: false });
      compareExpectations(res, { themeColor: false });
    });

    it("should return metadata using twitter card tags", async () => {
      const res = await seeLink(baseURL + "2", { detailedPreview: true });
      compareExpectations(res, { type: false });
    });

    it("should return metadata using third degree tags", async () => {
      const res = await seeLink(baseURL + "3", { detailedPreview: true, getDominantThemeColor: false });
      compareExpectations(res, {favIcon: false, themeColor: false, type: false, video: false});
    });

    it("should return metadata using fourth degree tags", async () => {
      const res = await seeLink(baseURL + "4", { detailedPreview: true, getDominantThemeColor: false });
      compareExpectations(res, {favIcon: false, themeColor: false, type: false, video: false, image: false});
    });
  });

  describe("works for miscellaneous cases", () => {
    it("should return only essential metadata", async () => {
      const res = await seeLink(baseURL + "5");
      compareExpectations(res, {favIcon: false, themeColor: false, type: false, video: false});
    });

    it("should convert rgb/rgba theme color to hex", async () => {
      const res = await seeLink(baseURL + "6", { getThemeColor: true });
      compareExpectations(res, { favIcon: false, type: false, video: false });
    });

    it("should throw error for an invalid url", async () => {
      return seeLink("abc.c").catch((err) => {
        expect(err).to.be.an("error");
      });
    });

    it("should detect correct dominant color", async () => {
      const res = await seeLink(baseURL + "7", { getThemeColor: true });
      expect(res.themeColor).to.equal("#040404");
    });
  });
});