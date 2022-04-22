import { Button, Checkbox, Divider, Group, Paper } from '@mantine/core';
import { useState } from 'react';
import { Check, InfoCircle } from 'tabler-icons-react';
// import IngredientDropdown from '../ingredients/ingredient-dropdown';
import { formatUnit, formatQuantity } from '../../lib/formatting';
import IngredientDropdown from '../IngredientDropdown/IngredientDropdown';

interface ShoppingListIngredientProps {
    ingredient: any;
    checkCombinedAmount: Function
    checkOffAllIngredientOccurances: Function
    deleteIngredient: Function
    category: any;
    measurement: string;
    list: any;
}

export function ShoppingListIngredient(props: ShoppingListIngredientProps) {
    const { ingredient, checkCombinedAmount, checkOffAllIngredientOccurances, deleteIngredient, list, category, measurement } = props;

    const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);

    return (
        <Paper radius="sm">
            <Group p="sm" position="apart" spacing="md">
                <Group>
                    <div>{ingredient.ingredient}</div>
                    <Group spacing="xs">
                        {ingredient.combinedAmounts.map((amount: { checked: boolean }, i3: number) => (
                            <Button
                                variant={amount.checked ? 'filled' : 'outline'}
                                radius="xl"
                                size="xs"
                                onClick={() => checkCombinedAmount(amount, ingredient)}
                                key={i3}
                                leftIcon={amount.checked ? <Check size={10} /> : null}
                            >
                                {formatQuantity(amount, measurement, ingredient)} {formatUnit(amount, measurement, ingredient)}
                            </Button>
                        ))}
                    </Group>
                </Group>

                <Group spacing="xs">
                    <Checkbox onClick={() => checkOffAllIngredientOccurances(ingredient, category.name !== 'Checked')} checked={category.name === 'Checked'} />
                    <Button variant="subtle" onClick={() => setShowIngredientDropdown(!showIngredientDropdown)}>
                        <InfoCircle />
                    </Button>                   {/* <button onClick={() => deleteIngredient(ingredient)}>Delete</button> */}

                </Group>

            </Group>
            {showIngredientDropdown &&
                <>
                    <Divider size="xs" />
                    <Group p="sm">
                        <IngredientDropdown ingredient={ingredient} list={list} />
                    </Group>
                </>
            }
        </Paper>

    );
}

export default ShoppingListIngredient;
