/* eslint-disable react/no-unescaped-entities */
import { Flex, Heading, Text } from '@chakra-ui/react';
import { ArticleCard } from '../../components/Articles/ArticlesCard';
import HeaderCard from '../../components/Card/HeaderCard';
import Layout from '../../components/Layout';
import { WP_Article } from '../../types';
import { wp_getLatestPosts } from '../api/wp/posts';

type Props = {
  allPosts: WP_Article[];
};

const ArticlesPage = (props: Props) => {
  const { allPosts } = props;

  return (
    <Layout
      SEO={{
        title: 'All Articles',
        themeColor: '#E4DA0A',
        openGraph: {
          images: [
            {
              url: 'https://images.neopets.com/nt/ntimages/94_acara_type.gif' ?? '',
              width: 150,
              height: 150,
              alt: 'All Articles',
            },
          ],
        },
      }}
    >
      <HeaderCard
        image={{
          src: 'https://images.neopets.com/nt/ntimages/94_acara_type.gif',
          alt: 'rainbow pets',
        }}
        color="#E4DA0A"
      >
        <Heading size="lg" as="h1">
          All Articles
        </Heading>
        <Text size={{ base: 'sm', md: undefined }} as="h2">
          {/* Check out all itemdb articles */}
        </Text>
      </HeaderCard>
      <Flex flexFlow="column" gap={3}>
        <Flex gap={3} flexWrap="wrap" justifyContent={'center'}>
          {allPosts.map((article) => (
            <ArticleCard vertical key={article.id} article={article} />
          ))}
        </Flex>
      </Flex>
    </Layout>
  );
};

export default ArticlesPage;

export async function getStaticProps() {
  const allPosts = await wp_getLatestPosts(100);

  return {
    props: {
      allPosts,
    },
    revalidate: 60, // In seconds
  };
}
