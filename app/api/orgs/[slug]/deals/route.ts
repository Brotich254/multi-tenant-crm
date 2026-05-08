import { NextResponse } from 'next/server';
import { getOrgMembership } from '@/lib/org';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const membership = await getOrgMembership(params.slug);
  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const deals = await prisma.deal.findMany({
    where: { orgId: membership.org.id },
    orderBy: [{ stage: 'asc' }, { position: 'asc' }],
    include: {
      contact: { select: { firstName: true, lastName: true, company: true } },
      assignee: { select: { name: true } },
    },
  });
  return NextResponse.json(deals);
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const membership = await getOrgMembership(params.slug);
  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const deal = await prisma.deal.create({
    data: { ...body, orgId: membership.org.id },
    include: { contact: { select: { firstName: true, lastName: true, company: true } } },
  });

  await prisma.activity.create({
    data: {
      orgId: membership.org.id,
      userId: membership.userId,
      dealId: deal.id,
      type: 'DEAL_CREATED',
      title: `Deal created: ${deal.title}`,
    },
  });

  return NextResponse.json(deal, { status: 201 });
}
