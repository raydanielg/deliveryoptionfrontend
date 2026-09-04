import { LandingHeader, LandingFooter } from "@/components/landing-sections"

export const metadata = {
  title: "Privacy Policy — Xerin Express",
  description: "How Xerin Express collects, uses, and protects your personal information.",
}

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="mt-12 space-y-10">
            <section>
              <h2 className="text-xl font-semibold tracking-tight">1. Introduction</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Xerin Express (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is a logistics and delivery management platform
                operating in Tanzania and across East Africa. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your personal information when you use our website, mobile applications,
                and services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">2. Information We Collect</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                We collect information you provide directly to us, including:
              </p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span><strong className="text-foreground">Account information:</strong> Name, email address, phone number, and password when you create an account.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span><strong className="text-foreground">Shipment information:</strong> Sender and recipient details, pickup and delivery addresses, parcel details, and tracking data.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span><strong className="text-foreground">Payment information:</strong> Payment method details processed securely through our payment gateway partners (Selcom, Azampesa).</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span><strong className="text-foreground">Usage data:</strong> Device information, IP address, browser type, and interaction data with our platform.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span><strong className="text-foreground">Location data:</strong> GPS coordinates for pickup, delivery, and real-time tracking purposes.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">3. How We Use Your Information</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                We use the collected information to:
              </p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Provide, operate, and maintain our delivery and logistics services.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Process shipments, payments, and provide real-time tracking.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Verify identity and authenticate users through OTP verification.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Communicate with you about shipments, updates, promotions, and support.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Maintain proof of delivery records including photos and OTP confirmations.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Comply with legal obligations and prevent fraud.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">4. Information Sharing</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span><strong className="text-foreground">Drivers and couriers:</strong> Necessary shipment details for pickup and delivery.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span><strong className="text-foreground">Payment processors:</strong> Selcom and Azampesa for secure payment processing.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span><strong className="text-foreground">Service providers:</strong> Third-party services that support our operations (e.g., cloud hosting, SMS gateways).</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span><strong className="text-foreground">Legal authorities:</strong> When required by law or to protect our rights and safety.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">5. Data Security</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                We implement industry-standard security measures to protect your personal information, including
                encrypted password hashing, secure OTP verification, role-based access control, and encrypted
                data transmission. However, no method of transmission over the internet is 100% secure, and we
                cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">6. Data Retention</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                We retain your personal information for as long as your account is active or as needed to provide
                our services. Shipment records, proof of delivery, and transaction data are retained for a minimum
                of 5 years for legal and audit purposes. You may request deletion of your account data at any time,
                subject to legal retention requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">7. Your Rights</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                You have the right to:
              </p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Access and review the personal information we hold about you.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Correct inaccurate or incomplete information.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Request deletion of your personal data, subject to legal obligations.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Opt out of marketing communications at any time.</span></li>
                <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> <span>Withdraw consent for location tracking and data processing.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">8. Cookies & Tracking</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Our website and applications use cookies and similar tracking technologies to enhance your
                experience, analyze traffic, and remember your preferences. You can control cookies through
                your browser settings, though disabling them may affect functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">9. Children&apos;s Privacy</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Our services are not intended for individuals under the age of 16. We do not knowingly collect
                personal information from children. If you believe we have collected information from a child,
                please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">10. Changes to This Policy</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of significant changes
                by posting the updated policy on this page and updating the &quot;Last updated&quot; date. We encourage
                you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">11. Contact Us</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                If you have any questions or concerns about this Privacy Policy or our data practices, please
                contact us at:
              </p>
              <div className="mt-4 rounded-xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Xerin Express</strong><br />
                  Dar es Salaam, Tanzania<br />
                  Email: <a href="mailto:info@xerinexpress.co.tz" className="text-primary hover:underline">info@xerinexpress.co.tz</a><br />
                  Phone: <a href="tel:+255792810292" className="text-primary hover:underline">+255 792 810 292</a> &middot; <a href="tel:+971565878379" className="text-primary hover:underline">+971 56 587 8379</a>
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
