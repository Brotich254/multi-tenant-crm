import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';

/** Get the current user's membership in an org by slug. Returns null if not a member. */
export async function getOrgMembership(slug: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = (session.user as any).id as string;

  const membership = await prisma.orgMember.findFirst({
    where: {
      userId,
      org: { slug },
    },
    include: { org: true, user: true },
  });

  return membership;
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
