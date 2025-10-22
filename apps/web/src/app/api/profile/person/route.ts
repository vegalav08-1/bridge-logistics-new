import { NextRequest, NextResponse } from 'next/server';
import { getFeatureFlags } from '@/lib/flags';
import { personSchema } from '@/lib/profile/schema';

/**
 * POST /api/profile/person - Update person profile
 */
export async function POST(request: NextRequest) {
  try {
    const flags = getFeatureFlags();
    
    if (!flags.PROFILE_SPLIT_V1) {
      return NextResponse.json({ error: 'Feature not enabled' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate person profile data
    const validation = personSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const personData = validation.data;

    // TODO: Update in database with proper authentication
    console.log('Updating person profile:', personData);

    return NextResponse.json({ 
      success: true, 
      message: 'Person profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating person profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
