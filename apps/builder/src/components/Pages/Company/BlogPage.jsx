import { Link } from 'react-router-dom';
import PageLayout from '../PageLayout';
import './BlogPage.css';

const blogPosts = [
  {
    id: 1,
    title: '10 Wedding Invitation Trends for 2025',
    excerpt: 'Discover the latest design trends that are shaping how couples share their special day with loved ones.',
    category: 'Trends',
    date: 'December 1, 2024',
    readTime: '5 min read',
    featured: true
  },
  {
    id: 2,
    title: 'How to Write the Perfect Wedding Invitation',
    excerpt: 'A comprehensive guide to wedding invitation wording, from formal to casual, and everything in between.',
    category: 'Tips & Advice',
    date: 'November 28, 2024',
    readTime: '8 min read',
    featured: false
  },
  {
    id: 3,
    title: 'Digital vs. Paper Invitations: Making the Right Choice',
    excerpt: 'Weighing the pros and cons of digital and traditional paper invitations for your wedding.',
    category: 'Planning',
    date: 'November 25, 2024',
    readTime: '6 min read',
    featured: false
  },
  {
    id: 4,
    title: 'Color Palettes That Will Make Your Invitation Pop',
    excerpt: 'Expert advice on choosing colors that complement your wedding theme and create visual harmony.',
    category: 'Design',
    date: 'November 20, 2024',
    readTime: '4 min read',
    featured: true
  },
  {
    id: 5,
    title: 'RSVP Etiquette: What Every Couple Should Know',
    excerpt: 'Navigate the sometimes tricky world of RSVP management with grace and ease.',
    category: 'Etiquette',
    date: 'November 15, 2024',
    readTime: '5 min read',
    featured: false
  },
  {
    id: 6,
    title: 'Sustainable Wedding Invitations: An Eco-Friendly Guide',
    excerpt: 'How to reduce your wedding\'s environmental impact without sacrificing style or elegance.',
    category: 'Sustainability',
    date: 'November 10, 2024',
    readTime: '6 min read',
    featured: false
  },
  {
    id: 7,
    title: 'Cultural Wedding Traditions Around the World',
    excerpt: 'Explore beautiful wedding customs from different cultures and how to incorporate them into your invitations.',
    category: 'Inspiration',
    date: 'November 5, 2024',
    readTime: '7 min read',
    featured: false
  },
  {
    id: 8,
    title: 'Timeline: When to Send Your Wedding Invitations',
    excerpt: 'The definitive guide to wedding invitation timing, including save-the-dates and follow-ups.',
    category: 'Planning',
    date: 'October 30, 2024',
    readTime: '4 min read',
    featured: false
  }
];

const categories = ['All', 'Trends', 'Tips & Advice', 'Planning', 'Design', 'Etiquette', 'Inspiration'];

function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <PageLayout
      title="Wedding Inspiration Blog"
      subtitle="Tips, trends, and advice for creating the perfect wedding invitation and planning your special day."
      breadcrumbs={[{ label: 'Company', path: '/about' }, { label: 'Blog' }]}
    >
      <div className="blog-page">
        {/* Category Filter */}
        <div className="blog-categories">
          {categories.map(category => (
            <button key={category} className="category-btn">
              {category}
            </button>
          ))}
        </div>

        {/* Featured Posts */}
        <section className="featured-posts">
          <div className="section-header">
            <span className="section-label">Featured</span>
            <h2 className="section-title">Editor's Picks</h2>
          </div>
          <div className="featured-grid">
            {featuredPosts.map(post => (
              <article key={post.id} className="featured-card">
                <div className="featured-image">
                  <span className="post-category">{post.category}</span>
                </div>
                <div className="featured-content">
                  <div className="post-meta">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <span className="read-more">Read Article →</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* All Posts */}
        <section className="all-posts">
          <div className="section-header">
            <span className="section-label">Latest</span>
            <h2 className="section-title">All Articles</h2>
          </div>
          <div className="posts-grid">
            {regularPosts.map(post => (
              <article key={post.id} className="post-card">
                <div className="post-image">
                  <span className="post-category">{post.category}</span>
                </div>
                <div className="post-content">
                  <div className="post-meta">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <span className="read-more">Read More →</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="blog-newsletter">
          <div className="newsletter-content">
            <h2>Get Wedding Inspiration</h2>
            <p>Subscribe to our newsletter for the latest tips, trends, and wedding planning advice.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" />
              <button type="submit" className="page-btn page-btn-primary">
                Subscribe
              </button>
            </form>
            <p className="newsletter-note">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default BlogPage;

