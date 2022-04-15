import { auth, firestore } from "./firebase";


// Venues
export async function getVenueById(id) {
    try {
        //console.log('RIP inside', recipeId)
        let res = await firestore
            .collection("venues")
            .doc(id)
            .get();

        if (!res.exists) {
            throw Error("Venue does not exist");
        }

        let data = res.data();

        return { ...data, id: res.id, venue: true };
    } catch (error) {
        console.warn(error);
        return null;
    }
}

export async function checkIfUserIsAdminOfVenue(venueId, userId) {
    if (!userId) return false;

    console.log("Venue ID", venueId);
    console.log("User ID", userId);

    // Check if recipe exists in saved_recipes
    // let res = await firestore.collection('venue_admin').where('venueId', '==', venueId).where('userId', '==', userId).get()

    // if (res.docs.length > 0) {
    //     return true
    // } else {
    //     return false
    // }

    let res = await firestore
        .collection("venue_admin")
        .doc(venueId)
        .get();
    if (!res || !res.exists) {
        // Recipe not currently in saved
        return false;
    } else {
        let data = res.data();
        console.log("Admin data", data);

        return data.admins && data.admins.includes(userId) ? true : false;
    }
}

export async function returnListOfAdminVenues(userId) {
    let venues = [];

    let res = await firestore
        .collection("venue_admin")
        .where("admins", "array-contains", userId)
        .get();

    for (const doc of res.docs) {
        //venues.push({ id: doc.id, ...doc.data() })
        let data = doc.data();
        let venueData = await getVenueById(doc.id);
        venues.push(venueData);
    }

    return venues;
}

export async function updateVenue(id, data) {
    await firestore
        .collection("venues")
        .doc(id)
        .update(data);
}

export async function getMenuGroups(venueId) {
    let groups = [];
    let res = await firestore
        .collection("venue_menu_groups")
        .where("venueId", "==", venueId)
        .orderBy("order")
        .get();
    for (const doc of res.docs) {
        groups.push({ id: doc.id, ...doc.data() });
    }

    return groups;
}

export async function updateMenuGroup(data, editId) {
    if (editId) {
        await firestore
            .collection("venue_menu_groups")
            .doc(editId)
            .update(data);
    } else {
        await firestore.collection("venue_menu_groups").add(data);
    }
}

export async function deleteMenuGroup(id) {
    await firestore
        .collection("venue_menu_groups")
        .doc(id)
        .delete();

    // Also delete all menu items in this group
    // let res = await firestore.collection("venue_menu").where("groupId", '==', id).get()
    // for (const doc of res.docs) {
    //     await firestore.collection("venue_menu").doc(doc.id).delete()
    // }
}

export async function reorderMenuGroup(id, up, lastElement) {
    console.log("ID: ", id);
    console.log("Up: ", up);
    console.log("lastElement: ", lastElement);
    if (!id) return;
    let res = await firestore
        .collection("venue_menu_groups")
        .doc(id)
        .get();

    if (!res) return;

    let data = res.data();
    let order = data.order;
    console.log("Order on original group", order);

    // Find before and after
    if (lastElement) {
        let itemRes = await firestore
            .collection("venue_menu_groups")
            .where("venueId", "==", data.venueId)
            .where("order", "==", order - 1)
            .get();
        for (const doc of itemRes.docs) {
            await firestore
                .collection("venue_menu_groups")
                .doc(doc.id)
                .update({ order: order });
        }
    } else {
        // Check if first element
        if (order == 0) {
            // Change just the one at index 1
            let itemRes = await firestore
                .collection("venue_menu_groups")
                .where("venueId", "==", data.venueId)
                .where("order", "==", 1)
                .get();
            for (const doc of itemRes.docs) {
                await firestore
                    .collection("venue_menu_groups")
                    .doc(doc.id)
                    .update({ order: 0 });
            }
        } else {
            // Change both before and after
            let itemResBefore = await firestore
                .collection("venue_menu_groups")
                .where("venueId", "==", data.venueId)
                .where("order", "==", up ? order - 1 : order + 1)
                .get();
            for (const doc of itemResBefore.docs) {
                await firestore
                    .collection("venue_menu_groups")
                    .doc(doc.id)
                    .update({ order: order });
            }
        }
    }

    up ? order-- : order++;
    console.log("Order after change", order);

    await firestore
        .collection("venue_menu_groups")
        .doc(id)
        .update({ order: order });
}

export async function updateOrderOfMenuGroup(id, order) {
    await firestore
        .collection("venue_menu_groups")
        .doc(id)
        .update({ order: order });
}

export async function getMenuItemsInGroup(id) {
    console.log("Venue menu items group ID", id);
    let items = [];
    let res = await firestore
        .collection("venue_menu")
        .where("groupId", "==", id)
        .orderBy("order")
        .get();
    for (const doc of res.docs) {
        console.log("Menu item doc", doc.data());
        items.push({ id: doc.id, ...doc.data() });
    }

    return items;
}

export async function updateGroupTitle(id, title) {
    await firestore
        .collection("venue_menu_groups")
        .doc(id)
        .update({ title: title });
}

export async function updateMenuItem(data, editId) {
    if (editId) {
        await firestore
            .collection("venue_menu")
            .doc(editId)
            .update(data);
    } else {
        await firestore.collection("venue_menu").add(data);
    }
}

export async function reorderMenuItem(id, up, lastElement) {
    console.log("ID: ", id);
    console.log("Up: ", up);
    console.log("lastElement: ", lastElement);
    if (!id) return;
    let res = await firestore
        .collection("venue_menu")
        .doc(id)
        .get();

    if (!res) return;

    let data = res.data();
    let order = data.order;
    console.log("Order on original group", order);

    // Find before and after
    if (lastElement) {
        let itemRes = await firestore
            .collection("venue_menu")
            .where("groupId", "==", data.groupId)
            .where("order", "==", order - 1)
            .get();
        for (const doc of itemRes.docs) {
            await firestore
                .collection("venue_menu")
                .doc(doc.id)
                .update({ order: order });
        }
    } else {
        // Check if first element
        if (order == 0) {
            // Change just the one at index 1
            let itemRes = await firestore
                .collection("venue_menu")
                .where("groupId", "==", data.groupId)
                .where("order", "==", 1)
                .get();
            for (const doc of itemRes.docs) {
                await firestore
                    .collection("venue_menu")
                    .doc(doc.id)
                    .update({ order: 0 });
            }
        } else {
            // Change both before and after
            let itemResBefore = await firestore
                .collection("venue_menu")
                .where("groupId", "==", data.groupId)
                .where("order", "==", up ? order - 1 : order + 1)
                .get();
            for (const doc of itemResBefore.docs) {
                await firestore
                    .collection("venue_menu")
                    .doc(doc.id)
                    .update({ order: order });
            }
        }
    }

    up ? order-- : order++;
    console.log("Order after change", order);

    await firestore
        .collection("venue_menu")
        .doc(id)
        .update({ order: order });
}

export async function updateOrderOfMenuItem(id, order) {
    await firestore
        .collection("venue_menu")
        .doc(id)
        .update({ order: order });
}

export async function deleteMenuItem(id) {
    await firestore
        .collection("venue_menu")
        .doc(id)
        .delete();
}

export async function updatePromotion(data, editId) {
    if (editId) {
        await firestore
            .collection("venue_promotions")
            .doc(editId)
            .update(data);
    } else {
        await firestore.collection("venue_promotions").add(data);
    }
}

export async function deletePromotion(id) {
    await firestore
        .collection("venue_promotions")
        .doc(id)
        .delete();
}

export async function getMenuForVenue(id) {
    let menu = [];
    let res = await firestore
        .collection("venue_menu")
        .where("venueId", "==", id)
        .get();
    for (const doc of res.docs) {
        menu.push({ ...doc.data(), id: doc.id });
    }
    return menu;
}

export async function getPromotionsForVenue(id) {
    let promotions = [];
    let res = await firestore
        .collection("venue_promotions")
        .where("venueId", "==", id)
        .get();
    for (const doc of res.docs) {
        promotions.push({ ...doc.data(), id: doc.id });
    }
    return promotions;
}

export async function updateRecipeCount(id, venue) {
    // Get number of recipes from venue
    let count = 0;
    let res = await firestore
        .collection("all_recipes")
        .where("channel", "==", id)
        .get();
    count = res.docs.length;

    // Update this in venues object
    await firestore
        .collection(venue ? "venues" : "pages")
        .doc(id)
        .update({ count: count });
}

export async function searchVenuesByTitle(term) {
    const terms = term
        .toLowerCase()
        .trim()
        .split(" ");
    console.log("Search terms", terms);

    let query: any = firestore;
    query = query.collection("venues")
    terms.forEach(word => {
        query = query.where(`search_terms.${word}`, "==", true);
    });

    console.log(query);

    let res = await query.limit(10).get();

    let venues = [];
    for (const doc of res.docs) {
        console.log("Doc", doc.data());
        venues.push({ id: doc.id, ...doc.data() });
    }

    return venues;
}