import SectionWrapper from "@/shared/ui/section-wrapper";
import AboutSection from "@/widgets/about-section/ui/AboutSection";
import ProjectsSection from "@/widgets/projects-section/ui/ProjectsSection";
import SkillsSection from "@/widgets/skills-section/ui/SkillsSection";
import WelcomSection from "@/widgets/welcome-section/ui/WelcomeSection";

export default function Home() {
  return (
    <main>
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
    </main>
  );
}
