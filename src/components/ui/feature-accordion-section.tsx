"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from "next/image";

export interface FeatureItem {
  id: string;
  title: string;
  count: number;
  image: string;
  description: string;
}

export interface FeatureAccordionSectionProps {
  features?: FeatureItem[];
  className?: string;
  defaultExpanded?: string;
}

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: "item-1",
    title: "Smart Pill Scanner & OCR",
    count: 24,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    description: "Point your camera at prescription bottles. Our AI recognizes medication names, dosage strength, and automatically configures schedule reminders."
  },
  {
    id: "item-2",
    title: "Medical AI & Lab Translation",
    count: 18,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    description: "Translate confusing doctor notes, clinic discharge summaries, and blood work test results into clear, plain-English guidance for the whole family."
  },
  {
    id: "item-3",
    title: "Allergy & Ingredient Scanner",
    count: 14,
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
    description: "Scan packaged food labels or restaurant menus to instantly cross-reference allergens and protect your kids and loved ones from severe reactions."
  },
  {
    id: "item-4",
    title: "Synchronized Dose Schedules",
    count: 36,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    description: "Coordinate morning, afternoon, and evening medication routines across all caregivers. One-tap 'Taken' logs prevent accidental double-doses."
  },
  {
    id: "item-5",
    title: "One-Tap Emergency SOS",
    count: 12,
    image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=800&q=80",
    description: "In critical moments, tap the emergency alert to transmit live GPS coordinates, vital medical profiles, and blood types to your entire care circle."
  },
  {
    id: "item-6",
    title: "Care Circles & Refill Tracking",
    count: 28,
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80",
    description: "Keep grandparents, parents, and kids connected. Monitor real-time pill inventory gauges and receive automated alerts before supplies run low."
  }
];

export default function FeatureAccordionSection({
  features = DEFAULT_FEATURES,
  className = "",
  defaultExpanded = "item-1",
}: FeatureAccordionSectionProps) {
  const items = features && features.length > 0 ? features : DEFAULT_FEATURES;

  return (
    <div className={`flex flex-col w-full max-w-xl mx-auto border rounded-xl shadow-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 p-4 ${className}`}>
      <Accordion type="single" collapsible defaultValue={defaultExpanded} className="w-full">
        {items.map((feature) => (
          <AccordionItem
            key={feature.id}
            value={feature.id}
            className="border-b border-gray-200 dark:border-neutral-700 last:border-b-0"
          >
            <AccordionTrigger className="flex items-center gap-3 py-3 text-left hover:no-underline">
              <Image
                src={feature.image}
                alt={feature.title}
                width={28}
                height={28}
                className="rounded-md object-cover"
              />
              <span className="flex-1 font-medium text-foreground">{feature.title}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({feature.count})
              </span>
            </AccordionTrigger>

            <AccordionContent className="px-2 pb-4 pt-2 space-y-3">
              {/* Big Image when expanded */}
              <div className="w-full flex justify-center overflow-hidden rounded-lg">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={500}
                  height={300}
                  className="rounded-lg shadow-md object-cover max-h-64 w-full"
                />
              </div>
              {/* Text below the image */}
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                {feature.description}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
