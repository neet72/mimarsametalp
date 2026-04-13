"use client";

import { ContactFormPanel } from "./ContactFormPanel";
import { ContactMapSection } from "./ContactMapSection";
import { ContactStoryColumn } from "./ContactStoryColumn";

export function ContactPageExperience() {
  return (
    <div className="w-full bg-surface text-primary">
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-10 lg:py-24">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <ContactStoryColumn />
          <ContactFormPanel />
        </div>
      </div>
      <ContactMapSection />
    </div>
  );
}
