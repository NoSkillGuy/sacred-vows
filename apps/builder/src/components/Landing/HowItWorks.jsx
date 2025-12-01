const steps = [
  {
    number: 1,
    icon: '🎨',
    title: 'Choose Your Template',
    description: 'Browse our beautiful collection and select the design that speaks to your heart.',
  },
  {
    number: 2,
    icon: '✏️',
    title: 'Customize Every Detail',
    description: 'Add your photos, edit text, choose colors, and make it uniquely yours.',
  },
  {
    number: 3,
    icon: '💌',
    title: 'Share With Guests',
    description: 'Send your stunning invitation to loved ones with just a click.',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="section-header">
        <p className="section-label">Simple Process</p>
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">
          Creating your dream wedding invitation takes just three simple steps.
        </p>
      </div>

      <div className="steps-container">
        <div className="steps-line" />
        {steps.map((step) => (
          <div key={step.number} className="step">
            <div className="step-number">{step.number}</div>
            <div className="step-icon">{step.icon}</div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-desc">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;

