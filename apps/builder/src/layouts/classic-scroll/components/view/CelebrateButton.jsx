function CelebrateButton() {
  const handleClick = () => {
    if (window.launchCelebration) {
      window.launchCelebration();
    }
  };

  return (
    <button
      type="button"
      className="celebrate-button"
      onClick={handleClick}
      title="Celebrate"
      aria-label="Celebrate"
    >
      🎉
    </button>
  );
}

export default CelebrateButton;

