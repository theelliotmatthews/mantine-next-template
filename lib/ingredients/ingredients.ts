import { auth, firestore } from '../firebase';
import { Ingredient, IngredientFormatted } from '../types';

export async function addIngredientsToList(ingredients: any[]) {
  await firestorePromiseAdd('list_items', ingredients);
}

export async function firestorePromiseAdd(collection: string, docs: any) {
  let promises = [];

  docs.forEach((doc) => {
    const promise = firestore.collection(collection).add(doc);
    promises.push(promise);
  });

  await Promise.all(promises).then((values) => {
    console.log('Promise values', values);
  });
}

export async function fetchIngredientData(ingredient: string) {
  try {
    const res = await firestore
      .collection('ingredients')
      .where('ingredient', '==', ingredient)
      .get();
    if (res.docs.length > 0) {
      return {
        id: res.docs[0].id,
        ...(res.docs[0].data() as Ingredient),
      };
    }
  } catch (e) {
    console.warn('cant fetch data for ingredient');
  }
  // console.log("Data from ingredient fetch", data, ingredient);
  return null;
}
