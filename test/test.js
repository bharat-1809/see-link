const seeLink = require("../index");
const expect = require("chai").expect;
const {PORT} = require("../test_setup/config");
const expectedPrev = require("../test_setup/preview");

const baseURL = `http://localhost:${PORT}/test/`;

describe("see-link : link preview", () => {
    describe("works for first degree (open graph) tags", () => {
        it("should return all the preview metadata", async () => {
            const res = await seeLink(baseURL + '1');

            expect(res.title).to.equal(expectedPrev["title"]);
            expect(res.description).to.equal(expectedPrev["description"]);
            expect(res.image).to.equal(expectedPrev["image"]);
            expect(res.domainName).to.equal(expectedPrev["domainName"]);
        })
    })
});