"use client";

import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export function HeroSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Turn Handwritten Notes Into{" "}
          <span className="text-blue-600">Smart Study Guides</span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Upload your handwritten notes and let our AI analyze them to create
          structured, intelligent study rundowns that help you learn faster and
          prepare better for exams.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-md"
          >
            <a href="/register">Get Started</a>
          </Button>
          <Button 
            asChild
            variant="outline" 
            className="px-8 py-3 text-lg rounded-md border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <a href="/how-it-works">See How It Works</a>
          </Button>
        </div>
      </div>
    </section>
  );
}