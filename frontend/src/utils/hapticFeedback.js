/**
 * Haptic Feedback Utilities
 * 
 * Ger taktil feedback för olika händelser i appen
 */

import { Vibration, Platform } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

/**
 * Haptic feedback-typer
 */
export const HapticType = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  SELECTION: 'selection',
};

/**
 * Haptic feedback-konfiguration
 */
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Trigga haptic feedback
 */
export const triggerHaptic = (type = HapticType.LIGHT) => {
  if (Platform.OS === 'ios') {
    // iOS har native haptic feedback
    switch (type) {
      case HapticType.LIGHT:
        ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
        break;
      case HapticType.MEDIUM:
        ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
        break;
      case HapticType.HEAVY:
        ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
        break;
      case HapticType.SUCCESS:
        ReactNativeHapticFeedback.trigger('notificationSuccess', hapticOptions);
        break;
      case HapticType.WARNING:
        ReactNativeHapticFeedback.trigger('notificationWarning', hapticOptions);
        break;
      case HapticType.ERROR:
        ReactNativeHapticFeedback.trigger('notificationError', hapticOptions);
        break;
      case HapticType.SELECTION:
        ReactNativeHapticFeedback.trigger('selection', hapticOptions);
        break;
      default:
        ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    }
  } else {
    // Android fallback till vibration
    switch (type) {
      case HapticType.LIGHT:
        Vibration.vibrate(50);
        break;
      case HapticType.MEDIUM:
        Vibration.vibrate(100);
        break;
      case HapticType.HEAVY:
        Vibration.vibrate(150);
        break;
      case HapticType.SUCCESS:
        Vibration.vibrate([0, 50, 50, 50]);
        break;
      case HapticType.WARNING:
        Vibration.vibrate([0, 100, 50, 100]);
        break;
      case HapticType.ERROR:
        Vibration.vibrate([0, 100, 100, 100]);
        break;
      case HapticType.SELECTION:
        Vibration.vibrate(30);
        break;
      default:
        Vibration.vibrate(50);
    }
  }
};

/**
 * Haptic feedback för boule-detektering
 */
export const onBouleDetected = () => {
  triggerHaptic(HapticType.LIGHT);
};

/**
 * Haptic feedback för cochonnet-detektering
 */
export const onCochonnetDetected = () => {
  triggerHaptic(HapticType.MEDIUM);
};

/**
 * Haptic feedback för lyckad kalibrering
 */
export const onCalibrationSuccess = () => {
  triggerHaptic(HapticType.SUCCESS);
};

/**
 * Haptic feedback för misslyckad kalibrering
 */
export const onCalibrationError = () => {
  triggerHaptic(HapticType.ERROR);
};

/**
 * Haptic feedback för lyckad träff
 */
export const onSuccessfulThrow = () => {
  // Dubbel vibration för extra feedback
  triggerHaptic(HapticType.SUCCESS);
  setTimeout(() => triggerHaptic(HapticType.LIGHT), 100);
};

/**
 * Haptic feedback för missad träff
 */
export const onMissedThrow = () => {
  triggerHaptic(HapticType.WARNING);
};

/**
 * Haptic feedback för achievement unlock
 */
export const onAchievementUnlocked = () => {
  // Speciell vibrationsmönster för achievement
  Vibration.vibrate([0, 100, 50, 100, 50, 150]);
};

/**
 * Haptic feedback för level up
 */
export const onLevelUp = () => {
  Vibration.vibrate([0, 50, 50, 100, 50, 150, 50, 200]);
};

/**
 * Haptic feedback för button press
 */
export const onButtonPress = () => {
  triggerHaptic(HapticType.SELECTION);
};

/**
 * Haptic feedback för avståndsmätning klar
 */
export const onDistanceMeasured = (distance) => {
  // Olika intensitet baserat på avstånd
  if (distance < 0.1) {
    triggerHaptic(HapticType.HEAVY); // Mycket nära!
  } else if (distance < 0.5) {
    triggerHaptic(HapticType.MEDIUM);
  } else {
    triggerHaptic(HapticType.LIGHT);
  }
};

/**
 * Haptic feedback för countdown
 */
export const onCountdown = (count) => {
  if (count === 1) {
    triggerHaptic(HapticType.HEAVY);
  } else {
    triggerHaptic(HapticType.LIGHT);
  }
};

/**
 * Custom vibration pattern
 */
export const customVibration = (pattern) => {
  Vibration.vibrate(pattern);
};

/**
 * Avbryt pågående vibration
 */
export const cancelVibration = () => {
  Vibration.cancel();
};

export default {
  HapticType,
  triggerHaptic,
  onBouleDetected,
  onCochonnetDetected,
  onCalibrationSuccess,
  onCalibrationError,
  onSuccessfulThrow,
  onMissedThrow,
  onAchievementUnlocked,
  onLevelUp,
  onButtonPress,
  onDistanceMeasured,
  onCountdown,
  customVibration,
  cancelVibration,
};
