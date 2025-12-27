/**
 * ThingsToDo - Magazine-style "While you're in..." with restaurants, cafés, landmarks
 * Lifestyle editorial framing
 */
function ThingsToDo({ _translations, _currentLang, config = {} }) {
  const thingsToDo = config.thingsToDo || {};
  const intro = thingsToDo.intro || "While you're in the city...";
  const activities = thingsToDo.activities || [];

  return (
    <section className="ee-section ee-things-to-do-section">
      <div className="ee-things-to-do-container">
        <h2 className="ee-section-heading">Things to Do</h2>
        <div className="ee-divider" />

        {/* Intro Text */}
        {intro && <p className="ee-things-to-do-intro">{intro}</p>}

        {/* Activities by Category */}
        {activities.length > 0 && (
          <div className="ee-things-to-do-activities">
            {activities.map((activity, index) => (
              <div key={index} className="ee-activity-item">
                <h3 className="ee-activity-name">{activity.name || ""}</h3>
                {activity.category && (
                  <span className="ee-activity-category">{activity.category}</span>
                )}
                {activity.description && (
                  <p className="ee-activity-description">{activity.description}</p>
                )}
                {activity.address && <p className="ee-activity-address">{activity.address}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ThingsToDo;
