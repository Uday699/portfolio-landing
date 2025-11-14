// api/lead.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const body = req.body;
    // validate minimal
    if(!body?.name || !body?.email || !body?.phone || !body?.consent){
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // forward to Pipedream: set PIPEDREAM_URL in your deployment environment variables
    const PIPEDREAM_URL = process.env.PIPEDREAM_URL || ''; // set this in Vercel dashboard

    // if not provided, store in a simple debug log response
    if(!PIPEDREAM_URL){
      console.log("PIPEDREAM not configured — returning debug response");
      return res.status(200).json({ forwarded:false, data: body, message: 'No PIPEDREAM_URL set (debug mode)' });
    }

    // forward
    const r = await fetch(PIPEDREAM_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });

    if(!r.ok){
      const txt = await r.text();
      return res.status(502).json({ message: 'Failed to forward to pipedream', detail: txt });
    }

    const pipedreamResp = await r.text();
    return res.status(200).json({ forwarded:true, pipedreamResp });

  } catch(err){
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
