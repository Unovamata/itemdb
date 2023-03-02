import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  VStack,
  Text,
  useBoolean,
  HStack,
  Badge,
  Skeleton,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { SearchStats, SearchFilters } from '../../types';
import CustomNumberInput from '../Input/CustomNumber';
import NegCheckbox from '../Input/NegCheckbox';
import debounce from 'lodash/debounce';

type Props = {
  stats?: SearchStats | null;
  filters: SearchFilters;
  isColorSearch?: boolean;
  onChange?: (newFilters: SearchFilters) => void;
};

const ALL_COLORS = [
  ['#ff0000', 'Red'],
  ['#ff8000', 'Orange'],
  ['#ffff00', 'Yellow'],
  ['#00ff00', 'Green'],
  ['#00ffff', 'Cyan'],
  ['#0000ff', 'Blue'],
  ['#ff00ff', 'Magenta'],
  ['#ff0080', 'Pink'],
  ['#808080', 'Gray'],
];

const SearchFilters = (props: Props) => {
  const { stats, isColorSearch } = props;
  const [showMoreCat, setCat] = useBoolean();
  const [filters, setFilters] = useState<SearchFilters>(props.filters);

  useEffect(() => {
    setFilters(props.filters);
  }, [props.filters]);

  const handleCheckChange = (
    newFilter: string,
    filterType: keyof typeof filters,
    defaultValue: string
  ) => {
    if (
      ['price', 'rarity', 'weight', 'estVal', 'sortBy', 'order', 'page', 'limit'].includes(
        filterType
      )
    )
      return;

    if (filterType === 'color') {
      setFilters({ ...filters, color: newFilter });
      if (props.onChange) props.onChange({ ...filters, color: newFilter });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const newFilters = [...filters[filterType]].filter(
      (f) => f !== defaultValue && f !== `!${defaultValue}`
    );

    if (newFilter) newFilters.push(newFilter);

    setFilters({ ...filters, [filterType]: newFilters });

    if (props.onChange) props.onChange({ ...filters, [filterType]: newFilters });
  };

  const handleNumberChange = (
    newNumber: string,
    index: 0 | 1,
    filterType: 'price' | 'rarity' | 'weight' | 'estVal'
  ) => {
    const tuple = [...filters[filterType]];
    tuple[index] = newNumber;

    setFilters({ ...filters, [filterType]: tuple });

    if (props.onChange) props.onChange({ ...filters, [filterType]: tuple });
  };

  const debouncedPriceChange = debounce(handleNumberChange, 200);

  return (
    <Accordion defaultIndex={[0]} allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" textAlign="left" fontSize="sm" color="gray.300">
              Category {filters.category.length > 0 && <Badge>{filters.category.length}</Badge>}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <VStack alignItems="flex-start">
            {stats &&
              Object.entries(stats.category)
                .sort((a, b) => b[1] - a[1])
                .slice(0, showMoreCat ? undefined : 5)
                .map((cat) => (
                  <NegCheckbox
                    key={cat[0]}
                    value={cat[0]}
                    onChange={(val) => handleCheckChange(val, 'category', cat[0])}
                    checklist={filters.category}
                  >
                    <Text fontSize={'sm'}>
                      {cat[0]} <Badge>{cat[1]}</Badge>
                    </Text>
                  </NegCheckbox>
                ))}
            {stats && Object.keys(stats.category).length > 5 && (
              <Text
                fontSize="sm"
                color="gray.300"
                cursor="pointer"
                onClick={setCat.toggle}
                textAlign="center"
              >
                {showMoreCat ? 'Show less' : 'Show more'}
              </Text>
            )}

            {!stats && [...Array(5)].map((_, i) => <Skeleton key={i} w="100%" h="25px" />)}
          </VStack>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" fontSize="sm" textAlign="left" color="gray.300">
              Type {filters.type.length > 0 && <Badge>{filters.type.length}</Badge>}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <VStack alignItems="flex-start">
            <NegCheckbox
              value="wearable"
              onChange={(val) => handleCheckChange(val, 'type', 'wearable')}
              checklist={filters.type}
            >
              <Text fontSize={'sm'}>
                <Badge colorScheme="blue">Wearable</Badge>{' '}
                <Badge>{stats?.isWearable.true ?? 0}</Badge>
              </Text>
            </NegCheckbox>
            <NegCheckbox
              value="nc"
              onChange={(val) => handleCheckChange(val, 'type', 'nc')}
              checklist={filters.type}
            >
              <Text fontSize={'sm'}>
                <Badge colorScheme="purple">NC</Badge> <Badge>{stats?.isNC.true ?? 0}</Badge>
              </Text>
            </NegCheckbox>
            <NegCheckbox
              value="np"
              onChange={(val) => handleCheckChange(val, 'type', 'np')}
              checklist={filters.type}
            >
              <Text fontSize={'sm'}>
                <Badge colorScheme="green">NP</Badge> <Badge>{stats?.isNC.false ?? 0}</Badge>
              </Text>
            </NegCheckbox>
          </VStack>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" fontSize="sm" textAlign="left" color="gray.300">
              Status {filters.status.length > 0 && <Badge>{filters.status.length}</Badge>}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <VStack alignItems="flex-start">
            {stats &&
              Object.entries(stats.status)
                .sort((a, b) => b[1] - a[1])
                .map((stat) => (
                  <NegCheckbox
                    key={stat[0]}
                    value={stat[0]}
                    onChange={(val) => handleCheckChange(val, 'status', stat[0])}
                    checklist={filters.status}
                  >
                    <Text fontSize={'sm'} textTransform="capitalize">
                      {stat[0]} <Badge>{stat[1]}</Badge>
                    </Text>
                  </NegCheckbox>
                ))}
            {!stats && [...Array(5)].map((_, i) => <Skeleton key={i} w="100%" h="25px" />)}
          </VStack>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" fontSize="sm" textAlign="left" color="gray.300">
              Price Range{' '}
              {filters.price.filter((a) => a || a === '0').length > 0 && (
                <Badge>{filters.price.filter((a) => a || a === '0').length}</Badge>
              )}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <HStack>
            <CustomNumberInput
              onChange={(val) => debouncedPriceChange(val, 0, 'price')}
              value={filters.price[0]}
            />
            <Text fontSize="sm" color="gray.300">
              to
            </Text>
            <CustomNumberInput
              onChange={(val) => debouncedPriceChange(val, 1, 'price')}
              value={filters.price[1]}
            />
          </HStack>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" fontSize="sm" textAlign="left" color="gray.300">
              Rarity{' '}
              {filters.rarity.filter((a) => a || a === '0').length > 0 && (
                <Badge>{filters.rarity.filter((a) => a || a === '0').length}</Badge>
              )}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <HStack>
            <CustomNumberInput
              onChange={(val) => debouncedPriceChange(val, 0, 'rarity')}
              value={filters.rarity[0]}
            />
            <Text fontSize="sm" color="gray.300">
              to
            </Text>
            <CustomNumberInput
              onChange={(val) => debouncedPriceChange(val, 1, 'rarity')}
              value={filters.rarity[1]}
            />
          </HStack>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" fontSize="sm" textAlign="left" color="gray.300">
              Weight{' '}
              {filters.weight.filter((a) => a || a === '0').length > 0 && (
                <Badge>{filters.weight.filter((a) => a || a === '0').length}</Badge>
              )}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <HStack>
            <CustomNumberInput
              onChange={(val) => debouncedPriceChange(val, 0, 'weight')}
              value={filters.weight[0]}
            />
            <Text fontSize="sm" color="gray.300">
              to
            </Text>
            <CustomNumberInput
              onChange={(val) => debouncedPriceChange(val, 1, 'weight')}
              value={filters.weight[1]}
            />
          </HStack>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" fontSize="sm" textAlign="left" color="gray.300">
              Est. Val{' '}
              {filters.estVal.filter((a) => a || a === '0').length > 0 && (
                <Badge>{filters.estVal.filter((a) => a || a === '0').length}</Badge>
              )}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <HStack>
            <CustomNumberInput
              onChange={(val) => debouncedPriceChange(val, 0, 'estVal')}
              value={filters.estVal[0]}
            />
            <Text fontSize="sm" color="gray.300">
              to
            </Text>
            <CustomNumberInput
              onChange={(val) => debouncedPriceChange(val, 1, 'estVal')}
              value={filters.estVal[1]}
            />
          </HStack>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" fontSize="sm" textAlign="left" color="gray.300">
              Vibrant Color {filters.color.length > 0 && <Badge>1</Badge>}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <VStack alignItems="flex-start">
            {ALL_COLORS.map(([hex, name]) => (
              <NegCheckbox
                disabled={isColorSearch}
                key={hex}
                value={hex}
                onChange={(val) => handleCheckChange(val, 'color', hex)}
                checklist={[filters.color]}
              >
                <Text as="div" fontSize={'sm'}>
                  <ColorBox color={hex} /> {name}
                </Text>
              </NegCheckbox>
            ))}
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default SearchFilters;

const ColorBox = (props: { color: string }) => (
  <Box
    display="inline-block"
    verticalAlign="middle"
    bg={props.color}
    width="15px"
    height="15px"
  ></Box>
);
