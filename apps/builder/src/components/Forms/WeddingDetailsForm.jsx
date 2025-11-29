import { useForm } from 'react-hook-form';
import { useBuilderStore } from '../../store/builderStore';
import { useEffect } from 'react';

function WeddingDetailsForm() {
  const { currentInvitation, updateNestedData } = useBuilderStore();
  const wedding = currentInvitation.data.wedding || {};
  const venue = wedding.venue || {};

  const { register, watch } = useForm({
    defaultValues: {
      date1: wedding.dates?.[0] || '',
      date2: wedding.dates?.[1] || '',
      countdownTarget: wedding.countdownTarget || '',
      venueName: venue.name || '',
      venueAddress: venue.address || '',
      venueCity: venue.city || '',
      venueState: venue.state || '',
      venueMapsUrl: venue.mapsUrl || '',
      venueMapsEmbedUrl: venue.mapsEmbedUrl || '',
      venueTags: venue.tags?.join(', ') || '',
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    const subscription = watch((data) => {
      const dates = [data.date1, data.date2].filter(Boolean);
      const tags = data.venueTags ? data.venueTags.split(',').map(t => t.trim()).filter(Boolean) : [];

      updateNestedData('wedding', {
        dates,
        countdownTarget: data.countdownTarget,
        venue: {
          name: data.venueName,
          address: data.venueAddress,
          city: data.venueCity,
          state: data.venueState,
          mapsUrl: data.venueMapsUrl,
          mapsEmbedUrl: data.venueMapsEmbedUrl,
          tags,
        },
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, updateNestedData]);

  return (
    <div className="form-section">
      <h3 className="form-section-title">Wedding Details</h3>
      
      <div className="form-group">
        <label className="form-label">Wedding Date 1</label>
        <input
          type="date"
          className="form-input"
          {...register('date1')}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Wedding Date 2 (Optional)</label>
        <input
          type="date"
          className="form-input"
          {...register('date2')}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Countdown Target (Date & Time)</label>
        <input
          type="datetime-local"
          className="form-input"
          {...register('countdownTarget')}
        />
      </div>

      <div className="form-subsection">
        <h4 className="form-subsection-title">Venue</h4>
        
        <div className="form-group">
          <label className="form-label">Venue Name</label>
          <input
            type="text"
            className="form-input"
            {...register('venueName')}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea
            className="form-textarea"
            {...register('venueAddress')}
            placeholder="Full address with line breaks"
          />
        </div>

        <div className="form-group">
          <label className="form-label">City</label>
          <input
            type="text"
            className="form-input"
            {...register('venueCity')}
          />
        </div>

        <div className="form-group">
          <label className="form-label">State</label>
          <input
            type="text"
            className="form-input"
            {...register('venueState')}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Google Maps URL</label>
          <input
            type="url"
            className="form-input"
            {...register('venueMapsUrl')}
            placeholder="https://maps.app.goo.gl/..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Google Maps Embed URL</label>
          <input
            type="url"
            className="form-input"
            {...register('venueMapsEmbedUrl')}
            placeholder="https://www.google.com/maps/embed?..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Venue Tags (comma-separated)</label>
          <input
            type="text"
            className="form-input"
            {...register('venueTags')}
            placeholder="Bengaluru, Karnataka, Near Airport"
          />
        </div>
      </div>
    </div>
  );
}

export default WeddingDetailsForm;

