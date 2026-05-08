import { NextResponse } from 'next/server';
import { getOrgMembership } from '@/lib/org';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const membership = await getOrgMembership(params.slug);
  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const members = await prisma.orgMember.findMany({
    where: { orgId: membership.org.id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(members);
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const membership = await getOrgMembership(params.slug);
  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (membership.role === 'MEMBER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { email, role = 'MEMBER' } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'User not found. They must register first.' }, { status: 404 });

  const existing = await prisma.orgMember.findFirst({
    where: { userId: user.id, orgId: membership.org.id },
  });
  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 400 });

  const member = await prisma.orgMember.create({
    data: { userId: user.id, orgId: membership.org.id, role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(member, { status: 201 });
}
