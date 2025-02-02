import { NextApiRequest, NextApiResponse } from 'next';
import { ExtendedSearchQuery } from '../../../../../../types';
import { CheckAuth } from '../../../../../../utils/googleCloud';
import prisma from '../../../../../../utils/prisma';
import { doSearch } from '../../../search';
import { Prisma } from '@prisma/client';
import { isSameHour } from 'date-fns';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  // return res.status(405).json({ error: 'Method not allowed' });

  if (req.method === 'GET') return GET(req, res);
  if (req.method === 'POST') return POST(req, res);
  // if (req.method === 'PUT') return PUT(req, res);
  // if (req.method === 'DELETE') return DELETE(req, res);

  if (req.method == 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
    return res.status(200).json({});
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { list_id } = req.query;
  await syncDynamicList(parseInt(list_id as string), true);
  res.send('ok');
  return null;
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { username, list_id } = req.query;

  if (!username || !list_id || Array.isArray(list_id))
    return res.status(400).json({ error: 'Missing username or list_id' });

  const { queryData, linked_id, dynamicType } = req.body;

  if (!['addOnly', 'removeOnly', 'fullSync'].includes(dynamicType))
    return res.status(400).json({ error: 'Invalid dynamic type' });

  try {
    const { user } = await CheckAuth(req);

    if (!user || user.username !== username) return res.status(401).json({ error: 'Unauthorized' });
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const targetList = await prisma.userList.findFirst({
    where: {
      internal_id: parseInt(list_id),
      user: {
        username: username as string,
      },
    },
  });

  if (!targetList) return res.status(404).json({ error: 'List not found' });

  if (targetList.dynamicQuery || targetList.linkedListId)
    return res.status(400).json({ error: 'List is already dynamic' });

  // ---------- handle linked list ---------- //

  if (linked_id) {
    const linkedList = await prisma.userList.findFirst({
      where: {
        internal_id: parseInt(linked_id),
      },
      include: {
        user: true,
      },
    });

    if (!linkedList) return res.status(404).json({ error: 'Linked list not found' });

    if (linkedList.visibility === 'private' && linkedList.user.username !== username)
      return res.status(403).json({ error: 'Unauthorized' });

    const newList = await prisma.userList.update({
      where: {
        internal_id: parseInt(list_id),
      },
      data: {
        dynamicType: dynamicType,
        linkedListId: parseInt(linked_id),
      },
    });

    await syncDynamicList(parseInt(list_id), true);
    return res.status(200).json(newList);
  }

  // ---------- handle dynamic list ---------- //

  if (!queryData) return res.status(400).json({ error: 'Missing query data' });

  const newList = await prisma.userList.update({
    where: {
      internal_id: parseInt(list_id),
    },
    data: {
      dynamicType: dynamicType,
      dynamicQuery: queryData,
    },
  });

  await syncDynamicList(parseInt(list_id), true);
  return res.status(200).json(newList);
};

export const syncDynamicList = async (list_id: number, force = false) => {
  const targetList = await prisma.userList.findFirst({
    where: {
      internal_id: list_id,
    },
  });

  if (
    !targetList ||
    (!targetList.dynamicQuery && !targetList.linkedListId) ||
    !targetList.dynamicType
  )
    return null;

  if (targetList.lastSync && isSameHour(targetList.lastSync, new Date()) && !force) return null;

  const firstSync = !targetList.lastSync;

  const { linkedListId, dynamicType } = targetList;
  const dynamicQuery = targetList.dynamicQuery as ExtendedSearchQuery;

  if (linkedListId) {
    if (dynamicType === 'addOnly' || dynamicType === 'fullSync' || firstSync) {
      const res = (await prisma.$queryRaw`
        select item_iid from listitems 
        where list_id = ${linkedListId} 
        and item_iid not in (select item_iid from listitems where list_id = ${list_id}) 
        and isHidden = 0
      `) as any;

      const addData: { list_id: number; item_iid: number }[] = res.map(
        (item: { item_iid: number }) => {
          return {
            list_id: list_id,
            item_iid: item.item_iid,
          };
        }
      );

      await prisma.listItems.createMany({
        data: addData,
      });
    }

    if (dynamicType === 'removeOnly' || dynamicType === 'fullSync' || firstSync) {
      const res = (await prisma.$queryRaw`
        select internal_id from listitems 
        where list_id = ${list_id} 
        and item_iid not in (select item_iid from listitems where list_id = ${linkedListId} and isHidden = 0)
      `) as any;

      const removeData: number[] = res.map((item: { internal_id: number }) => {
        return item.internal_id;
      });

      await prisma.listItems.deleteMany({
        where: {
          internal_id: {
            in: removeData,
          },
        },
      });
    }

    await prisma.userList.update({
      where: {
        internal_id: list_id,
      },
      data: {
        lastSync: new Date(),
      },
    });

    return true;
  }

  if (dynamicQuery) {
    dynamicQuery.limit = 3000;
    dynamicQuery.page = 0;

    const searchRes = await doSearch(dynamicQuery.s, dynamicQuery);

    const item_iids = searchRes.content.map((item) => item.internal_id);

    if (dynamicType === 'addOnly' || dynamicType === 'fullSync' || firstSync) {
      const res = (await prisma.$queryRaw`
        select internal_id from items where internal_id in (${Prisma.join(item_iids)})
        and internal_id not in (select item_iid from listitems where list_id = ${list_id})
      `) as any;

      const addData: { list_id: number; item_iid: number }[] = res.map(
        (item: { internal_id: number }) => {
          return {
            list_id: list_id,
            item_iid: item.internal_id,
          };
        }
      );

      await prisma.listItems.createMany({
        data: addData,
      });
    }

    if (dynamicType === 'removeOnly' || dynamicType === 'fullSync' || firstSync) {
      const res = (await prisma.$queryRaw`
        select item_iid from listitems where list_id = ${list_id} 
        and item_iid not in (${Prisma.join(item_iids)})
      `) as any;

      const removeData: number[] = res.map((item: { item_iid: number }) => {
        return item.item_iid;
      });

      await prisma.listItems.deleteMany({
        where: {
          item_iid: {
            in: removeData,
          },
          list_id: list_id,
        },
      });
    }

    await prisma.userList.update({
      where: {
        internal_id: list_id,
      },
      data: {
        lastSync: new Date(),
      },
    });
  }
};
