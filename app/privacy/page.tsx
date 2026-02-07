import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | BestFoodWhere",
  description:
    "Learn how BestFoodWhere collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#ff6a3d] to-[#ff8c66] py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Privacy Policy</h1>
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
              1. Introduction
            </h2>
            <p className="text-gray-600">
              Welcome to BestFoodWhere (&quot;we,&quot; &quot;our,&quot; or
              &quot;us&quot;). We are committed to protecting your personal
              information and your right to privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you visit our website bestfoodwhere.sg.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              2. Information We Collect
            </h2>
            <p className="text-gray-600">
              We collect information that you voluntarily provide to us when
              you:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Register for our newsletter or VIP club</li>
              <li>Fill out contact forms</li>
              <li>Participate in surveys or promotions</li>
              <li>Interact with our website</li>
            </ul>
            <p className="mt-4 text-gray-600">
              <strong>Personal Information:</strong> Name, email address, phone
              number (Singapore numbers only), and any other information you
              choose to provide.
            </p>
            <p className="text-gray-600">
              <strong>Automatically Collected Information:</strong> Device
              information, browser type, IP address, pages visited, time spent
              on pages, and other usage data.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-600">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Send you our newsletter and promotional content</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Improve our website and services</li>
              <li>Analyze usage patterns and trends</li>
              <li>Prevent fraudulent activity</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              4. Sharing Your Information
            </h2>
            <p className="text-gray-600">
              We do not sell your personal information. We may share your
              information with:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>
                Service providers who assist in operating our website (e.g.,
                email services, analytics)
              </li>
              <li>
                Partner restaurants when you explicitly opt-in to receive their
                promotions
              </li>
              <li>Legal authorities when required by law</li>
            </ul>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              5. Data Security
            </h2>
            <p className="text-gray-600">
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. However, no method of
              transmission over the Internet is 100% secure.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              6. Your Rights
            </h2>
            <p className="text-gray-600">
              Under Singapore&apos;s Personal Data Protection Act (PDPA), you
              have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Access your personal data</li>
              <li>Correct inaccurate personal data</li>
              <li>Withdraw consent for data processing</li>
              <li>Request deletion of your data</li>
            </ul>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              7. Cookies and Tracking
            </h2>
            <p className="text-gray-600">
              We use cookies and similar tracking technologies to improve your
              browsing experience. You can control cookie preferences through
              your browser settings.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              8. Third-Party Links
            </h2>
            <p className="text-gray-600">
              Our website may contain links to third-party websites. We are not
              responsible for the privacy practices of these external sites. We
              encourage you to review their privacy policies.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              9. Changes to This Policy
            </h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new policy on this page
              and updating the &quot;Last updated&quot; date.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              10. Contact Us
            </h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy or our data
              practices, please contact us at:
            </p>
            <p className="text-gray-600">
              <strong>Email:</strong> privacy@bestfoodwhere.sg
              <br />
              <strong>Website:</strong> bestfoodwhere.sg/contact-us
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
