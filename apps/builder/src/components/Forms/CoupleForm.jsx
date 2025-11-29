import { useForm } from 'react-hook-form';
import { useBuilderStore } from '../../store/builderStore';
import { useEffect } from 'react';

function CoupleForm() {
  const { currentInvitation, updateNestedData } = useBuilderStore();
  const couple = currentInvitation.data.couple || {};
  const bride = couple.bride || {};
  const groom = couple.groom || {};

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      brideName: bride.name || '',
      brideTitle: bride.title || '',
      brideMother: bride.parents?.mother || '',
      brideFather: bride.parents?.father || '',
      brideImage: bride.image || '',
      groomName: groom.name || '',
      groomTitle: groom.title || '',
      groomMother: groom.parents?.mother || '',
      groomFather: groom.parents?.father || '',
      groomImage: groom.image || '',
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    const subscription = watch((data) => {
      updateNestedData('couple', {
        bride: {
          name: data.brideName,
          title: data.brideTitle,
          parents: {
            mother: data.brideMother,
            father: data.brideFather,
          },
          image: data.brideImage,
        },
        groom: {
          name: data.groomName,
          title: data.groomTitle,
          parents: {
            mother: data.groomMother,
            father: data.groomFather,
          },
          image: data.groomImage,
        },
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, updateNestedData]);

  return (
    <div className="form-section">
      <h3 className="form-section-title">Couple Information</h3>
      
      <div className="form-subsection">
        <h4 className="form-subsection-title">Bride</h4>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-input"
            {...register('brideName', { required: 'Bride name is required' })}
          />
          {errors.brideName && <span className="form-error">{errors.brideName.message}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Title (e.g., Dr., Capt)</label>
          <input
            type="text"
            className="form-input"
            {...register('brideTitle')}
            placeholder="Capt Dr."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Mother's Name</label>
          <input
            type="text"
            className="form-input"
            {...register('brideMother')}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Father's Name</label>
          <input
            type="text"
            className="form-input"
            {...register('brideFather')}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Bride Image URL</label>
          <input
            type="text"
            className="form-input"
            {...register('brideImage')}
            placeholder="/assets/photos/bride/1.jpeg"
          />
        </div>
      </div>

      <div className="form-subsection">
        <h4 className="form-subsection-title">Groom</h4>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-input"
            {...register('groomName', { required: 'Groom name is required' })}
          />
          {errors.groomName && <span className="form-error">{errors.groomName.message}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Title (e.g., Dr.)</label>
          <input
            type="text"
            className="form-input"
            {...register('groomTitle')}
            placeholder="Dr."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Mother's Name</label>
          <input
            type="text"
            className="form-input"
            {...register('groomMother')}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Father's Name</label>
          <input
            type="text"
            className="form-input"
            {...register('groomFather')}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Groom Image URL</label>
          <input
            type="text"
            className="form-input"
            {...register('groomImage')}
            placeholder="/assets/photos/groom/1.jpeg"
          />
        </div>
      </div>
    </div>
  );
}

export default CoupleForm;

