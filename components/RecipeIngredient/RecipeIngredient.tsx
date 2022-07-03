import { Button, Group, Text } from '@mantine/core';
import { useState, useEffect } from 'react';
import { CircleX, InfoCircle } from 'tabler-icons-react';
import { formatQuantity, formatUnit } from '../../lib/formatting';
import { IngredientDropdown } from '../IngredientDropdown/IngredientDropdown';

interface RecipeIngredientProps {
    ingredient: any;
    multiplier: number;
    measurement: string;
}

export function RecipeIngredient(props: RecipeIngredientProps) {
    const { ingredient, multiplier, measurement } = props;

    const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);

    return (
        <div className="bg-white rounded-md p-4">

            <Group position="apart">
                <Group className="flex items-center space-x-2">

                    <Group spacing={4}>

                        <div>{formatQuantity({ quantity: ingredient.quantity * multiplier, unit: ingredient.unit }, measurement, ingredient)} {formatUnit({ quantity: ingredient.quantity * multiplier, unit: ingredient.unit }, measurement, ingredient)}</div>
                        <Text weight="bold" >{ingredient.ingredient}</Text>
                    </Group>
                </Group>

                <Group className="flex items-center space-x-4">
                    <Button variant="subtle" onClick={() => setShowIngredientDropdown(!showIngredientDropdown)}>
                        {showIngredientDropdown ? <CircleX /> : <InfoCircle />}
                    </Button>
                </Group>

            </Group>
            {showIngredientDropdown &&
                <div>
                    <IngredientDropdown ingredient={ingredient} list={false} />
                </div>
            }
        </div>

    );
}

export default RecipeIngredient;
