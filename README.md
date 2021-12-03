# See-Link

**See-a-Link**! Get the preview metadata like title, description, image, video, etc from a link/url.

See-Link looks through the [open-graph](http://ogp.me/), [twitter cards](https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/markup) markup and other meta tags to get the preview information from the link. It visits a link in a headless browser and scrapes the required information.

**NOTE**

- A different domain cannot be requested from your web app (browsers block cross-origin-requests). If you do not know how same-origin-policy works, here is a [great article](https://dev.to/lydiahallie/cs-visualized-cors-5b8h), therefore this library works on node (back-end environments) and certain mobile run-times (like react-native).

- This library fetches the website and parses its html using puppeteer, as if the user would visit the page, this means: Instagram (and other social sites) might redirect you to a sign-up page, you can try to change the user-agent property (by default it uses Facebook's user agent) and the response you get then might be different, but there is nothing wrong with this library.

## Getting Started

```npm install see-link```

## Usage

its quite simple:

```javascript
const seeLink = require('see-link');

(async () => {
    const preview = await seeLink('https://www.bharatsharma.me');
    console.log(preview);
})();
```
The above code will result in the following output:

```bash
{
  title: 'Bharat Sharma',
  description: 'Personal website of Bharat Sharma',
  image: 'https://bharatsharma.me/assets/images/logo.png',
  domainName: 'bharatsharma.me'
}
```

## API
