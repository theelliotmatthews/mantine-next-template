import { auth, firestore } from './firebase';
import { getRecipeById } from './recipes/recipes';
import { Notification } from './types';

export async function createNotification(
  recipeId,
  entityId,
  entityType,
  type,
  reviewId,
  post,
  collectionId,
  collectionCount,

) {
  const obj = {
    recipeId,
    entityId,
    entityType,
    type,
    //createdAt: firebase.firestore.FieldValue.serverTimestamp()
    createdAt: new Date(),
  };

  console.log('Obj');

  if (reviewId) obj.reviewId = reviewId;
  if (post) obj.post = post;
  if (collectionId) obj.collectionId = collectionId;
  if (collectionCount) obj.collectionCount = collectionCount;
  // if (pageSource) obj.pageSource = pageSource;
  // if (venueSource) obj.venueSource = venueSource;
  // if (userId) obj.userId = userId;

  // Check if notification already exists, if so then update the time, saves
  const res = await firestore
    .collection('notifications')
    .where('recipeId', '==', recipeId)
    .where('entityId', '==', entityId)
    .where('entityType', '==', entityType)
    .where('type', '==', type)
    .get();
  if (res.docs.length > 0 && (type === 'saved' || type === 'cooked')) {
    await firestore
      .collection('notifications')
      .doc(res.docs[0].id)
      .update({ createdAt: new Date() });
  } else {
    await firestore.collection('notifications').add(obj);
  }
}

export async function seeNotification(notificationId, userId) {
  await firestore.collection('notification_seen').add({
    notificationId,
    userId,
    dateSeen: new Date(),
  });
}

export async function hasUserViewedNotification(userId, notificationId) {
  let seen = false;
  const res = await firestore
    .collection('notification_seen')
    .where('userId', '==', userId)
    .where('notificationId', '==', notificationId)
    .get();
  if (res.docs && res.docs.length > 0) seen = true;

  return seen;
}

export async function getNotifications(userId, startAt) {
  // Notifications
  const notifications = [];

  let query = firestore
    .collection('notifications_seen')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc');

  if (startAt) {
    query = query.startAfter(startAt);
  }

  query = query.limit(10);

  // Reset the last visible for a new pagination query
  let lastVisible = null;

  // Get friend requests
  const res = await query.get();
  lastVisible = res.docs[res.docs.length - 1];

  for (const doc of res.docs) {
    notifications.push({ ...doc.data(), id: doc.id });
  }

  return { notifications, lastVisible } as {
    notifications: Notification[], lastVisible: any
  };
}

export async function getSingleNotification(id) {
  const res = await firestore.collection('notifications_seen').doc(id).get();
  return { ...res.data(), id: res.id };
}

export async function createNotificationSeen(notification: Notification) {
  await firestore.collection('notifications_seen').add(notification);
}

export async function checkIfNotificationHasBeenSeen(type, id) {
  const res = await firestore
    .collection('notifications_seen')
    .where('type', '==', type)
    .where('id', '==', id)
    .get();

  if (res.docs.length > 0) {
    return true;
  }
  return false;
}

export async function deleteNotification(id) {
  await firestore.collection('notifications_seen').doc(id).delete();
}

export async function rejectFriendRequestOnUserPage(from, to) {
  const res = await firestore
    .collection('notifications_seen')
    .where('userId', '==', to)
    .where('fromUserId', '==', from)
    .where('type', '==', 'friend_request')
    .get();

  for (const doc of res.docs) {
    await firestore.collection('notifications_seen').doc(doc.id).delete();
  }
}

export async function acceptFriendRequestNotification(id) {
  await firestore
    .collection('notifications_seen')
    .doc(id)
    .update({ accepted: true });
}

export async function acceptFriendRequestOnUserPage(from, to) {
  const res = await firestore
    .collection('notifications_seen')
    .where('userId', '==', to)
    .where('fromUserId', '==', from)
    .where('type', '==', 'friend_request')
    .get();

  for (const doc of res.docs) {
    await firestore
      .collection('notifications_seen')
      .doc(doc.id)
      .update({ accepted: true });
  }
}

// Feed posts

export async function getFeedPostFromId(id) {
  const res = await firestore.collection('notifications').doc(id).get();

  return { ...res.data(), id: res.id };
}

export async function searchProfiles(term) {
  const strSearch = term;
  const strlength = strSearch.length;
  const strFrontCode = strSearch.slice(0, strlength - 1);
  const strEndCode = strSearch.slice(strlength - 1, strSearch.length);

  const startcode = strSearch;
  const endcode =
    strFrontCode + String.fromCharCode(strEndCode.charCodeAt(0) + 1);
  const res2 = await firestore
    .collection('profiles')
    .where('combinedName', '>=', startcode)
    .where('combinedName', '<', endcode)
    .limit(15)
    .get();

  const profiles = [];
  for (const doc of res2.docs) {
    profiles.push({ ...doc.data(), id: doc.id });
  }

  return profiles;
}

export async function returnNotificationIdOfFriendRequest(from, to) {
  console.log('Return from', from);
  console.log('Return to', to);
  const res = await firestore
    .collection('notifications_seen')
    .where('fromUserId', '==', from)
    .where('userId', '==', to)
    .where('type', '==', 'friend_request')
    .get();
  console.log('Return res', res);
  return res.docs.length > 0 ? res.docs[0].id : null;
}

export async function readAllNotifications(notifications) {
  const promises = [];
  for (const notification of notifications) {
    if (!notification.seen) {
      const promise = firestore
        .collection('notifications_seen')
        .doc(notification.id)
        .update({ seen: true });

      promises.push(promise);
    }
  }

  await Promise.all(promises);
}
