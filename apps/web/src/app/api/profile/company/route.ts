import { NextRequest, NextResponse } from 'next/server';
import { getFeatureFlags } from '@/lib/flags';
import { companySchema } from '@/lib/profile/schema';

/**
 * POST /api/profile/company - Update company profile
 */
export async function POST(request: NextRequest) {
  try {
    const flags = getFeatureFlags();
    
    if (!flags.PROFILE_SPLIT_V1) {
      return NextResponse.json({ error: 'Feature not enabled' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate company profile data
    const validation = companySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const companyData = validation.data;

    // TODO: Update in database with proper authentication
    console.log('Updating company profile:', companyData);

    return NextResponse.json({ 
      success: true, 
      message: 'Company profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating company profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
