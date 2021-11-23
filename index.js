//@ts-check
import seeLink from "./lib/see_link";

(async () => {
  const res = await seeLink("medium.com", ["detailed"]);
  console.log(res);
})();
