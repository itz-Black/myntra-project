import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ─── Foreground notification handler ─────────────────────────────────────────
// Must be set at module level (before any scheduling) so the handler
// is active whenever the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Permission & Token Registration ─────────────────────────────────────────
/**
 * Requests notification permissions, creates the Android channel, and returns
 * the Expo push token string.  Returns `null` if on a web/simulator environment
 * or if the user denies permission.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted.');
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Push token:', token);
    } catch (e) {
      try {
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Fallback push token:', token);
      } catch (innerError) {
        console.error('Failed to get push token:', innerError);
      }
    }
  } else {
    console.log('Push notifications require a physical device.');
  }

  return token;
}

// ─── Immediate (local) Notification ──────────────────────────────────────────
/**
 * Shows a notification immediately (in-app or background).
 * `data.route` is read by the response listener in _layout.tsx for deep-linking.
 */
export async function sendImmediateNotification(
  title: string,
  body: string,
  data: Record<string, unknown> = {}
): Promise<string> {
  const id = await Notifications.presentNotificationAsync({
    title,
    body,
    data,
  });
  return id;
}

// ─── Scheduled Notifications ──────────────────────────────────────────────────
/**
 * Schedules a local notification to fire after `secondsFromNow` seconds.
 * Returns the notification identifier so it can be cancelled later.
 */
export async function scheduleNotification(
  title: string,
  body: string,
  secondsFromNow: number,
  data: Record<string, unknown> = {}
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: secondsFromNow, repeats: false },
  });
  console.log(`Scheduled notification "${title}" in ${secondsFromNow}s → id: ${id}`);
  return id;
}

/**
 * Cancels a single scheduled notification by its identifier.
 */
export async function cancelScheduledNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
  console.log('Cancelled notification:', notificationId);
}

/**
 * Cancels ALL pending scheduled notifications for this app.
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('All scheduled notifications cancelled.');
}

// ─── Domain-specific helpers ──────────────────────────────────────────────────

/**
 * Schedules a "cart abandonment" reminder if the user has not checked out
 * within 30 minutes of adding an item to the bag.
 *
 * Call this after a successful add-to-bag action.
 * The returned ID should be stored and cancelled when the user checks out.
 */
export async function scheduleCartAbandonmentReminder(productName: string): Promise<string> {
  const THIRTY_MINUTES = 30 * 60; // seconds
  return scheduleNotification(
    "Still thinking? 🛍️",
    `You left "${productName}" in your bag. Complete your order before it sells out!`,
    THIRTY_MINUTES,
    { route: '/bag' }
  );
}

/**
 * Immediately cancels a cart abandonment reminder when the user places an order.
 */
export async function cancelCartAbandonmentReminder(notificationId: string): Promise<void> {
  return cancelScheduledNotification(notificationId);
}

/**
 * Schedules a promotional reminder 24 hours from now.
 * Call this on app launch (once per day) for "daily offer" style notifications.
 */
export async function schedulePromoReminder(): Promise<string> {
  const ONE_DAY = 24 * 60 * 60; // seconds
  return scheduleNotification(
    "🔥 Today's Best Deals are Live!",
    "Don't miss out on up to 70% off. Limited time only!",
    ONE_DAY,
    { route: '/' }
  );
}

/**
 * Sends an immediate order-status notification (call from Checkout on success).
 */
export async function sendOrderPlacedNotification(orderId: string): Promise<string> {
  return sendImmediateNotification(
    "Order Placed Successfully! 🎉",
    `Your order #${orderId} is confirmed and is being processed.`,
    { route: '/orders' }
  );
}
