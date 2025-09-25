import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/businesses/[businessId]/gallery - Get gallery images
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

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: params.businessId,
        ownerId: session.user.id
      }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Get gallery images from business galleryImages JSON field
    const businessWithGallery = await prisma.business.findUnique({
      where: { id: params.businessId },
      select: { galleryImages: true }
    });

    let images = (businessWithGallery?.galleryImages as any[]) || [];

    // Apply filters
    if (category && category !== 'all') {
      images = images.filter((img: any) => img.category === category);
    }

    if (featured === 'true') {
      images = images.filter((img: any) => img.isFeatured === true);
    }

    // Sort by order and creation date
    images.sort((a: any, b: any) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

    // Paginate
    const totalImages = images.length;
    const paginatedImages = images.slice(skip, skip + limit);

    return NextResponse.json({
      images: paginatedImages,
      pagination: {
        page,
        limit,
        total: totalImages,
        pages: Math.ceil(totalImages / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}

// POST /api/businesses/[businessId]/gallery - Add new image
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
    const { url, title, description, category, isFeatured } = body;

    if (!url || !title || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: url, title, category' },
        { status: 400 }
      );
    }

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: params.businessId,
        ownerId: session.user.id
      },
      select: { galleryImages: true }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const existingImages = (business.galleryImages as any[]) || [];
    
    // Create new image object
    const newImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      title,
      description: description || '',
      category,
      isFeatured: isFeatured || false,
      order: existingImages.length + 1,
      uploadedAt: new Date().toISOString(),
      fileSize: body.fileSize || null,
      dimensions: body.dimensions || null
    };

    // Update business with new image
    const updatedImages = [newImage, ...existingImages];
    
    await prisma.business.update({
      where: { id: params.businessId },
      data: {
        galleryImages: updatedImages
      }
    });

    return NextResponse.json({
      success: true,
      image: newImage,
      message: 'Image added successfully'
    });

  } catch (error) {
    console.error('Error adding gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to add gallery image' },
      { status: 500 }
    );
  }
}

// PUT /api/businesses/[businessId]/gallery - Update multiple images or reorder
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
    const { images, action } = body;

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: params.businessId,
        ownerId: session.user.id
      },
      select: { galleryImages: true }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    let updatedImages = (business.galleryImages as any[]) || [];

    if (action === 'reorder' && Array.isArray(images)) {
      // Reorder images
      updatedImages = images.map((img: any, index: number) => ({
        ...img,
        order: index + 1
      }));
    } else if (action === 'bulk_update' && Array.isArray(images)) {
      // Update multiple images
      images.forEach((updateImage: any) => {
        const index = updatedImages.findIndex((img: any) => img.id === updateImage.id);
        if (index !== -1) {
          updatedImages[index] = { ...updatedImages[index], ...updateImage };
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action or images data' },
        { status: 400 }
      );
    }

    // Update business
    await prisma.business.update({
      where: { id: params.businessId },
      data: {
        galleryImages: updatedImages
      }
    });

    return NextResponse.json({
      success: true,
      images: updatedImages,
      message: 'Images updated successfully'
    });

  } catch (error) {
    console.error('Error updating gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to update gallery images' },
      { status: 500 }
    );
  }
}

// DELETE /api/businesses/[businessId]/gallery - Delete multiple images
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const imageIds = searchParams.get('ids')?.split(',') || [];

    if (imageIds.length === 0) {
      return NextResponse.json(
        { error: 'No image IDs provided' },
        { status: 400 }
      );
    }

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: params.businessId,
        ownerId: session.user.id
      },
      select: { galleryImages: true }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const existingImages = (business.galleryImages as any[]) || [];
    
    // Remove selected images
    const updatedImages = existingImages.filter((img: any) => 
      !imageIds.includes(img.id)
    );

    // Reorder remaining images
    const reorderedImages = updatedImages.map((img: any, index: number) => ({
      ...img,
      order: index + 1
    }));

    // Update business
    await prisma.business.update({
      where: { id: params.businessId },
      data: {
        galleryImages: reorderedImages
      }
    });

    return NextResponse.json({
      success: true,
      deletedCount: imageIds.length,
      remainingImages: reorderedImages,
      message: `Successfully deleted ${imageIds.length} image(s)`
    });

  } catch (error) {
    console.error('Error deleting gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery images' },
      { status: 500 }
    );
  }
}
