const seeLink = require("see-link");

(async () => {
  const prev = await seeLink(`pub.dev`, {
    getThemeColor: true,
    getVideo: true,
    detailedPreview: true,
  });
  console.log(prev);
})();
