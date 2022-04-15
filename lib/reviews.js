import { firestore } from "./firebase";
import { getPublicProfileForUser } from "./firestore";

export async function getReviewsForRecipe(id) {
  let reviews = [];

  let query = firestore.collection("reviews").where("recipeId", "==", id);
  //.orderBy('createdAt', "des")

  await query.get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      reviews.push({ ...doc.data(), id: doc.id });
    });
  });

  // Fetch user data for reviews and populate
  let promises = [];
  for (const review of reviews) {
    const promise = getPublicProfileForUser(review.uid);
    promises.push(promise);
  }

  await Promise.all(promises).then((values) => {
    for (const review of reviews) {
      for (const user of values) {
        if (review.uid === user.id) {
          review.userData = user;
        }
      }
    }
  });

  return reviews;
}

export async function getReviewById(id) {
  let query = await firestore.collection("reviews").doc(id).get();

  return { ...query.data(), id: query.id };
}

export async function addReview(review, editReviewId, recipe) {
  let reviewExists = await checkIfReviewExists(review.recipeId, review.uid);

  if (reviewExists && !editReviewId) return;

  // let reviewRes = editReviewId
  //   ? await firestore.collection("reviews").doc(editReviewId).update(review)
  //   : await firestore.collection("reviews").add(review);

  await firestore.collection("reviews").add(review);

  // Add back in all the user tracking
  // let recipeRes = await getRecipeById(review.recipeId);

  // let trackingRes = await db
  //   .collection("tracking")
  //   .where("userId", "==", review.uid)
  //   .where("recipeId", "==", recipe.id)
  //   .where("type", "==", "reviewed")
  //   .get();

  // if (!trackingRes.docs[0] || !trackingRes.docs[0].exists) {
  //   console.log("No tracking saved found for this recipe");
  //   // Recipe not currently in saved
  //   await trackActivity(
  //     review.uid,
  //     recipe.custom ? recipe.channel : false,
  //     recipe.custom ? false : recipe.channel,
  //     "reviewed",
  //     recipe.id
  //   );
  // } else {
  //   console.log("Tracking already found for this recipe, time to update");
  //   await firestore.collection("tracking").doc(trackingRes.docs[0].id).update({
  //     created: new Date(),
  //   });
  //   return true;
  // }

  // if (!recipeRes.private && !editReviewId) {
  //   await createNotification(
  //     review.recipeId,
  //     review.uid,
  //     "reviewed",
  //     reviewRes.id
  //   );
  // }

  // Update the average review for the recipe
  // Check if review already exists
  // let res = await firestore
  //   .collection("review_average")
  //   .doc(review.recipeId)
  //   .get();

  // // If exists, update
  // if (res.exists) {
  //   let data = res.data();
  //   let totalReviews = data.count;
  //   let difficultyAverage = data.difficulty;
  //   let feelAverage = data.feel;
  //   let ratingAverage = data.rating;
  //   let tasteAverage = data.taste;

  //   let newDifficulty =
  //     (difficultyAverage * totalReviews + review.difficulty) /
  //     (totalReviews + 1);
  //   let newFeel =
  //     (feelAverage * totalReviews + review.feel) / (totalReviews + 1);
  //   let newRating =
  //     (ratingAverage * totalReviews + review.rating) / (totalReviews + 1);
  //   let newTaste =
  //     (tasteAverage * totalReviews + review.taste) / (totalReviews + 1);
  //   totalReviews++;

  //   await firestore.collection("review_average").doc(review.recipeId).update({
  //     count: totalReviews,
  //     difficulty: newDifficulty,
  //     feel: newFeel,
  //     rating: newRating,
  //     taste: newTaste,
  //   });
  // } else {
  //   // Create new
  //   await firestore.collection("review_average").doc(review.recipeId).set({
  //     count: 1,
  //     difficulty: review.difficulty,
  //     feel: review.feel,
  //     rating: review.rating,
  //     taste: review.taste,
  //   });
  // }
}

export async function getReviewAverages(id) {
  let res = await firestore.collection("review_average").doc(id).get();
  return { ...res.data(), id: res.id };
}

export async function deleteReview(reviewId, userId) {
  try {
    // Delete review
    await firestore.collection("reviews").doc(reviewId).delete();

    // Delete any notifications about the review
    let res = await db
      .collection("notifications")
      .where("reviewId", "==", reviewId)
      .get();
    for (const doc of res.docs) {
      console.log("Spotted notificaiton to delete: ", doc.data(), doc.id);
      try {
        await firestore.collection("notifications").doc(doc.id).delete();
      } catch (e) {
        console.warn("Cant delete from notifications collection", e);
      }

      // Delete any posts / comments on that notification
      let moreRes = await db
        .collection("notification_comments")
        .where("notificationId", "==", doc.id)
        .get();
      for (const otherDoc of moreRes.docs) {
        console.log("Notification comment to delete:", otherDoc.data());
        try {
          await db
            .collection("notification_comments")
            .doc(otherDoc.id)
            .delete();
        } catch (e) {
          console.warn("Cant delete from notifications_comments collection", e);
        }
      }
    }
  } catch (e) {
    console.warn("Error deleting review", e);
  }
}

export async function checkIfReviewExists(recipeId, userId, returnId) {
  let res = await firestore
    .collection("reviews")
    .where("recipeId", "==", recipeId)
    .where("uid", "==", userId)
    .get();
  if (res.docs.length > 0) {
    return true;
  } else {
    return returnId ? recipeId : false;
  }
}
