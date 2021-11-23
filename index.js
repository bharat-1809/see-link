import { seeLink } from "./lib/see_link.js";

(async () => {
  const res = await seeLink(
    "https://web.whatsapp.com/", "detailed");
  console.log(res);
})();
