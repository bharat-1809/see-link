declare async function seeLink(
  uri: string,
  seeLinkOptions: string[]
): Promise<LinkPreviewRes>;
export = seeLink;

declare interface LinkPreviewRes {
  title: string;
  description: string;
  image: string;
  domainName: string;
  video?: string;
  themeColor?: string;
  icon?: string;
}
