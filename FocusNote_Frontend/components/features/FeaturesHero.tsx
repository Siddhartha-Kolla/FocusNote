"use client";

export function FeaturesHero() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Features Badge */}
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-6">
          Features
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Powerful Tools for{" "}
          <span className="text-blue-600">Smart Learning</span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Discover how our advanced technology transforms your handwritten notes into
          intelligent study materials that adapt to your learning style.
        </p>
      </div>
    </section>
  );
}