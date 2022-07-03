/* eslint-disable no-restricted-syntax */
import { KeyObject } from 'crypto';
import { Dice } from 'tabler-icons-react';
import firebase from 'firebase';
import { isFuture, isToday } from 'date-fns';
import { auth, firestore } from '../firebase';
import { createNotification, createNotificationSeen } from '../notifications';
import { getRecipeById } from '../recipes/recipes';
import { fetchSingleEntity } from '../social';
import { CollaborativePlanner, Recipe, UserProfile } from '../types';

export async function getAllCollaborativePlanners(
  userId: string,
  invitesOnly: boolean,
  collaborativeOnly: boolean,
  favourites: boolean
) {
  const plannerIds = [];
  let planners = [];

  if (favourites) {
    try {
      const res = await firestore
        .collection('collaborative_planner_favourites')
        .where('uid', '==', userId)
        .orderBy('created', 'desc')
        .get();

      for (const doc of res.docs) {
        const data = doc.data();
        plannerIds.push({ plannerId: data.plannerId, inviteId: doc.id });
      }
    } catch (e) {
      console.warn("Can't get collab planner invites", e);
    }
  } else {
    try {
      console.log('Trying here');
      const res = await firestore
        .collection('collaborative_planner_invites')
        .where('accepted', '==', !invitesOnly)
        .where('requestTo', '==', userId)
        .orderBy('created', 'desc')
        .get();

      for (const doc of res.docs) {
        console.log('Doc', doc.data());
        const data = doc.data();

        plannerIds.push({ plannerId: data.plannerId, inviteId: doc.id });
      }
    } catch (e) {
      console.warn("Can't get collab planner invites", e);
    }
  }

  try {
    const promises = [];
    for (const planner of plannerIds) {
      const promise = getCollaborativePlannerById(planner);
      promises.push(promise);
    }

    await Promise.all(promises).then((values) => {
      // console.log('Each value', value);
      values.forEach((value) => {
        if (value) planners.push(value);
      });
      // planners = [...values];
    });
  } catch (e) {
    console.warn("Can't get collab planner info", e);
  }

  if (collaborativeOnly) {
    planners = planners.filter((planner) => planner.collaborative || planner.createdBy == userId);
  }

  return planners;
}

export async function getCollaborativePlannerById(
  planner: CollaborativePlanner | string,
  idOnly?: string
) {
  try {
    const res = await firestore
      .collection('collaborative_planners')
      .doc(idOnly ? planner : planner.plannerId)
      .get();

    const data = res.data();
    const promises = [];
    for (const user of data.users) {
      const promise = fetchSingleEntity('user', user);
      promises.push(promise);
    }

    const usersWithData: UserProfile[] = [];
    await Promise.all(promises).then((values) => {
      values.forEach((value) => {
        if (value.name) usersWithData.push(value);
      });
    });

    console.log('Data GOT');

    return res.exists
      ? { ...res.data(), id: res.id, inviteId: planner.inviteId, usersWithData }
      : null;
  } catch (e) {
    console.warn('Error getting collaboraitve planner by ID', e);
    return null;
  }
}

export async function getRecipesInPlanner(
  userId: string,
  weekStart: Date,
  weekEnd: Date,
  loadRecipeData?: boolean,
  collaborativePlannerId?: string
) {
  const plannerRef = firestore.collection('planner');

  let query: any = plannerRef;

  query = query.where('date', '>=', weekStart).where('date', '<=', weekEnd).orderBy('date', 'asc');

  if (collaborativePlannerId) {
    query = query.where('plannerId', '==', collaborativePlannerId);
  } else {
    query = query.where('createdBy', '==', userId).where('collaborative', '==', false);
  }

  const planner = [];
  const res = await query.get();
  for (const doc of res.docs) {
    const data = doc.data();
    data.date = data.date.toDate();
    if (collaborativePlannerId) {
      data.collaborativePlannerId = collaborativePlannerId;
    }
    planner.push({ ...data, id: doc.id });
  }

  if (loadRecipeData) {
    const promises = [];

    const plannerRecipes = [];

    planner.forEach((recipe) => {
      const promise = getRecipeById(recipe.meal.id);
      promises.push(promise);
    });

    await Promise.all(promises).then((values) => {
      // Match up
      for (const recipe of planner) {
        for (const r of values) {
          if (recipe.meal.id === r.id) {
            const newObject = {
              plannerData: recipe,
              ...r,
            };
            plannerRecipes.push(newObject);
            break;
          }
        }
      }
    });

    return plannerRecipes;
  }

  return planner;
}

export async function removeRecipeFromPlanner(id: string) {
  await firestore.collection('planner').doc(id).delete();

  // if (updateOrderOfRemainingRecipes) {
  //   // Get recipes that are higher than this order on the same day
  //   const recipes = await getRecipesToReorderOnDate(
  //     recipe.plannerData.date,
  //     recipe.plannerData.collaborativePlannerId,
  //     userId,
  //     recipe.plannerData.order
  //   );

  //   const promises = [];
  //   for (const rec of recipes) {
  //     const promise = updatePlannerRecipe(rec.id, {
  //       order: rec.order - 1,
  //     });
  //     promises.push(promise);
  //   }

  //   await Promise.all(promises);
  // }
}

export async function updatePlannerRecipe(id, update) {
  await firestore.collection('planner').doc(id).update(update);
}

export async function getNumberOfRecipesOnDate(date, collaborativePlannerId, userId) {
  console.log('Date', date);
  console.log('collaborativePlannerId', collaborativePlannerId);
  console.log('userId', userId);
  const startToday = new Date(date);
  const endToday = new Date(date);
  // Set up start date
  startToday.setHours(0);
  startToday.setMinutes(0);
  startToday.setSeconds(0);
  // Set up end date
  endToday.setHours(23);
  endToday.setMinutes(59);
  endToday.setSeconds(59);

  const plannerRef = firestore.collection('planner');

  let query: any = plannerRef;

  console.log('Start', startToday);
  console.log('End', endToday);

  query = query.where('date', '>=', startToday).where('date', '<=', endToday);
  // .orderBy("date", "asc");

  if (collaborativePlannerId) {
    query = query.where('plannerId', '==', collaborativePlannerId);
  } else {
    console.log('Created query');
    query = query.where('createdBy', '==', userId);
  }

  const res = await query.get();
  console.log('Res', res);

  return res.docs.length;
}

// Reorder any recipes that are higher than the recipe we are deleting
export async function getRecipesToReorderOnDate(date, collaborativePlannerId, userId, order) {
  const startToday = date;
  const endToday = date;
  // Set up start date
  startToday.setHours(0);
  startToday.setMinutes(0);
  startToday.setSeconds(0);
  // Set up end date
  endToday.setHours(23);
  endToday.setMinutes(59);
  endToday.setSeconds(59);

  const plannerRef = firestore.collection('planner');

  let query: any = plannerRef;

  query = query
    .where('date', '>=', startToday)
    .where('date', '<=', endToday)
    .orderBy('date', 'asc');

  if (collaborativePlannerId) {
    query = query.where('plannerId', '==', collaborativePlannerId);
  } else {
    query = query.where('createdBy', '==', userId);
  }

  const res = await query.get();
  const recipes = [];
  for (const doc of res.docs) {
    const data = doc.data();

    if (data.order > order) recipes.push({ id: doc.id, ...doc.data() });
  }

  return recipes;
}

export async function updateOrderOfRecipesInVisiblePlanner(visibleWeek, skipRecipe?: string) {
  // console.log('Inside');
  const promises = [];

  Object.keys(visibleWeek).forEach((key) => {
    // console.log(key, visibleWeek[key]);
    visibleWeek[key].recipes.forEach((recipe, index) => {
      // console.log(`Index ${index}: ${recipe.title}`);
      // console.log('Recipe', recipe);
      // if (recipe.plannerData.id !== skipRecipe) {
      const promise = firestore.collection('planner').doc(recipe.plannerData.id).update({
        order: index,
        date: visibleWeek[key].date,
      });
      promises.push(promise);
      // }
    });
  });

  try {
    await Promise.all(promises).then(async (values) => {
      console.log('Values', values);
    });
  } catch (e) {
    console.log('Errors with promise all', e);
  }

  // Object.entries(visibleWeek).forEach((key) => {
  //   visibleWeek[key].recipes.forEach((recipe, index) => {
  //     console.log(`Index ${index}: ${recipe.title}`);
  //   });
  // });
}

export async function checkIfPlannerIsFavourite(id: string, userId: string) {
  const res = await firestore
    .collection('collaborative_planner_favourites')
    .where('uid', '==', userId)
    .where('plannerId', '==', id)
    .get();

  return res.docs.length > 0 ? { ...res.docs[0].data(), id: res.docs[0].id } : false;
}

export async function toggleFavouritePlanner(id: string, userId: string) {
  const isFavourite = await checkIfPlannerIsFavourite(id, userId);

  if (isFavourite) {
    await firestore.collection('collaborative_planner_favourites').doc(isFavourite.id).delete();
  } else {
    await firestore.collection('collaborative_planner_favourites').add({
      created: new Date(),
      plannerId: id,
      uid: userId,
    });
  }

  return !isFavourite;
}

export async function updateCollaborativePlanner(
  id: string,
  data: { title: string; collaborative: boolean }
) {
  await firestore.collection('collaborative_planners').doc(id).update(data);
}

export async function deleteCollaborativePlanner(id: string) {
  console.log('Deleting with ID', id);

  try {
    const invitesRes = await firestore
      .collection('collaborative_planner_invites')
      .where('plannerId', '==', id)
      .get();
    for (const doc of invitesRes.docs) {
      console.log(`Delete invite doc with id: ${doc.id}`);
      await firestore.collection('collaborative_planner_invites').doc(doc.id).delete();
    }
    if (!invitesRes.docs) console.log('NO INVITE RES DOCS');
  } catch (e) {
    console.error('Cant delete from invites', e);
  }

  try {
    const favouriteRes = await firestore
      .collection('collaborative_planner_favourites')
      .where('plannerId', '==', id)
      .get();
    for (const doc of favouriteRes.docs) {
      console.log(`Delete favourite doc with id: ${doc.id}`);
      await firestore.collection('collaborative_planner_favourites').doc(doc.id).delete();
    }
    if (!favouriteRes.docs) console.log('NO FAVOURITE RES DOCS');
  } catch (e) {
    console.error('Cant delete from favourites', e);
  }

  await firestore.collection('collaborative_planners').doc(id).delete();
}

export async function createCollaborativePlanner(data: CollaborativePlanner) {
  const res = await firestore.collection('collaborative_planners').add(data);
  await firestore.collection('collaborative_planner_invites').add({
    accepted: true,
    created: new Date(),
    plannerId: res.id,
    requestFrom: data.createdBy,
    requestTo: data.createdBy,
    users: data.users,
  });
}

export async function clearVisibleWeekOfPlanner(ids: string[]) {
  const promises: any[] = [];

  ids.forEach((id) => {
    const promise = firestore.collection('planner').doc(id).delete();
    promises.push(promise);
  });

  await Promise.all(promises);
}

export async function inviteFriendToPlanner(userId: string, friendId: string, plannerId: string) {
  const doc = {
    accepted: false,
    created: new Date(),
    plannerId,
    requestFrom: userId,
    requestTo: friendId,
    users: [userId, friendId],
  };

  await firestore.collection('collaborative_planner_invites').add(doc);
  await firestore
    .collection('collaborative_planners')
    .doc(plannerId)
    .update({
      invited: firebase.firestore.FieldValue.arrayUnion(friendId),
    });
  await createNotificationSeen({
    actionId: plannerId,
    createdAt: new Date(),
    fromEntityId: userId,
    toEntityId: friendId,
    fromEntityType: 'user',
    toEntityType: 'user',
    seen: false,
    type: 'collaborative_planner_invite',
  });
}

export async function getCollaborativePlannerInvites(plannerId: string) {
  const invited = [];
  const accepted = [];

  const res = await firestore
    .collection('collaborative_planner_invites')
    .where('plannerId', '==', plannerId)
    .get();
  for (const doc of res.docs) {
    const data = doc.data();

    if (data.accepted) {
      accepted.push(data.requestTo);
    } else {
      invited.push(data.requestTo);
    }
  }

  return {
    invited,
    accepted,
  };
}

export async function respondToCollaborativePlannerInvite(
  inviteId: string,
  accept: boolean,
  plannerId: string,
  userId: string
) {
  if (accept) {
    try {
      await firestore
        .collection('collaborative_planner_invites')
        .doc(inviteId)
        .update({ accepted: true });
    } catch (e) {
      console.warn('Error updating collaborative_planner_invites: response: ', accept, e);
    }
    try {
      console.log('Planner iD', plannerId);
      await firestore
        .collection('collaborative_planners')
        .doc(plannerId)
        .update({
          users: firebase.firestore.FieldValue.arrayUnion(userId),
          invited: firebase.firestore.FieldValue.arrayRemove(userId),
        });
    } catch (e) {
      console.warn('Error updating collaborative_planners: response: ', accept, e);
    }
  } else {
    try {
      await firestore.collection('collaborative_planner_invites').doc(inviteId).delete();
      await firestore
        .collection('collaborative_planners')
        .doc(plannerId)
        .update({
          invited: firebase.firestore.FieldValue.arrayRemove(userId),
          users: firebase.firestore.FieldValue.arrayRemove(userId),
        });
    } catch (e) {
      console.warn('Error updating collaborative_planners: response: ', accept, e);
    }
  }
}

export async function leaveCollaborativePlanner(userId: string, plannerId: string) {
  // Get invite ID first
  const res = await firestore
    .collection('collaborative_planner_invites')
    .where('plannerId', '==', plannerId)
    .where('requestTo', '==', userId)
    .get();
  const inviteId = res.docs[0].id;
  console.log('Invited ID', inviteId);

  await respondToCollaborativePlannerInvite(inviteId, false, plannerId, userId);
}

export async function checkIfRecipeIsInMealPlan(uid, recipeId) {
  console.log(`Checking if recipe is in meal plan with uid: ${uid} and recipe ID: ${recipeId}`);

  const upcomingRecipes = [];

  // Get users planner first
  const query = firestore
    .collection('planner')
    .where('createdBy', '==', uid)
    .where('meal.id', '==', recipeId)
    .orderBy('date');

  await query.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Data', data);
      if (isToday(data.date.toDate()) || isFuture(data.date.toDate())) {
        //console.log('Recipe future or today')
        upcomingRecipes.push({ ...doc.data(), id: doc.id });
      }
    });
  });

  // Check in any shared planners

  const collaborativePlanners = await getAllCollaborativePlanners(uid, false, false, false);

  for (const planner of collaborativePlanners) {
    //console.log('PLANNER', planner)
    //console.log('Planner ID', planner.id)

    // Get users planner first
    const q = firestore
      .collection('planner')
      .where('plannerId', '==', planner.id)
      .where('meal.id', '==', recipeId);

    await q.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (isToday(data.date.toDate()) || isFuture(data.date.toDate())) {
          //console.log('Recipe future or today')
          upcomingRecipes.push({
            ...doc.data(),
            id: doc.id,
            planner,
          });
        }
      });
    });
  }

  //console.log('Upcoming recipes:', upcomingRecipes)

  return upcomingRecipes;
}
