import { auth, firestore } from "../firebase";
import { getRecipeById } from "../recipes/recipes";

export async function getAllCollaborativePlanners(
  userId,
  invitesOnly,
  collaborativeOnly,
  favourites
) {
  let plannerIds = [];
  let planners = [];

  if (favourites) {
    try {
      let res = await firestore
        .collection("collaborative_planner_favourites")
        .where("uid", "==", userId)
        .orderBy("created", "desc")
        .get();

      for (const doc of res.docs) {
        let data = doc.data();
        plannerIds.push({ plannerId: data.plannerId, inviteId: doc.id });
      }
    } catch (e) {
      console.warn("Can't get collab planner invites", e);
    }
  } else {
    try {
      let res = await firestore
        .collection("collaborative_planner_invites")
        .where("accepted", "==", invitesOnly ? false : true)
        .where("requestTo", "==", userId)
        .orderBy("created", "desc")
        .get();

      for (const doc of res.docs) {
        let data = doc.data();

        plannerIds.push({ plannerId: data.plannerId, inviteId: doc.id });
      }
    } catch (e) {
      console.warn("Can't get collab planner invites", e);
    }
  }

  try {
    let promises = [];
    for (const planner of plannerIds) {
      const promise = getCollaborativePlannerById(planner);
      promises.push(promise);
    }

    await Promise.all(promises).then((values) => {
      planners = [...values];
    });
  } catch (e) {
    console.warn("Can't get collab planner info", e);
  }

  if (collaborativeOnly) {
    planners = planners.filter((planner) => {
      return planner.collaborative || planner.createdBy == userId;
    });
  }

  return planners;
}

export async function getCollaborativePlannerById(planner) {
  let res = await firestore
    .collection("collaborative_planners")
    .doc(planner.plannerId)
    .get();

  return res.exists
    ? { ...res.data(), id: res.id, inviteId: planner.inviteId }
    : null;
}

export async function getRecipesInPlanner(
  collaborativePlannerId: string,
  userId: string,
  weekStart: Date,
  weekEnd: Date,
  loadRecipeData?: boolean
) {
  const plannerRef = firestore.collection("planner");

  let query: any = plannerRef;

  query = query
    .where("date", ">=", weekStart)
    .where("date", "<=", weekEnd)
    .orderBy("date", "asc");

  if (collaborativePlannerId) {
    query = query.where("plannerId", "==", collaborativePlannerId);
  } else {
    query = query.where("createdBy", "==", userId);
  }

  let planner = [];
  const res = await query.get();
  for (const doc of res.docs) {
    let data = doc.data();
    data.date = data.date.toDate();
    if (collaborativePlannerId)
      data.collaborativePlannerId = collaborativePlannerId;
    planner.push({ ...data, id: doc.id });
  }

  if (loadRecipeData) {
    let promises = [];

    let plannerRecipes = [];

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

export async function removeRecipeFromPlanner(
  id,
  updateOrderOfRemainingRecipes?: any,
  recipe?: any,
  userId?: any
) {
  const res = await firestore.collection("planner").doc(id).delete();

  if (updateOrderOfRemainingRecipes) {
    // Get recipes that are higher than this order on the same day
    const recipes = await getRecipesToReorderOnDate(
      recipe.plannerData.date,
      recipe.plannerData.collaborativePlannerId,
      userId,
      recipe.plannerData.order
    );

    const promises = [];
    for (const rec of recipes) {
      const promise = updatePlannerRecipe(rec.id, {
        order: rec.order - 1,
      });
      promises.push(promise);
    }

    await Promise.all(promises);
  }
}

export async function updatePlannerRecipe(id, update) {
  await firestore.collection("planner").doc(id).update(update);
}

export async function getNumberOfRecipesOnDate(
  date,
  collaborativePlannerId,
  userId
) {
  console.log("Date", date);
  console.log("collaborativePlannerId", collaborativePlannerId);
  console.log("userId", userId);
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

  const plannerRef = firestore.collection("planner");

  let query: any = plannerRef;

  console.log("Start", startToday);
  console.log("End", endToday);

  query = query.where("date", ">=", startToday).where("date", "<=", endToday);
  // .orderBy("date", "asc");

  if (collaborativePlannerId) {
    query = query.where("plannerId", "==", collaborativePlannerId);
  } else {
    console.log("Created query");
    query = query.where("createdBy", "==", userId);
  }

  const res = await query.get();
  console.log("Res", res);

  return res.docs.length;
}

// Reorder any recipes that are higher than the recipe we are deleting
export async function getRecipesToReorderOnDate(
  date,
  collaborativePlannerId,
  userId,
  order
) {
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

  const plannerRef = firestore.collection("planner");

  let query: any = plannerRef;

  query = query
    .where("date", ">=", startToday)
    .where("date", "<=", endToday)
    .orderBy("date", "asc");

  if (collaborativePlannerId) {
    query = query.where("plannerId", "==", collaborativePlannerId);
  } else {
    query = query.where("createdBy", "==", userId);
  }

  const res = await query.get();
  let recipes = [];
  for (const doc of res.docs) {
    const data = doc.data();

    if (data.order > order) recipes.push({ id: doc.id, ...doc.data() });
  }

  return recipes;
}
