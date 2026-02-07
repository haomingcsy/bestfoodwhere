"use client";

import { useState } from "react";
import { IconX } from "@/components/layout/icons";
import {
  LISTING_OPTIONS,
  MARKETING_PACKAGES,
  DIGITAL_SOLUTIONS,
} from "../data";

type ModalType = "listing" | "marketing" | "digital" | "partner" | null;

const SERVICE_ICONS: Record<string, string> = {
  calendar: "🗓️",
  chart: "📊",
  cart: "🛒",
};

function Modal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-5"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-[600px] overflow-y-auto rounded-xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 rounded-full p-2 text-[#555] hover:bg-gray-100"
        >
          <IconX className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

function ListingModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#fff6f2]">
          <span className="text-2xl text-bfw-orange">📊</span>
        </div>
        <h2 className="font-heading text-2xl font-semibold text-[#333]">
          Restaurant Listing Services
        </h2>
        <p className="mt-2 font-body text-base text-[#666]">
          Get discovered by thousands of hungry customers
        </p>
      </div>

      <h3 className="mb-4 border-b-2 border-[#f0f0f0] pb-2 font-heading text-lg font-semibold text-[#333]">
        Listing Options
      </h3>

      <div className="space-y-4">
        {LISTING_OPTIONS.map((option, index) => (
          <div
            key={option.id}
            className={`rounded-lg border p-4 transition-all hover:border-bfw-orange hover:shadow-[0_5px_15px_rgba(239,95,42,0.1)] ${
              option.isFeatured
                ? "border-2 border-bfw-orange bg-[#fff6f2]"
                : "border-[#eee]"
            }`}
          >
            <div className="flex gap-4">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                  option.isFeatured
                    ? "bg-bfw-orange text-white"
                    : index === 0
                      ? "bg-[#f0f0f0] text-[#666]"
                      : "bg-[#fff6f2] text-bfw-orange"
                }`}
              >
                {index + 1}
              </span>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <h4 className="font-heading text-[17px] font-semibold">
                    {option.name}
                  </h4>
                  <span className="font-heading text-base font-semibold text-bfw-orange">
                    {option.price}
                  </span>
                </div>
                {option.isFeatured && (
                  <span className="mb-2 inline-block rounded bg-bfw-orange px-2 py-0.5 text-xs font-semibold text-white">
                    MOST POPULAR
                  </span>
                )}
                <p className="mb-2 font-body text-sm text-[#666]">
                  {option.description}
                </p>
                <ul className="list-disc space-y-1 pl-5 font-body text-sm text-[#666]">
                  {option.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-bfw-orange px-8 py-3 font-heading text-[15px] font-semibold text-white transition-colors hover:bg-bfw-orange-hover"
        >
          Start Now
        </button>
      </div>
    </>
  );
}

function MarketingModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#fff6f2]">
          <span className="text-2xl text-bfw-orange">🎯</span>
        </div>
        <h2 className="font-heading text-2xl font-semibold text-[#333]">
          Marketing Solutions
        </h2>
        <p className="mt-2 font-body text-base text-[#666]">
          Targeted campaigns to boost your restaurant&apos;s visibility
        </p>
      </div>

      <h3 className="mb-4 border-b-2 border-[#f0f0f0] pb-2 font-heading text-lg font-semibold text-[#333]">
        Our Marketing Packages
      </h3>

      <div className="space-y-5">
        {MARKETING_PACKAGES.map((pkg) => (
          <div key={pkg.id} className="rounded-lg bg-[#f8f8f8] p-5">
            <h4 className="mb-2 font-heading text-lg font-semibold text-[#333]">
              {pkg.name}
            </h4>
            <p className="mb-4 font-body text-sm text-[#666]">
              {pkg.description}
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-5 font-body text-sm text-[#666]">
              {pkg.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <div className="font-heading text-base font-semibold text-bfw-orange">
              {pkg.price}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-bfw-orange px-8 py-3 font-heading text-[15px] font-semibold text-white transition-colors hover:bg-bfw-orange-hover"
        >
          Contact Us
        </button>
      </div>
    </>
  );
}

function DigitalModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#fff6f2]">
          <span className="text-2xl text-bfw-orange">📱</span>
        </div>
        <h2 className="font-heading text-2xl font-semibold text-[#333]">
          Digital Solutions
        </h2>
        <p className="mt-2 font-body text-base text-[#666]">
          Tech-powered tools to streamline your operations
        </p>
      </div>

      <h3 className="mb-4 border-b-2 border-[#f0f0f0] pb-2 font-heading text-lg font-semibold text-[#333]">
        Our Digital Tools
      </h3>

      <div className="space-y-6">
        {DIGITAL_SOLUTIONS.map((solution) => (
          <div key={solution.id}>
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#fff6f2]">
                <span className="text-xl text-bfw-orange">
                  {SERVICE_ICONS[solution.icon]}
                </span>
              </div>
              <h4 className="font-heading text-lg font-semibold text-[#333]">
                {solution.name}
              </h4>
            </div>
            <p className="mb-4 pl-[66px] font-body text-sm text-[#666]">
              {solution.description}
            </p>
            <div className="ml-[66px] rounded-lg bg-[#f8f8f8] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="mb-1 font-heading text-base font-semibold text-[#333]">
                    Key Features
                  </h5>
                  <ul className="list-disc space-y-1 pl-5 font-body text-sm text-[#666]">
                    {solution.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <span className="font-heading text-base font-semibold text-bfw-orange">
                  {solution.price}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-bfw-orange px-8 py-3 font-heading text-[15px] font-semibold text-white transition-colors hover:bg-bfw-orange-hover"
        >
          Request Demo
        </button>
      </div>
    </>
  );
}

function PartnerFormModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: "",
    contactName: "",
    email: "",
    phone: "",
    services: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setFormData({
        restaurantName: "",
        contactName: "",
        email: "",
        phone: "",
        services: "",
        message: "",
      });
    }, 5000);
  };

  if (submitted) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-green-500 text-3xl text-white">
          ✓
        </div>
        <h3 className="mb-2 font-heading text-lg font-semibold text-green-600">
          Thank You!
        </h3>
        <p className="font-body text-sm text-[#555]">
          Your information has been submitted successfully. Our team will
          contact you within 1-2 business days.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="font-heading text-2xl font-semibold text-[#333]">
          Partner With Us
        </h2>
        <p className="mt-2 font-body text-base text-[#666]">
          Fill out the form below and our team will contact you shortly
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block font-body text-sm font-semibold text-[#555]">
            Restaurant Name*
          </label>
          <input
            type="text"
            required
            value={formData.restaurantName}
            onChange={(e) =>
              setFormData({ ...formData, restaurantName: e.target.value })
            }
            className="w-full rounded-md border border-[#ddd] px-3 py-2.5 font-body text-sm outline-none focus:border-bfw-orange"
          />
        </div>

        <div>
          <label className="mb-1 block font-body text-sm font-semibold text-[#555]">
            Contact Person*
          </label>
          <input
            type="text"
            required
            value={formData.contactName}
            onChange={(e) =>
              setFormData({ ...formData, contactName: e.target.value })
            }
            className="w-full rounded-md border border-[#ddd] px-3 py-2.5 font-body text-sm outline-none focus:border-bfw-orange"
          />
        </div>

        <div>
          <label className="mb-1 block font-body text-sm font-semibold text-[#555]">
            Email Address*
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full rounded-md border border-[#ddd] px-3 py-2.5 font-body text-sm outline-none focus:border-bfw-orange"
          />
        </div>

        <div>
          <label className="mb-1 block font-body text-sm font-semibold text-[#555]">
            Phone Number*
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full rounded-md border border-[#ddd] px-3 py-2.5 font-body text-sm outline-none focus:border-bfw-orange"
          />
        </div>

        <div>
          <label className="mb-1 block font-body text-sm font-semibold text-[#555]">
            Interested in*
          </label>
          <select
            required
            value={formData.services}
            onChange={(e) =>
              setFormData({ ...formData, services: e.target.value })
            }
            className="w-full rounded-md border border-[#ddd] bg-white px-3 py-2.5 font-body text-sm outline-none focus:border-bfw-orange"
          >
            <option value="">Select a service</option>
            <option value="listing">Listing Services</option>
            <option value="marketing">Marketing Solutions</option>
            <option value="digital">Digital Solutions</option>
            <option value="all">All Services</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block font-body text-sm font-semibold text-[#555]">
            Additional Information
          </label>
          <textarea
            rows={4}
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="w-full resize-y rounded-md border border-[#ddd] px-3 py-2.5 font-body text-sm outline-none focus:border-bfw-orange"
          />
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-md bg-bfw-orange py-3 font-heading text-[15px] font-semibold text-white transition-colors hover:bg-bfw-orange-hover"
        >
          Submit
        </button>
      </form>
    </>
  );
}

export function RestaurantOwnersSection() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const services = [
    {
      id: "listing",
      icon: "📊",
      title: "Listing Services",
      description:
        "Get your restaurant listed on our platform and reach thousands of hungry customers.",
    },
    {
      id: "marketing",
      icon: "🎯",
      title: "Marketing Solutions",
      description:
        "Boost your visibility with targeted marketing campaigns and premium placements.",
    },
    {
      id: "digital",
      icon: "📱",
      title: "Digital Solutions",
      description:
        "Reservation systems, online ordering, and analytics to grow your business.",
    },
  ];

  return (
    <section className="mb-8 rounded-xl bg-[#f9f9f9] p-8">
      <div className="mb-8 text-center">
        <h2 className="font-heading text-[26px] font-bold text-bfw-orange">
          For Restaurant Owners
        </h2>
        <p className="mt-2 font-body text-base text-[#666]">
          Partner with us to grow your business
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => setActiveModal(service.id as ModalType)}
            className="cursor-pointer rounded-xl bg-white p-6 text-center shadow-[0_3px_10px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-2.5 hover:shadow-[0_10px_20px_rgba(239,95,42,0.15)]"
          >
            <div className="mx-auto mb-4 flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#fff6f2]">
              <span className="text-2xl text-bfw-orange">{service.icon}</span>
            </div>
            <h3 className="mb-2 font-heading text-lg font-semibold">
              {service.title}
            </h3>
            <p className="mb-4 font-body text-sm leading-snug text-[#666]">
              {service.description}
            </p>
            <span className="inline-block rounded bg-[#f0f0f0] px-3 py-1 font-heading text-[13px] font-semibold text-bfw-orange">
              View Details
            </span>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setActiveModal("partner")}
          className="inline-block rounded-md bg-bfw-orange px-8 py-3 font-heading text-[15px] font-semibold text-white transition-colors hover:bg-bfw-orange-hover"
        >
          Partner With Us
        </button>
      </div>

      <Modal
        isOpen={activeModal === "listing"}
        onClose={() => setActiveModal(null)}
      >
        <ListingModal onClose={() => setActiveModal(null)} />
      </Modal>

      <Modal
        isOpen={activeModal === "marketing"}
        onClose={() => setActiveModal(null)}
      >
        <MarketingModal onClose={() => setActiveModal(null)} />
      </Modal>

      <Modal
        isOpen={activeModal === "digital"}
        onClose={() => setActiveModal(null)}
      >
        <DigitalModal onClose={() => setActiveModal(null)} />
      </Modal>

      <Modal
        isOpen={activeModal === "partner"}
        onClose={() => setActiveModal(null)}
      >
        <PartnerFormModal onClose={() => setActiveModal(null)} />
      </Modal>
    </section>
  );
}
