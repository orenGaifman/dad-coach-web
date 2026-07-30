import { NextResponse } from 'next/server';

/**
 * Dev-only endpoint to mark an invitation as SENT.
 * This is needed because the backend creates invitations in CREATED status,
 * but the onboarding flow requires SENT status.
 */
export async function POST(request: Request) {
  const { token, clearRateLimits } = await request.json();

  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 });
  }

  const { execSync } = await import('child_process');

  try {
    // Mark invitation as SENT
    execSync(
      `docker exec dad-coach-postgres-1 psql -U dadcoach -d dadcoach -c "UPDATE invitations SET status = 'SENT' WHERE token = '${token.replace(/'/g, "''")}'"`,
      { encoding: 'utf-8' }
    );

    // Clear rate limits so testing is smooth
    if (clearRateLimits) {
      execSync(
        `docker exec dad-coach-postgres-1 psql -U dadcoach -d dadcoach -c "DELETE FROM rate_limit_entries;"`,
        { encoding: 'utf-8' }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to mark invitation as SENT:', err);
    return NextResponse.json({ error: 'Failed to update invitation status' }, { status: 500 });
  }
}
