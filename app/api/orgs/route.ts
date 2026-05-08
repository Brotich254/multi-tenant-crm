import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/org';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;

  const memberships = await prisma.orgMember.findMany({
    where: { userId },
    include: { org: { include: { _count: { select: { members: true, contacts: true, deals: true } } } } },
  });
  return NextResponse.json(memberships);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  let slug = slugify(name);
  // Ensure unique slug
  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const org = await prisma.organization.create({
    data: {
      name,
      slug,
      members: { create: { userId, role: 'OWNER' } },
    },
  });
  return NextResponse.json(org, { status: 201 });
}
