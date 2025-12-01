const testimonials = [
  {
    content: "Sacred Vows made our wedding invitation absolutely magical. Our guests couldn't stop complimenting how beautiful and unique it was. The real-time preview feature made customization so easy!",
    author: 'Ananya & Vikram',
    location: 'Mumbai, India',
    date: 'Married Dec 2024',
    avatar: '👫',
    stars: '★★★★★',
  },
  {
    content: "We were amazed at how professional our invitation looked. The multi-language support was perfect for our multicultural wedding. Highly recommend to all couples!",
    author: 'Sarah & Michael',
    location: 'London, UK',
    date: 'Married Nov 2024',
    avatar: '💑',
    stars: '★★★★★',
  },
  {
    content: "The RSVP tracking feature saved us so much time. Everything was seamless from start to finish. Our invitation felt so personal and our guests loved the interactive elements.",
    author: 'Meera & Arjun',
    location: 'Delhi, India',
    date: 'Married Oct 2024',
    avatar: '👫',
    stars: '★★★★★',
  },
];

function Testimonials() {
  return (
    <section className="testimonials-section">
      <div className="section-header">
        <p className="section-label">Love Stories</p>
        <h2 className="section-title">What Couples Say</h2>
        <p className="section-subtitle">
          Join thousands of happy couples who trusted us with their special day.
        </p>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="testimonial-card">
            <div className="testimonial-quote-icon">"</div>
            <p className="testimonial-content">{testimonial.content}</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">{testimonial.avatar}</div>
              <div className="testimonial-info">
                <h4>{testimonial.author}</h4>
                <p>{testimonial.location} • {testimonial.date}</p>
                <div className="testimonial-stars">{testimonial.stars}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;

