import {
  Center,
  Flex,
  FormControl,
  Input,
  Text,
  Spinner,
  Button,
  FormHelperText,
  FormLabel,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
// import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import Image from 'next/image';
import logoIcon from '../public/logo_white.svg';
import axios from 'axios';
import { useAuth } from '../utils/auth';
import LoginModal from '../components/Modal/LoginModal';
import { User } from '../types';

const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getAuth = () => import('../utils/firebase/auth');

const LoginPage = () => {
  // const auth = getAuth();
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [needInfo, setNeedInfo] = useState<boolean>(false);
  const [neopetsUser, setNeopetsUser] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const { user, authLoading, setUser } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!router.isReady || authLoading) return;
    init();
  }, [router.isReady, authLoading]);

  const init = async () => {
    setIsLoading(true);
    const { auth, isSignInWithEmailLink, signInWithEmailLink } = await getAuth();

    if (isSignInWithEmailLink(auth, window.location.href) && !user) {
      let mailAddr = window.localStorage.getItem('emailForSignIn');
      window.localStorage.removeItem('emailForSignIn');

      if (!mailAddr) mailAddr = email;
      if (!mailAddr) {
        setIsLoading(false);
        return;
      }

      try {
        const userCred = await signInWithEmailLink(auth, mailAddr, window.location.href);

        const token = await userCred.user.getIdToken();
        const userRes = await axios.post('/api/auth/login', null, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = userRes.data as User;

        if (!user.neopetsUser || !user.username) {
          setNeopetsUser(user.neopetsUser || '');
          setUsername(user.username || '');
          setIsLoading(false);
          return setNeedInfo(true);
        }

        setUser(user);

        router.replace('/');
      } catch (e: any) {
        setError(e.message);
        console.error(error);
      }
    } else if (user) {
      if (!user.neopetsUser || !user.username) {
        setNeopetsUser(user.neopetsUser || '');
        setUsername(user.username || '');
        setIsLoading(false);
        return setNeedInfo(true);
      }

      router.replace('/');
    } else onOpen();
  };

  const doConfirm = () => {
    if (!email.match(mailRegex)) {
      setError('Invalid email address');
      return;
    }

    init();
  };

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };

  const saveChanges = async () => {
    setError('');
    if (!neopetsUser || !username) {
      setError('Please fill all fields');
      return;
    }

    if (!neopetsUser.match(/^[a-zA-Z0-9_]+$/) || !username.match(/^[a-zA-Z0-9_]+$/)) {
      setError('Only letters, numbers and underlines are allowed');
      return;
    }

    setIsLoading(true);

    if (!(await checkUsername())) {
      setIsLoading(false);
      setError('Username already taken');
      return;
    }

    try {
      const { auth } = await getAuth();
      const token = await auth.currentUser?.getIdToken();
      const userRes = await axios.post(
        '/api/auth/alterUser',
        {
          neopetsUser: neopetsUser,
          username: username,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const user = userRes.data as User;

      if (!user.neopetsUser || !user.username) {
        setIsLoading(false);
        return setNeedInfo(true);
      }

      setUser(user);

      router.replace('/');
    } catch (e: any) {
      setError(e.message);
      console.error(error);
    }
  };

  const closeLogin = () => {
    onClose();
    router.replace('/');
  };

  const checkUsername = async (): Promise<boolean> => {
    if (!username) return false;
    if (!username.match(/^[a-zA-Z0-9_]+$/)) return false;

    try {
      const res = await axios.get(`/api/v1/users/${username}`);
      if (res.data) return false;
      else return true;
    } catch (e: any) {
      setError(e.message);
      console.error(error);
      return false;
    }
  };

  return (
    <Layout>
      <LoginModal isOpen={isOpen} onClose={closeLogin} />
      <Center h="80vh" flexFlow="column">
        {isLoading && !error && <Spinner size="lg" />}
        {isLoading && !!error && (
          <Text mt={4} color="red.400" textAlign="center">
            {error}
          </Text>
        )}

        {!isLoading && !needInfo && (
          <Flex flexFlow="column" gap={4} justifyContent="center" alignItems="center">
            <Image src={logoIcon} alt="itemdb logo" width={300} quality={100} />
            <Text mt={4} textAlign="center">
              Please confirm your email address
            </Text>
            <FormControl isInvalid={!!error}>
              <Input
                placeholder="Email Address"
                type="email"
                value={email}
                onChange={onEmailChange}
              />
            </FormControl>
            <Button onClick={doConfirm}>Continue</Button>
          </Flex>
        )}

        {!isLoading && needInfo && (
          <Flex flexFlow="column" gap={4} justifyContent="center" alignItems="center">
            <Image src={logoIcon} alt="itemdb logo" width={300} quality={100} />
            <Text mt={4} textAlign="center">
              Heey, we need some info to complete your signup
            </Text>
            <Text fontSize="sm" color="gray.400">
              We need this info so other users can reach you about NC Trades etc
            </Text>
            {!!error && (
              <Text color="red.400" textAlign="center">
                {error}
              </Text>
            )}
            <FormControl>
              <FormLabel>itemdb Username</FormLabel>
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                variant="filled"
              />
              <FormHelperText>Only letters, numbers and underlines</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>Neopets Username</FormLabel>
              <Input
                placeholder="Neopets Username"
                value={neopetsUser}
                onChange={(e) => setNeopetsUser(e.target.value)}
                variant="filled"
              />
              <FormHelperText>
                We need this info so other users can reach you about NC Trades etc
              </FormHelperText>
            </FormControl>
            <Button onClick={saveChanges}>Continue</Button>
          </Flex>
        )}
      </Center>
    </Layout>
  );
};

export default LoginPage;
