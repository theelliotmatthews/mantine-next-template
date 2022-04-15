import { auth, firestore } from "./firebase";
import { getRecipeById } from "./recipes/recipes";
import { Notification } from "./types";

export async function createNotification(
  recipeId,
  userId,
  type,
  reviewId,
  post,
  collectionId,
  collectionCount,
  venueSource,
  pageSource
) {
  let obj = {
    recipeId: recipeId,

    type: type,
    //createdAt: firebase.firestore.FieldValue.serverTimestamp()
    createdAt: new Date(),
  };

  console.log("Obj");

  if (reviewId) obj.reviewId = reviewId;
  if (post) obj.post = post;
  if (collectionId) obj.collectionId = collectionId;
  if (collectionCount) obj.collectionCount = collectionCount;
  if (pageSource) obj.pageSource = pageSource;
  if (venueSource) obj.venueSource = venueSource;
  if (userId) obj.userId = userId;

  // Check if notification already exists, if so then update the time, saves
  let res = await firestore
    .collection("notifications")
    .where("recipeId", "==", recipeId)
    .where("userId", "==", userId)
    .where("type", "==", type)
    .get();
  if (res.docs.length > 0 && (type == "saved" || type == "cooked")) {
    await firestore
      .collection("notifications")
      .doc(res.docs[0].id)
      .update({ createdAt: new Date() });
  } else {
    await firestore.collection("notifications").add(obj);
  }
}

export async function seeNotification(notificationId, userId) {
  await firestore.collection("notification_seen").add({
    notificationId: notificationId,
    userId: userId,
    dateSeen: new Date(),
  });
}

export async function hasUserViewedNotification(userId, notificationId) {
  let seen = false;
  let res = await firestore
    .collection("notification_seen")
    .where("userId", "==", userId)
    .where("notificationId", "==", notificationId)
    .get();
  if (res.docs && res.docs.length > 0) seen = true;

  return seen;
}

export async function getNotifications(userId, startAt) {
  // Notifications
  let notifications = [];

  let query = firestore
    .collection("notifications_seen")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")


  if (startAt) {
    query = query.startAfter(startAt);
  }

  query = query.limit(10)


  // Reset the last visible for a new pagination query
  let lastVisible = null;

  // Get friend requests
  let res = await query.get();
  lastVisible = res.docs[res.docs.length - 1];

  for (const doc of res.docs) {
    notifications.push({ ...doc.data(), id: doc.id });
  }

  return { notifications: notifications, lastVisible: lastVisible } as {
    notifications: Notification[], lastVisible: any
  };

}

export async function getSingleNotification(id) {
  let res = await firestore.collection("notifications_seen").doc(id).get();
  return { ...res.data(), id: res.id };
}

export async function createNotificationSeen(notification) {
  await firestore.collection("notifications_seen").add(notification);
}

export async function checkIfNotificationHasBeenSeen(type, id) {
  let res = await firestore
    .collection("notifications_seen")
    .where("type", "==", type)
    .where("id", "==", id)
    .get();

  if (res.docs.length > 0) {
    return true;
  } else {
    return false;
  }
}

export async function deleteNotification(id) {
  await firestore.collection("notifications_seen").doc(id).delete();
}

export async function rejectFriendRequestOnUserPage(from, to) {
  let res = await firestore
    .collection("notifications_seen")
    .where("userId", "==", to)
    .where("fromUserId", "==", from)
    .where("type", "==", "friend_request")
    .get();

  for (const doc of res.docs) {
    await firestore.collection("notifications_seen").doc(doc.id).delete();
  }
}

export async function acceptFriendRequestNotification(id) {
  await firestore
    .collection("notifications_seen")
    .doc(id)
    .update({ accepted: true });
}

export async function acceptFriendRequestOnUserPage(from, to) {
  let res = await firestore
    .collection("notifications_seen")
    .where("userId", "==", to)
    .where("fromUserId", "==", from)
    .where("type", "==", "friend_request")
    .get();

  for (const doc of res.docs) {
    await firestore
      .collection("notifications_seen")
      .doc(doc.id)
      .update({ accepted: true });
  }
}

// Feed posts

export async function getFeedPostFromId(id) {
  let res = await firestore.collection("notifications").doc(id).get();

  return { ...res.data(), id: res.id };
}

export async function searchProfiles(term) {
  var strSearch = term;
  var strlength = strSearch.length;
  var strFrontCode = strSearch.slice(0, strlength - 1);
  var strEndCode = strSearch.slice(strlength - 1, strSearch.length);

  var startcode = strSearch;
  var endcode =
    strFrontCode + String.fromCharCode(strEndCode.charCodeAt(0) + 1);
  let res2 = await firestore
    .collection("profiles")
    .where("combinedName", ">=", startcode)
    .where("combinedName", "<", endcode)
    .limit(15)
    .get();

  let profiles = [];
  for (const doc of res2.docs) {
    profiles.push({ ...doc.data(), id: doc.id });
  }

  return profiles;
}

export async function returnNotificationIdOfFriendRequest(from, to) {
  console.log("Return from", from);
  console.log("Return to", to);
  let res = await firestore
    .collection("notifications_seen")
    .where("fromUserId", "==", from)
    .where("userId", "==", to)
    .where("type", "==", "friend_request")
    .get();
  console.log("Return res", res);
  return res.docs.length > 0 ? res.docs[0].id : null;
}

export async function readAllNotifications(notifications) {
  const promises = [];
  for (const notification of notifications) {
    if (!notification.seen) {
      const promise = firestore
        .collection("notifications_seen")
        .doc(notification.id)
        .update({ seen: true });

      promises.push(promise);
    }
  }

  await Promise.all(promises);
}
