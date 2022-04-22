import React, { useContext, useEffect, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { Bookmark, CalendarEvent, Clock, Notes, Share, Soup, Users } from 'tabler-icons-react';
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
} from '@mantine/core';
import { useModals } from '@mantine/modals';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Recipe } from '../../lib/types';
import { AddToList, AddToListItemProps } from '../AddToList/AddToList';
import { UserContext } from '../../lib/context';
import { firestorePromiseAdd } from '../../lib/ingredients/ingredients';

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

    action: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
    },

    footer: {
        marginTop: theme.spacing.md,
    },
}));

interface RecipeCardProps {
    recipe: Recipe
}

export default function RecipeCard({
    className,
    recipe,
}: RecipeCardProps & Omit<React.ComponentPropsWithoutRef<'div'>, keyof RecipeCardProps>) {
    const { classes, cx } = useStyles();
    const theme = useMantineTheme();
    const modals = useModals();
    const router = useRouter();
    const { user } = useContext(UserContext);

    const [saved, setSaved] = useState(true);
    const [cooked, setCooked] = useState(true);
    const [ingredientsToAdd, setIngredientsToAdd] = useState([]);
    const [modalIncrement, setModalIncrement] = useState(0);

    const toggleSaveRecipe = async () => {
        setSaved(!saved);

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

    const addToList = async () => {
        console.log('Adding to list', ingredientsToAdd);

        //Construct a clean list of ingredients
        const ingredients: AddToListItemProps[] = [];

        ingredientsToAdd.forEach((i: AddToListItemProps) => {
            if (i.checked) {
                const document = {
                    checked: false,
                    ingredient: i.ingredient,
                    quantity: i.quantity,
                    unit: i.unit,
                    listId: user.uid,
                    recipe: i.recipe,
                };
                console.log('Doc', document);
                ingredients.push(document);
            }
        });

        console.log('Ingredients to add to final list:', ingredients);
        ingredients.forEach(i => {
            console.log(`${i.quantity} ${i.unit} ${i.ingredient}`);
        });
        await firestorePromiseAdd('list_items', ingredients);

        showNotification({
            title: 'Added to list',
            message: 'Click here to view your list',
            onClick: () => {
                router.push('/list');
            },
            icon: <Notes size={12} />,
            style: { cursor: 'pointer' },
        });
    };

    const addToListModal = () => {
        modals.openConfirmModal({
            title: 'Add to list',
            children: (
                <>
                    <AddToList recipes={[recipe]} updateIngredientsProp={setIngredientsToAdd} />
                </>
            ),
            labels: { confirm: 'Add to list', cancel: 'Cancel' },
            onConfirm: () => {
                console.log('CONFIRM INGREDIENTS TO ADD', ingredientsToAdd);
                // addToList();
                setModalIncrement(modalIncrement + 1);
            },
        });
    };

    useEffect(() => {
        if (modalIncrement > 0) addToList();
    }, [modalIncrement]);

    return (
        <Card withBorder radius="md" className={cx(classes.card, className)}>
            <Card.Section>
                <Link href={`/recipes/${recipe.id}`} passHref>
                    <a>
                        <Image src={recipe.image} height={180} />
                    </a>
                </Link>
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
                        <ActionIcon
                            onClick={addToListModal}
                            className={classes.action}
                        >
                            <Notes size={16} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Add to planner">
                        <ActionIcon className={classes.action}>
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
    );
}
