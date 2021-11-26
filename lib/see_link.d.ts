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
 *
 * @param url
 * @param options
 */
declare function seeLink(
  url: string,
  options?: seeLink.Options
): Promise<LinkPrevRes>;

declare interface LinkPrevRes {
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
