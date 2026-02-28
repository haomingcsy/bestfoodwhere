"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  Home,
  Users,
  Utensils,
  ChevronDown,
  ChevronRight,
  Upload,
  FileText,
  Check,
  X,
  Briefcase,
  Clock,
  Sparkles,
  Bell,
  Target,
  UserPlus,
  Mail,
  Phone,
  User,
  Send,
  AlertCircle,
} from "lucide-react";
import type {
  CareerJob,
  CareerTeamMember,
  JobCategory,
  CareerApplicationFormData,
} from "@/types/career";
import {
  AREAS_OF_INTEREST,
  AVAILABILITY_OPTIONS,
  JOB_CATEGORY_LABELS,
  JOB_TYPE_COLORS,
} from "@/types/career";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Stats for hero section
const HERO_STATS = [
  { value: "100K+", label: "Monthly Users" },
  { value: "5,000+", label: "Restaurants" },
  { value: "200+", label: "Food Deals" },
];

// Benefits of working at BFW
const BENEFITS = [
  {
    icon: TrendingUp,
    title: "Growth & Impact",
    description:
      "Make a real difference in Singapore's food scene and grow your career with a fast-moving team.",
  },
  {
    icon: Home,
    title: "100% Remote Work",
    description:
      "Work from anywhere with complete flexibility. No commute, no office politics - just results that matter.",
  },
  {
    icon: Users,
    title: "Diverse Culture",
    description:
      "Join a talented, diverse team that values different perspectives and collaborative innovation.",
  },
  {
    icon: Utensils,
    title: "Food Perks",
    description:
      "Enjoy exclusive dining experiences, restaurant vouchers, and food delivery credits in Singapore and beyond.",
  },
];

// Application process steps
const APPLICATION_STEPS = [
  {
    step: 1,
    icon: FileText,
    title: "Apply",
    description:
      "Submit your resume and a short cover letter telling us why you're excited about BestFoodWhere.",
  },
  {
    step: 2,
    icon: Phone,
    title: "Initial Call",
    description:
      "Have a brief conversation with our team to discuss your experience and expectations.",
  },
  {
    step: 3,
    icon: Target,
    title: "Skills Assessment",
    description:
      "Complete a relevant task to showcase your skills and approach to problem-solving.",
  },
  {
    step: 4,
    icon: Check,
    title: "Offer",
    description:
      "Receive an offer and join our team in connecting Singapore with amazing food experiences!",
  },
];

// Why join reasons for sidebar
const WHY_JOIN_REASONS = [
  {
    icon: Sparkles,
    title: "Bring Your Unique Skills",
    description:
      "Your talents might be perfect for a role we haven't thought yet. Let us value diverse perspectives and innovative thinking.",
  },
  {
    icon: Bell,
    title: "First To Know",
    description:
      "Submit your info to new positions that match your background and be the first to hear about opportunities before they're public.",
  },
  {
    icon: UserPlus,
    title: "Join Our Network",
    description:
      "Connect with our team and become part of our talent community for potential future collaborations.",
  },
];

// FAQ items
const FAQ_ITEMS = [
  {
    question: "What is it like to work at BestFoodWhere?",
    answer:
      "Working at BestFoodWhere means being part of a passionate team dedicated to connecting people with amazing food experiences. Our culture emphasizes innovation, collaboration, and a love for food. With our 100% remote work policy, you'll enjoy the freedom to work from anywhere while making a real impact on Singapore's vibrant food scene.",
  },
  {
    question: "Is working remotely required or optional?",
    answer:
      "We are a fully remote company, which means all positions are remote by default. We believe in giving our team the flexibility to work from wherever they're most productive. We do occasional team meetups and food exploration events in Singapore for those who can attend.",
  },
  {
    question: "What's the interview and hiring process like?",
    answer:
      "Our hiring process typically involves 4 stages: an initial application review, a brief phone/video call to get to know you, a skills assessment relevant to the role, and a final interview with the team. The entire process usually takes 2-3 weeks, and we aim to be transparent and communicative throughout.",
  },
  {
    question: "What benefits do you offer besides remote work?",
    answer:
      "Beyond remote work flexibility, we offer competitive compensation, food and dining credits, professional development opportunities, and a supportive team environment. We also organize team food adventures and provide access to exclusive restaurant partnerships across Singapore.",
  },
];

// Job category tabs
const JOB_CATEGORIES: { value: JobCategory | "all"; label: string }[] = [
  { value: "all", label: "All Positions" },
  { value: "marketing", label: "Marketing" },
  { value: "technology", label: "Technology" },
  { value: "content", label: "Content" },
];

export default function CareerPage() {
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [team, setTeam] = useState<CareerTeamMember[]>([]);
  const [activeCategory, setActiveCategory] = useState<JobCategory | "all">("all");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState<CareerApplicationFormData>({
    name: "",
    email: "",
    phone: "",
    area_of_interest: "",
    availability: "",
    message: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // Refs for scrolling
  const jobsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Selected job for application
  const [selectedJob, setSelectedJob] = useState<CareerJob | null>(null);

  // Fetch jobs and team from Supabase
  useEffect(() => {
    async function fetchData() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      try {
        const [jobsResult, teamResult] = await Promise.all([
          supabase
            .from("career_jobs")
            .select("*")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
          supabase
            .from("career_team")
            .select("*")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
        ]);

        if (jobsResult.data) setJobs(jobsResult.data as CareerJob[]);
        if (teamResult.data) setTeam(teamResult.data as CareerTeamMember[]);
      } catch (error) {
        console.error("Failed to fetch career data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter jobs by category
  const filteredJobs = activeCategory === "all"
    ? jobs
    : jobs.filter((job) => job.category === activeCategory);

  // Scroll to jobs section
  const scrollToJobs = () => {
    jobsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle Apply Now click - scroll to form and pre-select job
  const handleApplyNow = (job: CareerJob) => {
    setSelectedJob(job);
    setFormData((prev) => ({
      ...prev,
      area_of_interest: job.category,
    }));
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        setFormError("Please upload a PDF, DOC, or DOCX file");
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormError("File size must be less than 5MB");
        return;
      }
      setResumeFile(file);
      setFormError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormStatus("submitting");

    // Validation
    if (!formData.name.trim()) {
      setFormError("Please enter your name");
      setFormStatus("idle");
      return;
    }
    if (!formData.email.trim()) {
      setFormError("Please enter your email");
      setFormStatus("idle");
      return;
    }

    try {
      let resumeUrl: string | undefined;

      // Upload resume if provided
      if (resumeFile) {
        const uploadData = new FormData();
        uploadData.append("file", resumeFile);

        const uploadRes = await fetch("/api/career/upload", {
          method: "POST",
          body: uploadData,
        });

        const uploadResult = await uploadRes.json();
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Failed to upload resume");
        }
        resumeUrl = uploadResult.url;
      }

      // Get UTM params from URL
      const urlParams = new URLSearchParams(window.location.search);

      // Submit application
      const res = await fetch("/api/career/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone?.trim(),
          area_of_interest: formData.area_of_interest,
          availability: formData.availability,
          message: formData.message?.trim(),
          resume_url: resumeUrl,
          pageUrl: window.location.href,
          utm_source: urlParams.get("utm_source") || undefined,
          utm_medium: urlParams.get("utm_medium") || undefined,
          utm_campaign: urlParams.get("utm_campaign") || undefined,
          utm_content: urlParams.get("utm_content") || undefined,
          utm_term: urlParams.get("utm_term") || undefined,
        }),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to submit application");
      }

      setFormStatus("success");
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        area_of_interest: "",
        availability: "",
        message: "",
      });
      setResumeFile(null);
    } catch (error) {
      console.error("Application submission error:", error);
      setFormError(error instanceof Error ? error.message : "Failed to submit application");
      setFormStatus("error");
    }
  };

  // Handle newsletter subscription
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setNewsletterStatus("submitting");

    try {
      const urlParams = new URLSearchParams(window.location.search);

      const res = await fetch("/api/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newsletterEmail.trim().toLowerCase(),
          name: "Career Subscriber",
          source: "bfw_website",
          tags: ["career_newsletter"],
          pageUrl: window.location.href,
          utm_source: urlParams.get("utm_source") || undefined,
          utm_medium: urlParams.get("utm_medium") || undefined,
          utm_campaign: urlParams.get("utm_campaign") || undefined,
        }),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      setNewsletterStatus("success");
      setNewsletterEmail("");
    } catch {
      setNewsletterStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Section 1: Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fff9f6] to-white">
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
            {/* Left content */}
            <div>
              <h1 className="font-heading text-[40px] md:text-[56px] font-bold leading-[1.1] text-bfw-text-dark">
                Join Our <span className="text-bfw-orange">Team</span>
              </h1>
              <p className="mt-4 text-lg text-bfw-text-gray max-w-md">
                Help us connect Singapore with amazing food experiences
              </p>

              {/* Stats */}
              <div className="mt-8 flex gap-8">
                {HERO_STATS.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl md:text-3xl font-bold text-bfw-orange">
                      {stat.value}
                    </div>
                    <div className="text-sm text-bfw-text-gray">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={scrollToJobs}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-bfw-orange px-6 py-3 font-medium text-white transition-colors hover:bg-bfw-orange-hover"
              >
                View Openings
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Right image */}
            <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                alt="Team working together"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Decorative blob */}
        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-bfw-orange/10 blur-3xl" />
      </section>

      {/* Section 2: Why Work With Us */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="text-center">
            <h2 className="font-heading text-[32px] md:text-[42px] font-bold text-bfw-text-dark">
              Why Work With <span className="text-bfw-orange">BestFoodWhere</span>
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_5px_15px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-bfw-orange/10">
                  <benefit.icon className="h-6 w-6 text-bfw-orange" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-bfw-text-dark">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm text-bfw-text-gray leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Meet Our Team */}
      <section className="bg-[#fafafa] py-16 md:py-20">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="mb-12">
            <h2 className="font-heading text-[32px] md:text-[42px] font-bold text-bfw-orange">
              Meet Our Team
            </h2>
            <p className="mt-3 max-w-2xl text-bfw-text-gray">
              We&apos;re a passionate group of foodies, tech enthusiasts, and creative minds working
              together to connect Singaporeans with amazing dining experiences.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-bfw-orange border-t-transparent" />
            </div>
          ) : team.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="group rounded-2xl bg-white p-6 shadow-[0_5px_15px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-bfw-orange to-orange-400">
                      {member.image_url ? (
                        <Image
                          src={member.image_url}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-bfw-text-dark">
                        {member.name}
                      </h3>
                      <p className="text-sm text-bfw-orange">{member.role}</p>
                    </div>
                  </div>
                  {member.bio && (
                    <p className="mt-4 text-sm text-bfw-text-gray leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-bfw-text-gray">
              Team information coming soon.
            </div>
          )}
        </div>
      </section>

      {/* Section 4: Current Openings */}
      <section ref={jobsRef} className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="text-center mb-10">
            <h2 className="font-heading text-[32px] md:text-[42px] font-bold">
              Current <span className="text-bfw-orange">Openings</span>
            </h2>
            <p className="mt-3 text-bfw-text-gray">
              Join our team and help shape the future of food discovery in Singapore
            </p>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {JOB_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat.value
                    ? "bg-bfw-orange text-white"
                    : "bg-gray-100 text-bfw-text-gray hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Job listings */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-bfw-orange border-t-transparent" />
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_5px_15px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-heading text-lg font-semibold text-bfw-text-dark">
                      {job.title}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        JOB_TYPE_COLORS[job.type] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {job.type}
                    </span>
                  </div>
                  <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-bfw-text-gray mb-3">
                    {JOB_CATEGORY_LABELS[job.category]}
                  </span>
                  <p className="text-sm text-bfw-text-gray leading-relaxed mb-4 line-clamp-3">
                    {job.description}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApplyNow(job)}
                      className="flex-1 rounded-lg bg-bfw-orange px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-bfw-orange-hover"
                    >
                      Apply Now
                    </button>
                    <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-bfw-text-gray transition-colors hover:bg-gray-50">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-bfw-text-gray">
                {activeCategory === "all"
                  ? "No open positions at the moment. Check back soon!"
                  : `No ${JOB_CATEGORY_LABELS[activeCategory as JobCategory]} positions available right now.`}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Section 5: Application Process */}
      <section className="bg-white py-16 md:py-20 border-t border-gray-100">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-[32px] md:text-[42px] font-bold">
              Our <span className="text-bfw-orange">Application Process</span>
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {APPLICATION_STEPS.map((step, index) => (
              <div key={step.step} className="relative text-center">
                {/* Connector line */}
                {index < APPLICATION_STEPS.length - 1 && (
                  <div className="absolute left-[60%] top-8 hidden h-0.5 w-[80%] bg-gray-200 lg:block" />
                )}

                {/* Step number badge */}
                <div className="relative mx-auto mb-4">
                  <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-bfw-orange text-xs font-bold text-white">
                    {step.step}
                  </div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 bg-white">
                    <step.icon className="h-7 w-7 text-bfw-orange" />
                  </div>
                </div>

                <h3 className="font-heading text-lg font-semibold text-bfw-text-dark">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-bfw-text-gray leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Don't See the Right Role? (Contact Form) */}
      <section ref={formRef} className="relative bg-gradient-to-br from-[#fff9f6] to-white py-16 md:py-20 overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-bfw-orange/5 blur-3xl" />

        <div className="mx-auto max-w-[1200px] px-4 relative">
          <div className="text-center mb-12">
            <h2 className="font-heading text-[32px] md:text-[42px] font-bold">
              {selectedJob ? (
                <>Apply for <span className="text-bfw-orange">{selectedJob.title}</span></>
              ) : (
                <>Don&apos;t See the <span className="text-bfw-orange">Right Role?</span></>
              )}
            </h2>
            <p className="mt-3 text-bfw-text-gray">
              {selectedJob
                ? "Fill out the form below and we'll get back to you soon!"
                : "We Still Want to Hear From You!"}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-5">
            {/* Left sidebar - Why Join */}
            <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-bfw-orange to-orange-500 p-8 text-white">
              <h3 className="font-heading text-2xl font-bold mb-6">
                Why Join Our Team?
              </h3>
              <div className="space-y-6">
                {WHY_JOIN_REASONS.map((reason) => (
                  <div key={reason.title} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                        <reason.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold">{reason.title}</h4>
                      <p className="mt-1 text-sm text-white/80 leading-relaxed">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Form */}
            <div className="lg:col-span-3 rounded-2xl bg-white p-8 shadow-[0_5px_20px_rgba(0,0,0,0.08)]">
              {formStatus === "success" ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-bfw-text-dark">
                    Application Received!
                  </h3>
                  <p className="mt-2 text-bfw-text-gray">
                    Thank you for your interest. We&apos;ll be in touch if there&apos;s a good fit.
                  </p>
                  <button
                    onClick={() => setFormStatus("idle")}
                    className="mt-6 text-bfw-orange font-medium hover:underline"
                  >
                    Submit another application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {formError && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {formError}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-bfw-text-dark mb-1.5">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-bfw-text-dark placeholder:text-gray-400 focus:border-bfw-orange focus:outline-none focus:ring-2 focus:ring-bfw-orange/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-bfw-text-dark mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email address"
                        className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-bfw-text-dark placeholder:text-gray-400 focus:border-bfw-orange focus:outline-none focus:ring-2 focus:ring-bfw-orange/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Area of Interest & Availability */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-bfw-text-dark mb-1.5">
                        Area of Interest
                      </label>
                      <select
                        value={formData.area_of_interest}
                        onChange={(e) =>
                          setFormData({ ...formData, area_of_interest: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-200 py-3 px-4 text-bfw-text-dark focus:border-bfw-orange focus:outline-none focus:ring-2 focus:ring-bfw-orange/20"
                      >
                        <option value="">Select an area of interest</option>
                        {AREAS_OF_INTEREST.map((area) => (
                          <option key={area.value} value={area.value}>
                            {area.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-bfw-text-dark mb-1.5">
                        Availability
                      </label>
                      <select
                        value={formData.availability}
                        onChange={(e) =>
                          setFormData({ ...formData, availability: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-200 py-3 px-4 text-bfw-text-dark focus:border-bfw-orange focus:outline-none focus:ring-2 focus:ring-bfw-orange/20"
                      >
                        <option value="">When can you start?</option>
                        {AVAILABILITY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Why BestFoodWhere */}
                  <div>
                    <label className="block text-sm font-medium text-bfw-text-dark mb-1.5">
                      Why BestFoodWhere?
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your skills and why you're interested in joining our team..."
                      rows={4}
                      className="w-full rounded-lg border border-gray-200 py-3 px-4 text-bfw-text-dark placeholder:text-gray-400 focus:border-bfw-orange focus:outline-none focus:ring-2 focus:ring-bfw-orange/20 resize-none"
                    />
                  </div>

                  {/* Resume Upload */}
                  <div>
                    <label className="block text-sm font-medium text-bfw-text-dark mb-1.5">
                      Resume / CV
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer rounded-lg border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-bfw-orange hover:bg-bfw-orange/5"
                    >
                      {resumeFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="h-8 w-8 text-bfw-orange" />
                          <div className="text-left">
                            <p className="font-medium text-bfw-text-dark">{resumeFile.name}</p>
                            <p className="text-sm text-bfw-text-gray">
                              {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setResumeFile(null);
                            }}
                            className="ml-auto rounded-full p-1 hover:bg-gray-100"
                          >
                            <X className="h-5 w-5 text-gray-400" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-bfw-text-gray">
                            <span className="font-medium text-bfw-orange">Click to upload</span> or
                            drag and drop
                          </p>
                          <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={formStatus === "submitting"}
                    className="w-full rounded-xl bg-bfw-orange py-3.5 font-medium text-white transition-colors hover:bg-bfw-orange-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {formStatus === "submitting" ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Submit Application
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: FAQ */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-[800px] px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-[32px] md:text-[42px] font-bold">
              Frequently Asked <span className="text-bfw-orange">Questions</span>
            </h2>
            <p className="mt-3 text-bfw-text-gray">
              Find answers to common questions about careers at BestFoodWhere
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-100 bg-white overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-bfw-text-dark pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 text-bfw-orange transition-transform ${
                      expandedFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-5 pb-5">
                    <p className="text-bfw-text-gray leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: Career Newsletter */}
      <section className="bg-[#fafafa] py-16 md:py-20">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            {/* Left content */}
            <div>
              <h2 className="font-heading text-[28px] md:text-[36px] font-bold text-bfw-text-dark">
                Stay Updated on{" "}
                <span className="text-bfw-orange">Career Opportunities</span>
              </h2>
              <p className="mt-3 text-bfw-text-gray max-w-md">
                Subscribe to our talent network and be the first to know when new positions open at
                BestFoodWhere.
              </p>

              {/* Newsletter form */}
              {newsletterStatus === "success" ? (
                <div className="mt-6 flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-green-700">You&apos;re subscribed! We&apos;ll notify you of new openings.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="mt-6 flex gap-3">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Your Email Address"
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-bfw-text-dark placeholder:text-gray-400 focus:border-bfw-orange focus:outline-none focus:ring-2 focus:ring-bfw-orange/20"
                    required
                  />
                  <button
                    type="submit"
                    disabled={newsletterStatus === "submitting"}
                    className="rounded-xl bg-bfw-orange px-6 py-3 font-medium text-white transition-colors hover:bg-bfw-orange-hover disabled:opacity-50"
                  >
                    {newsletterStatus === "submitting" ? "..." : "Subscribe"}
                  </button>
                </form>
              )}

              {/* Features */}
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-bfw-text-gray">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-bfw-orange" />
                  New job alerts
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-bfw-orange" />
                  Privacy respected
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-bfw-orange" />
                  Unsubscribe anytime
                </span>
              </div>
            </div>

            {/* Right image */}
            <div className="relative h-[280px] md:h-[350px] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&h=600&fit=crop"
                alt="Professional working"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
