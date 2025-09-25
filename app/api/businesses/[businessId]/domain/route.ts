import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/businesses/[businessId]/domain - Get domain settings
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
        subdomain: true,
        customDomain: true,
        isActive: true,
        updatedAt: true
      }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Get domain status
    const domainStatus = await getDomainStatus(business.customDomain);
    const subdomainStatus = await getSubdomainStatus(business.subdomain);

    return NextResponse.json({
      business,
      domainStatus,
      subdomainStatus,
      availableSubdomain: !business.subdomain ? await generateAvailableSubdomain(business.name) : null
    });

  } catch (error) {
    console.error('Error fetching domain settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domain settings' },
      { status: 500 }
    );
  }
}

// PUT /api/businesses/[businessId]/domain - Update domain settings
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
    const { subdomain, customDomain } = body;

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

    // Validate subdomain
    if (subdomain !== undefined) {
      const subdomainValidation = validateSubdomain(subdomain);
      if (!subdomainValidation.valid) {
        return NextResponse.json(
          { error: subdomainValidation.message },
          { status: 400 }
        );
      }

      // Check subdomain availability
      if (subdomain && subdomain !== existingBusiness.subdomain) {
        const isAvailable = await isSubdomainAvailable(subdomain);
        if (!isAvailable) {
          return NextResponse.json(
            { error: 'Subdomain is already taken' },
            { status: 400 }
          );
        }
      }
    }

    // Validate custom domain
    if (customDomain !== undefined) {
      const domainValidation = validateCustomDomain(customDomain);
      if (!domainValidation.valid) {
        return NextResponse.json(
          { error: domainValidation.message },
          { status: 400 }
        );
      }

      // Check custom domain availability
      if (customDomain && customDomain !== existingBusiness.customDomain) {
        const isAvailable = await isCustomDomainAvailable(customDomain);
        if (!isAvailable) {
          return NextResponse.json(
            { error: 'Custom domain is already taken' },
            { status: 400 }
          );
        }
      }
    }

    // Update business domain settings
    const updateData: any = {};
    if (subdomain !== undefined) updateData.subdomain = subdomain || null;
    if (customDomain !== undefined) updateData.customDomain = customDomain || null;

    const updatedBusiness = await prisma.business.update({
      where: { id: params.businessId },
      data: updateData,
      select: {
        id: true,
        name: true,
        subdomain: true,
        customDomain: true,
        updatedAt: true
      }
    });

    // If custom domain is being set, verify DNS
    let domainVerification = null;
    if (customDomain) {
      domainVerification = await verifyCustomDomain(customDomain);
    }

    return NextResponse.json({
      success: true,
      business: updatedBusiness,
      domainVerification,
      message: 'Domain settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating domain settings:', error);
    return NextResponse.json(
      { error: 'Failed to update domain settings' },
      { status: 500 }
    );
  }
}

// POST /api/businesses/[businessId]/domain/verify - Verify custom domain
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

    const business = await prisma.business.findFirst({
      where: {
        id: params.businessId,
        ownerId: session.user.id
      },
      select: {
        customDomain: true
      }
    });

    if (!business?.customDomain) {
      return NextResponse.json(
        { error: 'No custom domain configured' },
        { status: 400 }
      );
    }

    const verification = await verifyCustomDomain(business.customDomain);

    return NextResponse.json({
      success: true,
      verification,
      domain: business.customDomain
    });

  } catch (error) {
    console.error('Error verifying domain:', error);
    return NextResponse.json(
      { error: 'Failed to verify domain' },
      { status: 500 }
    );
  }
}

// Helper functions
function validateSubdomain(subdomain: string): { valid: boolean; message?: string } {
  if (!subdomain) return { valid: true }; // Allow empty subdomain
  
  // Check length
  if (subdomain.length < 3 || subdomain.length > 50) {
    return { valid: false, message: 'Subdomain must be between 3-50 characters' };
  }
  
  // Check format
  const subdomainRegex = /^[a-z0-9-]+$/;
  if (!subdomainRegex.test(subdomain)) {
    return { valid: false, message: 'Subdomain can only contain lowercase letters, numbers, and hyphens' };
  }
  
  // Check reserved words
  const reservedWords = [
    'www', 'api', 'admin', 'app', 'mail', 'ftp', 'localhost', 'test', 'staging',
    'dev', 'blog', 'shop', 'store', 'support', 'help', 'about', 'contact',
    'login', 'register', 'signup', 'dashboard', 'profile', 'settings'
  ];
  
  if (reservedWords.includes(subdomain)) {
    return { valid: false, message: 'This subdomain is reserved' };
  }
  
  return { valid: true };
}

function validateCustomDomain(domain: string): { valid: boolean; message?: string } {
  if (!domain) return { valid: true }; // Allow empty domain
  
  // Basic domain validation
  const domainRegex = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;
  if (!domainRegex.test(domain)) {
    return { valid: false, message: 'Invalid domain format' };
  }
  
  // Check domain length
  if (domain.length > 253) {
    return { valid: false, message: 'Domain is too long' };
  }
  
  return { valid: true };
}

async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  try {
    const existing = await prisma.business.findFirst({
      where: { subdomain }
    });
    return !existing;
  } catch (error) {
    console.error('Error checking subdomain availability:', error);
    return false;
  }
}

async function isCustomDomainAvailable(domain: string): Promise<boolean> {
  try {
    const existing = await prisma.business.findFirst({
      where: { customDomain: domain }
    });
    return !existing;
  } catch (error) {
    console.error('Error checking domain availability:', error);
    return false;
  }
}

async function generateAvailableSubdomain(businessName: string): Promise<string> {
  // Generate subdomain from business name
  let baseSubdomain = businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  // Limit length
  if (baseSubdomain.length > 30) {
    baseSubdomain = baseSubdomain.substring(0, 30);
  }
  
  // Find available subdomain
  let subdomain = baseSubdomain;
  let counter = 1;
  
  while (!(await isSubdomainAvailable(subdomain))) {
    subdomain = `${baseSubdomain}-${counter}`;
    counter++;
    
    // Prevent infinite loop
    if (counter > 100) {
      subdomain = `business-${Date.now()}`;
      break;
    }
  }
  
  return subdomain;
}

async function getDomainStatus(domain: string | null): Promise<any> {
  if (!domain) return null;
  
  // In production, this would check DNS records and SSL status
  // For development, return mock status
  return {
    domain,
    dnsConfigured: false,
    sslEnabled: false,
    status: 'pending_verification',
    requiredDNS: [
      {
        type: 'CNAME',
        name: domain,
        value: 'app.jongque.com',
        status: 'pending'
      }
    ]
  };
}

async function getSubdomainStatus(subdomain: string | null): Promise<any> {
  if (!subdomain) return null;
  
  return {
    subdomain,
    fullDomain: `${subdomain}.jongque.com`,
    status: 'active',
    sslEnabled: true
  };
}

async function verifyCustomDomain(domain: string): Promise<any> {
  // In production, this would perform actual DNS verification
  // For development, return mock verification
  return {
    domain,
    verified: false,
    dnsRecords: {
      cname: {
        configured: false,
        expected: 'app.jongque.com',
        current: null
      }
    },
    ssl: {
      enabled: false,
      issuer: null,
      expiresAt: null
    },
    instructions: [
      {
        step: 1,
        title: 'Add CNAME record',
        description: `Add a CNAME record pointing ${domain} to app.jongque.com`,
        details: {
          type: 'CNAME',
          name: domain,
          value: 'app.jongque.com'
        }
      },
      {
        step: 2,
        title: 'Wait for DNS propagation',
        description: 'DNS changes may take up to 24 hours to propagate'
      },
      {
        step: 3,
        title: 'Verify domain',
        description: 'Click verify to check if your domain is configured correctly'
      }
    ]
  };
}
