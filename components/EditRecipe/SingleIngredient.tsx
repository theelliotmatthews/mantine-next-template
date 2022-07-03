import { Card, Group, Stack, Text } from '@mantine/core';
import React, { useState } from 'react'
import { Edit, Trash } from 'tabler-icons-react';
import { IngredientGroup, RecipeIngredient } from '../../lib/types';
import AddEditIngredient from './AddEditIngredient';

interface SingleIngredientProps {
    ingredient: RecipeIngredient,
    deleteIngredient: Function;
    groups: IngredientGroup[],
    ingredients: RecipeIngredient[],
    setIngredients: Function,
    ingredientGroups: IngredientGroup[],
    setIngredientGroups: Function,
}

export default function SingleIngredient(props: SingleIngredientProps) {
    const { ingredient, deleteIngredient, ingredients, setIngredients, ingredientGroups, setIngredientGroups, groups } = props

    const [editing, setEditing] = useState(false)

    return (
        <Stack style={{ width: '100%' }}>
            <Group position="apart" style={{ width: '100%' }}>
                <Group>
                    <Text>{ingredient.ingredient} {ingredient.quantity}{ingredient.unit}</Text>
                    {ingredient.note && <Text color="dimmed" size="sm">{ingredient.note}</Text>}
                </Group>
                <Group>
                    <Edit onClick={() => setEditing(!editing)} />
                    <Trash onClick={() => deleteIngredient(ingredient.id)} style={{ cursor: 'pointer' }} />
                </Group>
            </Group>

            {editing &&
                <AddEditIngredient
                    item={ingredient}
                    groups={ingredientGroups}
                    ingredients={ingredients}
                    setIngredients={setIngredients}
                    ingredientGroups={ingredientGroups}
                    setIngredientGroups={setIngredientGroups}
                    cancelEditing={() => setEditing(false)}
                />
            }
        </Stack>

    )
}
