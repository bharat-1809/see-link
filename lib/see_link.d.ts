declare function seeLink(
  url: string,
  linkPrevOptions?: string[]
): Promise<LinkPrevRes>;
export = seeLink;

declare interface LinkPrevRes {
    title: string;
    description: string;
    image: string;
    domainName: string;
    video?: string;
    themeColor?: string;
    favIcon?: string;
    type?: string;
};
export = LinkPrevRes;