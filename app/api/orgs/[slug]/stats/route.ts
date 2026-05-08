import { NextResponse } from 'next/server';
import { getOrgMembership } from '@/lib/org';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const membership = await getOrgMembership(params.slug);
  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orgId = membership.org.id;

  const [totalContacts, totalDeals, wonDeals, pipeline] = await Promise.all([
    prisma.contact.count({ where: { orgId } }),
    prisma.deal.count({ where: { orgId } }),
    prisma.deal.count({ where: { orgId, stage: 'CLOSED_WON' } }),
    prisma.deal.aggregate({ where: { orgId, stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] } }, _sum: { value: true } }),
  ]);

  const dealsByStage = await prisma.deal.groupBy({
    by: ['stage'],
    where: { orgId },
    _count: true,
    _sum: { value: true },
  });

  const wonValue = await prisma.deal.aggregate({
    where: { orgId, stage: 'CLOSED_WON' },
    _sum: { value: true },
  });

  const recentActivities = await prisma.activity.findMany({
    where: { orgId },
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: { user: { select: { name: true } } },
  });

  const stageMap: Record<string, number> = {};
  dealsByStage.forEach((d: any) => { stageMap[d.stage] = d._count; });

  return NextResponse.json({
    totalContacts,
    totalDeals,
    wonDeals,
    wonValue: wonValue._sum.value || 0,
    totalValue: pipeline._sum.value || 0,
    monthly_savings: 0,
    dealsByStage: stageMap,
    recentActivities,
  });
}
