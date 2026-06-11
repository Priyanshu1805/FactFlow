import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Subscription Terms | Fact Flow",
  description: "Fact Flow Subscription Terms — billing, renewal, and cancellation policies for premium plans.",
}

export default function SubscriptionTermsPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">Subscription Terms</h1>
          <p className="text-muted-foreground text-sm">
            <strong>Effective Date:</strong> June 1, 2026 &nbsp;|&nbsp;
            <strong>Last Updated:</strong> June 10, 2026
          </p>
        </div>

        {/* Compliance Banner */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-4 mb-10">
          <p className="text-sm font-semibold text-red-500">
            These Subscription Terms govern your purchase and use of paid subscription plans on Fact Flow. By subscribing to a paid plan, you agree to these terms in addition to our general Terms of Use and Privacy Policy.
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">

          {/* 1. Subscription Plans */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Subscription Plans</h2>
            <p>Fact Flow offers the following tiers of access:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong className="text-foreground">Free Tier:</strong> Access to basic news articles, standard features, and community commenting with advertisements.
              </li>
              <li>
                <strong className="text-foreground">Premium Plan:</strong> Unlocks an ad-free reading experience, personalized daily/weekly news digest emails, and priority support.
              </li>
            </ul>
          </section>

          {/* 2. Billing & Payment */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Billing & Payment</h2>
            <p>
              By selecting a Premium Plan, you authorize Fact Flow (and our designated payment processors, such as Razorpay) to charge your selected payment method.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-foreground">Billing Cycle:</strong> Subscriptions are billed in advance on a recurring monthly or annual basis, depending on the plan you select at checkout.</li>
              <li><strong className="text-foreground">Payment Methods:</strong> We accept major credit/debit cards, UPI, and select net banking options. You must provide current, complete, and accurate billing information.</li>
            </ul>
          </section>

          {/* 3. Auto-Renewal */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Auto-Renewal</h2>
            <p>
              To ensure uninterrupted service, your Premium Plan subscription will automatically renew at the end of each billing cycle unless you cancel it before the renewal date.
            </p>
            <p className="mt-3">
              We will charge the subscription fee to the payment method on file on the first day of the new billing cycle. If a payment fails, we may suspend your premium access until the payment is successfully processed.
            </p>
          </section>

          {/* 4. Free Trial */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Free Trial</h2>
            <p>
              Fact Flow may occasionally offer a free trial period for the Premium Plan.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>If you sign up for a free trial, you may be required to provide payment information.</li>
              <li>You will not be charged until the trial period expires.</li>
              <li>Unless you cancel before the trial ends, your subscription will automatically convert to a paid, auto-renewing subscription at the standard rate.</li>
            </ul>
          </section>

          {/* 5. Refund Policy */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Refund Policy & No Refunds</h2>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 mb-4 mt-2">
              <p className="text-red-500 font-bold text-sm">Strictly No Refunds: All subscription payments are final and non-refundable.</p>
            </div>
            <p>
              Once a subscription is purchased and activated, Fact Flow does not offer refunds, credits, or pro-rated billing for any reason. 
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-foreground">No Partial Refunds:</strong> If you cancel your subscription mid-cycle (e.g., halfway through a month or year), you will not receive a refund for the unused portion of that cycle.</li>
              <li><strong className="text-foreground">Continued Access:</strong> Upon cancellation, you will continue to have full access to your Premium Plan features until the end of your currently paid billing period.</li>
              <li><strong className="text-foreground">Accidental Purchases:</strong> It is your responsibility to manage your subscriptions. We do not provide refunds for claims of accidental purchases or forgotten cancellations before auto-renewal.</li>
            </ul>
          </section>

          {/* 6. Cancellation */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Cancellation</h2>
            <p>
              You can cancel your Premium Plan auto-renewal at any time.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-foreground">How to Cancel:</strong> Navigate to your Account Settings → Subscription, and click "Cancel Subscription".</li>
              <li><strong className="text-foreground">Effect of Cancellation:</strong> Your cancellation will take effect at the end of the current billing cycle. You will retain premium features until that date. Afterwards, your account will revert to the Free Tier.</li>
            </ul>
          </section>

          {/* 7. Price Changes */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Price Changes</h2>
            <p>
              Fact Flow reserves the right to change the pricing of our subscription plans.
            </p>
            <p className="mt-3">
              If we change prices, we will provide you with at least <strong>30 days' advance notice</strong> via email before the new price applies to your next billing cycle. If you do not agree to the new price, you must cancel your subscription before the change takes effect.
            </p>
          </section>

          {/* 8. Taxes */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Taxes</h2>
            <p>
              All listed subscription prices are generally inclusive of applicable taxes unless otherwise stated at checkout.
            </p>
            <p className="mt-3">
              For users located in India, Goods and Services Tax (GST) is applicable on digital subscription services in accordance with Indian tax laws. A valid tax invoice will be generated and emailed to you for every successful payment.
            </p>
          </section>

          {/* 9. Governing Law */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Governing Law</h2>
            <p>
              These Subscription Terms shall be governed by and construed in accordance with the laws of India. Key applicable laws include:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>The Information Technology Act, 2000</li>
              <li>The Consumer Protection Act, 2019 (specifically relating to e-commerce and unfair trade practices)</li>
            </ul>
            <p className="mt-3">
              Any billing disputes or claims arising out of these terms shall be subject to the exclusive jurisdiction of the courts located in India.
            </p>
          </section>

          {/* 10. Contact */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">10. Contact Us</h2>
            <p>
              For any questions regarding billing, subscriptions, refunds, or cancellations, please contact our billing support team:
            </p>
            <div className="mt-4 bg-secondary/50 border border-border rounded-xl p-5 space-y-2">
              <p><span className="text-foreground font-semibold">Email:</span>{" "}
                <a href="mailto:billing@factflow.com" className="text-red-500 hover:underline">billing@factflow.com</a>
              </p>
              <p><span className="text-foreground font-semibold">Response Time:</span> We aim to respond to all billing inquiries within 24-48 business hours.</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
