import { Prisma } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../utils/prisma';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return GET(req, res);

  if (req.method == 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    return res.status(200).json({});
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function GET(req: NextApiRequest, res: NextApiResponse<any>) {
  const itemProcess = prisma.itemProcess.count({
    where: {
      processed: false,
      manual_check: null,
    },
  });

  const itemProcessTotal = prisma.itemProcess.count();

  const itemsMissingInfo = prisma.items.count({
    where: {
      OR: [{ item_id: null }, { category: null }, { rarity: null }],
    },
  });

  const itemsTotal = prisma.items.count();

  const tradeQueueRaw = prisma.$queryRaw<{ count: number }[]>(
    Prisma.sql`SELECT COUNT(DISTINCT hash) as "count" FROM trades where processed = 0`
  );

  const feedbackVoting = prisma.feedbacks.count({
    where: {
      type: 'tradePrice',
      processed: false,
    },
  });

  const [
    itemToProcessCount,
    itemsMissingInfoCount,
    itemsTotalCount,
    tradeQueueCount,
    itemProcessCount,
    feedbackVotingCount,
  ] = await Promise.all([
    itemProcess,
    itemsMissingInfo,
    itemsTotal,
    tradeQueueRaw,
    itemProcessTotal,
    feedbackVoting,
  ]);

  return res.status(200).json({
    itemProcess: itemProcessCount,
    itemToProcess: itemToProcessCount,
    itemsMissingInfo: itemsMissingInfoCount,
    itemsTotal: itemsTotalCount,
    tradeQueue: Number(tradeQueueCount[0].count.toString()),
    feedbackVoting: feedbackVotingCount,
  });
}
