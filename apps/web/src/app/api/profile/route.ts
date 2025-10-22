import { NextRequest, NextResponse } from 'next/server';
import { getFeatureFlags } from '@/lib/flags';
import { profileBaseSchema } from '@/lib/profile/schema';
import { z } from 'zod';

/**
 * GET /api/profile - Get current user profile
 */
export async function GET(request: NextRequest) {
  try {
    const flags = getFeatureFlags();
    
    if (!flags.PROFILE_SPLIT_V1) {
      return NextResponse.json({ error: 'Feature not enabled' }, { status: 403 });
    }

    // TODO: Get from database with proper authentication
    // For now, return mock data
    const mockProfile = {
      id: 'user-1',
      email: 'vegalav0202@gmail.com',
      kind: 'PERSON' as const,
      base: {
        phone: '+7 999 123 45 67',
        country: 'RU',
        city: 'Москва',
        zip: '101000',
        address_line1: 'Тверская, 1',
        address_line2: 'офис 101',
        lang: 'ru',
        currency: 'EUR',
        client_code: '0421'
      },
      person: {
        first_name: 'Александр',
        last_name: 'Вега',
        date_of_birth: '1990-01-01',
        passport_no: '1234 567890',
        national_id: null
      },
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    };

    return NextResponse.json(mockProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/profile - Update base profile (excluding email)
 */
export async function POST(request: NextRequest) {
  try {
    const flags = getFeatureFlags();
    
    if (!flags.PROFILE_SPLIT_V1) {
      return NextResponse.json({ error: 'Feature not enabled' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate base profile data
    const validation = profileBaseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const profileData = validation.data;

    // TODO: Update in database with proper authentication
    // For now, just return success
    console.log('Updating profile:', profileData);

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
