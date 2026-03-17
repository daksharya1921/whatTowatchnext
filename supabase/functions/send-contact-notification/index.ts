import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Send notification email to site owner
    const emailResponse = await fetch('https://api.lovable.dev/api/v1/send-email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'arya.daksh.official@gmail.com',
        subject: `New Contact Form Message from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px;">
            <h2 style="color: #1a1a2e; border-bottom: 2px solid #d49030; padding-bottom: 12px;">
              New Contact Form Submission
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #555; width: 100px;">Name</td>
                <td style="padding: 8px 12px; color: #1a1a2e;">${name}</td>
              </tr>
              <tr style="background: #f9f9f9;">
                <td style="padding: 8px 12px; font-weight: bold; color: #555;">Email</td>
                <td style="padding: 8px 12px; color: #1a1a2e;">${email}</td>
              </tr>
            </table>
            <div style="margin-top: 20px; padding: 16px; background: #f5f0e8; border-left: 3px solid #d49030; border-radius: 4px;">
              <p style="margin: 0 0 4px; font-weight: bold; color: #555;">Message</p>
              <p style="margin: 0; color: #1a1a2e; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="margin-top: 24px; font-size: 12px; color: #999;">
              Sent via CineScope contact form
            </p>
          </div>
        `,
        purpose: 'transactional',
      }),
    });

    if (!emailResponse.ok) {
      const errBody = await emailResponse.text();
      console.error(`Email API failed [${emailResponse.status}]: ${errBody}`);
      // Don't fail the request - the message is already saved in the DB
      return new Response(JSON.stringify({ success: true, emailSent: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, emailSent: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
