/* eslint-disable no-lonely-if */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { Bookmark, Calendar, CalendarEvent, Clock, Notes, Share, Soup, Trash, Users } from 'tabler-icons-react';
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
import { ITEM_TYPE, ITEM_TYPES, Recipe } from '../../lib/types';

import { UserContext } from '../../lib/context';
import { firestorePromiseAdd } from '../../lib/ingredients/ingredients';
import { checkRecipeStatus, toggleRecipeStatus } from '../../lib/recipes/recipes';
import { AddToPlanner } from '../AddToPlanner/AddToPlanner';
import { AddToListItemProps, AddToList } from '../AddToList/AddToList';
import { getNumberOfRecipesOnDate, removeRecipeFromPlanner } from '../../lib/planner/planner';
import AddToListButton from '../AddToListButton/AddToListButton';

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
}

interface RecipesToAddToPlanner {
    selectedDates: Date[];
    addingToSharedPlanner: boolean;
    selectedSharedPlanners: string[];
    data: Recipe[];
    switchDay: boolean;
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
    selectRecipe
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
    const [recipesToAddToPlanner, setRecipesToAddToPlanner] = useState<RecipesToAddToPlanner>({
        selectedDates: [],
        addingToSharedPlanner: false,
        selectedSharedPlanners: [],
        data: [],
        switchDay: false,
    });
    const [plannerModalIncrement, setPlannerModalIncrement] = useState(0);

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
        setSaved(!saved);

        await toggleRecipeStatus('saved', user.uid, recipe);

        if (!saved) {
            showNotification({
                title: 'Recipe saved',
                message: 'Click here to view your saved recipes',
                onClick: () => {
                    router.push('/my-recipes');
                },
                icon: <Bookmark size={12} />,
                style: { cursor: 'pointer' },
            });
        }
    };

    const toggleCooked = async () => {
        setCooked(!cooked);
    };

    const addRecipesToPlanner = async () => {
        console.log('Adding to planner with data: ', recipesToAddToPlanner.data);

        // Store all docs to add in an array
        const docs = [];

        let sameDaySameRecipe = null;

        for (const date of recipesToAddToPlanner.selectedDates) {
            // Adding to a planner normally
            if (!recipesToAddToPlanner.switchDay) {
                // console.log('Date were adding', date)
                if (recipesToAddToPlanner.addingToSharedPlanner && (recipesToAddToPlanner.selectedSharedPlanners.length > 0)) {
                    for (const planner of recipesToAddToPlanner.selectedSharedPlanners) {
                        // Get number of recipes on this date
                        const numberOfRecipesOnDate = await getNumberOfRecipesOnDate(date, planner, user.uid);

                        for (let x = 0; x < recipesToAddToPlanner.data.length; x++) {
                            const doc = {
                                addedBy: user.uid,
                                meal: recipesToAddToPlanner.data[x],
                                date,
                                plannerId: planner,
                                collaborative: true,
                                order: numberOfRecipesOnDate + x,
                            };
                            docs.push(doc);
                        }
                    }
                } else {
                    // Get number of recipes on this date
                    const numberOfRecipesOnDate = await getNumberOfRecipesOnDate(date, null, user.uid);

                    for (let x = 0; x < recipesToAddToPlanner.data.length; x++) {
                        const doc = {
                            addedBy: user.uid,
                            meal: recipesToAddToPlanner.data[x],
                            date,
                            collaborative: false,
                            createdBy: user.uid,
                            order: numberOfRecipesOnDate + x,
                        };
                        docs.push(doc);
                    }
                }
            } else {
                // Updating an existing planner
                if (isSameDay(date, recipesToAddToPlanner.data[0].plannerData.date)) sameDaySameRecipe = recipesToAddToPlanner.data[0];
                else {
                    // Get number of recipes on this date
                    const numberOfRecipesOnDate = await getNumberOfRecipesOnDate(date, null, user.uid);

                    for (let x = 0; x < recipesToAddToPlanner.data.length; x++) {
                        const doc: {
                            addedBy: string,
                            meal: Recipe,
                            date: Date,
                            collaborative: boolean,
                            order: number,
                            plannerId?: string,
                            createdBy?: string
                        } = {
                            addedBy: user.uid,
                            meal: recipesToAddToPlanner.data[x],
                            date,
                            collaborative: !!recipesToAddToPlanner.data[x].plannerData.collaborativePlannerId,
                            order: numberOfRecipesOnDate + x,
                        };

                        if (recipesToAddToPlanner.data[x].plannerData.collaborativePlannerId !== undefined) {
                            doc.plannerId = recipesToAddToPlanner.data[x].plannerData.collaborativePlannerId;
                        } else {
                            doc.createdBy = user.uid;
                        }
                        docs.push(doc);
                    }
                }
            }
        }

        if ((sameDaySameRecipe === null) && recipesToAddToPlanner.switchDay) {
            await removeRecipeFromPlanner(recipesToAddToPlanner.data[0].plannerData.id, true, recipesToAddToPlanner.data, user.uid);
        }

        // console.log('Docs to add', docs)
        await firestorePromiseAdd('planner', docs);

        showNotification({
            title: 'Added to planner',
            message: 'Click here to view your planner',
            onClick: () => {
                router.push('/planner');
            },
            icon: <Calendar size={12} />,
            style: { cursor: 'pointer' },
        });
    };

    const addToPlannerModal = () => {
        modals.openConfirmModal({
            title: 'Add to planner',
            children: (
                <>
                    <AddToPlanner recipes={[recipe]} updatePlannerRecipes={setRecipesToAddToPlanner} />
                </>
            ),
            labels: { confirm: 'Add to planner', cancel: 'Cancel' },
            onConfirm: () => {
                console.log('CONFIRM INGREDIENTS TO ADD', ingredientsToAdd);
                // addToList();
                setPlannerModalIncrement(plannerModalIncrement + 1);
            },
        });
    };

    useEffect(() => {
        if (plannerModalIncrement > 0) addRecipesToPlanner();
    }, [plannerModalIncrement]);

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
                                        {/* <Menu.Item
                                            icon={<Search size={14} />}
                                            rightSection={<Text size="xs" color="dimmed">⌘K</Text>}
                                        >
                                            Search
                                        </Menu.Item> */}

                                        <Divider />

                                        <Menu.Label>Danger zone</Menu.Label>
                                        <Menu.Item color="red" icon={<Trash size={14} />}>Remove from planner</Menu.Item>
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
                                <ActionIcon
                                    onClick={addToPlannerModal}
                                    className={classes.action}
                                >
                                    <CalendarEvent size={16} />
                                </ActionIcon>
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
