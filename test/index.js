const seeLink = require("see-link");

(async () => {
  const prev = await seeLink(`passportindia.gov.in`, {
    getThemeColor: true,
    getVideo: true,
    detailedPreview: true,
    headless: false,
  });
  console.log(prev);
})();
