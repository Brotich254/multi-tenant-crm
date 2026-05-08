import { NextResponse } from 'next/server';
import { getOrgMembership } from '@/lib/org';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const membership = await getOrgMembership(params.slug);
  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const activities = await prisma.activity.findMany({
    where: { orgId: membership.org.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user: { select: { name: true } },
      contact: { select: { firstName: true, lastName: true } },
      deal: { select: { title: true } },
    },
  });
  return NextResponse.json(activities);
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const membership = await getOrgMembership(params.slug);
  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const activity = await prisma.activity.create({
    data: { ...body, orgId: membership.org.id, userId: membership.userId },
  });
  return NextResponse.json(activity, { status: 201 });
}
