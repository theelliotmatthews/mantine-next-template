import { auth, firestore } from './firebase';
import { getPage } from './pages';
import { Comment, Entity, Notification, Post, Profile } from './types';
import { getVenueById } from './venues';

export async function getPublicProfileForUser(id) {
  const res = await firestore.collection('profiles').doc(id).get();
  const data = res.data();

  return { ...data, id: res.id } as Profile;
}

export async function fetchEntities(type: string, userId: string, startAfter: any, limit: number) {
  // // console.log("Fetching entities", type, userId);

  let results = {};

  if (type === 'friends') {
    const friends = [];
    const friendIds = [];

    let query = firestore
      .collection('friends')
      .where('users', 'array-contains', userId)
      .where('accepted', '==', true)
      .orderBy('createdAt', 'desc');

    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const res = await query.get();
    // Reset the last visible for a new pagination query
    let lastVisible = null;
    lastVisible = res.docs[res.docs.length - 1];

    for (const doc of res.docs) {
      const data = doc.data();

      //// console.log('Each friend data:', data)
      const friendId = data.users.filter((id) => id !== userId);
      friends.push(friendId[0]);
      friendIds.push(friendId[0]);
    }

    let friendsWithData = [];
    const promises = [];
    for (const friend of friends) {
      const promise = getPublicProfileForUser(friend);
      promises.push(promise);
    }

    await Promise.all(promises).then((values) => {
      values.forEach((value) => {
        friendsWithData.push({
          name: `${value.firstName && value.firstName}${value.lastName && ` ${value.lastName}`}`,
          image: value.image,
          href: `/user/${value.id}`,
          id: value.id,
          type: 'user',
        });
      });
    });

    if (!limit) {
      friendsWithData = friendsWithData.sort((a, b) =>
        a.name < b.name ? -1 : a.name > b.name ? 1 : 0
      );
    }

    results = {
      results: friendsWithData,
      lastVisible,
    };
  } else if (type === 'followers' || type === 'following') {
    const following = [];
    const followingIds = [];

    let query = firestore
      .collection('following')
      .where(type === 'followers' ? 'following' : 'followedBy', '==', userId)
      .orderBy('createdAt', 'desc');

    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const res = await query.get();
    // Reset the last visible for a new pagination query
    let lastVisible = null;
    lastVisible = res.docs[res.docs.length - 1];

    for (const doc of res.docs) {
      const data = doc.data();

      following.push(data);
      followingIds.push(type === 'followers' ? data.followedBy : data.following);
    }

    let followsWithData = [];
    const promises = [];
    for (const id of followingIds) {
      const promise = getPublicProfileForUser(id);
      promises.push(promise);
    }

    await Promise.all(promises).then((values) => {
      values.forEach((value) => {
        followsWithData.push({
          name: `${value.firstName && value.firstName}${value.lastName && ` ${value.lastName}`}`,
          image: value.image,
          href: `/user/${value.id}`,
          id: value.id,
          type: 'user',
        });
      });
    });

    if (!limit) {
      followsWithData = followsWithData.sort((a, b) =>
        a.name < b.name ? -1 : a.name > b.name ? 1 : 0
      );
    }

    results = {
      results: followsWithData,
      lastVisible,
    };
  } else if (type === 'followingPages' || type === 'followingVenues') {
    const following = [];
    const followingIds = [];

    let query = firestore
      .collection('following_pages')
      .where('type', '==', type === 'followingPages' ? 'page' : 'venue')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc');

    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const res = await query.get();
    // Reset the last visible for a new pagination query
    let lastVisible = null;
    lastVisible = res.docs[res.docs.length - 1];

    for (const doc of res.docs) {
      const data = doc.data();
      // console.log("Each data", data);

      followingIds.push(type === 'followingPages' ? data.pageId : data.venueId);
    }

    // console.log(type, followingIds);

    let followsWithData = [];
    const promises = [];
    for (const id of followingIds) {
      const promise = type === 'followingPages' ? getPage(id) : getVenueById(id);
      promises.push(promise);
    }

    // console.log("Promises", promises);

    await Promise.all(promises).then((values) => {
      // console.log("Values", values);
      values.forEach((value) => {
        followsWithData.push({
          name: value.name,
          image: value.profilePhoto,
          href: `/${type === 'followingPages' ? 'pages' : 'venues'}/${value.id}`,
          id: value.id,
          type: type === 'followingPages' ? 'page' : 'venue',
        });
      });
    });

    if (!limit) {
      followsWithData = followsWithData.sort((a, b) =>
        a.name < b.name ? -1 : a.name > b.name ? 1 : 0
      );
    }

    results = {
      results: followsWithData,
      lastVisible,
    };
  } else if (type === 'managedPages' || type === 'managedVenues') {
    const following = [];
    const followingIds = [];

    let query = firestore
      .collection(type === 'managedPages' ? 'page_admins' : 'venue_admin')
      .where('admins', 'array-contains', userId);

    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const res = await query.get();
    // Reset the last visible for a new pagination query
    let lastVisible = null;
    lastVisible = res.docs[res.docs.length - 1];

    for (const doc of res.docs) {
      followingIds.push(doc.id);
    }

    // console.log(type, followingIds);

    let followsWithData = [];
    const promises = [];
    for (const id of followingIds) {
      const promise = type === 'managedPages' ? getPage(id) : getVenueById(id);
      promises.push(promise);
    }

    await Promise.all(promises).then((values) => {
      values.forEach((value) => {
        followsWithData.push({
          name: value.name,
          image: value.profilePhoto,
          href: `/${type === 'managedPages' ? 'pages' : 'venues'}/${value.id}`,
          id: value.id,
          type: type === 'managedPages' ? 'page' : 'venue',
        });
      });
    });

    if (!limit) {
      followsWithData = followsWithData.sort((a, b) =>
        a.name < b.name ? -1 : a.name > b.name ? 1 : 0
      );
    }

    results = {
      results: followsWithData,
      lastVisible,
    };
  }

  return results as {
    results: Profile[];
    lastVisible: any;
  };
}

export async function fetchAllFollowing(userId: string, managedOnly?: boolean) {
  const following = [];

  // Add in this user as well
  const currentUser = await getPublicProfileForUser(userId);
  following.push({
    name: `${currentUser.firstName && currentUser.firstName}${
      currentUser.lastName && ` ${currentUser.lastName}`
    }`,
    image: currentUser.image,
    href: `/user/${currentUser.id}`,
    id: currentUser.id,
    type: 'user',
  });

  const promises = [];

  if (!managedOnly) {
    const friendsPromise = fetchEntities('friends', userId, null, null);
    promises.push(friendsPromise);

    const followingPromise = fetchEntities('following', userId, null, null);
    promises.push(followingPromise);

    const venuePromise = fetchEntities('followingVenues', userId, null, null);
    promises.push(venuePromise);

    const pagePromise = fetchEntities('followingPages', userId, null, null);
    promises.push(pagePromise);
  }

  const venueManagedPromise = fetchEntities('managedPages', userId, null, null);
  promises.push(venueManagedPromise);

  const pageManagedPromise = fetchEntities('managedVenues', userId, null, null);
  promises.push(pageManagedPromise);

  await Promise.all(promises).then((values) => {
    values.forEach((value) => {
      value.results.forEach((result) => {
        if (!following.find((x) => x.id === result.id && x.type === result.type)) {
          following.push(result);
        }
      });
    });
  });

  return following;
}

export async function fetchPostsFromEntity(
  id: string,
  type: string,
  startDate: Date,
  endDate: Date
) {
  const posts = [];

  const res = await firestore
    .collection('notifications')
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .where(type === 'page' ? 'pageSource' : type === 'venue' ? 'venueSource' : 'userId', '==', id)
    .get();

  //let res = await firestore.collection('notifications').where('createdAt', '<=', new Date()).where('userId', '==', friendId).get()
  let allowComments = true;

  // Fetch users profile info to check if comments are allowed
  if (res.docs.length > 0 && type === 'user') {
    const profile = await getPublicProfileForUser(id);
    if (!profile.allowFollowersToComment) allowComments = false;
  }

  for (const doc of res.docs) {
    const data = doc.data();
    if (data.type === 'post') console.log(data);
    posts.push({ ...doc.data(), id: doc.id, allowComments });
  }

  return posts;
}

export async function fetchPostsFromFollowing(following: Entity[], startDate: Date, endDate: Date) {
  console.log('Start date', startDate);
  console.log('End date', endDate);
  const promises = [];

  for (const entity of following) {
    const promise = fetchPostsFromEntity(entity.id, entity.type, startDate, endDate);

    promises.push(promise);
  }

  let posts = [];
  await Promise.all(promises).then((values) => {
    values.forEach((user) => {
      user.forEach((post) => {
        if (post.type === 'post') console.log('POST:', post);
        let entityData = {};
        for (const entity of following) {
          if (
            (entity.type === 'user' && post.userId === entity.id) ||
            (entity.type === 'venue' && post.venueSource === entity.id) ||
            (entity.type === 'page' && post.pageSource === entity.id)
          ) {
            entityData = entity;
          }
        }

        posts.push({ ...post, entityData });
      });
    });
  });

  posts = posts
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0))
    .reverse();

  console.log('Posts', posts);
  return posts;
}

export async function fetchSingleEntity(type: string, id: string) {
  // console.log(`Type: ${type}  --  Id: ${id}`);
  let entity = {};

  if (type === 'page') {
    const value: any = await getPage(id);
    entity = {
      name: value.name,
      image: value.profilePhoto,
      href: `/pages/${value.id}`,
      id: value.id,
      type: 'page',
    };
  } else if (type === 'user') {
    const value: any = await getPublicProfileForUser(id);
    entity = {
      name: `${value.firstName && value.firstName}${value.lastName && ` ${value.lastName}`}`,
      image: value.image,
      href: `/user/${value.id}`,
      id: value.id,
      type: 'user',
    };
  } else if (type === 'venue') {
    const value: any = await getVenueById(id);
    entity = {
      name: value.name,
      image: value.profilePhoto,
      href: `/venue/${value.id}`,
      id: value.id,
      type: 'venue',
    };
  }

  return entity as Entity;
}

export async function createPost(post: { image?: string; text?: string }, entity: Entity) {
  // console.log('Entity', entity);
  const p: any = {
    post,
    createdAt: new Date(),
    sourceId: entity.id,
    sourceType: entity.type,
    type: 'post',
    recipeId: null,
  };

  if (entity.type === 'page') {
    p.pageSource = entity.id;
  } else if (entity.type === 'user') {
    p.userId = entity.id;
  } else if (entity.type === 'venue') {
    p.venueSource = entity.id;
  }

  console.log('Post into DB', p);
  await firestore.collection('notifications').add(p);
}

export async function commentOnNotification(
  notificationId,
  fromEntityId,
  comment,
  repliedToComment,
  postOwnerId,
  postOwnerType,
  fromEntityType
) {
  const obj: Comment = {
    notificationId,
    entityId: fromEntityId,
    entityType: fromEntityType,
    createdAt: new Date(),
    comment,
    repliedToComment,
    sourceType: postOwnerType,
    sourceId: fromEntityId,
  };

  console.log('Comment Object', obj);

  const res = await firestore.collection('notification_comments').add(obj);

  if (fromEntityId !== postOwnerId) {
    const seen: Notification = {
      type: repliedToComment ? 'comment_reply' : 'comment',
      actionId: res.id,
      seen: false,
      createdAt: new Date(),
      toEntityType: postOwnerType,
      toEntityId: postOwnerId,
      fromEntityType,
      fromEntityId,
    };

    // if (sourceType === "user") {
    //   seen.userId = postOwnerId;
    // } else if (sourceType === "page") {
    //   seen.pageId = postOwnerId;
    // } else if (sourceType === "venue") {
    //   seen.venueId = postOwnerId;
    // }

    console.log('Seen', seen);
    await firestore.collection('notifications_seen').add(seen);
  }
}

export async function getCommentsForNotification(notificationId) {
  const comments = [];
  const res = await firestore
    .collection('notification_comments')
    .where('notificationId', '==', notificationId)
    .where('repliedToComment', '==', false)
    .orderBy('createdAt')
    .get();
  //let res = await firestore.collection('notifications').where('createdAt', '<=', new Date()).where('userId', '==', friendId).get()

  for (const doc of res.docs) {
    comments.push({ ...doc.data(), id: doc.id });
  }

  return comments;
}

export async function getRepliesForComment(commentId) {
  const replies = [];
  const res = await firestore
    .collection('notification_comments')
    .where('repliedToComment', '==', commentId)
    .orderBy('createdAt')
    .get();
  //let res = await firestore.collection('notifications').where('createdAt', '<=', new Date()).where('userId', '==', friendId).get()

  for (const doc of res.docs) {
    replies.push({ ...doc.data(), id: doc.id });
  }

  return replies;
}

export async function deleteComment(id) {
  await firestore.collection('notification_comments').doc(id).delete();

  const res = await firestore
    .collection('notifications_seen')
    .where('type', '==', 'comment')
    .where('actionId', '==', id)
    .get();

  if (res.docs.length > 0) {
    await firestore.collection('notifications_seen').doc(res.docs[0].id).delete();
  }
}

export async function getOrignalPostIdOfComment(commentId) {
  const res = await firestore.collection('notification_comments').doc(commentId).get();

  const data = res.data();
  return data.notificationId;
}
