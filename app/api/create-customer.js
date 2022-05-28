import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_KEY);

/**
 * Create Customer if it doesn't exist
 * Return existing customer if it does
 */
export default async function handler(req, res) {
  try {
    const { email } = req.body;
    const { data } = await stripe.customers.list({ email });
    let customer;
    if (data.length) {
      customer = data[0];

      // Check for monthly subscription
      const { data: monthlySubscriptions } = await stripe.subscriptions.list({
        customer: customer.id,
        price: process.env.STRIPE_PRICE_ID,
      });

      if (monthlySubscriptions.length) {
        return res.status(200).json({
          customer,
          subscription: monthlySubscriptions[0],
        });
      }

      // Check for yearly subscription
      const { data: yearlySubscriptions } = await stripe.subscriptions.list({
        customer: customer.id,
        price: process.env.STRIPE_PRICE_ID_YEARLY,
      });

      if (yearlySubscriptions.length) {
        return res.status(200).json({
          customer,
          subscription: yearlySubscriptions[0],
        });
      }

      res.json({ customer });
    } else {
      customer = await stripe.customers.create({ email });
      res.json({ customer });
    }
  } catch (error) {
    return res.status("402").send({ error: { message: error.message } });
  }
}
