import { useEffect, useState } from 'react';
import { Popover, Text, Button, Image } from '@mantine/core';
import { Ingredient } from '../../lib/types';

interface PopoverIngredient {
    ingredients: Ingredient[];

}

export default function PopoverIngredient(props: PopoverIngredient) {
    const { ingredient, ingredients } = props;
    const [opened, setOpened] = useState(false);
    const [recipeIngredient, setRecipeIngredient] = useState<Ingredient>({});

    useEffect(() => {
        const foundIngredient = ingredients.find(x => x.id.toString() === props['data-id']);

        setRecipeIngredient(foundIngredient);
    }, [ingredients]);

    return (
        <Popover
            opened={opened}
            onClose={() => setOpened(false)}
            target={<Button onMouseEnter={() => setOpened(true)} onMouseLeave={() => setOpened(false)} variant="light" px={6} py={0} radius="md">{props['data-value']}</Button>}
            width={260}
            position="top"
            withArrow
        >
            <div style={{ display: 'flex' }}>
                <Text size="sm">{recipeIngredient.value} {recipeIngredient.quantity}{recipeIngredient.unit}</Text>
            </div>
        </Popover>
    );
}
