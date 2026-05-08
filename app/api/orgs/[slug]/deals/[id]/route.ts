import { NextResponse } from 'next/server';
import { getOrgMembership } from '@/lib/org';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { slug: string; id: string } }) {
  const membership = await getOrgMembership(params.slug);
  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const deal = await prisma.deal.findFirst({ where: { id: params.id, orgId: membership.org.id } });
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.deal.update({
    where: { id: params.id },
    data: body,
    include: { contact: { select: { firstName: true, lastName: true, company: true } } },
  });

  // Log stage change
  if (body.stage && body.stage !== deal.stage) {
    await prisma.activity.create({
      data: {
        orgId: membership.org.id,
        userId: membership.userId,
        dealId: deal.id,
        type: 'DEAL_MOVED',
        title: `Deal moved: ${deal.title} → ${body.stage}`,
      },
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { slug: string; id: string } }) {
  const membership = await getOrgMembership(params.slug);
  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const deal = await prisma.deal.findFirst({ where: { id: params.id, orgId: membership.org.id } });
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.deal.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
