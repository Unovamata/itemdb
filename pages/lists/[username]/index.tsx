import {
  Badge,
  Box,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
  Image,
  Button,
  Center,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Switch,
  useToast,
  Icon,
} from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import CreateListModal from '../../../components/Modal/CreateListModal';
import { User, UserList } from '../../../types';
import { useAuth } from '../../../utils/auth';
import { useRouter } from 'next/router';
import { SortableLists } from '../../../components/Sortable/SortableLists';
import Color from 'color';
import { SelectItemsCheckbox } from '../../../components/Input/SelectItemsCheckbox';
import { FaTrash } from 'react-icons/fa';
import DeleteListModal from '../../../components/Modal/DeleteListModal';
import { BiLinkExternal } from 'react-icons/bi';

type ExtendedUserList = UserList & {
  hasChanged?: boolean;
};

const UserListsPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { user, getIdToken, authLoading } = useAuth();
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

  const [lists, setLists] = useState<{ [list_id: number]: ExtendedUserList }>({});
  const [listsIds, setListsIds] = useState<number[]>([]);

  const [selectedLists, setSelectedLists] = useState<number[]>([]);
  const [isEdit, setEdit] = useState<boolean>(false);

  const [owner, setOwner] = useState<User>();
  const [matches, setMatches] = useState({ seek: [], trade: [] });

  const isOwner = user?.username === router.query.username;

  const color = Color(undefined ?? '#4A5568');
  const rgb = color.rgb().array();

  useEffect(() => {
    if (!authLoading && router.isReady && listsIds.length === 0) {
      init();
    }
  }, [authLoading, router.isReady, listsIds]);

  useEffect(() => {
    return () => toast.closeAll();
  }, []);

  const init = async () => {
    setLists({});
    const targetUsername = router.query.username;

    if (!targetUsername) return;

    const token = await getIdToken();

    const listsRes = await axios.get(`/api/lists/getUserLists?username=${targetUsername}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (user?.username === targetUsername) setOwner(user);
    else {
      const userRes = await axios.get(`/api/users/getUser?username=${targetUsername}`);
      setOwner(userRes.data);
    }

    if (user) {
      const [seekRes, tradeRes] = await Promise.all([
        axios.get(`/api/lists/match?offerer=${targetUsername}&seeker=${user.username}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`/api/lists/match?offerer=${user.username}&seeker=${targetUsername}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      ]);

      setMatches({
        seek: seekRes.data,
        trade: tradeRes.data,
      });
    }

    const listsData = listsRes.data;
    const listsIds = listsData.map((list: UserList) => list.internal_id);
    setListsIds(listsIds);

    const listsObj: { [list_id: number]: UserList } = {};

    listsData.forEach((list: UserList) => {
      listsObj[list.internal_id] = list;
    });

    setLists(listsObj);
  };

  const selectItem = (id: number) => {
    if (!isEdit) return;
    if (selectedLists.includes(id)) setSelectedLists(selectedLists.filter((list) => list !== id));
    else setSelectedLists([...selectedLists, id]);
  };

  const handleSelectCheckbox = (checkAll: boolean) => {
    if (checkAll) setSelectedLists(listsIds);
    else setSelectedLists([]);
  };

  const toggleEdit = () => {
    if (isEdit) setSelectedLists([]);

    setEdit(!isEdit);
  };

  const handleSort = (newOrder: number[]) => {
    const newLists = { ...lists };

    for (let i = 0; i < newOrder.length; i++) {
      if (newLists[newOrder[i]].order === i) continue;

      newLists[newOrder[i]].order = i;
      newLists[newOrder[i]].hasChanged = true;
      setHasChanges();
    }

    setListsIds(newOrder);
    setLists(newLists);
  };

  const setHasChanges = () => {
    if (toast.isActive('unsavedChanges')) return;

    toast({
      title: 'You have unsaved changes',
      id: 'unsavedChanges',
      description: (
        <>
          <Button variant="solid" colorScheme="blackAlpha" onClick={handleSaveChanges} size="sm">
            Save Changes
          </Button>
        </>
      ),
      status: 'info',
      duration: null,
    });
  };

  const handleSaveChanges = async () => {
    toast.closeAll();

    const x = toast({
      title: 'Saving changes...',
      status: 'info',
      duration: null,
    });

    try {
      const token = await getIdToken();
      const listsToSave = Object.values(lists).filter((list) => list.hasChanged);

      const res = await axios.post(
        '/api/lists/updateListOrder',
        { lists: listsToSave },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.update(x, {
          title: 'Changes saved',
          status: 'success',
          duration: 5000,
        });

        setEdit(false);
      }
    } catch (err) {
      console.error(err);

      toast.update(x, {
        title: 'An error occurred',
        description: 'Please try again later',
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (!owner)
    return (
      <Layout>
        <Center>
          <Text>Loading...</Text>
        </Center>
      </Layout>
    );

  return (
    <Layout>
      {isOwner && (
        <CreateListModal isOpen={openCreateModal} onClose={() => setOpenCreateModal(false)} />
      )}
      {isOwner && (
        <DeleteListModal
          selectedLists={selectedLists}
          isOpen={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          refresh={init}
        />
      )}
      <Box>
        <Box
          position="absolute"
          h="30vh"
          left="0"
          width="100%"
          bgGradient={`linear-gradient(to top,rgba(0,0,0,0) 0,rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]},.6) 80%)`}
          zIndex={-1}
        />
        <Flex gap={{ base: 3, md: 6 }} pt={6} alignItems="center">
          <Box
            position="relative"
            p={{ base: 1, md: 2 }}
            bg={`rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]},.75)`}
            borderRadius="md"
            display="flex"
            flexFlow="column"
            justifyContent="center"
            alignItems="center"
            boxShadow="sm"
            textAlign="center"
            flex="0 0 auto"
          >
            <Image
              src={'https://magnetismotimes.com/wp-content/uploads/2022/09/seller_avy.jpg'}
              borderRadius="md"
              width={{ base: 100, md: 150 }}
              height={{ base: 100, md: 150 }}
              alt={'wishseller'}
            />
            {isOwner && (
              <Button
                variant="solid"
                mt={2}
                onClick={() => setOpenCreateModal(true)}
                colorScheme={color.isLight() ? 'blackAlpha' : 'gray'}
                size="sm"
              >
                + New List
              </Button>
            )}
          </Box>
          <Box>
            <Stack direction="row" mb={1} flexWrap="wrap">
              <Link
                isExternal
                href={`http://www.neopets.com/userlookup.phtml?user=${owner.neo_user}`}
              >
                <Badge borderRadius="md" colorScheme={color.isLight() ? 'black' : 'gray'}>
                  Userlookup <Icon as={BiLinkExternal} verticalAlign="text-top" />
                </Badge>
              </Link>
              <Link
                isExternal
                href={`http://www.neopets.com/neomessages.phtml?type=send&recipient=${owner.neo_user}`}
              >
                <Badge borderRadius="md" colorScheme={color.isLight() ? 'black' : 'gray'}>
                  Neomail <Icon as={BiLinkExternal} verticalAlign="text-top" />
                </Badge>
              </Link>
            </Stack>
            <Heading size={{ base: 'lg', md: undefined }}>
              {owner.username}&apos;s Lists{' '}
              <Badge fontSize="lg" verticalAlign="middle">
                {listsIds.length}
              </Badge>
            </Heading>
            {!isOwner && (
              <Stack mt={2} gap={1}>
                <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="bold">
                  {owner.username} has{' '}
                  <Badge borderRadius="md" verticalAlign="middle" colorScheme="green">
                    {matches.seek.length} items
                  </Badge>{' '}
                  that you want
                </Text>
                <Text
                  fontSize={{ base: 'xs', md: 'sm' }}
                  fontWeight="bold"
                  sx={{ marginTop: '0 !important' }}
                >
                  You have{' '}
                  <Badge borderRadius="md" verticalAlign="middle" colorScheme="blue">
                    {matches.trade.length} items
                  </Badge>{' '}
                  that {owner.username} wants
                </Text>
              </Stack>
            )}
            {isOwner && (
              <Text mt={2} fontSize={{ base: 'xs', md: 'sm' }} fontWeight="bold">
                Oh, that&apos;s you!
              </Text>
            )}
          </Box>
        </Flex>
      </Box>

      <Divider mt={5} />

      <Flex justifyContent={'space-between'} flexWrap="wrap" gap={3} alignItems="center" py={3}>
        {!isEdit && (
          <Text as="div" textColor={'gray.300'} fontSize="sm">
            {listsIds.length} lists
          </Text>
        )}
        {isEdit && (
          <Flex gap={3}>
            <Box bg={`rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]},.35)`} p={2} borderRadius="md">
              <SelectItemsCheckbox
                checked={selectedLists}
                allChecked={selectedLists.length === listsIds.length}
                onClick={handleSelectCheckbox}
              />
            </Box>
            <Button
              isDisabled={!selectedLists.length}
              colorScheme="red"
              leftIcon={<FaTrash />}
              variant="ghost"
              onClick={() => setOpenDeleteModal(true)}
            >
              Delete
            </Button>
            <Box></Box>
          </Flex>
        )}

        <HStack flex="0 0 auto">
          {isOwner && (
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0" textColor={'gray.300'} fontSize="sm">
                Edit Mode
              </FormLabel>
              <Switch colorScheme="whiteAlpha" isChecked={isEdit} onChange={toggleEdit} />
            </FormControl>
          )}
        </HStack>
      </Flex>

      {isEdit && (
        <Center>
          <Text fontSize="sm" opacity="0.8">
            Tip: Drag and drop to reorder lists
          </Text>
        </Center>
      )}
      <Flex mt={5} gap={4} flexWrap="wrap" justifyContent={'center'}>
        <SortableLists
          lists={lists}
          ids={listsIds}
          listSelect={selectedLists}
          editMode={isEdit}
          activateSort={isEdit}
          onClick={selectItem}
          onSort={handleSort}
        />
      </Flex>
    </Layout>
  );
};

export default UserListsPage;
