/**
 * see-link
 * by Bharat Sharma - https ://www.bharatsharma.me
 * 
 * License
 * -------
 * Copyright (c) Bharat Sharma
 * Released under the MIT License
 * https://raw.githubusercontent.com/bharat-1809/see-link/main/LICENSE
 */

declare namespace seeLink {
  export interface Options {
    /**
     Get the detailed preview metadata for the URL.

     @default false
    */
    readonly detailedPreview?: boolean;

    /**
     Get the video metadata for the URL.

     @default false
    */
    readonly getVideo?: boolean;

    /**
     Get the theme-color metadata for the URL

     @default false
    */
    readonly getThemeColor?: boolean;

    /**
     Additional command line arguments to pass to the browser instance.
    
     @remarks This is an option of puppeteer
    */
    readonly args?: string[];

    /**
     Path to a browser executable to use instead of the bundled Chromium.
     Note that Puppeteer is only guaranteed to work with the bundled Chromium,
     so use this setting at your own risk.
    */
    readonly executablePath?: string;

    /**
     Timeout for the request.

     @default 30000
    */
    readonly timeout?: number;

    /**
      The user agent to use.
      
      @default "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
    */
    readonly userAgent?: string;

    /**
      Whether to run the browser in headless mode.

      @default true
    */
    readonly headless?: boolean;
  }
}

/**
 * Gets the preview metadata from a link. SeeLink looks for the [open-graph](http://ogp.me/) and
 * [twitter cards](https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/markup)
 * markup to get information about the link. It also looks for the HTML tags in case no `og` and `twitter`
 * markups are found.
 * 
 * @param url Text containing the URL to get the preview metadata from.
 * @param options Options for the request.
 * 
 * @returns A promise that resolves to the preview metadata.
 * 
 * @example
 * ```
 * const seeLink = require('see-link');
 * const prev = await seeLink('bharatsharma.me', {getThemeColor: true});
 * ```
 */
declare function seeLink(
  url: string,
  options?: seeLink.Options
): Promise<SeeLinkRes>;

declare interface SeeLinkRes {
  title: string;
  description: string;
  image: string;
  domainName: string;
  video?: string;
  themeColor?: string;
  favIcon?: string;
  type?: string;
}
export = seeLink;
