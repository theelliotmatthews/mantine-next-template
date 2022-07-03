import React, { useContext, useEffect, useState } from 'react';
import { createStyles, Header, Container, Group, Burger, Text, Menu, UnstyledButton, Avatar, Divider, Stack, Badge } from '@mantine/core';
import { useBooleanToggle } from '@mantine/hooks';
import Link from 'next/link';
import {
    ChevronDown, Heart, Star, Message, Settings, SwitchHorizontal, Logout, PlayerPause, Trash, Bell, Soup,
} from 'tabler-icons-react';
import { add } from 'date-fns/esm';
import { UserContext } from '../../lib/context';
import { auth, firestore } from '../../lib/firebase';
import PlantFoodLogo from '../../PlantFoodLogo/PlantFoodLogo';
import { Notification } from '../../lib/types';
import { readAllNotifications } from '../../lib/notifications';
import SingleNotification from '../SingleNotification/SingleNotification';

const useStyles = createStyles((theme) => ({
    nav: {
        backgroundColor: theme.colors[theme.primaryColor][6],
    },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
    },

    links: {
        [theme.fn.smallerThan('xs')]: {
            display: 'none',
        },
    },

    burger: {
        [theme.fn.largerThan('xs')]: {
            display: 'none',
        },
    },

    link: {
        display: 'block',
        lineHeight: 1,
        padding: '8px 12px',
        borderRadius: theme.radius.sm,
        textDecoration: 'none',
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[0],
        fontSize: theme.fontSizes.sm,
        fontWeight: 500,

        '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors[theme.primaryColor][5],
        },
    },

    linkActive: {
        '&, &:hover': {
            backgroundColor:
                theme.colorScheme === 'dark'
                    ? theme.fn.rgba(theme.colors[theme.primaryColor][9], 0.25)
                    : theme.colors[theme.primaryColor][0],
            color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 3 : 7],
        },
    },

    logo: {
        width: '120px',
    },

    userMenu: {
        [theme.fn.smallerThan('xs')]: {
            display: 'none',
        },
    },

    user: {
        color: theme.white,
        padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
        borderRadius: theme.radius.sm,
        transition: 'background-color 100ms ease',

        '&:hover': {
            backgroundColor: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 7 : 5],
        },
    },

    userActive: {
        backgroundColor: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 7 : 5],
    },

    notificationCount: {
        backgroundColor: theme.colors.red,
        color: theme.colors.white,
        position: 'absolute',
        top: 0,
        right: 0,
        fontSize: 12,
        padding: 2,
        borderRadius: '50%',
        height: 16,
        widht: 16,
    },
}));

interface HeaderSimpleProps {
    links: { link: string; label: string }[];
}

export default function HeaderSimple({ links }: HeaderSimpleProps) {
    const [opened, toggleOpened] = useBooleanToggle(false);
    const [active, setActive] = useState('Search');
    const [userMenuOpened, setUserMenuOpened] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const { classes, theme, cx } = useStyles();
    const { user, profile } = useContext(UserContext);

    const items = links.map((link) => (
        <Link
            key={link.label}
            href={link.link}
        >
            <a
                className={cx(classes.link, { [classes.linkActive]: active === link.link })}
            >
                {link.label}
            </a>
        </Link>
    ));

    const signOut = () => {
        auth.signOut();
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    };

    // Notifications logic
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [addedNotifications, setAddedNotifications] = useState<Notification[]>([]);
    const [modifiedNotifications, setModifiedNotifications] = useState<Notification[]>([]);
    const [deletedNotifications, setDeletedNotifications] = useState<Notification[]>([]);
    const [updates, setUpdates] = useState(0);
    const [newNotificationCount, setNewNotificationCount] = useState(0);

    useEffect(() => {
        if (user) {
            // Moved inside "useEffect" to avoid re-creating on render
            const handleNotificationChanges = (snapshot: any) => {
                const changes = snapshot.docChanges();

                const added: Notification[] = [];
                const modified: Notification[] = [];
                const deleted: Notification[] = [];
                changes.forEach((change: any) => {
                    const data = change.doc.data()
                    // console.log('Created: ', data.createdAt.toDate())
                    if (change.type === 'added') {
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
                    if (change.type === 'modified') {
                        // console.log("Modified notification: ", change.doc.data());
                        // setNotifications(list.filter(item => item.id !== change.doc.id));
                        const notification = {
                            id: change.doc.id,
                            ...change.doc.data(),
                        };
                        modified.push(notification);
                    }
                    if (change.type === 'removed') {
                        const notification = {
                            id: change.doc.id,
                            ...change.doc.data(),
                        };

                        deleted.push(notification);
                    }
                });

                // Work out new notification count
                let count = 0;
                added.forEach(notification => {
                    if (!notification.seen) count += 1;
                });

                modified.forEach(notification => {
                    if (!notification.seen) count += 1;
                });

                deleted.forEach(notification => {
                    if (!notification.seen) count += 1;
                });

                setNewNotificationCount(count);
                setAddedNotifications((prev) => [...prev, ...added]);
                setModifiedNotifications((prev) => [...prev, ...modified]);
                setDeletedNotifications((prev) => [...prev, ...deleted]);
            };

            const query = firestore
                .collection('notifications_seen')
                .where('toEntityId', '==', user.uid)
                .where('toEntityType', '==', 'user')
                .orderBy('createdAt', 'desc')
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
            addedNotifications.forEach(notification => {
                const copy = [...notifications];
                copy.push(notification);
                // setNotifications(copy)
                setNotifications((prev) => [...prev, notification]);
            });
            setAddedNotifications([]);
            setUpdates(updates + 1);
        }
    }, [addedNotifications]);

    // Listen to modified Notifications
    useEffect(() => {
        // Check for modified Notifications
        if (modifiedNotifications.length > 0) {
            const copy = [...notifications];

            modifiedNotifications.forEach(notification => {
                const i = notifications.find((x) => x.id === notification.id);
                const index = copy.indexOf(i);
                // console.log('Index', index);
                // console.log('Found i notification', i);
                // console.log('Modified notification', notification);
                copy[index] = notification;
            });

            setNotifications(copy);

            setModifiedNotifications([]);
            setUpdates(updates + 1);
        }
    }, [modifiedNotifications]);

    useEffect(() => {
        // Check for deleted Notifications
        if (deletedNotifications.length > 0) {
            deletedNotifications.forEach(notification => {
                const copy = [...notifications].filter(
                    (item) => item.id !== notification.id
                );
                setNotifications(copy);
            });

            setDeletedNotifications([]);
            setUpdates(updates + 1);
        }
    }, [deletedNotifications]);

    const seeNotifications = async () => {
        await readAllNotifications(notifications);
        setNewNotificationCount(0);
    };

    return (
        <Header height={60} className={classes.nav}>
            <Container size="xl" className={classes.header}>
                <PlantFoodLogo className={classes.logo} />
                <Group spacing={5} className={classes.links}>
                    {items}

                </Group>

                {(user && profile) ?
                    <Group spacing={0}>
                        <Menu
                            size={400}
                            placement="end"
                            transition="pop-top-right"
                            className={classes.userMenu}
                            onClose={() => setNotificationsOpen(false)}
                            onOpen={() => {
                                setNotificationsOpen(true);
                                seeNotifications();
                            }}
                            control={
                                <UnstyledButton
                                    className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                                >
                                    <Group spacing={4} style={{ position: 'relative' }}>
                                        <Bell />
                                        {newNotificationCount > 0 ? <Badge color="red" p={2} radius="xl" variant="filled" size="xs" style={{ height: 16, width: 16, position: 'absolute', top: -3, right: -5 }}>{newNotificationCount}</Badge> : null}
                                    </Group>
                                </UnstyledButton>
                            }
                        >
                            <Menu.Item>
                                <Stack>
                                    {notifications.map((notification, index) => <SingleNotification notification={notification} key={index} />)}
                                </Stack>
                            </Menu.Item>
                        </Menu>
                        <Menu
                            size={260}
                            placement="end"
                            transition="pop-top-right"
                            className={classes.userMenu}
                            onClose={() => setUserMenuOpened(false)}
                            onOpen={() => setUserMenuOpened(true)}
                            control={
                                <UnstyledButton
                                    className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                                >
                                    <Group spacing={4}>
                                        <Avatar src={(profile && profile.image) ? profile.image : user.photoURL} alt={user.name} radius="xl" size={30} />
                                        <Text weight={500} size="sm" sx={{ lineHeight: 1, color: theme.white }} mr={3}>
                                            {user.name}
                                        </Text>
                                        <ChevronDown size={12} />
                                    </Group>
                                </UnstyledButton>
                            }
                        >
                            <Menu.Item icon={<Soup size={14} color={theme.colors.red[6]} />}>
                                <Link href="/create-recipe">Create recipe</Link>
                            </Menu.Item>
                            <Menu.Item icon={<Star size={14} color={theme.colors.yellow[6]} />}>
                                Saved posts
                            </Menu.Item>
                            <Menu.Item icon={<Message size={14} color={theme.colors.blue[6]} />}>
                                Your comments
                            </Menu.Item>

                            <Menu.Label>Settings</Menu.Label>
                            <Menu.Item icon={<Settings size={14} />}>Account settings</Menu.Item>
                            <Menu.Item icon={<SwitchHorizontal size={14} />}>Change account</Menu.Item>
                            <Menu.Item icon={<Logout size={14} />} onClick={signOut}>Logout</Menu.Item>

                            <Divider />

                            <Menu.Label>Danger zone</Menu.Label>
                            <Menu.Item icon={<PlayerPause size={14} />}>Pause subscription</Menu.Item>
                            <Menu.Item color="red" icon={<Trash size={14} />}>
                                Delete account
                            </Menu.Item>
                        </Menu>
                    </Group>
                    : null
                }
                <Burger
                    opened={opened}
                    onClick={() => toggleOpened()}
                    className={classes.burger}
                    size="sm"
                />
            </Container>
        </Header>
    );
}
