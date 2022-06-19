/* eslint-disable no-restricted-syntax */
/* eslint-disable no-useless-escape */
import { firestore } from '../firebase';
import { calorieGroup, carbGroup, fatGroup, proteinGroup } from '../nutrients/nutrients';
import { getRecipeById } from '../recipes/recipes';
import { Recipe, Results } from '../types';

export async function searchRecipes(
  searchTerm: string,
  ingredients: string[],
  limit: number,
  startAt: any,
  channel: string,
  macros: any,
  avoidances: string[],
  filters: any,
  creatorType: string,
  recipeCreatorId: string,
  userRecipeType: string,
  combination: string[],
  collectionId: string
) {
  // Check if this is a search in a users recipes, rather than the entire database
  // This is a bit different as we have to fetch the recipeId first from user_recipes, then fetch recipe data
  const userRecipeSearch = (creatorType && recipeCreatorId && userRecipeType) || collectionId;

  console.log('Check 1', creatorType && recipeCreatorId && userRecipeType);
  console.log('Check 2', !collectionId);
  console.log('----------------------------');
  console.log('Creator type', creatorType);
  console.log('recipeCreatorId', recipeCreatorId);
  console.log('userRecipeType', userRecipeType);
  console.log('collectionId', collectionId);
  console.log('User recipe search', userRecipeSearch);

  // If no search term or ingredients, return
  if (searchTerm.length === 0 && ingredients.length === 0 && !userRecipeSearch && !combination) {
    return [];
  }

  // Construct reference
  const recipeRef = userRecipeSearch
    ? userRecipeType === 'reviewed'
      ? firestore.collection('reviews')
      : userRecipeType === 'created'
      ? firestore.collection('all_recipes')
      : firestore.collection('user_recipes')
    : firestore.collection('all_recipes');

  // console.log('Recipe ref', recipeRef);

  // Construct query
  let query: any = recipeRef;

  // Work with the search term
  if (searchTerm.length > 0) {
    const cleanedSearchTerm = searchTerm
      .replace(/['.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .toLowerCase()
      .trim()
      .split(' ');

    // Cycle through cleaned search terms and build query
    cleanedSearchTerm.forEach((word) => {
      const parameter =
        (userRecipeSearch && userRecipeType !== 'created'
          ? 'recipeSearchTerms.'
          : 'search_terms.') + word.split(' ').join('_');
      query = query.where(parameter, '==', true);
    });
  }

  // Split ingredients and search
  if (ingredients.length > 0) {
    // let tags = this.searchingWithCartesians ? this.currentCartesian : this.tags;
    const tags = ingredients;

    tags.forEach((ingredient) => {
      // Add the base ingredient as well
      const parameter = `ingredients_map.${ingredient.split(' ').join('_')}`;
      query = query.where(parameter, '==', true);
      //searchWhereConditions.push([parameter, "==", true]);
    });
  }

  // Check for channel
  // if (channel) {
  //   query = query.where("channel", "==", channel);
  // }

  // Check for collection Id
  if (collectionId) {
    query = query.where('collectionId', '==', collectionId);
  }

  // Check for macros
  if (macros) {
    const macroFormat = [
      {
        key: 'calories',
        calories: true,
        groupFunction: calorieGroup,
      },
      {
        key: 'carbs',
        calories: false,
        groupFunction: carbGroup,
      },
      {
        key: 'protein',
        calories: false,
        groupFunction: proteinGroup,
      },
      {
        key: 'fat',
        calories: false,
        groupFunction: fatGroup,
      },
    ];

    const caloriesOnly = macros.calories !== null;

    // Cycle through each macro and check whether it's active
    macroFormat.forEach((macro) => {
      if (macro.calories === caloriesOnly) {
        // Check if a value actually exists before trying to return a group
        if (macros[macro.key]) {
          const group = macro.groupFunction(parseInt(macros[macro.key], 10));
          query = query.where(`nutrition_search.${group}`, '==', true);
        }
      }
    });
  }

  // Check for filters
  if (filters.length > 0) {
    filters.forEach((filter: { type: string; dbName: string }) => {
      if (filter.type === 'meal') {
        query = query.where(`categories.${filter.dbName}`, '==', true);
      }

      if (filter.type === 'cuisine') {
        query = query.where(`categories.${filter.dbName}`, '==', true);
      }

      if (filter.type === 'time') {
        query = query.where('timeBoundary', '==', filter.dbName);
      }

      if (filter.type === 'dietary') {
        query = query.where(filter.dbName, '==', true);
      }
    });
  }

  // console.log('Creater type', creatorType);
  // console.log('recipeCreatorId', recipeCreatorId);
  // Check for recipe creator type
  if (creatorType && recipeCreatorId && userRecipeType) {
    // Created recipes
    if (userRecipeType === 'created') {
      console.log('Yes created');

      // New data structures
      // query = query.where('entity.id', '==', recipeCreatorId);
      // query = query.where('entity.type', '==', creatorType);

      // Old data structures
      query = query.where('channel', '==', recipeCreatorId);

      // if (searchTerm.length === 0) query = query.orderBy('createdAt', 'desc');
      // console.log('Yes here with entities');
      // Reviewed recipes
    } else if (userRecipeType === 'reviewed') {
      query = query.where('uid', '==', recipeCreatorId);
      if (searchTerm.length === 0) query = query.orderBy('createdAt', 'desc');

      // Saved / Cooked / Viewed recipes
    } else {
      query = query.where('type', '==', userRecipeType);
      if (creatorType === 'user') {
        query = query.where('uid', '==', recipeCreatorId);
      }

      if (searchTerm.length === 0) {
        query = query.orderBy('added', 'desc');
        console.log('Order by added');
      }
    }
  } else if (collectionId) {
    query = query.orderBy('added', 'desc');
  }

  // Check for combination - used for similar recipes
  if (combination) {
    combination.forEach((keyword) => {
      if (keyword.length > 0) {
        const parameter = `search_terms.${keyword.split(' ').join('_')}`;
        query = query.where(parameter, '==', true);
      }
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

  // Reset the last visible for a new pagination query
  let lastVisible = null;

  // Make request and set last visible
  const res = await query.get();
  lastVisible = res.docs[res.docs.length - 1];

  // Push results
  let docs: Recipe[] = [];

  // Promises for fetching recipe data
  const promises: any = [];

  // Make call
  res.docs.forEach((doc) => {
    const data = doc.data();
    // console.log('Each data', data);
    // Check for avoidances
    if (avoidances.length > 0) {
      // If we have some, remove don't add recipes that contain the ingredients
      let ingredientMatch = false;
      avoidances.forEach((ingredient) => {
        if (data.ingredients_map[ingredient.split(' ').join('_')]) {
          ingredientMatch = true;
        }
      });

      if (!ingredientMatch) {
        docs.push({ id: doc.id, ...data });
      }
    } else {
      docs.push({ id: doc.id, ...data });
    }

    // If it's a user saved recipe type, then we need to fetch the recipe data
    if (userRecipeSearch && (userRecipeType !== 'created' || collectionId)) {
      const promise = getRecipeById(data.recipeId);
      promises.push(promise);
    }
  });

  // Action the promises
  if (userRecipeSearch && (userRecipeType !== 'created' || collectionId)) {
    const recipesWithData: Recipe[] = [];
    await Promise.all(promises).then((values) => {
      // Match up
      docs.forEach((recipe: Recipe & { recipeId?: string }) => {
        for (const r of values) {
          if (r && recipe.recipeId === r.id) {
            const newObject = {
              ...r,
            };
            recipesWithData.push(newObject);
            break;
          }
        }
      });
    });
    docs = recipesWithData;
  }

  // Return
  const results = {
    results: docs,
    lastVisible,
  };

  console.log('Results', results);

  return results as Results;
}

// Used for creating different combinations for similar recipes
export async function getCombinations(valuesArray) {
  const array = [];
  valuesArray.forEach((element) => {
    if (element.length > 0 && isNaN(element) && !array.includes(element)) {
      array.push(element);
    }
  });

  const words = [
    'of',
    'the',
    'in',
    'on',
    'at',
    'to',
    'a',
    'is',
    'with',
    'or',
    'best',
    'ever',
    'vegan',
    '&',
    'more',
    'recipe',
    'recipes',
    'vegetarian',
    'classic',
    'healthy',
    'easy',
    'ways',
    'and',
    'meal',
    'prep',
    'ingredients',
    ',',
    '-',
    'gluten',
    'free',
    '|',
    'how',
    'make',
  ];

  let combi = [];
  let temp = [];
  const slent = 2 ** array.length;

  for (let i = 0; i < slent; i++) {
    temp = [];
    for (let j = 0; j < array.length; j++) {
      if (i & (2 ** j)) {
        temp.push(array[j]);
      }
    }
    if (temp.length > 0) {
      combi.push(temp);
    }
  }

  combi = combi.sort((a, b) => a.length - b.length).reverse();

  return combi;
}

export function keywords(s) {
  const words = [
    'how',
    'make',
    'of',
    'the',
    'in',
    'on',
    'at',
    'to',
    'a',
    'is',
    'with',
    'or',
    'best',
    'ever',
    'vegan',
    '&',
    'more',
    'recipe',
    'recipes',
    'vegetarian',
    'classic',
    'healthy',
    'easy',
    'ways',
    'and',
    'meal',
    'prep',
    'ingredients',
    ',',
    '-',
    'gluten',
    'free',
    '|',
  ];
  const re = new RegExp(`\\b(${words.join('|')})\\b`, 'g');
  return (s || '').replace(re, '').replace(/[ ]{2,}/, ' ');
}
