import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { invoiceService } from '@/lib/payments/invoice';

const prisma = new PrismaClient();

// GET /api/payments/invoices - Get invoices for business
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || undefined;

    // Get user's business
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const result = await invoiceService.getBusinessInvoices(business.id, {
      limit,
      offset,
      status
    });

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error getting invoices:', error);
    return NextResponse.json(
      { error: 'Failed to get invoices' },
      { status: 500 }
    );
  }
}

// POST /api/payments/invoices - Create manual invoice
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, description, notes, dueDate, lineItems, taxAmount, discount } = body;

    // Get user's business and subscription
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
      include: { subscription: true }
    });

    if (!business?.subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    const invoice = await invoiceService.createInvoice({
      subscriptionId: business.subscription.id,
      amount,
      currency: 'THB',
      description,
      notes,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      lineItems: lineItems || [],
      taxAmount,
      discount
    });

    return NextResponse.json({
      success: true,
      invoice
    });

  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
