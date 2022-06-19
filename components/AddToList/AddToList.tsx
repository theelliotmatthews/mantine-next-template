import { useEffect, useContext, useState } from 'react';
import { createStyles, Stack } from '@mantine/core';
import ListRecipe from '../ListRecipe/ListRecipe';
import { Recipe } from '../../lib/types';
import { UserContext } from '../../lib/context';
import { firestorePromiseAdd } from '../../lib/ingredients/ingredients';

const useStyles = createStyles(() => ({
    modal: {
        overflow: 'hidden',
    },
    maxHeightModal: {
        maxHeight: '60vh',
        overflowY: 'scroll',
    },
}));

interface AddToListProps {
    recipes: Recipe[];
    updateIngredientsProp: Function;
}

export interface AddToListItemProps {
    ingredient: string;
    quantity: number;
    unit: string;
    recipe?: Recipe;
    checked: boolean;
    index?: number;
    id?: number;
}

export function AddToList(props: AddToListProps) {
    const { user } = useContext(UserContext);
    const { recipes, updateIngredientsProp } = props;
    const { classes } = useStyles();

    const [servingsMultiplier, setServingsMultiplier] = useState(1);

    // Make a copy of ingredients and set each one to selected true as default
    const [ingredientsToAdd, setIngredientsToAdd] = useState<AddToListItemProps[] | []>([]);

    const addToList = async () => {
        // console.log('Adding to list', ingredientsToAdd)

        //Construct a clean list of ingredients
        const ingredients: AddToListItemProps[] = [];

        ingredientsToAdd.forEach((i: AddToListItemProps) => {
            if (i.checked) {
                const document = {
                    checked: false,
                    ingredient: i.ingredient,
                    quantity: i.quantity * servingsMultiplier,
                    unit: i.unit,
                    listId: user.uid,
                    recipe: i.recipe,
                };

                ingredients.push(document);
            }
        });

        // console.log('Ingredients to add to final list:', ingredients);
        // ingredients.forEach(i => {
        //     console.log(`${i.quantity} ${i.unit} ${i.ingredient}`);
        // });
        await firestorePromiseAdd('list_items', ingredients);
    };

    // Populate initial list
    useEffect(() => {
        const ingredients: AddToListItemProps[] = [];

        recipes.forEach((recipe, index) => {
            recipe.ingredients_formatted.forEach((ingredient, id) => {
                ingredients.push({
                    ...ingredient,
                    checked: true,
                    index,
                    id,
                });
            });
        });

        setIngredientsToAdd(ingredients);
        updateIngredientsProp(ingredients);
    }, []);

    const updateIngredients = (ingredients: AddToListItemProps[], multiplier: number, index: number) => {
        if (ingredients.length === 0) return;

        // Remove all ingredients from ingredients with the current index
        let ingredientsCopy = [...ingredientsToAdd];
        ingredientsCopy = ingredientsCopy.filter(i => i.index !== index);

        const updatedIngredients: AddToListItemProps[] = [];
        ingredients.forEach(ingredient => {
            const copy = { ...ingredient };
            copy.quantity /= multiplier;
            if (ingredient.checked) {
                updatedIngredients.push(copy);
            }
        });

        ingredientsCopy = [...ingredientsCopy, ...updatedIngredients];
        setIngredientsToAdd(ingredientsCopy);
        updateIngredientsProp(ingredientsCopy);
    };

    return (
        <div>
            {/* <ModalWrapper title="Add to list" confirmButtonColor="bg-primary-medium" confirmButtonText="Add" onClick={addToList} hideConfirmButton={ingredientsToAdd.length === 0}> */}
            <Stack className={classes.maxHeightModal}>
                {recipes.map((recipe, index) => (
                    <ListRecipe key={index} index={index} recipe={recipe} updateIngredients={updateIngredients} />
                    // <div key={index}>{recipe.title}</div>
                ))}
            </Stack>
            {/* </ModalWrapper> */}
        </div>
    );
}

export default AddToList;
