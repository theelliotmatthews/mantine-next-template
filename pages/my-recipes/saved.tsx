import React, { useContext } from 'react'
import UserRecipes from '../../components/UserRecipes/UserRecipes';
import { UserContext } from '../../lib/context';

export default function SavedRecipes() {
    const { user } = useContext(UserContext);

    return (
        <>
            {user ? <UserRecipes recipeCreatorId={user.uid} /> : 'No recipes here'}
        </>
    );
}
