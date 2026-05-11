const DURATION = 200;
const DECELERATION = 0.015;
const SMOOTH_STEP = 5;
const SMOOTH_THRESHOLD = 0.1;
const VELOCITY_THRESHOLD = 0.5;
const MOVE_THRESHOLD = 5;
const EASE = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

export {
  DURATION,
  DECELERATION,
  SMOOTH_STEP,
  SMOOTH_THRESHOLD,
  VELOCITY_THRESHOLD,
  MOVE_THRESHOLD,
  EASE,
};
