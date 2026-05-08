import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  if (await prisma.user.findUnique({ where: { email } }))
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, password: hashed } });
  return NextResponse.json({ ok: true }, { status: 201 });
}
