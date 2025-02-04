import { auth, firestore } from '../firebase';
import { Ingredient, IngredientFormatted } from '../types';

export async function searchIngredients(searchTerm: string, ingredients: any[]) {
  // If no search term or ingredients, return
  if (searchTerm.length === 0) return [];

  // Store results in array
  let searchResults = [];
  let searchResultsWithData = [];

  // Clean the search term
  let term = searchTerm.trim().toLowerCase();

  let cleanedSearchTerm = '';

  if (searchTerm.length > 0) {
    // Clean the search term first
    cleanedSearchTerm = searchTerm
      .replace(/['.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .toLowerCase()
      .trim();
  }

  //   console.log("Cleaned search term", cleanedSearchTerm);
  //   console.log("Ingredients", ingredients);

  for (const ingredient of ingredients) {
    if (ingredient.ingredient.includes(cleanedSearchTerm)) {
      searchResults.push(ingredient.ingredient);
      searchResultsWithData.push({ ...ingredient, expanded: false });
    }
  }

  // Sort results by length
  searchResults = searchResults.sort((a, b) => a.length - b.length);

  searchResultsWithData = searchResultsWithData.sort((a, b) =>
    a.ingredient.length < b.ingredient.length
      ? -1
      : a.ingredient.length > b.ingredient.length
      ? 1
      : 0
  );

  return searchResultsWithData;
}

export async function loadIngredientFile(namesOnly: boolean) {
  const res = await fetch('/ingredients.txt');
  const json = await res.json();

  if (namesOnly) {
    const ingredients: any[] = [];
    json.ingredients_collection.forEach((ingredient: { ingredient: any }) => {
      if (!ingredients.find((x) => x.value === ingredient.ingredient)) {
        ingredients.push({
          value: ingredient.ingredient,
          label: ingredient.ingredient,
        });
      }
    });
    return ingredients.sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));
  }

  const ingredients: any[] = [];
  json.ingredients_collection.forEach((ingredient: { ingredient: any }) => {
    if (!ingredients.find((x) => x.ingredient === ingredient.ingredient)) {
      ingredients.push({
        ...ingredient,
        label: ingredient.ingredient,
        value: ingredient.ingredient,
      });
    }
  });

  return ingredients.sort((a, b) =>
    a.label.length > b.label.length ? 1 : b.label.length > a.label.length ? -1 : 0
  );
}

export async function findExactIngredient(search: string, ingredients: Ingredient[]) {
  console.log('Ingredient files', ingredients);

  const foundIngredient = ingredients.find((x) => x.ingredient === search);
  if (foundIngredient) {
    return foundIngredient;
  }

  return null;
}

export async function getAvoidances(userId) {
  if (!userId) return;

  // Get user saved recipes first
  let userAvoidances = [];

  let res = await firestore
    .collection('avoidances')
    .where('uid', '==', userId)
    .orderBy('name', 'desc')
    .get();

  for (const doc of res.docs) {
    userAvoidances.push({ id: doc.id, ...doc.data() });
  }

  return userAvoidances;
}

export async function addNewAvoidance(payload: any) {
  try {
    await firestore.collection('avoidances').add(payload);
  } catch (e) {
    console.warn('Cant create avoidance', e);
  }
}

export async function fetchDataForIngredients(ingredients: IngredientFormatted[]) {
  if (!ingredients) return null;
  const res = await fetch('/ingredients.txt');
  const json = await res.json();

  const copy = [...ingredients];

  console.log('Ingredient database', json);
  for (const ingredient of copy) {
    const foundIngredient = json.ingredients_collection.find(
      (i) => i.ingredient === ingredient.ingredient
    );

    if (foundIngredient) ingredient.data = foundIngredient;
  }

  return copy;
}
