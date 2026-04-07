import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

// We must disable Vercel's default body parser so Stripe can cryptographically verify the raw request payload
export const config = {
  api: {
    bodyParser: false,
  },
};

const buffer = (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  let reqBuffer;
  try {
     reqBuffer = await buffer(req);
  } catch (e) {
     return res.status(400).send('Webhook parsing error');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(reqBuffer, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook signature verification failed.`);
  }

  // Use Service Role Key to bypass RLS securely from server 
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
     console.error("Missing Supabase Environmental variables on Server.");
     return res.status(500).json({ error: "Server Configuration Error" });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // The user's ID string we passed into the Payment Link!
      const userId = session.client_reference_id; 

      if (userId) {
         // Upsert the subscription record securely
         const { error } = await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            status: 'active',
            updated_at: new Date().toISOString()
         }, { onConflict: 'user_id' });

         if (error) {
           console.error('Supabase error saving sub:', error);
           return res.status(500).json({ error: 'Supabase failure' });
         }
      }
    }

    // Handle Cancellations / Expirations
    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.canceled') {
       const subscription = event.data.object;
       const { error } = await supabase.from('subscriptions').update({ status: 'canceled' }).eq('stripe_customer_id', subscription.customer);
       if (error) console.error('Error canceling sub:', error);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Unexpected error handling event:", error);
    res.status(500).json({ error: error.message });
  }
}
