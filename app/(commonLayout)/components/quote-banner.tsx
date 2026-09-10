export function QuoteBanner() {
  return (
    <section className="bg-[#e8e8e8] px-6 py-16 lg:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-lg">
          {/* Gradient Background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                 'linear-gradient(90deg, #f3f4f6 0%, #cdeedc 16%, #8cc9c4 32%, #5f94d1 52%, #9f8fd8 72%, #e3e5f0 100%)'
            }}
          />

          {/* Content */}
          <div className="relative px-8 py-16 md:px-16 md:py-24 lg:px-24 lg:py-32 flex items-center justify-center text-center">
            <p className="text-2xl font-light text-white md:text-3xl lg:text-5xl">
              The Way You Do Research Is <span className="italic">Changing.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
