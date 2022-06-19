import { firestore } from '../../lib/firebase';
import { getRecipeById } from '../../lib/recipes/recipes';
import { Recipe } from '../../lib/types';

import { useEffect, useState, useContext } from 'react'
import { ModalContext, SlideoverContext } from "../../../lib/context";
import classNames from 'classnames';
import Button from '../../ui/button/button';
import Icon from '../../ui/icon/icon';
import { checkRecipeStatus, toggleRecipeStatus, fetchRecipeCreatorData } from '../../../lib/recipes/recipes'
import { UserContext } from "../../../lib/context";

import ImageCreator from './image-creator';
import WhiteBox from '../../ui/white-box/white-box';
import RecipeIngredients from './recipe-ingredients';
import RecipeNutrition from './recipe-nutrition';
import SimilarRecipes from './similar-recipes';
import Reviews from '../reviews/reviews';

export async function getStaticProps({ params }: { params: any }) {
    const { id } = params;

    const recipe = await getRecipeById(id);

    if (!recipe) {
        return {
            notFound: true,
        };
    }

    return {
        props: { recipe: JSON.parse(JSON.stringify(recipe)) },
        revalidate: 100,
    };
}

export async function getStaticPaths() {
    // Improve my using Admin SDK to select empty docs
    const snapshot = await firestore.collection('all_recipes').limit(1).get();

    const paths = snapshot.docs.map((doc) => {
        const { id } = doc;
        return {
            params: { id },
        };
    });

    return {
        // must be in this format:
        // paths: [
        //   { params: { username, slug }}
        // ],
        paths,
        fallback: 'blocking',
    };
}

export default function Recipe(props: { recipe: Recipe }) {
    const { recipe } = props;

    return (
        <div>

        </div>
    );
}
