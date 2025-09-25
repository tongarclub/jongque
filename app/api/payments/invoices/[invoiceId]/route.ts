import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { invoiceService } from '@/lib/payments/invoice';

const prisma = new PrismaClient();

// GET /api/payments/invoices/[invoiceId] - Get specific invoice
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ invoiceId: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.invoiceId },
      include: {
        subscription: {
          include: { business: true }
        }
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if user owns this invoice
    if (session.user.role !== 'ADMIN' && invoice.subscription.business.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      invoice
    });

  } catch (error) {
    console.error('Error getting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to get invoice' },
      { status: 500 }
    );
  }
}

// PUT /api/payments/invoices/[invoiceId] - Update invoice status
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ invoiceId: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status, paymentData } = body;

    // Get invoice and verify ownership
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.invoiceId },
      include: {
        subscription: {
          include: { business: true }
        }
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.subscription.business.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let updatedInvoice;

    if (status === 'PAID' && paymentData) {
      updatedInvoice = await invoiceService.markInvoiceAsPaid(params.invoiceId, paymentData);
    } else {
      updatedInvoice = await invoiceService.updateInvoiceStatus(params.invoiceId, status);
    }

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice
    });

  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}
