/* eslint-disable no-restricted-syntax */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Badge, Button, Group, Stack } from '@mantine/core';
import { BrandGoogle, ChartBar, Notes, Soup } from 'tabler-icons-react';
import { IngredientOccurance } from '../../lib/types';
// import { ModalContext } from '../../lib/context';

interface IngredientDropdownProps {
    ingredient: any;
    list: any
}

export function IngredientDropdown(props: IngredientDropdownProps) {
    const { ingredient, list } = props;

    const router = useRouter();

    // const { showModal } = useContext(ModalContext);

    // Work out ingredient occurances
    const [occurances, setOccurances] = useState<IngredientOccurance[]>([]);
    const [showNutrition, setShowNutrition] = useState(false);

    useEffect(() => {
        if (list) {
            console.log('COL', list);

            const ingredientOccurances = [];
            for (const item of list) {
                if (item.ingredient === ingredient.ingredient) {
                    ingredientOccurances.push({
                        recipeTitle: item.recipe && item.recipe.title ? item.recipe.title : 'No recipe',
                        recipeId: item.recipe && item.recipe.id ? item.recipe.id : null,
                        unit: item.unit,
                        quantity: item.quantity,
                    });
                }
            }

            setOccurances(ingredientOccurances);
            console.log('Occurances', occurances);
        }
    }, [list]);

    const addToList = () => {
        console.log('Adding ingredient to list', ingredient);
        // showModal('ingredient', [{
        //     ingredient: ingredient.ingredient,
        //     amount: ingredient.combinedAmounts[0],
        //     exampleServings: ingredient.data && ingredient.data.example_servings ? ingredient.data.example_servings : [],
        // }]);
    };

    const toggleNutrition = () => {
        setShowNutrition(!showNutrition);
    };

    const googleSearch = () => {
        window.open(`https://www.google.com/search?q=${ingredient.ingredient}`, '_blank');
    };

    const findRecipes = () => {
        router.push({
            pathname: '/search',
            query: { ingredient: ingredient.ingredient },
        });
    };

    // Buttons
    const buttons = [
        {
            label: 'Add to list',
            action: addToList,
            icon: <Notes size={14} />,
        },
        {
            label: 'Nutrition',
            action: toggleNutrition,
            icon: <ChartBar size={14} />,
        },
        {
            label: 'Search',
            action: googleSearch,
            icon: <BrandGoogle size={14} />,
        },
        {
            label: 'Recipes',
            action: findRecipes,
            icon: <Soup size={14} />,
        },
    ];

    return (
        <Stack>
            {occurances.length > 0 &&
                <Group>
                    {occurances.map((occ, index) => (
                        <Group key={index}>
                            <Badge>{occ.quantity} {occ.unit}</Badge>
                            <div>{occ.recipeTitle ? occ.recipeTitle : 'No recipe'}</div>
                        </Group>
                    ))}
                </Group>
            }
            <Group spacing="xs">
                {buttons.map((button, index) => <Button key={index} onClick={button.action} leftIcon={button.icon} size="xs" variant="light">{button.label}</Button>)}
            </Group>

        </Stack>

    );
}

export default IngredientDropdown;
