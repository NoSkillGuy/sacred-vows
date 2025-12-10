import { useEffect } from 'react';

// Star icon component
const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
    <path d="M10 1L12.39 6.26L18 7.27L14 11.14L14.94 17L10 14.27L5.06 17L6 11.14L2 7.27L7.61 6.26L10 1Z"/>
  </svg>
);

// Verified badge icon
const VerifiedIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 0L9.79 1.62L12.22 1.22L12.62 3.65L14.94 4.73L14.02 7.05L15.38 9.05L13.38 10.41L13.38 12.93L10.86 12.93L9.05 14.94L7.05 13.38L4.73 14.02L3.65 11.78L1.22 11.38L1.62 8.95L0 7.16L1.62 5.37L1.22 2.94L3.65 2.54L4.73 0.3L7.05 1.22L8 0Z"/>
    <path d="M6.5 8.5L7.5 9.5L10 6.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Couple avatar icon
const CoupleIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="10" r="5" fill="currentColor" opacity="0.8"/>
    <circle cx="21" cy="10" r="5" fill="currentColor" opacity="0.8"/>
    <path d="M6 26C6 21.5817 9.58172 18 14 18H18C22.4183 18 26 21.5817 26 26V28H6V26Z" fill="currentColor" opacity="0.6"/>
  </svg>
);

const testimonials = [
  {
    content: "Sacred Vows made our wedding invitation absolutely magical. Our guests couldn't stop complimenting how beautiful and unique it was. The real-time preview feature made customization so easy!",
    author: 'Ananya & Vikram',
    location: 'Mumbai, India',
    date: 'Married Dec 2024',
    stars: 5,
    platform: 'Google Reviews',
  },
  {
    content: "We were amazed at how professional our invitation looked. The multi-language support was perfect for our multicultural wedding. Highly recommend to all couples!",
    author: 'Sarah & Michael',
    location: 'London, UK',
    date: 'Married Nov 2024',
    stars: 5,
    platform: 'Trustpilot',
  },
  {
    content: "The RSVP tracking feature saved us so much time. Everything was seamless from start to finish. Our invitation felt so personal and our guests loved the interactive elements.",
    author: 'Meera & Arjun',
    location: 'Delhi, India',
    date: 'Married Oct 2024',
    stars: 5,
    platform: 'WeddingWire',
  },
];

function Testimonials({ onSectionView }) {
  useEffect(() => {
    if (onSectionView) onSectionView('testimonials');
  }, [onSectionView]);

  return (
    <section className="testimonials-section">
      <div className="section-header">
        <p className="section-label">Love Stories</p>
        <h2 className="section-title">What Couples Say</h2>
        <p className="section-subtitle">
          Join thousands of happy couples who trusted us with their special day.
        </p>
      </div>

      <div className="social-proof-bar">
        <div className="rating-score">
          <span className="rating-number">4.9/5</span>
          <span className="rating-label">Avg rating from verified couples</span>
        </div>
        <div className="proof-logos">
          <span className="proof-pill"><StarIcon /> Google</span>
          <span className="proof-pill"><StarIcon /> Pinterest</span>
          <span className="proof-pill"><StarIcon /> WeddingWire</span>
        </div>
      </div>

      <div className="testimonials-carousel">
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-badge">
                <span>{testimonial.platform}</span>
              </div>
              <div className="testimonial-stars">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <span key={i} className="testimonial-star">
                    <StarIcon />
                  </span>
                ))}
              </div>
              
              <p className="testimonial-content">{testimonial.content}</p>
              
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  <span className="testimonial-avatar-icon">
                    <CoupleIcon />
                  </span>
                </div>
                <div className="testimonial-info">
                  <h4>{testimonial.author}</h4>
                  <p>{testimonial.location} • {testimonial.date}</p>
                  <div className="testimonial-verified">
                    <VerifiedIcon />
                    <span>Verified Couple</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
