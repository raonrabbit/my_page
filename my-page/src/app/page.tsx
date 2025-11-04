"use client";

import LoadingScreen from "@/shared/ui/loading-screen/LoadingScreen";
import SectionWrapper from "@/shared/ui/section-wrapper";
import AboutSection from "@/widgets/about-section/ui/AboutSection";
import ProjectsSection from "@/widgets/projects-section/ui/ProjectsSection";
import SkillsSection from "@/widgets/skills-section/ui/SkillsSection";
import WelcomSection from "@/widgets/welcome-section/ui/WelcomeSection";
import { useEffect, useState } from "react";

export default function Home() {
  const [showFirstPage, setShowFirstPage] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFirstPage(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main>
      {showFirstPage ? (
        <LoadingScreen />
      ) : (
        <div>
          <SectionWrapper id="welcome-section">
            <WelcomSection />
          </SectionWrapper>

          <SectionWrapper id="about-section">
            <AboutSection />
          </SectionWrapper>

          <SectionWrapper id="skills-section">
            <SkillsSection />
          </SectionWrapper>

          <SectionWrapper id="projects-section">
            <ProjectsSection />
          </SectionWrapper>
        </div>
      )}
    </main>
  );
}
