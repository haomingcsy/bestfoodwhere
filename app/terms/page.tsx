import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | BestFoodWhere",
  description:
    "Read the terms and conditions for using BestFoodWhere.sg, Singapore's premier food discovery platform.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#ff6a3d] to-[#ff8c66] py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Terms of Service</h1>
          <p className="mt-4 text-lg opacity-90">
            Last updated: January 1, 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl bg-white p-8 shadow-lg md:p-12">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600">
              By accessing and using BestFoodWhere.sg (&quot;the Website&quot;),
              you accept and agree to be bound by these Terms of Service. If you
              do not agree to these terms, please do not use our Website.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              2. Description of Service
            </h2>
            <p className="text-gray-600">
              BestFoodWhere is Singapore&apos;s premier mall dining discovery
              platform. We provide:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Restaurant and food establishment listings</li>
              <li>Mall dining directories and guides</li>
              <li>Postal code-based food finder</li>
              <li>Cuisine and dining type filters</li>
              <li>Promotional information and deals</li>
              <li>Newsletter and VIP club services</li>
            </ul>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              3. User Conduct
            </h2>
            <p className="text-gray-600">
              When using our Website, you agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>
                Provide accurate information when registering or contacting us
              </li>
              <li>Use the Website only for lawful purposes</li>
              <li>
                Not attempt to disrupt or compromise the Website&apos;s security
              </li>
              <li>
                Not use automated systems to access the Website without
                permission
              </li>
              <li>
                Not copy, reproduce, or redistribute our content without
                authorization
              </li>
            </ul>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              4. Intellectual Property
            </h2>
            <p className="text-gray-600">
              All content on BestFoodWhere, including text, graphics, logos,
              images, and software, is the property of BestFoodWhere or its
              content suppliers and is protected by Singapore and international
              copyright laws. You may not use, reproduce, or distribute our
              content without prior written consent.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              5. Restaurant Information Disclaimer
            </h2>
            <p className="text-gray-600">
              While we strive to maintain accurate and up-to-date information
              about restaurants, malls, and dining establishments:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>
                We cannot guarantee the accuracy of all information (menus,
                prices, operating hours)
              </li>
              <li>Restaurant details may change without notice</li>
              <li>
                We recommend contacting establishments directly for current
                information
              </li>
              <li>User reviews and ratings represent individual opinions</li>
            </ul>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              6. Third-Party Links
            </h2>
            <p className="text-gray-600">
              Our Website may contain links to third-party websites. We are not
              responsible for the content, accuracy, or practices of these
              external sites. Accessing third-party links is at your own risk.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-600">
              To the fullest extent permitted by law, BestFoodWhere shall not be
              liable for:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Any indirect, incidental, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>
                Damages arising from your use or inability to use the Website
              </li>
              <li>
                Actions taken based on information provided on the Website
              </li>
            </ul>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              8. Indemnification
            </h2>
            <p className="text-gray-600">
              You agree to indemnify and hold harmless BestFoodWhere, its
              officers, directors, employees, and partners from any claims,
              damages, or expenses arising from your use of the Website or
              violation of these Terms.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              9. Newsletter and Marketing
            </h2>
            <p className="text-gray-600">
              By subscribing to our newsletter or VIP club, you consent to
              receive marketing communications from us. You may unsubscribe at
              any time by clicking the unsubscribe link in our emails or
              contacting us directly.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              10. Modifications to Terms
            </h2>
            <p className="text-gray-600">
              We reserve the right to modify these Terms of Service at any time.
              Changes will be effective immediately upon posting on the Website.
              Your continued use of the Website after changes constitutes
              acceptance of the modified terms.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              11. Governing Law
            </h2>
            <p className="text-gray-600">
              These Terms shall be governed by and construed in accordance with
              the laws of Singapore. Any disputes shall be subject to the
              exclusive jurisdiction of the courts of Singapore.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              12. Contact Information
            </h2>
            <p className="text-gray-600">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-gray-600">
              <strong>Email:</strong> legal@bestfoodwhere.sg
              <br />
              <strong>Website:</strong> bestfoodwhere.sg/contact-us
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
