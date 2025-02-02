import { Box, Button, Flex, FormControl, FormHelperText, Icon, Text } from '@chakra-ui/react';
import { TradeData } from '../../types';
import CardBase from '../Card/CardBase';
import Image from 'next/image';
import CustomNumberInput from '../Input/CustomNumber';
import { useState, useEffect } from 'react';
import { BsArrowLeft, BsArrowLeftRight, BsCheck2 } from 'react-icons/bs';

type Props = {
  trade?: TradeData;
  onChange?: (newValue: TradeData) => void;
  handleSkip?: () => void;
  hasUndo?: boolean;
  handleUndo: () => void;
  handleSubmit?: (trade: TradeData) => void;
};

type TradeItems = TradeData['items'][0];

const FeedbackTrade = (props: Props) => {
  const { handleSkip, handleSubmit, handleUndo, hasUndo } = props;
  const [trade, setTrade] = useState<TradeData | undefined>(props.trade);

  useEffect(() => {
    setTrade(props.trade);
  }, [props.trade]);

  const handleChange = (item: TradeItems, index: number) => {
    if (!trade) return;
    const tempTrade = { ...trade };
    tempTrade.items[index] = item;
    setTrade(tempTrade);
  };

  const doSubmit = () => {
    if (!trade) return;
    handleSubmit?.(trade);
  };

  return (
    <Flex flexFlow={{ base: 'column-reverse', md: 'column' }} gap={4}>
      <Flex justifyContent="center" gap={4}>
        <Button
          leftIcon={<Icon as={BsArrowLeft} />}
          colorScheme="gray"
          variant="solid"
          isDisabled={!hasUndo}
          onClick={handleUndo}
        >
          Back
        </Button>
        <Button
          leftIcon={<Icon as={BsArrowLeftRight} />}
          colorScheme="gray"
          variant="outline"
          onClick={handleSkip}
        >
          Skip
        </Button>
        <Button
          leftIcon={<Icon as={BsCheck2} />}
          colorScheme="green"
          variant="solid"
          mr={2}
          onClick={doSubmit}
        >
          Submit
        </Button>
      </Flex>
      <CardBase chakraWrapper={{ flex: 1 }} title="Trade Pricing" chakra={{ bg: 'gray.700' }}>
        <Flex flexFlow="column" gap={6}>
          <Flex
            textAlign="center"
            fontSize="sm"
            wordBreak={'break-word'}
            whiteSpace={'pre-line'}
            flexFlow="column"
            p={2}
          >
            <b>Wishlist</b>
            <Text>{trade?.wishlist}</Text>
          </Flex>

          {trade?.items.map((item) => (
            <ItemTrade
              onChange={(item) => handleChange(item, item.order)}
              item={item}
              key={item.order}
            />
          ))}
        </Flex>
      </CardBase>
    </Flex>
  );
};

export default FeedbackTrade;

type ItemTradeProps = {
  item: TradeItems;
  onChange?: (newValue: TradeItems) => void;
};

const ItemTrade = (props: ItemTradeProps) => {
  const { item } = props;

  const handleChange = (val: string) => {
    const tempItem = { ...item };
    tempItem.price = val ? parseInt(val) : null;

    props.onChange?.(tempItem);
  };

  return (
    <Flex gap={3}>
      <Box>
        <Image src={item.image} width={80} height={80} alt={item.name} />
      </Box>
      <Flex flex={1} flexFlow="column" justifyContent="center" gap={1}>
        <Text wordBreak={'break-word'} whiteSpace={'pre-line'} fontSize="sm">
          {item.name}
        </Text>
        <FormControl>
          <CustomNumberInput
            skipDebounce
            wrapperProps={{
              variant: 'filled',
              size: 'sm',
              placeholder: 'NP Price',
            }}
            inputProps={{
              placeholder: 'NP Price',
              textAlign: 'left',
              name: item.trade_id + item.name + item.order,
            }}
            value={item.price?.toString()}
            onChange={(val) => handleChange(val)}
          />
          <FormHelperText fontSize="xs">Leave empty if price is not specified</FormHelperText>
        </FormControl>
      </Flex>
    </Flex>
  );
};
