import { Badge, Flex, Link, Text, Image } from '@chakra-ui/react';
import { ListItemInfo, UserList } from '../../types';
import icon from '../../public/logo_icon.svg';
import DynamicIcon from '../../public/icons/dynamic.png';
import NextImage from 'next/image';
import Color from 'color';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import { stripMarkdown } from '../../utils/utils';

type Props = {
  list: UserList;
  isSelected?: boolean;
  disableLink?: boolean;
  matches?: {
    seek: ListItemInfo[];
    trade: ListItemInfo[];
  };
};

const UserListCard = (props: Props) => {
  const { list, matches, isSelected, disableLink } = props;
  const [matchCount, setMatchCount] = useState(0);
  const color = Color(list?.colorHex || '#4A5568');
  const rgb = color.rgb().array();

  useEffect(() => {
    if (!matches) return;

    const listItemsMap = new Set(list.itemInfo.map((item) => item.item_iid));

    if (list.purpose === 'trading' && matches?.seek.length) {
      const count = matches.seek.filter((item) => listItemsMap.has(item.item_iid)).length;
      setMatchCount(count);
    }

    if (list.purpose === 'seeking' && matches?.trade.length) {
      const count = matches.trade.filter((item) => listItemsMap.has(item.item_iid)).length;
      setMatchCount(count);
    }
  }, [list, matches]);

  return (
    <Flex
      bg="gray.700"
      p={{ base: 2, md: 3 }}
      borderRadius="md"
      overflow="visible"
      minH="150px"
      maxWidth="375px"
      w={{ base: 'auto', sm: '375px' }}
      gap={3}
      ml="40px"
      boxShadow={isSelected ? 'outline' : undefined}
      bgGradient={`linear-gradient(to top,rgba(0,0,0,0) 0,rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]},.6) 0%)`}
      pointerEvents={disableLink ? 'none' : 'initial'}
    >
      <Link
        as={NextLink}
        href={`/lists/${list.official ? 'official' : list.user_username}/${list.internal_id}`}
        _hover={{ textDecoration: 'none' }}
      >
        <Flex
          position="relative"
          w={{ base: '100px', sm: '150px' }}
          h={{ base: '100px', sm: '150px' }}
          ml="-50px"
          bg="gray.700"
          bgGradient={`linear-gradient(to top,rgba(0,0,0,0) 0,rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, .75) 0%)`}
          flex="0 0 auto"
          borderRadius="md"
          overflow="hidden"
          boxShadow={isSelected ? 'outline' : 'md'}
          justifyContent="center"
          alignItems="center"
        >
          {!list.coverURL && (
            <NextImage src={icon} width={75} style={{ opacity: 0.85 }} alt={'List Cover'} />
          )}

          {list.coverURL && (
            <Image
              src={list.coverURL}
              w={{ base: '95px', sm: '140px' }}
              h={{ base: '95px', sm: '140px' }}
              alt={'List Cover'}
              objectFit="cover"
              borderRadius="md"
            />
          )}
        </Flex>
      </Link>
      <Flex flexFlow="column" gap={2}>
        <Text
          fontWeight="bold"
          noOfLines={2}
          color={color.isLight() ? 'blackAlpha.800' : undefined}
        >
          <Link
            as={NextLink}
            href={`/lists/${list.official ? 'official' : list.user_username}/${list.internal_id}`}
          >
            {list.name}
          </Link>
        </Text>
        <Text
          fontSize="xs"
          color={color.isLight() ? 'blackAlpha.700' : undefined}
          flex={1}
          noOfLines={4}
        >
          {stripMarkdown(list.description ?? '')}
        </Text>
        <Flex gap={1} flexWrap="wrap">
          {!!list.dynamicType && (
            <Badge
              colorScheme={color.isLight() ? 'black' : 'orange'}
              display="inline-flex"
              ml={1}
              p={'2px'}
              alignItems={'center'}
            >
              <NextImage src={DynamicIcon} alt="Dynamic List" width={8} />
            </Badge>
          )}
          {list.official && (
            <Badge as={NextLink} href="/lists/official" colorScheme="blue" variant="solid">
              ✓ Official
            </Badge>
          )}

          {list.visibility !== 'public' && (
            <Badge colorScheme={color.isLight() ? 'black' : 'gray'}>{list.visibility}</Badge>
          )}

          {!list.official && list.purpose !== 'none' && (
            <Badge colorScheme={color.isLight() ? 'black' : 'gray'}>{list.purpose}</Badge>
          )}

          <Badge colorScheme={color.isLight() ? 'black' : 'gray'}>{list.itemCount} items</Badge>

          {!list.official && list.purpose === 'trading' && !!matchCount && (
            <Badge colorScheme={color.isLight() ? 'black' : 'gray'}>
              You want {matchCount} items from this list
            </Badge>
          )}
          {!list.official && list.purpose === 'seeking' && !!matchCount && (
            <Badge colorScheme={color.isLight() ? 'black' : 'gray'}>
              You have {matchCount} items from this list
            </Badge>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default UserListCard;
