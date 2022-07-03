import { auth, firestore } from '../firebase';
import { fetchIngredientData } from '../ingredients/ingredients';
import { IngredientFormatted, Recipe } from '../types';

export async function checkRecipeStatus(userId: string, recipeId: string) {
  const status = {
    cooked: false,
    saved: false,
  };

  const res = await firestore
    .collection('user_recipes')
    .where('uid', '==', userId)
    .where('recipeId', '==', recipeId)
    .get();
  for (const doc of res.docs) {
    const data = doc.data();
    status[data.type] = true;
  }

  return status;
}

// Check if any document exists in any collection, given an array of parameters
export async function checkIfDocumentExists(
  collection: string,
  parameters: {
    field: string;
    check: string;
    value: string;
  }[]
) {
  // Construct reference
  const ref = firestore.collection(collection);

  // Construct query
  let query: any = ref;

  // console.log('Parameters', parameters);
  for (const p of parameters) {
    query = query.where(p.field, p.check, p.value);
  }

  const res = await query.get();
  // console.log('Res', res);
  if (res.docs.length > 0) {
    return res.docs[0].id;
  }
  return false;

  console.log(res);
}

// Delete a document from a collection with a specific ID
export async function deleteFromCollection(collection: string, id: string) {
  try {
    await firestore.collection(collection).doc(id).delete();
  } catch (e) {
    console.warn('Cant delete from collection', e);
  }
}

// Add a document to a collection with a given payload
export async function addDocumentToCollection(collection: string, payload: any, id?: string) {
  if (id) {
    const res = await firestore.collection(collection).doc(id).set(payload);
    return res;
  }
  const res = await firestore.collection(collection).add(payload);
  return res.id;
}

// For toggling the status of a recipe
export async function toggleRecipeStatus(type: string, userId: string, recipe: any) {
  const collection = 'user_recipes';
  // console.log('Type', type);
  // console.log('userId', userId);
  // console.log('recipe', recipe);
  // Check current status
  const exists = await checkIfDocumentExists(collection, [
    { field: 'type', check: '==', value: type },
    { field: 'uid', check: '==', value: userId },
    { field: 'recipeId', check: '==', value: recipe.id },
  ]);

  console.log('Exists', exists);
  if (exists) {
    await deleteFromCollection(collection, exists);
  } else {
    // Construct payload containing added at date, recipeId, recipeSearchTerms, recipeTitle
    const payload = {
      added: new Date(),
      uid: userId,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      recipeSearchTerms: recipe.search_terms,
      type,
    };

    if (type === 'viewed') {
      payload.views = 1;
    }

    console.log('Payload test', payload);

    const docId = await addDocumentToCollection(collection, payload);
    console.log('Added docId', docId);
  }

  return !exists;
}

// Fetch creator data
export async function fetchRecipeCreatorData(id: string, type: string) {
  let data = {};
  if (type === 'channel') {
    const res = await firestore.collection('all_channels').doc(id).get();
    data = { id: res.id, ...res.data() };
  } else if (type === 'user') {
    const res = await firestore.collection('profiles').doc(id).get();
    data = { id: res.id, ...res.data() };
  }

  return data;
}

// Get recipe by ID
export async function getRecipeById(id: string) {
  const res = await firestore.collection('all_recipes').doc(id).get();
  if (!res.exists) {
    return null;
  }

  const data: Recipe | any = res.data();
  // console.log('Recipe data', data);
  data.servingsAdjusted = data.servings ? data.servings : 1;

  const creatorData = await fetchRecipeCreatorData(data.channel, data.custom ? 'user' : 'channel');

  return {
    id: res.id,
    ...data,
    creator: creatorData,
  } as Recipe;
}

export async function fetchDataForIngredients(ingredients: IngredientFormatted[]) {
  const ingredientsWithData = [...ingredients];

  const promises = [];
  for (const ingredient of ingredients) {
    const promise = fetchIngredientData(ingredient.ingredient);
    promises.push(promise);
  }

  await Promise.all(promises).then((values) => {
    // console.log('VALUES', values);
    for (const ingredient of ingredientsWithData) {
      for (const value of values) {
        if (value && ingredient.ingredient == value.ingredient) {
          ingredient.data = value;
          break;
        }
      }
    }
  });

  return ingredientsWithData;
}
