import { buffer } from 'micro';

export const config = {
  api: {
    bodyParser: false, // Required for raw body parsing
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const rawBody = await buffer(req);

    // TODO: verify signature from SafePay if available
    const event = JSON.parse(rawBody.toString());

    console.log('Webhook received:', event);

    if (event.type === 'payment.success') {
      const { bookingId, vehicleId } = event.data;

      // Example: update your database (Supabase, MongoDB, etc.)
      // await db.updateBooking(bookingId, { status: 'rented', paid: true });

      console.log(`Vehicle ${vehicleId} marked as rented`);
    }

    res.status(200).send('Webhook received');
  } else {
    res.status(405).send('Method not allowed');
  }
}
