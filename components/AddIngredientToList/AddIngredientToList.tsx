/* eslint-disable no-restricted-syntax */
import { Button, Group, NumberInput, Stack, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { unitsList } from '../../lib/lists';
import { findExactIngredient } from '../../lib/search/ingredient-search';
import { Ingredient } from '../../lib/types';
import Dropdown from '../Dropdown/Dropdown';

interface AddIngredientToListProps {
    ingredient: string;
    ingredientFile: Ingredient[];
    updateIngredientToAdd: Function;
}

export function AddIngredientToList(props: AddIngredientToListProps) {
    const { ingredient, ingredientFile, updateIngredientToAdd } = props;
    // const { data } = useContext(ModalContext);
    // console.log('Recipes in modal ', recipes)
    // const [servings, setServings] = useState(recipe.servings)

    const [units, setUnits] = useState<{ label: string; value: string }[]>([]);
    const [ingredientWithData, setIngredientWithData] = useState<Ingredient>();
    // const [commonServings, setCommonServings] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState<string>('');
    const [selectedQuantity, setSelectedQuantity] = useState<number>();

    // Select a unit from the dropdown
    const selectUnit = (unit: string) => {
        setSelectedUnit(unit);
    };

    // Add a common serving
    const addCommonServing = (serving: { unit: string; quantity: any }) => {
        setSelectedUnit(serving.unit);
        setSelectedQuantity(parseFloat(serving.quantity));
    };

    // Fetch units and common servings and ingredient data
    useEffect(() => {
        const fetchIngredient = async () => {
            const res = await findExactIngredient(ingredient, ingredientFile);
            if (res) {
                setIngredientWithData(res);
                if (res.example_servings) {
                    setSelectedUnit(res.example_servings[0].unit);
                }
            } else {
                setIngredientWithData({ ingredient });
            }
        };

        fetchIngredient();

        const unitObject = unitsList();
        const unitsSimplified = [];
        for (const unit of unitObject) {
            for (const [key] of Object.entries(unit)) {
                // unit.unit = key;
                unitsSimplified.push({ label: key, value: key });
            }
        }

        setUnits(unitsSimplified.sort());
    }, []);

    // Listen to changes in anything to update ingredient
    useEffect(() => {
        updateIngredientToAdd({
            ingredient,
            quantity: selectedQuantity,
            unit: selectedUnit,
        });
    }, [selectUnit, selectedQuantity]);

    return (
        <Stack>
            {ingredientWithData ?
                <Stack>
                    <Title order={2}>{ingredientWithData.ingredient}</Title>
                    {ingredientWithData.example_servings && ingredientWithData.example_servings.length > 0 &&
                        <Stack>
                            <Title order={5}>Common servings</Title>
                            <Group position="left" spacing="xs">
                                {ingredientWithData.example_servings.map((serving, index) =>
                                    <Button key={index} onClick={() => addCommonServing(serving)} size="xs" variant="outline">
                                        {serving.quantity} {serving.unit}
                                    </Button>)}
                            </Group>
                        </Stack>
                    }
                </Stack>
                : null
            }

            <Group>
                <NumberInput
                    placeholder="Quantity"
                    defaultValue={selectedQuantity}
                    value={selectedQuantity}
                />
                <Dropdown items={units} selectItem={selectUnit} default={{ label: selectedUnit, value: selectedUnit }} />
            </Group>
        </Stack>
    );
}

export default AddIngredientToList;
