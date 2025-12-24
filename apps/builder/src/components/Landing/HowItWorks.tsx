import { useEffect, useRef, useState, ReactElement } from "react";

// SVG Icons for steps
const PaletteIcon = (): ReactElement => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M24 4C12.954 4 4 12.954 4 24C4 35.046 12.954 44 24 44C25.657 44 27 42.657 27 41C27 40.2 26.7 39.5 26.2 38.9C25.7 38.3 25.4 37.6 25.4 36.8C25.4 35.143 26.743 33.8 28.4 33.8H32C38.627 33.8 44 28.427 44 21.8C44 11.895 35.046 4 24 4Z"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="14" cy="20" r="3" fill="currentColor" />
    <circle cx="22" cy="14" r="3" fill="currentColor" />
    <circle cx="32" cy="16" r="3" fill="currentColor" />
    <circle cx="36" cy="24" r="3" fill="currentColor" />
  </svg>
);

const EditIcon = (): ReactElement => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M34 6L42 14L16 40H8V32L34 6Z"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M28 12L36 20"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8 40H42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const SendIcon = (): ReactElement => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M44 4L22 26"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M44 4L30 44L22 26L4 18L44 4Z"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface Step {
  number: number;
  Icon: () => ReactElement;
  title: string;
  description: string;
  target: string;
}

const steps: Step[] = [
  {
    number: 1,
    Icon: PaletteIcon,
    title: "Choose Your Layout",
    description: "Browse our beautiful collection and select the design that speaks to your heart.",
    target: "#layouts",
  },
  {
    number: 2,
    Icon: EditIcon,
    title: "Customize Every Detail",
    description: "Add your photos, edit text, choose colors, and make it uniquely yours.",
    target: "/signup",
  },
  {
    number: 3,
    Icon: SendIcon,
    title: "Share With Guests",
    description: "Send your stunning invitation to loved ones with just a click.",
    target: "#cta",
  },
];

interface HowItWorksProps {
  onSectionView?: (sectionId: string) => void;
}

function HowItWorks({ onSectionView }: HowItWorksProps): ReactElement {
  const containerRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (onSectionView) onSectionView("how_it_works");
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [onSectionView]);

  const handleStepClick = (target: string): void => {
    if (target?.startsWith("#")) {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    } else if (target) {
      window.location.assign(target);
    }
  };

  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="section-header">
        <p className="section-label">Simple Process</p>
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">
          Creating your dream wedding invitation takes just three simple steps.
        </p>
      </div>

      <div ref={containerRef} className={`steps-container ${inView ? "in-view" : ""}`}>
        <div className="steps-line" />
        {steps.map((step) => {
          const IconComponent = step.Icon;
          return (
            <button
              key={step.number}
              className="step"
              type="button"
              onClick={() => handleStepClick(step.target)}
            >
              <div className="step-number">{step.number}</div>
              <div className="step-icon">
                <IconComponent />
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default HowItWorks;
