const seeLink = require("../index");
const expect = require("chai").expect;
const {PORT} = require("../test_setup/config");
const expectedPrev = require("../test_setup/preview");

const baseURL = `http://localhost:${PORT}/test:`;

describe("see-link : link preview", () => {
    describe("works for all category tags", () => {
        it("should return metadata using open graph tags", async () => {
            const res = await seeLink(baseURL + '1', {detailedPreview: true});

            expect(res.title).to.equal(expectedPrev["title"]);
            expect(res.description).to.equal(expectedPrev["description"]);
            expect(res.image).to.equal(expectedPrev["image"]);
            expect(res.domainName).to.equal(expectedPrev["domainName"]);
            expect(res.favIcon).to.equal(expectedPrev["favIcon"]);
            expect(res.themeColor).to.equal(expectedPrev["null"]);
            expect(res.type).to.equal(expectedPrev["type"]);
            expect(res.video).to.equal(expectedPrev["video"]);
        });

        it("should return metadata using twitter card tags", async () => {
            const res = await seeLink(baseURL + '2', {detailedPreview: true});

            expect(res.title).to.equal(expectedPrev["title"]);
            expect(res.description).to.equal(expectedPrev["description"]);
            expect(res.image).to.equal(expectedPrev["image"]);
            expect(res.domainName).to.equal(expectedPrev["domainName"]);
            expect(res.favIcon).to.equal(expectedPrev["favIcon"]);
            expect(res.themeColor).to.equal(expectedPrev["themeColor"]);
            expect(res.type).to.equal(expectedPrev["null"]);
            expect(res.video).to.equal(expectedPrev["video"]);
        });
    })
});