import seeLink from "seelink";

(async () => {
    const prev = await seeLink("https://www.google.com");
    console.log(prev);
})()