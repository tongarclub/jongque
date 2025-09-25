import { PrismaClient } from '@prisma/client';
import { stripe } from './stripe';

const prisma = new PrismaClient();

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  period?: {
    start: Date;
    end: Date;
  };
}

export interface CreateInvoiceData {
  subscriptionId: string;
  amount: number;
  currency: string;
  description?: string;
  notes?: string;
  dueDate?: Date;
  lineItems: InvoiceLineItem[];
  taxAmount?: number;
  discount?: number;
}

export class InvoiceService {
  // Generate invoice number
  private generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-6);
    return `INV-${year}${month}-${timestamp}`;
  }

  // Create invoice
  async createInvoice(data: CreateInvoiceData) {
    try {
      const invoiceNumber = this.generateInvoiceNumber();
      const subtotal = data.lineItems.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = data.taxAmount || 0;
      const discount = data.discount || 0;
      const total = subtotal + taxAmount - discount;

      // Create invoice in database
      const invoice = await prisma.invoice.create({
        data: {
          subscriptionId: data.subscriptionId,
          invoiceNumber,
          amount: total,
          currency: data.currency,
          subtotal,
          taxAmount,
          discount,
          total,
          description: data.description,
          notes: data.notes,
          dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
          lineItems: data.lineItems as any,
          status: 'DRAFT'
        }
      });

      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw new Error('Failed to create invoice');
    }
  }

  // Generate invoice for subscription
  async generateSubscriptionInvoice(subscriptionId: string, billingPeriod: { start: Date; end: Date }) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { business: true }
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Get subscription tier price
      const tierPrices = {
        FREE: 0,
        BASIC: 300,
        PRO: 600,
        ENTERPRISE: 1000
      };

      const monthlyPrice = tierPrices[subscription.tier];

      const lineItems: InvoiceLineItem[] = [
        {
          description: `${subscription.tier} Plan Subscription - ${billingPeriod.start.toLocaleDateString('th-TH')} to ${billingPeriod.end.toLocaleDateString('th-TH')}`,
          quantity: 1,
          unitPrice: monthlyPrice,
          amount: monthlyPrice,
          period: billingPeriod
        }
      ];

      const invoice = await this.createInvoice({
        subscriptionId,
        amount: monthlyPrice,
        currency: 'THB',
        description: `Monthly subscription for ${subscription.business.name}`,
        lineItems,
        taxAmount: monthlyPrice * 0.07, // 7% VAT in Thailand
      });

      return invoice;
    } catch (error) {
      console.error('Error generating subscription invoice:', error);
      throw new Error('Failed to generate subscription invoice');
    }
  }

  // Update invoice status
  async updateInvoiceStatus(invoiceId: string, status: string, paidDate?: Date) {
    try {
      const invoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status,
          paidDate: status === 'PAID' ? (paidDate || new Date()) : null
        }
      });

      return invoice;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw new Error('Failed to update invoice status');
    }
  }

  // Get invoices for subscription
  async getSubscriptionInvoices(subscriptionId: string, options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }) {
    try {
      const where: any = { subscriptionId };
      
      if (options?.status) {
        where.status = options.status;
      }

      const invoices = await prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0
      });

      const total = await prisma.invoice.count({ where });

      return {
        invoices,
        total,
        hasMore: (options?.offset || 0) + invoices.length < total
      };
    } catch (error) {
      console.error('Error getting subscription invoices:', error);
      throw new Error('Failed to get subscription invoices');
    }
  }

  // Get business invoices
  async getBusinessInvoices(businessId: string, options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { businessId }
      });

      if (!subscription) {
        return { invoices: [], total: 0, hasMore: false };
      }

      return this.getSubscriptionInvoices(subscription.id, options);
    } catch (error) {
      console.error('Error getting business invoices:', error);
      throw new Error('Failed to get business invoices');
    }
  }

  // Generate PDF invoice (placeholder for future implementation)
  async generateInvoicePDF(invoiceId: string): Promise<string> {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          subscription: {
            include: { business: true }
          }
        }
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // TODO: Implement PDF generation with libraries like jsPDF or Puppeteer
      // For now, return a placeholder URL
      const pdfUrl = `/api/invoices/${invoiceId}/pdf`;
      
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { invoicePdf: pdfUrl }
      });

      return pdfUrl;
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw new Error('Failed to generate invoice PDF');
    }
  }

  // Send invoice via email
  async sendInvoiceEmail(invoiceId: string) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          subscription: {
            include: { business: { include: { owner: true } } }
          }
        }
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // TODO: Implement email sending logic
      // This would integrate with your notification system
      
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { 
          status: invoice.status === 'DRAFT' ? 'SENT' : invoice.status 
        }
      });

      return true;
    } catch (error) {
      console.error('Error sending invoice email:', error);
      throw new Error('Failed to send invoice email');
    }
  }

  // Mark invoice as paid
  async markInvoiceAsPaid(invoiceId: string, paymentData?: {
    paymentId: string;
    paymentDate: Date;
    paymentMethod: string;
  }) {
    try {
      const invoice = await this.updateInvoiceStatus(invoiceId, 'PAID', paymentData?.paymentDate);

      // Create payment record if payment data is provided
      if (paymentData && invoice) {
        await prisma.payment.create({
          data: {
            subscriptionId: invoice.subscriptionId,
            amount: invoice.total,
            currency: invoice.currency,
            status: 'SUCCEEDED',
            paymentDate: paymentData.paymentDate,
            paymentMethod: paymentData.paymentMethod,
            stripePaymentId: paymentData.paymentId,
            description: `Payment for invoice ${invoice.invoiceNumber}`,
            invoiceUrl: invoice.hostedInvoiceUrl,
          }
        });
      }

      return invoice;
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      throw new Error('Failed to mark invoice as paid');
    }
  }

  // Get payment history for subscription
  async getPaymentHistory(subscriptionId: string, options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }) {
    try {
      const where: any = { subscriptionId };
      
      if (options?.status) {
        where.status = options.status;
      }

      const payments = await prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0
      });

      const total = await prisma.payment.count({ where });

      return {
        payments,
        total,
        hasMore: (options?.offset || 0) + payments.length < total
      };
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw new Error('Failed to get payment history');
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(businessId: string, period: 'month' | 'quarter' | 'year' = 'month') {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { businessId },
        include: { payments: true }
      });

      if (!subscription) {
        return {
          totalRevenue: 0,
          paidInvoices: 0,
          pendingRevenue: 0,
          averagePayment: 0,
          paymentsByMonth: []
        };
      }

      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
          break;
        default: // month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Get successful payments in period
      const successfulPayments = await prisma.payment.findMany({
        where: {
          subscriptionId: subscription.id,
          status: 'SUCCEEDED',
          paymentDate: {
            gte: startDate,
            lte: now
          }
        },
        orderBy: { paymentDate: 'asc' }
      });

      // Calculate metrics
      const totalRevenue = successfulPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const averagePayment = successfulPayments.length > 0 ? totalRevenue / successfulPayments.length : 0;

      // Get pending revenue
      const pendingInvoices = await prisma.invoice.findMany({
        where: {
          subscriptionId: subscription.id,
          status: { in: ['SENT', 'OVERDUE'] }
        }
      });
      const pendingRevenue = pendingInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

      // Group payments by month
      const paymentsByMonth = this.groupPaymentsByMonth(successfulPayments);

      return {
        totalRevenue,
        paidInvoices: successfulPayments.length,
        pendingRevenue,
        averagePayment,
        paymentsByMonth
      };
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      throw new Error('Failed to get revenue analytics');
    }
  }

  private groupPaymentsByMonth(payments: any[]) {
    const grouped = payments.reduce((acc, payment) => {
      const date = new Date(payment.paymentDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[key]) {
        acc[key] = {
          period: key,
          amount: 0,
          count: 0
        };
      }
      
      acc[key].amount += Number(payment.amount);
      acc[key].count += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }
}

// Export singleton instance
export const invoiceService = new InvoiceService();
