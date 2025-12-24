import { ReactElement } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../PageLayout";
import "./PressPage.css";

// SVG Icons
const DownloadIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 10L12 15L17 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15V3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface PressRelease {
  date: string;
  title: string;
  excerpt: string;
}

const pressReleases: PressRelease[] = [
  {
    date: "December 1, 2024",
    title: "Sacred Vows Reaches 50,000 Couples Milestone",
    excerpt:
      "Sacred Vows celebrates helping 50,000 couples share their love stories through beautiful digital invitations.",
  },
  {
    date: "October 15, 2024",
    title: "Sacred Vows Launches New Luxury Layout Collection",
    excerpt:
      "Introducing our most elegant designs yet, featuring hand-crafted illustrations and premium animations.",
  },
  {
    date: "August 1, 2024",
    title: "Sacred Vows Expands Multi-Language Support",
    excerpt: "Now supporting 25+ languages to help couples connect with guests around the world.",
  },
  {
    date: "May 15, 2024",
    title: "Sacred Vows Partners with Top Wedding Venues",
    excerpt:
      "Strategic partnerships bring seamless digital invitation experiences to premier wedding destinations.",
  },
];

interface MediaCoverage {
  outlet: string;
  title: string;
  date: string;
}

const mediaCoverage: MediaCoverage[] = [
  {
    outlet: "TechCrunch",
    title: "Sacred Vows is Revolutionizing Wedding Invitations",
    date: "Nov 2024",
  },
  {
    outlet: "Brides Magazine",
    title: "Top Digital Invitation Platforms of 2024",
    date: "Oct 2024",
  },
  {
    outlet: "The Knot",
    title: "How Digital Invitations Are Transforming Weddings",
    date: "Sep 2024",
  },
  { outlet: "Forbes", title: "10 Wedding Tech Startups to Watch", date: "Aug 2024" },
];

interface PressKitItem {
  name: string;
  description: string;
  format: string;
}

const pressKitItems: PressKitItem[] = [
  { name: "Brand Guidelines", description: "Logo usage, colors, typography", format: "PDF" },
  { name: "Logo Package", description: "All logo variations and formats", format: "ZIP" },
  { name: "Product Screenshots", description: "High-resolution product images", format: "ZIP" },
  { name: "Founder Photos", description: "Professional headshots", format: "ZIP" },
  { name: "Company Factsheet", description: "Key stats and information", format: "PDF" },
];

interface Stat {
  number: string;
  label: string;
}

const stats: Stat[] = [
  { number: "50,000+", label: "Couples Served" },
  { number: "2M+", label: "Guests Reached" },
  { number: "50+", label: "Countries" },
  { number: "2022", label: "Founded" },
];

function PressPage(): ReactElement {
  return (
    <PageLayout
      title="Press & Media"
      subtitle="Get the latest news about Sacred Vows and access our press resources."
      breadcrumbs={[{ label: "Company", path: "/about" }, { label: "Press" }]}
    >
      <div className="press-page">
        {/* Company Stats */}
        <section className="press-stats">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </section>

        {/* About Section */}
        <section className="press-about">
          <div className="about-content">
            <h2>About Sacred Vows</h2>
            <p>
              Sacred Vows is a digital wedding invitation platform founded in 2022 with a mission to
              make beautiful, personalized wedding invitations accessible to every couple. Our
              platform combines elegant design with modern technology to create interactive digital
              experiences that guests love.
            </p>
            <p>
              Trusted by over 50,000 couples worldwide, Sacred Vows has helped share millions of
              love stories with friends and family around the globe. Our team is passionate about
              being a part of the most important day in people&apos;s lives.
            </p>
          </div>
        </section>

        {/* Press Kit */}
        <section className="press-kit">
          <div className="section-header">
            <span className="section-label">Resources</span>
            <h2 className="section-title">Press Kit</h2>
            <p className="section-subtitle">
              Download our press assets for media coverage and publications.
            </p>
          </div>
          <div className="press-kit-grid">
            {pressKitItems.map((item, index) => (
              <div key={index} className="press-kit-item">
                <div className="kit-info">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>
                <button className="download-btn">
                  <DownloadIcon />
                  <span>{item.format}</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Press Releases */}
        <section className="press-releases">
          <div className="section-header">
            <span className="section-label">News</span>
            <h2 className="section-title">Press Releases</h2>
          </div>
          <div className="releases-list">
            {pressReleases.map((release, index) => (
              <article key={index} className="release-card">
                <span className="release-date">{release.date}</span>
                <h3>{release.title}</h3>
                <p>{release.excerpt}</p>
                <span className="read-more">Read Full Release →</span>
              </article>
            ))}
          </div>
        </section>

        {/* Media Coverage */}
        <section className="media-coverage">
          <div className="section-header">
            <span className="section-label">In The News</span>
            <h2 className="section-title">Media Coverage</h2>
          </div>
          <div className="coverage-grid">
            {mediaCoverage.map((item, index) => (
              <div key={index} className="coverage-card">
                <span className="outlet">{item.outlet}</span>
                <h3>{item.title}</h3>
                <span className="coverage-date">{item.date}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Press Contact */}
        <section className="press-contact">
          <h2>Media Inquiries</h2>
          <p>
            For press inquiries, interviews, or partnership opportunities, please contact our
            communications team.
          </p>
          <div className="contact-info">
            <p>
              <strong>Email:</strong> press@sacredvows.com
            </p>
            <p>
              <strong>Response Time:</strong> Within 24 hours
            </p>
          </div>
          <Link to="/contact" className="page-btn page-btn-primary">
            Contact Press Team
          </Link>
        </section>
      </div>
    </PageLayout>
  );
}

export default PressPage;
