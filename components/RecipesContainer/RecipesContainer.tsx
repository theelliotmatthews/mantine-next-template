import { Grid } from '@mantine/core';
import React from 'react';
import { Recipe } from '../../lib/types';
import RecipeCard from '../RecipeCard/RecipeCard';

interface RecipesContainerProps {
    recipes: Recipe[];
    selectMode?: boolean;
    selectedRecipes?: string[];
    selectRecipe?: Function;
}

export default function RecipesContainer(props: RecipesContainerProps) {
    const { recipes, selectMode, selectedRecipes, selectRecipe } = props;

    return (
        <Grid>
            {recipes.map((recipe, index) => (
                <Grid.Col key={index} sm={1} md={6} lg={3}>
                    <RecipeCard recipe={recipe} selectMode={selectMode} selectMode={selectMode} selectRecipe={selectRecipe} />
                </Grid.Col>
            ))}
        </Grid>
    );
}
