import { seelink } from "./lib/seelink.js";

(async () => {
  const res = await seelink(
    "https://www.youtube.com/v/sicTI_2pV6k", "theme", "video");
  console.log(res);
})();
