import { LandingHeader, LandingFooter } from "@/components/landing-sections"

export const metadata = {
  title: "Terms of Service — Xerin Express",
  description: "The terms and conditions governing your use of Xerin Express logistics platform.",
}

export default function TermsOfServicePage() {
  return (
    <>
      <LandingHeader />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Legal
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="mt-12 space-y-10">
            <section>
              <h2 className="text-xl font-semibold tracking-tight">1. Acceptance of Terms</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                By accessing or using the Xerin Express website, mobile applications, or any of our logistics
                and delivery services, you agree to be bound by these Terms of Service. If you do not agree
                with any part of these terms, you must not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">2. Description of Services</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Xerin Express provides a logistics and delivery management platform that includes:
              </p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Domestic and international parcel delivery.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Freight forwarding and logistics management.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Real-time shipment tracking with OTP verification.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Proof of delivery with photo documentation.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Online payment processing via Selcom and Azampesa.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Scheduled delivery and surge pricing management.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">3. User Accounts</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                To use our services, you must create an account and provide accurate, complete information.
                You are responsible for maintaining the confidentiality of your account credentials and for
                all activities that occur under your account. You must be at least 16 years old to create
                an account. We offer three account types: Customer, Driver, and Administrator, each with
                specific permissions and responsibilities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">4. Shipments & Deliveries</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                When creating a shipment, you agree to:
              </p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Provide accurate sender and recipient information.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Ensure parcels are properly packaged and labeled.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Not ship prohibited, illegal, or dangerous items.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Provide OTP verification for pickup and delivery confirmation.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Pay applicable shipping fees based on weight, distance, and service level.</span></li>
              </ul>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Delivery times are estimates and may be affected by weather, traffic, customs, or other
                factors beyond our control. We are not liable for delays caused by such circumstances.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">5. Payments & Fees</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Shipping fees are calculated based on parcel category, weight, distance, and applicable surge
                pricing. Payments are processed securely through our payment gateway partners (Selcom and
                Azampesa). You agree to pay all charges at the time of booking. Surge pricing may apply during
                peak hours, holidays, or high-demand periods. All fees are displayed before you confirm a shipment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">6. Prohibited Items</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                You are strictly prohibited from shipping:
              </p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Illegal drugs, narcotics, or controlled substances.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Firearms, ammunition, or explosives.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Hazardous, flammable, or toxic materials.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Counterfeit goods or items violating intellectual property rights.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Perishable items requiring special handling without prior arrangement.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Any item prohibited by Tanzanian or international law.</span></li>
              </ul>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                We reserve the right to refuse, inspect, or confiscate any shipment that we suspect contains
                prohibited items, and to report such shipments to the appropriate authorities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">7. Liability & Insurance</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Xerin Express takes reasonable care in handling and transporting shipments. Our liability for
                lost or damaged parcels is limited to the declared value of the shipment or the shipping fee paid,
                whichever is lower. We are not liable for:
              </p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Indirect, incidental, or consequential damages.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Loss or damage due to improper packaging by the sender.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Delays caused by events beyond our reasonable control.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Contents of parcels that are prohibited or undeclared.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">8. Cancellations & Refunds</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Shipments can be cancelled before a driver has accepted the pickup. Cancellations after driver
                assignment may incur a cancellation fee. Refunds for cancelled shipments are processed to the
                original payment method within 5-10 business days. Surge pricing fees are non-refundable once
                a driver has been assigned.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">9. Driver Responsibilities</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Drivers using our platform are independent contractors, not employees of Xerin Express. Drivers
                agree to:
              </p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Maintain a valid driver&apos;s license and vehicle registration.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Follow all traffic laws and safety regulations.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Verify pickup and delivery using OTP authentication.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Capture proof of delivery photos when required.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Maintain professional conduct with customers.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">10. Intellectual Property</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                All content, features, and functionality of the Xerin Express platform, including logos, designs,
                text, graphics, and software, are the exclusive property of Xerin Express and are protected by
                intellectual property laws. You may not reproduce, distribute, or create derivative works from
                our content without prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">11. Termination</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                We reserve the right to suspend or terminate your account and access to our services at any time,
                without prior notice, for violations of these Terms, fraudulent activity, or any behavior that
                we determine may harm other users or our business. Upon termination, your right to use our
                services ceases immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">12. Dispute Resolution</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Any disputes arising from these Terms or your use of our services shall first be attempted to
                resolve through good-faith negotiation. If unresolved, disputes shall be settled through
                arbitration in Dar es Salaam, Tanzania, in accordance with Tanzanian law. You waive your right
                to participate in class action lawsuits or class-wide arbitration.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">13. Changes to Terms</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                We may modify these Terms of Service at any time. We will notify users of significant changes
                by posting the updated terms on this page and updating the &quot;Last updated&quot; date. Your continued
                use of our services after changes are posted constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">14. Contact Us</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                If you have any questions or concerns about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 rounded-xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Xerin Express</strong><br />
                  Dar es Salaam, Tanzania<br />
                  Email: <a href="mailto:info@xerinexpress.co.tz" className="text-primary hover:underline">info@xerinexpress.co.tz</a><br />
                  Phone: <a href="tel:+255700000000" className="text-primary hover:underline">+255 700 000 000</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <LandingFooter />
    </>
  )
}
