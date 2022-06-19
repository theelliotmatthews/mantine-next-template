import { auth, firestore } from './firebase';
import { getRecipeById } from './recipes/recipes';
import { createNotification } from './notifications';
import { Collection, Recipe, Snapshot } from './types';
import { firestorePromiseAdd } from './firestore';
import { fetchSingleEntity, getPublicProfileForUser } from './social';

export async function getCollections(userId) {
  const collections = [];

  const query = firestore.collection('collections').where('userId', '==', userId);

  await query.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      doc.data().userId && collections.push({ id: doc.id, ...doc.data() });
    });
  });

  return collections;
}

export async function searchCollections(
  searchTerm: string,
  limit: number,
  startAt: any,
  userId: string
) {
  console.log('Search collections', searchTerm);
  console.log('startAt', startAt);
  // Construct reference
  const collectionRef = firestore.collection('collections');

  // Construct query
  let query: any = collectionRef;

  // Work with the search term
  if (searchTerm.length > 0) {
    const cleanedSearchTerm = searchTerm
      .replace(/['.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .toLowerCase()
      .trim()
      .split(' ');

    // Cycle through cleaned search terms and build query
    cleanedSearchTerm.forEach((word) => {
      const parameter = `search_terms.${word.split(' ').join('_')}`;
      query = query.where(parameter, '==', true);
    });
  }

  // Check for startAfter
  if (startAt) {
    query = query.startAfter(startAt);
  }

  // Add limit
  if (limit) {
    query = query.limit(limit);
  }

  // Add userId
  query = query.where('userId', '==', userId);

  // Reset the last visible for a new pagination query
  let lastVisible = null;

  // Make request and set last visible
  const res = await query.get();
  lastVisible = res.docs[res.docs.length - 1];

  // Push results
  let docs = [];

  // Promises for fetching recipe data
  const promises = [];

  // Make call
  for (const doc of res.docs) {
    const data = doc.data();

    docs.push({ id: doc.id, ...data });

    const promise = getCollectionFeaturedImage(doc.id);
    promises.push(promise);
  }

  console.log('Docs', docs);

  const collectionsWithData = [];
  await Promise.all(promises).then(async (values) => {
    // Match up
    for (const collection of docs) {
      for (const r of values) {
        if (collection.id === r.id) {
          const entity = await fetchSingleEntity('user', collection.userId);

          const newObject = {
            ...collection,
            ...r,
            entity,
          };
          collectionsWithData.push(newObject);
          break;
        }
      }
    }
  });

  console.log('Collections with data', collectionsWithData);
  docs = collectionsWithData;

  // Return
  const results = {
    results: docs,
    lastVisible,
  };

  return results;
}

export async function getCollectionFeaturedImage(collectionId: string) {
  let image = null;

  const res = await firestore
    .collection('user_recipes')
    .where('type', '==', 'collection')
    .where('collectionId', '==', collectionId)
    .orderBy('added', 'desc')
    .limit(1)
    .get();

  if (res.docs.length > 0) {
    const data = res.docs[0].data();
    const recipe = await getRecipeById(data.recipeId);
    image = recipe.image;
  }

  return {
    id: collectionId,
    image,
  };
}

export async function updateCollectionCount(collectionId, increase) {
  // Get current count first
  const res = await firestore.collection('collections').doc(collectionId).get();
  const data = res.data();
  const currentCount = data.count;
  await firestore
    .collection('collections')
    .doc(collectionId)
    .update({ count: increase ? currentCount + 1 : currentCount - 1 });
}

export async function getCollectionCount(collectionId) {
  const res = await firestore.collection('collections').doc(collectionId).get();
  const data = res.data();
  return data.count;
}

export async function getCollectionsWithInfo(userId) {
  const collections = [];
  const collectionsWithData = [];
  //let query = firestore.collection('collections').where('userId', '==', userId)
  const query = firestore
    .collection('collections')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc');

  await query.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      doc.data().userId && collections.push({ ...doc.data(), id: doc.id });
    });
  });

  collections.forEach(async (collection) => {
    // Get the first recipe in the collection to use as featured image
    const res = await firestore
      .collection('user_collection_recipes')
      .where('collectionId', '==', collection.id)
      .orderBy('added', 'desc')
      .limit(1)
      .get();

    const copy = collection;
    if (res.docs[0]) {
      const data = res.docs[0].data();

      const featuredRecipe = await getRecipeById(data.recipeId);
      copy.image = featuredRecipe.image;
    } else {
      copy.image = 'https://i.ibb.co/ZN4rhF0/noimage.png';
    }
    collectionsWithData.push(copy);
  });

  return collectionsWithData;
}

export async function getSingleCollectionWithInfo(collectionId) {
  const res = await firestore.collection('collections').doc(collectionId).get();
  const collection = { ...res.data(), id: res.id } as Collection;
  console.log('Collection here:', collection);
  const userRes = await firestore
    .collection('user_collection_recipes')
    .where('collectionId', '==', collectionId)
    .orderBy('added', 'desc')
    .limit(1)
    .get();
  const userDataRes = await getPublicProfileForUser(collection.userId);
  console.log('User Data Res', userDataRes);

  if (userDataRes) {
    collection.userData = userDataRes;
  }

  if (userRes.docs[0] && userRes.docs[0].exists) {
    const data = userRes.docs[0].data();

    const featuredRecipe = await getRecipeById(data.recipeId);
    collection.image = featuredRecipe.image;
  } else {
    collection.image = 'https://i.ibb.co/ZN4rhF0/noimage.png';
  }

  return collection as Collection;
}

export async function createCollection(userId, title) {
  const searchTerms = {};

  const searchTermsSplit = title
    .replace(/['.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .toLowerCase()
    .trim()
    .split(' ');

  for (const term of searchTermsSplit) {
    searchTerms[term] = true;
  }

  const res = await firestore.collection('collections').add({
    userId,
    title,
    createdAt: new Date(),
    count: 0,
    search_terms: searchTerms,
  });
  return res;
}

export async function getCollection(id: string) {
  try {
    const res = await firestore.collection('collections').doc(id).get();

    if (!res.exists) {
      throw Error('Collection does not exist');
    }

    //console.log('Res.data.recipes', res.data().recipes)

    return {
      id: res.id,
      ...res.data(),
    } as Collection;
  } catch (err) {
    console.warn(err);
  }
}

export async function getSingleCollection(id) {
  try {
    let recipesInCollection = [];
    const res = await firestore.collection('collections').doc(id).get();

    if (!res.exists) {
      throw Error('Collection does not exist');
    }

    //console.log('Res.data.recipes', res.data().recipes)

    if (res.data().recipes) recipesInCollection = res.data().recipes;

    return recipesInCollection;
  } catch (err) {
    console.warn(err);
  }
}

export async function getSingleCollectionWithRecipeData(id) {
  console.log('Collection ID:', id);
  try {
    const recipes = [];
    const res = await firestore.collection('collections').doc(id).get();

    if (!res.exists) {
      throw Error('Collection does not exist');
    }

    const data = res.data();
    const collectionTitle = data.title;

    const promises = [];

    //console.log('Res.data.recipes', res.data().recipes)
    const res2 = await firestore
      .collection('user_collection_recipes')
      .where('collectionId', '==', id)
      .orderBy('added', 'desc')
      .get();

    console.log('res2', res2);
    for (const doc of res2.docs) {
      const res2data = doc.data();

      const promise = getRecipeById(res2data.recipeId);
      promises.push(promise);
    }

    await Promise.all(promises).then((values) => {
      //console.log(values);
      values.forEach((val) => {
        recipes.push(val);
      });
    });

    console.log('Recipes', recipes);

    return { title: collectionTitle, recipes };
  } catch (err) {
    console.warn(err);
  }
}

export async function addRecipeToCollections(userId, recipeId, collectionIds) {
  const recipe = await getRecipeById(recipeId);

  if (!recipe) return;

  // const docs = [];
  // for (const collection of collectionIds) {
  //   docs.push({
  //     uid: userId,
  //     recipeId,
  //     collectionId: collection,
  //     added: new Date(),
  //     recipeTitle: recipe.title,
  //     recipeSearchTerms: recipe.search_terms,
  //   });
  // }

  // await firestorePromiseAdd("user_recipes", docs);

  for (const id of collectionIds) {
    // Check if recipe already in collection
    const res = await firestore
      .collection('user_recipes')
      .where('type', '==', 'collection')
      .where('collectionId', '==', id)
      .where('recipeId', '==', recipeId)
      .get();

    if (!res.docs[0] || !res.docs[0].exists) {
      await firestore.collection('user_recipes').add({
        uid: userId,
        recipeId,
        collectionId: id,
        added: new Date(),
        recipeTitle: recipe.title,
        recipeSearchTerms: recipe.search_terms,
        type: 'collection',
      });
      await updateCollectionCount(id, true);
    } else {
      await firestore.collection('user_recipes').doc(res.docs[0].id).update({ added: new Date() });
    }

    // Check what the current count of the collection is. If it is a multiple of 5 and there hasn't already been a notification sent, send one.
    const collectionCount = await getCollectionCount(id);
    if (collectionCount % 5 == 0) {
      // Now check if the notification has already happened
      const check = (await firestore
        .collection('notifications')
        .where('userId', '==', userId)
        .where('type', '==', 'collection_count')
        .where('collectionCount', '==', collectionCount)
        .get()) as any;
      if (!check.exists) {
        // Create the notification
        await createNotification(null, userId, 'collection_count', null, null, id, collectionCount);
      }
    }
  }
}

export async function removeRecipeFromCollections(userId, recipeId, collectionIds) {
  collectionIds.forEach(async (id) => {
    const res = await firestore
      .collection('user_collection_recipes')
      .where('collectionId', '==', id)
      .where('recipeId', '==', recipeId)
      .get();
    if (res.docs[0]) {
      // Remove from collection
      await firestore.collection('user_collection_recipes').doc(res.docs[0].id).delete();

      // Update count of collection
      await updateCollectionCount(id, false);
    }
  });
}

export async function deleteCollection(id) {
  await firestore.collection('collections').doc(id).delete();
}

export async function fetchCollectionAuthor(id) {
  const res = await firestore.collection('collections').doc(id).get();
  const data = res.data();

  const res2 = await firestore.collection('profiles').doc(data.userId).get();
  console.log('Res2 data author:', res2.data());
  return { ...res2.data(), id: res2.id };
}

export async function checkWhichCollectionsContainRecipe(recipeId, userId) {
  const res = await firestore
    .collection('user_recipes')
    .where('recipeId', '==', recipeId)
    .where('uid', '==', userId)
    .where('type', '==', 'collection')
    .get();

  const collections = [];
  for (const doc of res.docs) {
    const data = doc.data();
    collections.push(data.collectionId);
  }

  return collections;
}

export async function updateCollectionTitle(id: string, title: string) {
  await firestore.collection('collections').doc(id).update({ title });
}
