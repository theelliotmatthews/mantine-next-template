import { Badge, Button, Card, Divider, Grid, Group, Image, Stack, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { json } from 'stream/consumers';
import { Bookmark, Calendar, Clock, Folder, Soup, User } from 'tabler-icons-react';
import { UserContext } from '../../lib/context';
import { formatTime } from '../../lib/formatting';
import { checkIfRecipeIsInMealPlan } from '../../lib/planner/planner';
import { checkRecipeStatus, toggleRecipeStatus } from '../../lib/recipes/recipes';
import { Recipe } from '../../lib/types';
import AddToCollectionButton from '../AddToCollectionButton/AddToCollectionButton';
import AddToPlannerButton from '../AddToPlannerButton/AddToPlannerButton';
import NutrientStats from '../NutrientStats/NutrientStats';
import RecipeIngredients from '../RecipeIngredients/RecipeIngredients';
import RecipeInstruction from '../RecipeInstruction/RecipeInstruction';
import RecipeNutrition from '../RecipeNutrition/RecipeNutrition';
import Reviews from '../Reviews/Reviews';
import SimilarRecipes from '../SimilarRecipes/SimilarRecipes';
import { UserCard } from '../UserCard/UserCard';

interface RecipeComponentProps {
    recipe: Recipe
    popup?: boolean
}

export default function RecipeComponent(props: RecipeComponentProps) {
    const { recipe, popup } = props;
    const { user } = useContext(UserContext);
    const router = useRouter();

    const [saved, setSaved] = useState(false);
    const [cooked, setCooked] = useState(false);
    const [plannerOccurances, setPlannerOccurances] = useState([]);

    // Check recipe status on load
    useEffect(() => {
        if (user) {
            const checkStatus = async () => {
                const status = await checkRecipeStatus(user.uid, recipe.id);
                setSaved(status.saved);
                setCooked(status.cooked);
            };

            const checkForOccurances = async () => {
                const res = await checkIfRecipeIsInMealPlan(user.uid, recipe.id);
                console.log('Meal plan occurancerss', res);
                setPlannerOccurances(res);
            };

            checkStatus();
            checkForOccurances();
        }
    }, [user]);

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
    useEffect(() => {
        console.log('Recipe component', recipe);
    }, []);

    const formatDate = (date) => {
        return format(date, "do MMMM");

    }

    return (
        <Stack spacing="xs" px={0}>
            <h1>{recipe.title}</h1>

            {plannerOccurances.length > 0 ? (
                <Group>
                    {plannerOccurances.map((occurance) => (
                        <Link key={occurance.id} href={occurance.collaborative ? `/shared-planner/${occurance.planner.id}` : '/planner'}>
                            <Badge p={12} style={{ cursor: 'pointer' }}>
                                <Text transform="capitalize" size="xs">In {occurance.collaborative ? occurance.planner.title : 'planner'} on {formatDate(occurance.date.toDate())}</Text>
                            </Badge>
                        </Link>))}
                </Group>) : null}

            <Group>
                {recipe.servings ? (
                    <Group spacing="xs">
                        <User />
                        <Text>Serves {recipe.servings}</Text>
                    </Group>) : null}

                {recipe.time ? (
                    <Group spacing="xs">
                        <Clock />
                        <Text>{formatTime(recipe.time)}</Text>
                    </Group>) : null}
            </Group>
            <Divider my={12} />

            <Group spacing={8}>
                <Button onClick={() => toggleSaveRecipe()} leftIcon={<Bookmark size={16} />} variant={saved ? 'filled' : 'outline'}>{saved ? 'Saved' : 'Save'}</Button>
                <Button onClick={() => toggleCooked()} leftIcon={<Soup size={16} />} variant={cooked ? 'filled' : 'outline'}>{cooked ? 'In cooked' : 'Add to cooked'}</Button>
                <AddToPlannerButton recipe={recipe}><Button leftIcon={<Calendar size={16} />} variant="outline">Add to planner</Button></AddToPlannerButton>
                <AddToCollectionButton recipe={recipe}><Button leftIcon={<Folder size={16} />} variant="outline">Add to collection</Button></AddToCollectionButton>
            </Group>

            <Grid p={8}>
                <Grid.Col sm={12} md={6} lg={9} style={{ maxHeight: '800px', backgroundImage: `url("${recipe.image}")`, backgroundPosition: 'center center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', borderRadius: '8px' }}>
                    {/* <Image src={recipe.image} fit="contain"  style={{ overflow: 'hidden' }} /> */}
                </Grid.Col>
                <Grid.Col sm={12} md={6} lg={3} py={0}>
                    <Stack spacing={8}>
                        {recipe.creator ?
                            <UserCard
                                image={recipe.creator?.image}
                                avatar={recipe.creator.image}
                                name={recipe.creator.name}
                                tagline="Recipe creator"
                                id={recipe.creator.id}
                                stats={[{ label: 'Followers', value: '200' }, { label: 'Recipes', value: recipe.creator.count }]}
                            /> : null}
                    </Stack>
                </Grid.Col>
            </Grid>

            <Grid>
                <Grid.Col sm={12} md={6}>
                    <Card p="xl" withBorder>
                        <RecipeIngredients recipe={recipe} />
                    </Card>
                </Grid.Col>
                <Grid.Col sm={12} md={6}>
                    <Card p="xl" withBorder>
                        <NutrientStats recipes={[recipe]} recipePage />
                    </Card>
                </Grid.Col>
            </Grid>

            {recipe.description ? (
                <>
                    <Text weight="bold">Description</Text>
                    <Card withBorder>

                        <Text>{recipe.description}</Text>
                    </Card>
                </>) : null}

            {recipe.method ?
                <Stack spacing={8}>
                    <Text weight="bold">Method</Text>
                    {recipe.v2 ?
                        recipe.methodIds.map((id, index) => <RecipeInstruction key={index} index={index + 1} instruction={recipe.method[id].instruction as string} />)
                        : recipe.method.map((instruction, index) => <RecipeInstruction key={index} index={index + 1} instruction={instruction as string} />)}
                </Stack> : null}

            {recipe.title && <SimilarRecipes title={recipe.title} id={recipe.id} sectionTitle="Similar recipes" />}
            {recipe.title && <SimilarRecipes title={recipe.title} id={recipe.id} channel={recipe.channel} sectionTitle="More from this channel" buttonText="See more" buttonLink={`/channel/${recipe.channel_path}`} />}

            <Reviews id={recipe.id} recipe={recipe} />

        </Stack>
    );
}
