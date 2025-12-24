import EditableText from "../shared/EditableText";
import { getDefaultAssetUrl } from "../../../../services/defaultAssetService";

/**
 * EditableEventsSection - WYSIWYG editable version of Events section
 */
function EditableEventsSection({ translations, currentLang, config = {}, onUpdate }) {
  const events = config.events || {};
  const day1Config = events.day1 || {};
  const day2Config = events.day2 || {};

  // Get custom translations - handle nested paths
  const getTranslation = (key) => {
    let customValue = null;
    if (config?.customTranslations) {
      const keys = key.split(".");
      let current = config.customTranslations;
      for (const k of keys) {
        if (current && typeof current === "object" && k in current) {
          current = current[k];
        } else {
          current = null;
          break;
        }
      }
      customValue = current || null;
    }
    return customValue || translations[key] || "";
  };

  // Get day1 events from config or use defaults
  const day1Events = day1Config.events || [
    {
      emoji: "🪔",
      label: getTranslation("events.tilak.label") || "Tilak",
      tag: getTranslation("events.tilak.tag") || "Auspicious beginning",
      time: "3:00 PM",
    },
    {
      emoji: "🌼",
      label: getTranslation("events.haldi.label") || "Haldi",
      tag: getTranslation("events.haldi.tag") || "Turmeric & traditions",
      time: "6:00 PM",
    },
    {
      emoji: "🌺",
      label: getTranslation("events.mehandi.label") || "Mehandi",
      tag: getTranslation("events.mehandi.tag") || "Henna & happiness",
      time: "9:00 PM",
    },
  ];

  // Get day2 events from config or use defaults
  const day2Events = day2Config.events || [
    {
      emoji: "💐",
      label: getTranslation("events.jaimala.label") || "Jaimala",
      tag: getTranslation("events.jaimala.tag") || "Exchange of garlands",
      time: "5:00 PM",
    },
    {
      emoji: "🍽️",
      label: getTranslation("events.dinner.label") || "Dinner",
      tag: getTranslation("events.dinner.tag") || "Feast with family & friends",
      time: "8:00 PM",
    },
    {
      emoji: null,
      image: getDefaultAssetUrl("icons", null, "3.jpg"),
      label: getTranslation("events.wedding.label") || "Wedding",
      tag: getTranslation("events.wedding.tag") || "Sacred vows",
      time: "9:00 PM",
    },
  ];

  const day1Date = day1Config.date || "Thursday · 22 January 2026";
  const day2Date = day2Config.date || "Friday · 23 January 2026";

  return (
    <section id="events">
      <div className="section-header">
        <EditableText
          value={getTranslation("events.eyebrow") || "Program Details"}
          onUpdate={onUpdate}
          path="customTranslations.events.eyebrow"
          className="section-eyebrow"
          tag="div"
        />
        <EditableText
          value={getTranslation("events.title") || "The Celebrations"}
          onUpdate={onUpdate}
          path="customTranslations.events.title"
          className="section-title"
          tag="div"
        />
        <EditableText
          value={
            getTranslation("events.subtitle") ||
            "We would be honoured by your presence at each of these moments of joy."
          }
          onUpdate={onUpdate}
          path="customTranslations.events.subtitle"
          className="section-subtitle"
          tag="div"
          multiline={true}
        />
      </div>

      <div className="card">
        <div className="card-inner event-grid">
          {/* Day One */}
          <div className="event-day">
            <EditableText
              value={getTranslation("events.day1") || "Day One"}
              onUpdate={onUpdate}
              path="customTranslations.events.day1"
              className="event-date-label"
              tag="div"
            />
            <EditableText
              value={day1Date}
              onUpdate={onUpdate}
              path="events.day1.date"
              className="event-date-main"
              tag="div"
            />

            {day1Events.map((event, index) => (
              <div key={index} className="event-item">
                <div className="event-icon-wrapper">
                  {event.emoji ? (
                    <div className="event-icon-emoji">{event.emoji}</div>
                  ) : (
                    <img src={event.image} alt={event.label} className="event-icon-image" />
                  )}
                </div>
                <div className="event-content">
                  <div className="event-left">
                    <EditableText
                      value={event.label}
                      onUpdate={onUpdate}
                      path={`events.day1.events.${index}.label`}
                      className="event-label"
                      tag="div"
                    />
                    <EditableText
                      value={event.tag}
                      onUpdate={onUpdate}
                      path={`events.day1.events.${index}.tag`}
                      className="event-tag"
                      tag="div"
                    />
                  </div>
                  <EditableText
                    value={event.time}
                    onUpdate={onUpdate}
                    path={`events.day1.events.${index}.time`}
                    className="event-time"
                    tag="div"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Day Two */}
          <div className="event-day">
            <EditableText
              value={getTranslation("events.day2") || "Day Two"}
              onUpdate={onUpdate}
              path="customTranslations.events.day2"
              className="event-date-label"
              tag="div"
            />
            <EditableText
              value={day2Date}
              onUpdate={onUpdate}
              path="events.day2.date"
              className="event-date-main"
              tag="div"
            />

            {day2Events.map((event, index) => (
              <div key={index} className="event-item">
                <div className="event-icon-wrapper">
                  {event.emoji ? (
                    <div className="event-icon-emoji">{event.emoji}</div>
                  ) : (
                    <img src={event.image} alt={event.label} className="event-icon-image" />
                  )}
                </div>
                <div className="event-content">
                  <div className="event-left">
                    <EditableText
                      value={event.label}
                      onUpdate={onUpdate}
                      path={`events.day2.events.${index}.label`}
                      className="event-label"
                      tag="div"
                    />
                    <EditableText
                      value={event.tag}
                      onUpdate={onUpdate}
                      path={`events.day2.events.${index}.tag`}
                      className="event-tag"
                      tag="div"
                    />
                  </div>
                  <EditableText
                    value={event.time}
                    onUpdate={onUpdate}
                    path={`events.day2.events.${index}.time`}
                    className="event-time"
                    tag="div"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <EditableText
          value={
            getTranslation("events.complete") ||
            "Your presence and blessings at these ceremonies will make our celebration truly complete."
          }
          onUpdate={onUpdate}
          path="customTranslations.events.complete"
          className="muted"
          tag="p"
          multiline={true}
          style={{ marginTop: "14px", fontSize: "12px" }}
        />
      </div>
    </section>
  );
}

export default EditableEventsSection;
