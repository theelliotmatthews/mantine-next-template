/* eslint-disable import/no-cycle */
/* eslint-disable no-restricted-syntax */
import { Button, Group, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { AddToShoppingListIngredient } from '../AddToShoppingListIngredient/AddToShoppingListIngredient';
import { QuantityInput } from '../QuantityInput/QuantityInput';
import { AddToListItemProps } from '../ColorSchemeToggle/AddToList/AddToList';

interface ListRecipeProps {
    recipe: any;
    updateIngredients: Function;
    index: number
}

export function ListRecipe(props: ListRecipeProps) {
    const { recipe, updateIngredients, index } = props;

    const [servingsMultiplier, setServingsMultiplier] = useState(1);
    const [servings, setServings] = useState(recipe.servings ? recipe.servings : 1);

    // Make a copy of ingredients and set each one to selected true as default
    const [ingredientsToAdd, setIngredientsToAdd] = useState<AddToListItemProps[]>([]);

    const adjustServings = (newServings: number) => {
        setServings(newServings);
    };

    const toggleIngredient = (ingredient: AddToListItemProps) => {
        // Search ingredients and change the state of checked
        const copy = [...ingredientsToAdd];
        for (const i of copy) {
            if (i.id === ingredient.id) {
                i.checked = !i.checked;
                // console.log('Found ingredient', i);
                break;
            }
        }

        setIngredientsToAdd(copy);
    };

    // Give each ingredient an ID and set it's checked to true by default
    useEffect(() => {
        const ingredients = [...recipe.ingredients_formatted];
        for (let i = 0; i < ingredients.length; i += 1) {
            ingredients[i].checked = true;
            ingredients[i].id = i + 1;
            ingredients[i].recipe = {
                id: recipe.id,
                title: recipe.title,
            };
            ingredients[i].index = index;
        }

        setIngredientsToAdd(ingredients);
        console.log('Setting ingredients to add', ingredients);
    }, []);

    // Update the servings multiplier
    useEffect(() => {
        const newMultiplier = (parseInt(recipe.servings ? recipe.servings : 1, 10) / parseInt(servings, 10));
        setServingsMultiplier(newMultiplier);
    }, [servings]);

    // Listen for ingredient changes and update function
    useEffect(() => {
        updateIngredients(ingredientsToAdd, servingsMultiplier, index);
        // setInitialFetch(true)
    }, [ingredientsToAdd, servingsMultiplier]);

    // Used for selecting / unselecting all
    const setAll = (checked: boolean) => {
        const copy = [...ingredientsToAdd];
        for (const i of copy) {
            i.checked = checked;
        }

        setIngredientsToAdd(copy);
    };

    const selectButtons = [
        {
            label: 'Select all',
            checked: true,
        },
        {
            label: 'Unselect all',
            checked: false,
        },
    ];

    const multipliers = [2, 3, 4];

    return (
        <Stack>
            <Text>{recipe.title}</Text>

            <Group noWrap grow={false} position="left">
                {/* <ChangeAmountButton onChange={adjustServings} amount={servings} /> */}
                <QuantityInput updateValue={adjustServings} defaultValue={servings} label={'Serves'} />
                {multipliers.map((multiplier, i) => <Button key={i} type="button" onClick={() => setServings(multiplier * recipe.servings)} size="xs" variant="outline">{multiplier}x</Button>)}
            </Group>
            <Group grow>
                {selectButtons.map((button, i) => <Button key={i} type="button" onClick={() => setAll(button.checked)} size="xs">{button.label}</Button>)}
            </Group>
            <Stack spacing="xs">
                {(recipe && recipe.ingredients_formatted) ? ingredientsToAdd.map((ingredient, i) => <AddToShoppingListIngredient key={i} ingredient={ingredient} select={toggleIngredient} multiplier={servingsMultiplier} />)
                    : null}
            </Stack>
        </Stack>
    );
}

export default ListRecipe;
