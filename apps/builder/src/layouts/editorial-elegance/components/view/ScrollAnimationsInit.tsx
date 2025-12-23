import { useScrollAnimations } from '../../hooks/useScrollAnimations';

/**
 * ScrollAnimationsInit - Component that initializes scroll animations
 * Renders nothing, just initializes the Intersection Observer
 */
function ScrollAnimationsInit() {
  useScrollAnimations();
  return null;
}

export default ScrollAnimationsInit;

