export const createManyUrls = ({ host }: { host: string }) => [
  {
    title: `Google`,
    redirect: `https://google.com`,
    url: `${host}/1`,
    clicks: 0,
  },
  {
    title: `Facebook`,
    redirect: `https://facebook.com`,
    url: `${host}/2`,
    clicks: 0,
  },
  {
    title: `Twitter`,
    redirect: `https://twitter.com`,
    url: `${host}/3`,
    clicks: 0,
  },
];
