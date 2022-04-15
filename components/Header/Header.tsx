import React, { useContext, useState } from 'react';
import { createStyles, Header, Container, Group, Burger, Text, Menu, UnstyledButton, Avatar, Divider } from '@mantine/core';
import { useBooleanToggle } from '@mantine/hooks';
import Link from 'next/link';
import {
    ChevronDown, Heart, Star, Message, Settings, SwitchHorizontal, Logout, PlayerPause, Trash,
} from 'tabler-icons-react';
import { PlantFoodLogo } from '../PlantFoodLogo/PlantFoodLogo';
import { UserContext } from '../../lib/context';
import { auth } from '../../lib/firebase';

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
}));

interface HeaderSimpleProps {
    links: { link: string; label: string }[];
}

export function HeaderSimple({ links }: HeaderSimpleProps) {
    const [opened, toggleOpened] = useBooleanToggle(false);
    const [active, setActive] = useState('Search');
    const [userMenuOpened, setUserMenuOpened] = useState(false);
    const { classes, theme, cx } = useStyles();
    const { user, username } = useContext(UserContext);

    console.log('User', user);

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

    return (
        <Header height={60} className={classes.nav}>
            <Container className={classes.header}>
                <PlantFoodLogo className={classes.logo} />
                <Group spacing={5} className={classes.links}>
                    {items}

                </Group>

                {user ?
                    <Group>
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
                                        <Avatar src={user.photoURL} alt={user.name} radius="xl" size={30} />
                                        <Text weight={500} size="sm" sx={{ lineHeight: 1, color: theme.white }} mr={3}>
                                            {user.name}
                                        </Text>
                                        <ChevronDown size={12} />
                                    </Group>
                                </UnstyledButton>
                            }
                        >
                            <Menu.Item icon={<Heart size={14} color={theme.colors.red[6]} />}>
                                Liked posts
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