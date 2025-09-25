import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { isValidHexColor } from '@/lib/utils/theme-templates';

const prisma = new PrismaClient();

// GET /api/businesses/[businessId]/branding - Get business branding settings
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const business = await prisma.business.findFirst({
      where: {
        id: params.businessId,
        ownerId: session.user.id
      },
      select: {
        id: true,
        name: true,
        description: true,
        
        // Branding fields
        logo: true,
        coverImage: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        backgroundColor: true,
        textColor: true,
        
        // Typography
        fontFamily: true,
        fontHeading: true,
        fontSize: true,
        
        // Theme
        themeTemplate: true,
        customCSS: true,
        
        // Content
        welcomeMessage: true,
        termsOfService: true,
        privacyPolicy: true,
        aboutUs: true,
        
        // Gallery & Media
        galleryImages: true,
        socialMedia: true,
        
        // SEO
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        
        // Localization
        language: true,
        timeZone: true,
        currency: true,
        
        updatedAt: true
      }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json(business);

  } catch (error) {
    console.error('Error fetching business branding:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branding settings' },
      { status: 500 }
    );
  }
}

// PUT /api/businesses/[businessId]/branding - Update business branding settings
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate business ownership
    const existingBusiness = await prisma.business.findFirst({
      where: {
        id: params.businessId,
        ownerId: session.user.id
      }
    });

    if (!existingBusiness) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Validate color fields
    const colorFields = ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor'];
    for (const field of colorFields) {
      if (body[field] && !isValidHexColor(body[field])) {
        return NextResponse.json(
          { error: `Invalid color format for ${field}. Use hex format (e.g., #3b82f6)` },
          { status: 400 }
        );
      }
    }

    // Validate JSON fields
    if (body.galleryImages && typeof body.galleryImages !== 'object') {
      return NextResponse.json(
        { error: 'Gallery images must be a valid JSON array' },
        { status: 400 }
      );
    }

    if (body.socialMedia && typeof body.socialMedia !== 'object') {
      return NextResponse.json(
        { error: 'Social media must be a valid JSON object' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    // Branding fields
    if (body.logo !== undefined) updateData.logo = body.logo;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.primaryColor !== undefined) updateData.primaryColor = body.primaryColor;
    if (body.secondaryColor !== undefined) updateData.secondaryColor = body.secondaryColor;
    if (body.accentColor !== undefined) updateData.accentColor = body.accentColor;
    if (body.backgroundColor !== undefined) updateData.backgroundColor = body.backgroundColor;
    if (body.textColor !== undefined) updateData.textColor = body.textColor;
    
    // Typography
    if (body.fontFamily !== undefined) updateData.fontFamily = body.fontFamily;
    if (body.fontHeading !== undefined) updateData.fontHeading = body.fontHeading;
    if (body.fontSize !== undefined) updateData.fontSize = body.fontSize;
    
    // Theme
    if (body.themeTemplate !== undefined) updateData.themeTemplate = body.themeTemplate;
    if (body.customCSS !== undefined) updateData.customCSS = body.customCSS;
    
    // Content
    if (body.welcomeMessage !== undefined) updateData.welcomeMessage = body.welcomeMessage;
    if (body.termsOfService !== undefined) updateData.termsOfService = body.termsOfService;
    if (body.privacyPolicy !== undefined) updateData.privacyPolicy = body.privacyPolicy;
    if (body.aboutUs !== undefined) updateData.aboutUs = body.aboutUs;
    
    // Gallery & Media
    if (body.galleryImages !== undefined) updateData.galleryImages = body.galleryImages;
    if (body.socialMedia !== undefined) updateData.socialMedia = body.socialMedia;
    
    // SEO
    if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle;
    if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription;
    if (body.metaKeywords !== undefined) updateData.metaKeywords = body.metaKeywords;
    
    // Localization
    if (body.language !== undefined) updateData.language = body.language;
    if (body.timeZone !== undefined) updateData.timeZone = body.timeZone;
    if (body.currency !== undefined) updateData.currency = body.currency;

    // Update business
    const updatedBusiness = await prisma.business.update({
      where: { id: params.businessId },
      data: updateData,
      select: {
        id: true,
        name: true,
        logo: true,
        primaryColor: true,
        secondaryColor: true,
        themeTemplate: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      business: updatedBusiness,
      message: 'Branding settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating business branding:', error);
    return NextResponse.json(
      { error: 'Failed to update branding settings' },
      { status: 500 }
    );
  }
}

// POST /api/businesses/[businessId]/branding/preview - Generate preview CSS
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Import theme utilities dynamically
    const { generateThemeCSS } = await import('@/lib/utils/theme-templates');

    // Generate CSS from the provided branding data
    const css = generateThemeCSS(body);

    return NextResponse.json({
      success: true,
      css,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating preview CSS:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}
