/* eslint-disable no-restricted-syntax */
import { Button, Center, Grid, Group, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Notes } from 'tabler-icons-react';
import { fetchIngredientData } from '../../lib/ingredients/ingredients';

import { Recipe } from '../../lib/types';
import AddToListButton from '../AddToListButton/AddToListButton';
import ChangeAmountButton from '../ChangeAmountButton/ChangeAmountButton';
import RecipeIngredient from '../RecipeIngredient/RecipeIngredient';

interface RecipeIngredientsProps {
    recipe: Recipe
}

export function RecipeIngredients(props: RecipeIngredientsProps) {
    const { recipe } = props;

    const [view, setView] = useState('formatted');
    const [unit, setUnit] = useState('original');
    const [serves, setServes] = useState(recipe.servings ? recipe.servings : 1);
    const [servesMultiplier, setServesMultiplier] = useState(1);
    const [ingredientsInGroups, setIngredientsInGroups] = useState([]);
    const [ingredientsWithData, setIngredientsWithData] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [amazonFormattedIngredients, setAmazonFormattedIngredients] = useState([]);


    const views = ['formatted', 'original'];
    const units = ['original', 'metric', 'imperial'];
    const multipliers = [1, 2, 3, 4];

    // Add to shopping list
    const addToShoppingList = async () => {
        // showModal('list', [recipe]);
    };

    // Order on Amazon
    const orderOnAmazon = () => {
        // showModal('amazon', amazonFormattedIngredients);
    };

    // Listen to serves change to update multiplier
    useEffect(() => {
        console.log('Serves changing');
        setServesMultiplier(serves / (recipe.servings ? recipe.servings : 1));
    }, [serves]);

    // Fetch data for each ingredient
    useEffect(() => {
        const fetchData = async () => {
            const copy = recipe.v2 ? [...recipe.ingredients] : [...recipe.ingredients_formatted];
            const promises = [];
            for (const ingredient of copy) {
                if (!ingredient.data) {
                    const promise = fetchIngredientData(ingredient.ingredient);
                    promises.push(promise);
                }
            }

            // Match up
            if (promises.length > 0) {
                await Promise.all(promises).then((values) => {
                    // console.log('Promise values', values)
                    // Match up
                    for (const ingredient of copy) {
                        for (const r of values) {
                            if (r && (ingredient.ingredient === r.ingredient)) {
                                ingredient.data = { ...r };
                                // console.log('Ingredient updates', ingredient)
                                break;
                            }
                        }
                    }
                });
            }

            setIngredientsWithData(copy);
            setDataFetched(true);
        };

        fetchData();
    }, []);

    // Sort ingredients into groups
    useEffect(() => {
        if (ingredientsWithData && dataFetched) {
            const groups = [{
                name: null,
                ingredients: [],
            }];

            (recipe.v2 ? recipe.ingredients : recipe.ingredients_formatted).forEach(ingredient => {
                if (ingredient.group) {
                    const namedGroup = groups.find(x => x.name === ingredient.group);

                    if (namedGroup) {
                        namedGroup.ingredients.push(ingredient);
                    } else {
                        groups.push({
                            name: ingredient.group,
                            ingredients: [ingredient],
                        });
                    }
                } else {
                    const noNameGroup = groups.find(x => x.name === null);
                    noNameGroup.ingredients.push(ingredient);
                }
            });

            console.log('Groups', groups);
            setIngredientsInGroups(groups);
        }
    }, [ingredientsWithData, dataFetched]);

    // Populate Amazon fresh basket
    useEffect(() => {
        const amazonIngredients = [];
        for (const ingredient of recipe.v2 ? recipe.ingredients : recipe.ingredients_formatted) {
            amazonIngredients.push({ ...ingredient, combinedAmounts: [{ unit: ingredient.unit, quantity: ingredient.quantity }] });
        }
        setAmazonFormattedIngredients([{
            combinedIngredients: amazonIngredients,
        }]);
    }, []);

    return (
        <Stack>
            <Group position="apart">
                <Text size="lg">Ingredients</Text>
                <Group>
                    <ChangeAmountButton onChange={setServes} amount={serves} amountPrefix="Serves" />
                    <Group spacing={4}>
                        {multipliers.map((m, index) => <Button key={index} variant="outline" onClick={() => setServes(m * recipe.servings)} className="text-sm border h-10 w-10 flex items-center justify-center">{m}x</Button>)}
                    </Group>
                </Group>
            </Group>

            <Stack spacing="xs">
                {/* Different views */}
                {!recipe.custom &&
                    <Group grow spacing="xs">
                        {views.map((v, index) => <Button key={index} onClick={() => setView(v)} variant={v === view ? 'filled' : 'outline'}>{v}</Button>)}
                    </Group>
                }

                {/* Different units */}
                {
                    view !== 'original' &&
                    <Group grow spacing="xs">
                        {units.map((v, index) => <Button key={index} onClick={() => setUnit(v)} variant={v === unit ? 'filled' : 'outline'}>{v}</Button>)}
                    </Group>
                }
            </Stack>

            {/* Ingredient items */}
            {/* If original, just list out the list of original ingredients */}
            {
                view === 'original' ?
                    <Stack>
                        {recipe.ingredients.map((ingredient, index) => <div key={index}>{ingredient}</div>)}
                    </Stack>
                    :
                    // Else list in different formats
                    <Stack>
                        {ingredientsInGroups.map((group, index) => <div key={index}>
                            {group.name && <Center><Text weight="bold">{group.name}</Text></Center>}
                            {group.ingredients && <Stack>
                                {group.ingredients.map((ingredient, i) => <RecipeIngredient key={i} ingredient={ingredient} multiplier={servesMultiplier} measurement={unit} />)}
                            </Stack>}
                        </div>)}
                    </Stack>
            }

            <Grid grow>
                {/* Shopping list button */}
                <Grid.Col span={6}>
                    <AddToListButton recipes={[recipe]}>
                        <Button leftIcon={<Notes size={16} />} style={{ width: '100%' }}>Add to list</Button>
                    </AddToListButton>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Button type="button" onClick={() => orderOnAmazon()} style={{ width: '100%' }}>Order on Amazon</Button>
                </Grid.Col>
            </Grid>

        </Stack>
    );
}

export default RecipeIngredients;
