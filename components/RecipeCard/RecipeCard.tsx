/* eslint-disable no-lonely-if */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { Bookmark, Calendar, CalendarEvent, Clock, Copy, Notes, Share, Soup, Trash, Users } from 'tabler-icons-react';
import {
    Card,
    Image,
    Text,
    ActionIcon,
    Badge,
    Group,
    Center,
    Avatar,
    useMantineTheme,
    createStyles,
    Tooltip,
    Stack,
    Menu,
    Divider,
} from '@mantine/core';
import { useModals } from '@mantine/modals';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { isSameDay } from 'date-fns';
import { useDrag, useDrop } from 'react-dnd';
import { CollaborativePlanner, ITEM_TYPE, ITEM_TYPES, PlannerRecipe, Recipe } from '../../lib/types';

import { UserContext } from '../../lib/context';
import { firestorePromiseAdd } from '../../lib/ingredients/ingredients';
import { checkRecipeStatus, toggleRecipeStatus } from '../../lib/recipes/recipes';
import { AddToPlanner } from '../AddToPlanner/AddToPlanner';
import { AddToListItemProps, AddToList } from '../AddToList/AddToList';
import { getNumberOfRecipesOnDate, removeRecipeFromPlanner } from '../../lib/planner/planner';
import AddToListButton from '../AddToListButton/AddToListButton';
import AddToPlannerButton from '../AddToPlannerButton/AddToPlannerButton';
import { firestore } from '../../lib/firebase';

const useStyles = createStyles((theme) => ({
    card: {
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    },

    rating: {
        position: 'absolute',
        top: theme.spacing.xs,
        right: theme.spacing.xs + 2,
        pointerEvents: 'none',
    },

    title: {
        display: 'block',
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.xs / 2,
        textDecoration: 'none',
        color: theme.colors.dark[7],
    },

    titleMobile: {
        display: 'block',
        marginTop: theme.spacing.xs,
        marginBottom: theme.spacing.xs / 2,
        textDecoration: 'none',
        color: theme.colors.dark[7],
    },

    action: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
    },

    footer: {
        marginTop: theme.spacing.md,
    },
}));

interface RecipeCardProps {
    recipe: Recipe;
    small?: boolean;
    index?: number;
    moveItem?: Function;
    status?: any;
    item?: Recipe;
    plannerDay?: Date
    selectMode?: boolean;
    selectedRecipes?: string[];
    selectRecipe?: Function;
    removeFromPlanner?: Function;
    getPlanners?: Function;
    userCanEdit?: boolean
}

export default function RecipeCard({
    className,
    recipe,
    small,
    index,
    moveItem,
    item,
    plannerDay,
    selectMode,
    selectedRecipes,
    selectRecipe,
    removeFromPlanner,
    getPlanners,
    userCanEdit
}: RecipeCardProps & Omit<React.ComponentPropsWithoutRef<'div'>, keyof RecipeCardProps>) {
    const { classes, cx } = useStyles();
    const theme = useMantineTheme();
    const modals = useModals();
    const router = useRouter();
    const { user } = useContext(UserContext);

    const [saved, setSaved] = useState(false);
    const [cooked, setCooked] = useState(false);
    const [ingredientsToAdd, setIngredientsToAdd] = useState([]);
    const [listModalIncrement, setListModalIncrement] = useState(0);

    // Check recipe status on load
    useEffect(() => {
        if (user) {
            const checkStatus = async () => {
                const status = await checkRecipeStatus(user.uid, recipe.id);
                setSaved(status.saved);
                setCooked(status.cooked);
            };

            checkStatus();
        }
    }, []);

    const toggleSaveRecipe = async () => {
        const res = await toggleRecipeStatus('saved', user.uid, recipe);
        setSaved(res);
        if (res) {
            showNotification({
                title: 'Recipe saved',
                message: 'Click here to view your saved recipes',
                onClick: () => {
                    router.push('/my-recipes/saved');
                },
                icon: <Bookmark size={12} />,
                style: { cursor: 'pointer' },
            });
        }
    };

    const toggleCooked = async () => {
        const res = await toggleRecipeStatus('cooked', user.uid, recipe);
        setCooked(res);
        if (res) {
            showNotification({
                title: 'Recipe cooked',
                message: 'Click here to view your cooked recipes',
                onClick: () => {
                    router.push('/my-recipes/saved');
                },
                icon: <Bookmark size={12} />,
                style: { cursor: 'pointer' },
            });
        }
    };

    const duplicateInPlanner = async () => {
        const numberOfRecipesOnDate = await getNumberOfRecipesOnDate(recipe.plannerData.date, recipe.plannerData.collaborativePlannerId, user.uid);

        const doc: PlannerRecipe = {
            addedBy: user.uid,
            meal: recipe,
            date: recipe.plannerData.date,
            collaborative: recipe.plannerData.collaborative,
            collaborativePlannerId: recipe.plannerData.collaborativePlannerId ? recipe.plannerData.collaborativePlannerId : null,
            createdBy: user.uid,
            order: numberOfRecipesOnDate,
        };

        if (recipe.plannerData.collaborativePlannerId) {
            doc.plannerId = recipe.plannerData.collaborativePlannerId;
        }

        await firestore.collection('planner').add(doc);
        getPlanners && getPlanners();
    };

    return (
        <>
            {small && recipe ?
                <Card withBorder radius="md">
                    <Card.Section>
                        <Group noWrap align="center" p={0} pr="xs">
                            <Link href={`/recipes/${recipe.id}`} passHref>
                                <a>
                                    <Image src={recipe.image} height={120} width={100} fit="cover" />
                                </a>
                            </Link>
                            <Stack>
                                <Text weight={500} p={0} lineClamp={2}>
                                    <Link href={`/recipes/${recipe.id}`} passHref>
                                        <a className={classes.titleMobile}>
                                            {recipe.title}
                                        </a>

                                    </Link>

                                </Text>
                                {/* {index} */}
                                <Group position="apart" pb="xs" pr="xs">
                                    {recipe.servings ?
                                        <Group spacing="xs">
                                            <Users size={13} color={theme.colors.gray[6]} />
                                            <Text size="xs" color="dimmed">
                                                Serves {recipe.servings}
                                            </Text>

                                        </Group>
                                        : null
                                    }

                                    {/* {recipe.time ?
                                        <Group spacing="xs">
                                            <Clock size={13} color={theme.colors.gray[6]} />
                                            <Text size="xs" color="dimmed">
                                                {recipe.time} mins
                                            </Text>
                                        </Group>
                                        : null
                                    } */}

                                    <Menu position="left">
                                        {/* <Menu.Label>Application</Menu.Label> */}
                                        <AddToListButton recipes={[recipe]}>
                                            <Menu.Item icon={<Notes size={14} />}>Add to list</Menu.Item>
                                        </AddToListButton>

                                        {userCanEdit ? (
                                            <AddToPlannerButton recipe={recipe} switchDay currentDate={recipe.plannerData.date} getPlanners={getPlanners}>
                                                <Menu.Item icon={<Calendar size={14} />}>Switch day</Menu.Item>
                                            </AddToPlannerButton>) : null}

                                        {userCanEdit ? (<Menu.Item onClick={() => duplicateInPlanner()} icon={<Copy size={14} />}>Duplicate</Menu.Item>
                                        ) : null}

                                        {/* <Menu.Item
                                            icon={<Search size={14} />}
                                            rightSection={<Text size="xs" color="dimmed">⌘K</Text>}
                                        >
                                            Search
                                        </Menu.Item> */}
                                        {userCanEdit ? (
                                            <>
                                                <Divider />
                                                <Menu.Label>Danger zone</Menu.Label>
                                                <Menu.Item color="red" icon={<Trash size={14} />} onClick={() => removeFromPlanner && removeFromPlanner([recipe.plannerData.id])}>Remove from planner</Menu.Item>
                                            </>) : null}
                                    </Menu>
                                </Group>
                            </Stack>

                        </Group>
                    </Card.Section>
                </Card>

                :
                <Card withBorder radius="md" className={cx(classes.card, className)}>
                    <Card.Section>
                        {selectMode ?
                            <Image src={recipe.image} height={180} onClick={() => { selectRecipe && selectRecipe(recipe); }} />
                            : (
                                <Link href={`/recipes/${recipe.id}`} passHref>
                                    <a>
                                        <Image src={recipe.image} height={180} />
                                    </a>
                                </Link>)
                        }
                    </Card.Section>

                    <Badge className={classes.rating} variant="gradient" gradient={{ from: theme.colors[theme.primaryColor][4], to: theme.colors[theme.primaryColor][6] }}>
                        Gluten Free
                    </Badge>

                    <Text className={classes.title} weight={500}>
                        <Link href={`/recipes/${recipe.id}`} passHref>
                            <a className={classes.title}>
                                {recipe.title}
                            </a>
                        </Link>
                    </Text>

                    <Group position="apart">
                        {recipe.servings ?
                            <Group spacing="xs">
                                <Users size={13} color={theme.colors.gray[6]} />
                                <Text size="xs" color="dimmed">
                                    Serves {recipe.servings}
                                </Text>
                            </Group>
                            : null
                        }

                        {recipe.time ?
                            <Group spacing="xs">
                                <Clock size={13} color={theme.colors.gray[6]} />
                                <Text size="xs" color="dimmed">
                                    {recipe.time} mins
                                </Text>
                            </Group>
                            : null
                        }
                    </Group>

                    <Group position="apart" className={classes.footer}>
                        {recipe.creator && recipe.creator.name ?
                            <Center>
                                <Avatar src={recipe.creator.image} size={24} radius="xl" mr="xs" />
                                <Text size="xs" inline>
                                    {recipe.creator.name}
                                </Text>
                            </Center>
                            : null
                        }

                        <Group spacing={8} mr={0}>
                            <Tooltip label={saved ? 'Remove from saved' : 'Save recipe'}>
                                <ActionIcon
                                    onClick={toggleSaveRecipe}
                                    className={classes.action}
                                    style={{
                                        color: !saved ? theme.colors.yellow[7] : theme.colors.gray[0],
                                        backgroundColor: saved ? theme.colors.yellow[7] : theme.colors.gray[0],
                                    }}
                                >
                                    <Bookmark size={16} />
                                </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Add to cooked">
                                <ActionIcon
                                    onClick={toggleCooked}
                                    className={classes.action}
                                    style={{
                                        color: !cooked ? theme.colors.red[6] : theme.colors.gray[0],
                                        backgroundColor: cooked ? theme.colors.red[6] : theme.colors.gray[0],
                                    }}
                                >
                                    <Soup size={16} />
                                </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Add to list">
                                <AddToListButton recipes={[recipe]}>
                                    <ActionIcon
                                        className={classes.action}
                                    >
                                        <Notes size={16} />
                                    </ActionIcon>
                                </AddToListButton>
                            </Tooltip>
                            <Tooltip label="Add to planner">
                                <AddToPlannerButton recipe={recipe}>
                                    <ActionIcon
                                        className={classes.action}
                                    >
                                        <CalendarEvent size={16} />
                                    </ActionIcon>
                                </AddToPlannerButton>
                            </Tooltip>
                            <Tooltip label="Share">
                                <ActionIcon className={classes.action}>
                                    <Share size={16} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Group>
                </Card>
            }
        </>
    );
}
