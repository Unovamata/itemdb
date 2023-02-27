import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import type { NextApiRequest } from 'next'
import prisma from './prisma'
import { Storage } from '@google-cloud/storage'
import { User } from '../types'

if (!getApps().length)
  initializeApp({ credential: cert('./firebase-key.json') })

const Auth = getAuth()

export const CheckAuth = async (req: NextApiRequest) => {
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) throw new Error('No token provided')

  const decodedToken = await Auth.verifyIdToken(token)
  let user = (await prisma.user.findUnique({
    where: { id: decodedToken.uid },
  })) as User | null

  if (user) user.isAdmin = user.role === 'ADMIN'

  return {
    decodedToken: decodedToken,
    user: user,
  }
}

export const GoogleStorage = new Storage({
  keyFilename: './firebase-key.json',
})

export const ImageBucket = GoogleStorage.bucket('itemdb-1db58.appspot.com')
