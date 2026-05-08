import { NextResponse } from 'next/server';
import { getOrgMembership } from '@/lib/org';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { slug: string; id: string } }) {
  const membership = await getOrgMembership(params.slug);
  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contact = await prisma.contact.findFirst({
    where: { id: params.id, orgId: membership.org.id },
    include: {
      deals: { orderBy: { createdAt: 'desc' } },
      activities: { orderBy: { createdAt: 'desc' }, take: 10, include: { user: { select: { name: true } } } },
    },
  });
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(contact);
}

export async function PATCH(req: Request, { params }: { params: { slug: string; id: string } }) {
  const membership = await getOrgMembership(params.slug);
  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const contact = await prisma.contact.findFirst({ where: { id: params.id, orgId: membership.org.id } });
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.contact.update({ where: { id: params.id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { slug: string; id: string } }) {
  const membership = await getOrgMembership(params.slug);
  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contact = await prisma.contact.findFirst({ where: { id: params.id, orgId: membership.org.id } });
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.contact.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
