import { useState, useEffect } from "react";

function RSVPModal({ isOpen, onClose, translations, currentLang, config = {} }) {
  const [name, setName] = useState("");
  const rsvp = config.rsvp || {};
  const wedding = config.wedding || {};
  const couple = config.couple || {};

  const maxDate = rsvp.maxDate || "2026-01-24";
  const defaultArrivalDate = rsvp.defaultArrivalDate || wedding.dates?.[0] || "2026-01-21";
  const whatsappNumber = rsvp.whatsappNumber || "918527476555";
  const dates = wedding.dates || ["2026-01-22", "2026-01-23"];
  const venue = wedding.venue || {};
  const brideName = couple.bride?.name || "Capt (Dr) Priya Singh";
  const groomName = couple.groom?.name || "Dr Saurabh Singh";
  const venueName = venue.name || "Royal Lotus View Resotel";
  const venueCity = venue.city || "Bengaluru";

  const formatDates = (dates) => {
    if (dates.length === 1) {
      return new Date(dates[0]).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    return (
      dates
        .map((d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long" }))
        .join(" & ") +
      " " +
      new Date(dates[0]).getFullYear()
    );
  };

  const [date, setDate] = useState("");

  // Load stored name when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const storedName = localStorage.getItem("wedding-guest-name");
    if (storedName) {
      setName(storedName);
    } else {
      setName("");
    }
    setDate(defaultArrivalDate);
  }, [isOpen, defaultArrivalDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !date) return;

    const dateObj = new Date(date + "T00:00:00");
    const formattedDate = dateObj.toLocaleDateString(
      currentLang === "hi" ? "hi-IN" : currentLang === "te" ? "te-IN" : "en-IN",
      { day: "numeric", month: "long", year: "numeric" }
    );

    const formattedWeddingDates = formatDates(dates);
    const defaultMessage = `Hello! I would like to RSVP for the wedding of ${brideName} and ${groomName}.\n\nName: {name}\nArrival Date: {date}\n\nI confirm my attendance for the celebrations on ${formattedWeddingDates} at ${venueName}, ${venueCity}.`;

    const messageLayout = translations["rsvp.message"] || defaultMessage;
    const message = encodeURIComponent(
      messageLayout.replace("{name}", name.trim()).replace("{date}", formattedDate)
    );

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`;

    window.open(whatsappUrl, "_blank");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="rsvp-modal active" onClick={onClose}>
      <div className="rsvp-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="rsvp-modal-close" onClick={onClose}>
          ×
        </button>
        <div className="rsvp-modal-header">
          <div className="rsvp-modal-title">{translations["rsvp.modal.title"] || "RSVP"}</div>
          <div className="rsvp-modal-subtitle">
            {translations["rsvp.modal.subtitle"] || "Please confirm your attendance"}
          </div>
        </div>
        <form id="rsvpForm" onSubmit={handleSubmit}>
          <div className="rsvp-form-group">
            <label className="rsvp-form-label" htmlFor="rsvpName">
              {translations["rsvp.modal.name"] || "Your Name *"}
            </label>
            <input
              type="text"
              id="rsvpName"
              className="rsvp-form-input"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="rsvp-form-group">
            <label className="rsvp-form-label" htmlFor="rsvpDate">
              {translations["rsvp.modal.date"] || "When will you be arriving? *"}
            </label>
            <input
              type="date"
              id="rsvpDate"
              className="rsvp-form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              max={maxDate}
            />
          </div>
          <div className="rsvp-modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {translations["rsvp.modal.cancel"] || "Cancel"}
            </button>
            <button type="submit" className="btn btn-primary">
              {translations["rsvp.modal.send"] || "Send RSVP"}
              <span className="btn-icon">➚</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RSVPModal;
