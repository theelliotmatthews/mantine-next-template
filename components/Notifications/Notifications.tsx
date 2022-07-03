import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../lib/context';
import { readAllNotifications } from '../../lib/notifications';

export default function Notifications() {

    const { user, username } = useContext(UserContext);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [addedNotifications, setAddedNotifications] = useState<Notification[]>([]);
    const [modifiedNotifications, setModifiedNotifications] = useState<Notification[]>([]);
    const [deletedNotifications, setDeletedNotifications] = useState<Notification[]>([]);
    const [updates, setUpdates] = useState(0);
    const [newNotificationCount, setNewNotificationCount] = useState(0);

    useEffect(() => {
        if (user) {
            // Moved inside "useEffect" to avoid re-creating on render
            const handleNotificationChanges = (snapshot) => {
                const changes = snapshot.docChanges();

                let added = [];
                let modified = [];
                let deleted = [];
                console.log("Start of changes");
                changes.forEach((change) => {
                    if (change.type === "added") {
                        // console.log("New notification: ", change.doc.data());
                        const notification = {
                            id: change.doc.id,
                            ...change.doc.data(),
                        };

                        if (!notifications.find((x) => x.id === change.doc.id)) {
                            added.push(notification);
                        }

                        // console.log('List', list)
                    }
                    if (change.type === "modified") {
                        // console.log("Modified notification: ", change.doc.data());
                        // setNotifications(list.filter(item => item.id !== change.doc.id));
                        const notification = {
                            id: change.doc.id,
                            ...change.doc.data(),
                        };
                        modified.push(notification);
                    }
                    if (change.type === "removed") {
                        const notification = {
                            id: change.doc.id,
                            ...change.doc.data(),
                        };

                        deleted.push(notification);
                    }
                });

                console.log("End of changes");

                // Work out new notification count
                let count = 0;
                for (const notification of added) {
                    if (!notification.seen) count++;
                }
                for (const notification of modified) {
                    if (!notification.seen) count++;
                }
                for (const notification of deleted) {
                    if (!notification.seen) count++;
                }

                setNewNotificationCount(count);

                setAddedNotifications((prev) => [...prev, ...added]);
                setModifiedNotifications((prev) => [...prev, ...modified]);
                setDeletedNotifications((prev) => [...prev, ...deleted]);

                // Use the setState callback
                // console.log('List outside changes', list)
            };

            const query = firestore
                .collection("notifications_seen")
                .where("toEntityId", "==", user.uid)
                .where("toEntityType", "==", "user")
                .orderBy("createdAt", "desc")
                .limit(10);

            // Create the DB listener
            const unsuscribe = query.onSnapshot(handleNotificationChanges, (err) =>
                console.log(err)
            );
            return () => {
                unsuscribe();
            };
        }
    }, [user]);

    // Listen to new Notifications
    useEffect(() => {
        // Check for added Notifications
        if (addedNotifications.length > 0) {
            for (const notification of addedNotifications) {
                let copy = [...notifications];
                copy.push(notification);
                // setNotifications(copy)
                setNotifications((prev) => [...prev, notification]);
            }
            setAddedNotifications([]);
            setUpdates(updates + 1);
        }
    }, [addedNotifications]);

    // Listen to modified Notifications
    useEffect(() => {
        // Check for modified Notifications
        if (modifiedNotifications.length > 0) {
            let copy = [...notifications];

            for (const notification of modifiedNotifications) {
                let i = notifications.find((x) => x.id === notification.id);
                let index = copy.indexOf(i);
                console.log("Index", index);
                console.log("Found i notification", i);
                console.log("Modified notification", notification);
                copy[index] = notification;
            }

            setNotifications(copy);

            setModifiedNotifications([]);
            setUpdates(updates + 1);
        }
    }, [modifiedNotifications]);

    useEffect(() => {
        // Check for deleted Notifications
        if (deletedNotifications.length > 0) {
            for (const notification of deletedNotifications) {
                let copy = [...notifications].filter(
                    (item) => item.id !== notification.id
                );
                setNotifications(copy);
            }

            setDeletedNotifications([]);
            setUpdates(updates + 1);
        }
    }, [deletedNotifications]);

    const seeNotifications = async () => {
        await readAllNotifications(notifications);
        setNewNotificationCount(0);
    };

    return (
        <div>Notifications</div>
    )
}
