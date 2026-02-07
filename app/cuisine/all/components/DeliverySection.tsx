import { DELIVERY_SERVICES, DELIVERY_TIPS } from "../data";

const SERVICE_ICONS: Record<string, string> = {
  panda: "🐼",
  grab: "🚗",
  deliveroo: "🛒",
};

export function DeliverySection() {
  return (
    <section className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c1c2e] to-[#2a2a40] p-10 shadow-[0_15px_30px_rgba(0,0,0,0.15)]">
      {/* Background decorations */}
      <div className="absolute -bottom-20 -right-20 h-[200px] w-[200px] rounded-full bg-gradient-to-br from-bfw-orange/20 to-transparent" />
      <div className="absolute -left-14 -top-14 h-[150px] w-[150px] rounded-full bg-white/[0.03]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-bfw-orange to-[#ff8e63] shadow-[0_8px_20px_rgba(239,95,42,0.3)]">
            <span className="text-4xl">🛵</span>
          </div>
          <h2 className="font-heading text-[32px] font-bold text-white drop-shadow-md">
            Food Delivery
          </h2>
          <p className="mx-auto mt-2 max-w-[600px] font-body text-[17px] text-[#ccc]">
            Enjoy your favorite cuisines delivered right to your doorstep
          </p>
        </div>

        {/* Delivery Service Cards */}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {DELIVERY_SERVICES.map((service) => (
            <a
              key={service.id}
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-6 shadow-[0_10px_25px_rgba(0,0,0,0.1)] backdrop-blur-lg transition-all hover:-translate-y-2.5 hover:border-bfw-orange/30 hover:shadow-[0_15px_30px_rgba(0,0,0,0.15),0_0_20px_rgba(239,95,42,0.2)]"
            >
              <div className="absolute bottom-0 left-0 h-[20%] w-full bg-gradient-to-t from-bfw-orange/5 to-transparent" />

              <div className="mb-5 flex items-center justify-between">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-[28px]"
                  style={{ backgroundColor: service.bgColor }}
                >
                  {SERVICE_ICONS[service.icon]}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bfw-orange/10 text-lg text-bfw-orange transition-all group-hover:bg-bfw-orange/20">
                  →
                </div>
              </div>

              <h3 className="mb-2 font-heading text-[22px] font-semibold text-white">
                {service.name}
              </h3>
              <p className="mb-5 font-body text-[15px] leading-relaxed text-[#aaa]">
                {service.description}
              </p>
              <div className="flex items-center font-heading text-sm font-medium text-bfw-orange">
                <span>Order now</span>
                <span className="ml-1">→</span>
              </div>
            </a>
          ))}
        </div>

        {/* Delivery Tips */}
        <div className="relative overflow-hidden rounded-2xl border border-bfw-orange/20 bg-gradient-to-br from-bfw-orange/10 to-bfw-orange/[0.03] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.15)] backdrop-blur-lg">
          <div className="absolute -right-5 -top-5 h-[120px] w-[120px] rounded-full bg-gradient-to-br from-bfw-orange/20 to-transparent" />

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start">
            <div className="mt-1 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-bfw-orange/15">
              <span className="text-[30px]">💡</span>
            </div>

            <div className="flex-1">
              <h3 className="mb-4 font-heading text-[22px] font-semibold text-white">
                Smart Delivery Tips
              </h3>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {DELIVERY_TIPS.map((tip, index) => (
                  <div key={tip} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-bfw-orange/10 font-heading text-sm font-semibold text-bfw-orange">
                      {index + 1}
                    </div>
                    <p className="font-body text-[15px] leading-relaxed text-[#ccc]">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
