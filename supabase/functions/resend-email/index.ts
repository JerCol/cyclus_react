import { Resend } from 'https://esm.sh/resend@2';
import { corsHeaders } from '../_shared/cors.ts';
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
Deno.serve(async (req)=>{
  /* 1️⃣  CORS pre-flight */ if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  /* 2️⃣  Business */ const { email, pdfBase64 } = await req.json();
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Your Cyclus ticket',
    html: `
    <p>Hello,</p>

    <p>Thanks for your support!</p>

    <p>
       Where? <a href="https://maps.app.goo.gl/NuwN9HraQasXheyH9">Rue Ravenstein 26, Brussels</a><br>
       When? <strong>25&nbsp;July&nbsp;2025</strong> (19:30 – 05:00)</p>

    <p>General info through our channels:<br>
       <a href="https://cyclus-bxl.be/">Website</a> ·
       <a href="https://www.instagram.com/cyclus.bxl?igsh=am9nYjhpcXJtOW15">Instagram</a> ·
       <a href="https://chat.whatsapp.com/LBvA1PzU6ztJmsRBAzrDJN?mode=r_c">WhatsApp group</a></p>

    <p>Doors open at <strong>19h30</strong> for our shared dinner (vegan option available).<br>
       We’d love you to dinner with us so the adventure starts collectively from the very beginning.</p>

    <p>See you soon!</p>
  `,
    attachments: [
      {
        filename: 'cyclus_ticket.pdf',
        content: pdfBase64,
        contentType: 'application/pdf'
      }
    ]
  });
  /* 3️⃣  Surface any error */ if (error) {
    console.error('Resend refused →', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
  console.log('Resend accepted →', data); // id: "xxxx-…"
  return new Response(JSON.stringify({
    ok: true
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
});
