"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  brandName: string;
  locationName?: string;
}

const ISSUE_TYPES = [
  "Wrong information",
  "Restaurant permanently closed",
  "Missing or incorrect menu items",
  "Wrong opening hours",
  "Wrong address or phone",
  "Other",
] as const;

export function ReportIssueModal({
  open,
  onClose,
  brandName,
  locationName,
}: Props) {
  const [form, setForm] = useState({
    email: "",
    name: "",
    issueType: "" as string,
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.issueType) return;

    setStatus("submitting");
    setErrorMsg("");

    const subject = `${form.issueType} - ${brandName}${locationName ? ` (${locationName})` : ""}`;

    try {
      const params = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();

      const res = await fetch("/api/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: form.name || undefined,
          source: "report_issue",
          tags: ["report_issue", form.issueType.toLowerCase().replace(/\s+/g, "_")],
          subject,
          message: form.message || undefined,
          pageUrl: window.location.href,
          utm_source: params.get("utm_source") || "",
          utm_medium: params.get("utm_medium") || "",
          utm_campaign: params.get("utm_campaign") || "",
          utm_content: params.get("utm_content") || "",
          utm_term: params.get("utm_term") || "",
          customFields: [
            { key: "bfw_issue_type", field_value: form.issueType },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
      setTimeout(() => {
        onClose();
        setStatus("idle");
        setForm({ email: "", name: "", issueType: "", message: "" });
      }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      className="m-auto w-full max-w-md rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-black/50"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Report an Issue
          </h3>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          Help us keep {brandName} info accurate
          {locationName ? ` at ${locationName}` : ""}.
        </p>

        {status === "success" ? (
          <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <div className="text-base font-semibold text-gray-900">
              Thank you!
            </div>
            <p className="text-sm text-gray-500">
              We&apos;ll review your report and update the listing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Issue Type */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                What&apos;s the issue? <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.issueType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, issueType: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#e74c3c]/40 focus:ring-2 focus:ring-[#e74c3c]/10"
              >
                <option value="">Select issue type</option>
                {ISSUE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Your email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#e74c3c]/40 focus:ring-2 focus:ring-[#e74c3c]/10"
              />
            </div>

            {/* Name (optional) */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Your name{" "}
                <span className="text-xs text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="John"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#e74c3c]/40 focus:ring-2 focus:ring-[#e74c3c]/10"
              />
            </div>

            {/* Message */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Details{" "}
                <span className="text-xs text-gray-400">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Tell us more about the issue..."
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#e74c3c]/40 focus:ring-2 focus:ring-[#e74c3c]/10"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-600">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full rounded-xl bg-[#e74c3c] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#e74c3c]/25 transition hover:-translate-y-0.5 hover:bg-[#d44133] disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {status === "submitting" ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
