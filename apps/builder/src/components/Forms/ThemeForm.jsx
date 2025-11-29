import { useForm } from 'react-hook-form';
import { useBuilderStore } from '../../store/builderStore';
import { useEffect } from 'react';

function ThemeForm() {
  const { currentInvitation, updateNestedData } = useBuilderStore();
  const theme = currentInvitation.data.theme || {};
  const colors = theme.colors || {};
  const fonts = theme.fonts || {};

  const { register, watch } = useForm({
    defaultValues: {
      primaryColor: colors.primary || '#d4af37',
      secondaryColor: colors.secondary || '#8b6914',
      backgroundColor: colors.background || '#fff8f0',
      textColor: colors.text || '#2c2c2c',
      headingFont: fonts.heading || 'Playfair Display',
      bodyFont: fonts.body || 'Poppins',
      scriptFont: fonts.script || 'Great Vibes',
    },
  });

  useEffect(() => {
    const subscription = watch((data) => {
      updateNestedData('theme', {
        colors: {
          primary: data.primaryColor,
          secondary: data.secondaryColor,
          background: data.backgroundColor,
          text: data.textColor,
        },
        fonts: {
          heading: data.headingFont,
          body: data.bodyFont,
          script: data.scriptFont,
        },
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, updateNestedData]);

  return (
    <div className="form-section">
      <h3 className="form-section-title">Theme Customization</h3>
      
      <div className="form-subsection">
        <h4 className="form-subsection-title">Colors</h4>
        
        <div className="form-group">
          <label className="form-label">Primary Color</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              {...register('primaryColor')}
              style={{ width: '60px', height: '40px', border: '1px solid #e0e0e0', borderRadius: '4px' }}
            />
            <input
              type="text"
              className="form-input"
              {...register('primaryColor')}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Secondary Color</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              {...register('secondaryColor')}
              style={{ width: '60px', height: '40px', border: '1px solid #e0e0e0', borderRadius: '4px' }}
            />
            <input
              type="text"
              className="form-input"
              {...register('secondaryColor')}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Background Color</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              {...register('backgroundColor')}
              style={{ width: '60px', height: '40px', border: '1px solid #e0e0e0', borderRadius: '4px' }}
            />
            <input
              type="text"
              className="form-input"
              {...register('backgroundColor')}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Text Color</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              {...register('textColor')}
              style={{ width: '60px', height: '40px', border: '1px solid #e0e0e0', borderRadius: '4px' }}
            />
            <input
              type="text"
              className="form-input"
              {...register('textColor')}
              style={{ flex: 1 }}
            />
          </div>
        </div>
      </div>

      <div className="form-subsection">
        <h4 className="form-subsection-title">Fonts</h4>
        
        <div className="form-group">
          <label className="form-label">Heading Font</label>
          <input
            type="text"
            className="form-input"
            {...register('headingFont')}
            placeholder="Playfair Display"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Body Font</label>
          <input
            type="text"
            className="form-input"
            {...register('bodyFont')}
            placeholder="Poppins"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Script/Decorative Font</label>
          <input
            type="text"
            className="form-input"
            {...register('scriptFont')}
            placeholder="Great Vibes"
          />
        </div>
      </div>
    </div>
  );
}

export default ThemeForm;

