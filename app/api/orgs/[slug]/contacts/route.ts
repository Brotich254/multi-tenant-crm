import { NextResponse } from 'next/server';
import { getOrgMembership } from '@/lib/org';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const membership = await getOrgMembership(params.slug);
  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || '';
  const status = searchParams.get('status') || undefined;

  const contacts = await prisma.contact.findMany({
    where: {
      orgId: membership.org.id,
      ...(status ? { status: status as any } : {}),
      ...(search ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { deals: true, activities: true } } },
  });
  return NextResponse.json(contacts);
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const membership = await getOrgMembership(params.slug);
  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const contact = await prisma.contact.create({
    data: { ...body, orgId: membership.org.id },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      orgId: membership.org.id,
      userId: membership.userId,
      contactId: contact.id,
      type: 'CONTACT_CREATED',
      title: `Contact created: ${contact.firstName} ${contact.lastName || ''}`,
    },
  });

  return NextResponse.json(contact, { status: 201 });
}
