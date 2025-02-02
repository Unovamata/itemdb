/* eslint-disable react/no-unescaped-entities */
import {
  Flex,
  Heading,
  Text,
  Link,
  ListItem,
  UnorderedList,
  Table,
  TableContainer,
  Td,
  Tr,
  Tbody,
  Code,
} from '@chakra-ui/react';
import { GetStaticPropsContext } from 'next';
import HeaderCard from '../../components/Card/HeaderCard';
import Layout from '../../components/Layout';
import { WP_Article } from '../../types';
import { wp_getBySlug } from '../api/wp/posts/[slug]';
import parse, { HTMLReactParserOptions, Element, domToReact } from 'html-react-parser';
import NextLink from 'next/link';
import { wp_getLatestPosts } from '../api/wp/posts';
import { ArticleCard } from '../../components/Articles/ArticlesCard';

type Props = {
  post: WP_Article;
  recomendations: WP_Article[];
};

const ArticlePage = (props: Props) => {
  const { post, recomendations } = props;
  return (
    <Layout
      SEO={{
        title: post.title,
        description: post.excerpt,
        themeColor: post.palette?.lightvibrant.hex ?? '#05B7E8',
        openGraph: {
          images: [{ url: post.thumbnail ?? '', width: 150, height: 150, alt: post.title }],
        },
      }}
    >
      <HeaderCard
        image={
          post.thumbnail
            ? {
                src: post.thumbnail,
                alt: 'rainbow pets',
              }
            : undefined
        }
        color={post.palette?.lightvibrant.hex ?? '#05B7E8'}
      >
        <Text fontSize="xs">
          <Link as={NextLink} href="/articles">
            Articles
          </Link>
        </Text>
        <Heading size="lg" as="h1">
          {parse(post.title)}
        </Heading>
        <Text size={{ base: 'sm', md: undefined }} as="h2">
          {post.excerpt}
        </Text>
      </HeaderCard>
      <Flex
        flexFlow="column"
        gap={3}
        sx={{
          a: { color: post.palette?.vibrant.hex ?? 'cyan.300' },
          'b,strong': { color: post.palette?.lightvibrant.hex ?? 'blue.300' },
          img: { my: 2 },
        }}
      >
        <Flex flexFlow="column" gap={3} px={3} maxW={1000}>
          {parse(post.content, options)}
        </Flex>
      </Flex>
      {recomendations.length > 0 && (
        <>
          <Heading size="md" as="h3" my={2} mt={16}>
            Recommended Articles
          </Heading>
          <Flex gap={[2, 3]} overflow="auto" pb={3}>
            {recomendations.slice(0, 3).map((article) => (
              <ArticleCard key={article.id} article={article} vertical />
            ))}
          </Flex>
        </>
      )}
    </Layout>
  );
};

export default ArticlePage;

export async function getStaticProps(context: GetStaticPropsContext) {
  const slug = context?.params?.slug as string;

  if (!slug) return { notFound: true };

  const post = await wp_getBySlug(slug);
  if (!post) return { notFound: true };

  let recommended = await wp_getLatestPosts(100, 1, true);
  //shuffle
  const Chance = (await import('chance')).default;
  const chance = new Chance();
  recommended = chance.shuffle(recommended);

  return {
    props: {
      post,
      recomendations: recommended.filter((x) => x.id !== post.id),
    },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  const posts = await wp_getLatestPosts(100);

  return {
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: 'blocking',
  };
}

const options: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (domNode instanceof Element && domNode.name === 'h2')
      return (
        <Heading size="lg" as="h2" my={3}>
          {domToReact(domNode.children, options)}
        </Heading>
      );

    if (domNode instanceof Element && domNode.name === 'h3')
      return (
        <Heading size="md" as="h3" my={2}>
          {domToReact(domNode.children, options)}
        </Heading>
      );

    if (domNode instanceof Element && domNode.name === 'h4')
      return (
        <Heading size="sm" as="h4" my={2}>
          {domToReact(domNode.children, options)}
        </Heading>
      );

    if (domNode instanceof Element && domNode.name === 'a')
      return (
        <Link href={domNode.attribs.href} isExternal={domNode.attribs.target === '_blank'}>
          {domToReact(domNode.children, options)}
        </Link>
      );

    if (domNode instanceof Element && domNode.name === 'ul')
      return <UnorderedList spacing={1}>{domToReact(domNode.children, options)}</UnorderedList>;

    if (domNode instanceof Element && domNode.name === 'li')
      return <ListItem>{domToReact(domNode.children, options)}</ListItem>;

    if (domNode instanceof Element && domNode.name === 'table')
      return (
        <TableContainer my={3} border="1px solid rgba(255,255,255,0.3)" borderRadius={'sm'}>
          <Table variant="striped">{domToReact(domNode.children, options)}</Table>
        </TableContainer>
      );

    if (domNode instanceof Element && domNode.name === 'tbody')
      return <Tbody>{domToReact(domNode.children, options)}</Tbody>;

    if (domNode instanceof Element && domNode.name === 'tr')
      return <Tr>{domToReact(domNode.children, options)}</Tr>;

    if (domNode instanceof Element && domNode.name === 'td')
      return <Td whiteSpace={'normal'}>{domToReact(domNode.children, options)}</Td>;

    if (domNode instanceof Element && domNode.name === 'code')
      return <Code>{domToReact(domNode.children, options)}</Code>;
  },
};
