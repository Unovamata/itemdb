/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-empty-function */
/** @type {import('next-sitemap').IConfig} */
import { getServerSideSitemapLegacy, ISitemapField } from 'next-sitemap';
import { GetServerSideProps } from 'next';
import prisma from '../../utils/prisma';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const siteURL = 'https://itemdb.com.br';

  const [itemInfo, officialLists] = await Promise.all([
    prisma.items.findMany({
      select: {
        slug: true,
      },
    }),
    prisma.userList.findMany({
      where: {
        official: true,
      },
      select: {
        internal_id: true,
      },
    }),
  ]);

  const officialListsPaths: ISitemapField[] = officialLists.map((list) => ({
    loc: `${siteURL}/lists/official/${list.internal_id}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
  }));

  const itemPaths: ISitemapField[] = itemInfo.map((item) => ({
    loc: `${siteURL}/item/${item.slug}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
  }));

  return getServerSideSitemapLegacy(ctx, [...officialListsPaths, ...itemPaths]);
};

// Default export to prevent next.js errors
export default function Sitemap() {}
