import { NextRequest, NextResponse } from 'next/server';
import { LeadSubmission } from '@/utils/analytics';

// In-memory storage for demo (replace with database in production)
const leadsStore = new Map<string, LeadSubmission>();

export async function POST(request: NextRequest) {
  try {
    const leadData: LeadSubmission = await request.json();
    
    // Validate required fields
    if (!leadData.email || !leadData.firstName) {
      return NextResponse.json(
        { error: 'Email and first name are required' },
        { status: 400 }
      );
    }

    // Generate lead ID
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store lead data
    const lead: LeadSubmission = {
      ...leadData,
      timestamp: new Date(leadData.timestamp)
    };

    leadsStore.set(leadId, lead);

    // Log lead submission (in production, send to CRM/email service)
    console.log('Lead submitted:', {
      leadId,
      email: lead.email,
      firstName: lead.firstName,
      company: lead.company,
      urgency: lead.urgency,
      leadScore: lead.leadScore,
      sessionId: lead.sessionId,
      source: lead.source
    });

    // In production, you would:
    // 1. Send to CRM (HubSpot, Salesforce, etc.)
    // 2. Send welcome email
    // 3. Notify sales team
    // 4. Add to mailing list

    return NextResponse.json({ 
      success: true, 
      leadId,
      message: 'Thank you! We\'ll be in touch within 24 hours.' 
    });
  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json(
      { error: 'Failed to submit lead' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const leadId = url.searchParams.get('leadId');

    if (leadId) {
      // Get specific lead
      const lead = leadsStore.get(leadId);
      if (!lead) {
        return NextResponse.json(
          { error: 'Lead not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(lead);
    } else {
      // Get all leads (for admin dashboard)
      const allLeads = Array.from(leadsStore.entries()).map(([id, lead]) => ({
        id,
        ...lead
      }));
      
      // Sort by timestamp (newest first)
      allLeads.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      return NextResponse.json(allLeads);
    }
  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve leads data' },
      { status: 500 }
    );
  }
} 