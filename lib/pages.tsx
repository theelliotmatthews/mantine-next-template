import { auth, firestore, increment } from "./firebase";



// Pages
export async function updatePage(id, data, userId) {
    if (!userId) return;
    try {
        if (id) {
            await firestore
                .collection("pages")
                .doc(id)
                .update(data);

            return false;
        } else {
            let res = await firestore.collection("pages").add(data);

            // Add as venue as well
            await firestore
                .collection("page_admins")
                .doc(res.id)
                .set({
                    admins: [userId]
                });

            // Create count document with following info 
            await firestore.collection(`pages/${res.id}/followers`).doc('count').set({
                count: 0
            })

            return res.id;

        }
    } catch (e) {
        console.warn("Error updating page", e);
    }
}

export async function getPage(id) {
    // console.log("Getting page with id: ", id);

    try {
        //// console.log('RIP inside', recipeId)
        let res = await firestore
            .collection("pages")
            .doc(id)
            .get();

        if (!res.exists) {
            throw Error("Page does not exist");
        }

        let data = res.data();
        // console.log("Page data: ", data);

        return { ...data, id: res.id, page: true };
    } catch (error) {
        console.warn(error);
        return null;
    }
}

export async function deletePage(id) {
    try {
        await firestore
            .collection("pages")
            .doc(id)
            .delete();

        // Delete all recipes from page TODO
        // let recipeRes = await firestore.collection('all_recipes').where()

        // Delete all admin
        await firestore
            .collection("page_admins")
            .doc(id)
            .delete();

        // Delete all people following this page
        let res = await firestore
            .collection("following_pages")
            .where('pageId', '==', id)
            .get();

        for (const doc of res.docs) {
            await firestore
                .collection("following_pages")
                .doc(doc.id)
                .delete();
        }

        // Delete all notifications from this page and to this page
        res = await firestore
            .collection("notifications")
            .where('sourceId', '==', id)
            .where('sourceType', '==', "page")
            .get();

        for (const doc of res.docs) {
            await firestore
                .collection("notifications")
                .doc(doc.id)
                .delete();
        }

        // Delete all comments from this page and to this page
        res = await firestore
            .collection("notification_comments")
            .where('sourceId', '==', id)
            .where('sourceType', '==', "page")
            .get();

        for (const doc of res.docs) {
            await firestore
                .collection("notifications")
                .doc(doc.id)
                .delete();
        }

        res = await firestore
            .collection("notification_comments")
            .where('entityId', '==', id)
            .where('entityType', '==', "page")
            .get();

        for (const doc of res.docs) {
            await firestore
                .collection("notifications")
                .doc(doc.id)
                .delete();
        }


        // Delete all comments from posts

    } catch (e) {
        console.warn("Cannot delete page", e);
    }
}

export async function fetchPagesForUser(userId) {
    let pages = [];
    try {
        let res = await firestore
            .collection("page_admins")
            .where("admins", "array-contains", userId)
            .get();
        for (const doc of res.docs) {
            pages.push({ id: doc.id, ...doc.data() });
        }
    } catch (e) {
        console.warn("Cant fetch pages for user", e);
    }

    return pages;
}

export async function fetchPagesUserIsFollowing(userId) {
    let pages = [];

    let res = await firestore
        .collection("following_pages")
        .where("userId", "==", userId)
        .get();
    for (const doc of res.docs) {
        pages.push({ id: doc.id, ...doc.data() });
    }

    return pages;
}

export async function checkIfUserIsAdminOfPage(pageId, userId) {
    if (!userId) return false;

    try {
        let res = await firestore
            .collection("page_admins")
            .doc(pageId)
            .get();
        if (!res || !res.exists) {
            // Recipe not currently in saved
            return false;
        } else {
            let data = res.data();
            // console.log("Admin data", data);

            return data.admins.includes(userId) ? true : false;
        }
    } catch (e) {
        console.warn("Error checking if user is admin of page", e);
    }
}

export async function checkIfUserIsFollowingPage(pageId, userId) {
    try {
        let res = await firestore
            .collection("following_pages")
            .where("pageId", "==", pageId)
            .where("userId", "==", userId)
            .get();
        if (res.docs.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.warn("Error checking if user is following page", e);
    }
}

export async function togglePageFollow(pageId, userId, following, page) {
    // 4th parameter is true for page, false if venue
    // console.log("Toggling page follow");
    // console.log("Page ID: ", pageId);
    // console.log("User ID: ", userId);
    // If already following, unfollow
    if (following) {
        let res = await firestore
            .collection("following_pages")
            .where(page ? "pageId" : "venueId", "==", pageId)
            .where("userId", "==", userId)
            .get();
        if (res.docs.length > 0) {
            await firestore
                .collection("following_pages")
                .doc(res.docs[0].id)
                .delete();
        }

        const batch = firestore.batch();

        batch.update(firestore.doc(`pages/${pageId}/followers/count`), { count: increment(-1) });

        await batch.commit();
    } else {
        // Else follow
        let obj = {
            createdAt: new Date(),
            userId: userId,
            type: page ? 'page' : 'venue'
        } as { createdAt: Date, userId: string, pageId: string, venueId: string, type: string }

        if (page) obj.pageId = pageId;
        if (!page) obj.venueId = pageId;
        let res = await firestore.collection("following_pages").add(obj);

        const batch = firestore.batch();

        batch.update(firestore.doc(`pages/${pageId}/followers/count`), { count: increment(1) });

        await batch.commit();

    }

    return !following
}

export async function getPageTotalFollowers(id: string) {
    const res = await firestore.collection(`pages`).doc(`/${id}/followers/count`).get()
    const data = res.data()
    return data.count

}