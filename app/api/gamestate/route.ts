import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

const gameStates = new Map<string, string>();

export async function POST(request: NextRequest) {
  const { gameState } = await request.json();
  const id = nanoid(6);
  gameStates.set(id, JSON.stringify(gameState));
  return NextResponse.json({ id });
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'No ID provided' }, { status: 400 });
  }

  const gameState = gameStates.get(id);

  if (!gameState) {
    return NextResponse.json(
      { error: 'Game state not found' },
      { status: 404 },
    );
  }

  return NextResponse.json({ gameState: JSON.parse(gameState) });
}

export async function PUT(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  const { gameState } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'No ID provided' }, { status: 400 });
  }

  if (!gameStates.has(id)) {
    return NextResponse.json(
      { error: 'Game state not found' },
      { status: 404 },
    );
  }

  gameStates.set(id, JSON.stringify(gameState));
  return NextResponse.json({ id });
}
