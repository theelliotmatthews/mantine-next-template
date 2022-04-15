import { auth, firestore } from "../firebase";

export async function addIngredientsToList(ingredients: any[]) {
  await firestorePromiseAdd("list_items", ingredients);
}

export async function firestorePromiseAdd(collection: string, docs: any) {
  let promises = [];

  docs.forEach((doc) => {
    const promise = firestore.collection(collection).add(doc);
    promises.push(promise);
  });

  await Promise.all(promises).then((values) => {
    console.log("Promise values", values);
  });
}

export async function fetchIngredientData(ingredient) {
  let data = null;
  try {
    const res = await firestore
      .collection("ingredients")
      .where("ingredient", "==", ingredient)
      .get();
    if (res.docs.length > 0) {
      data = {
        id: res.docs[0].id,
        ...res.docs[0].data(),
      };
    }
  } catch (e) {
    console.warn("cant fetch data for ingredient");
  }
  // console.log("Data from ingredient fetch", data, ingredient);
  return data;
}
