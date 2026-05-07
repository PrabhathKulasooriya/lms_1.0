import React from "react";

const TermsPage = () => {
  const lastUpdated = "May 4, 2026";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Terms and Conditions
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Last Updated: {lastUpdated}
        </p>

        <section className="space-y-6 text-gray-700 leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using our LMS platform, you agree to be bound by
              these Terms and Conditions and our Privacy Policy. If you do not
              agree, you may not access the services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              2. User Accounts
            </h2>
            <p>
              To access certain courses, you must register for an account. You
              are responsible for maintaining the confidentiality of your login
              credentials. You agree to notify us immediately of any
              unauthorized use of your account.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              3. Intellectual Property Rights
            </h2>
            <p>
              All course materials, including videos, quizzes, and text, are the
              property of [Your Company Name] or its content providers. You are
              granted a limited, non-exclusive license to access content for
              personal, non-commercial use only.
              <strong>
                {" "}
                Redistribution or resale of content is strictly prohibited.
              </strong>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              4. Payments and Refunds
            </h2>
            <p>
              Fees for courses are billed in advance. We offer a [e.g., 7-day]
              money-back guarantee if you are unsatisfied with the content,
              provided you have not completed more than [e.g., 20%] of the
              course.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              5. Prohibited Conduct
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>Sharing account credentials with third parties.</li>
              <li>Using automated systems (bots) to scrape content.</li>
              <li>
                Uploading malicious software or spamming discussion boards.
              </li>
              <li>Attempting to reverse-engineer the platform.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              6. Limitation of Liability
            </h2>
            <p>
              [Your Company Name] shall not be liable for any indirect,
              incidental, or consequential damages resulting from your use or
              inability to use the platform.
            </p>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Questions about the Terms? Contact us at{" "}
              <a
                href="mailto:support@yourlms.com"
                className="text-blue-600 hover:underline"
              >
                support@yourlms.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
