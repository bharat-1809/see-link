const seeLink = require("seelink");

(async () => {
    const prev = await seeLink("bharatsharma.me", ["detailed"]);
    console.log(prev);
})()