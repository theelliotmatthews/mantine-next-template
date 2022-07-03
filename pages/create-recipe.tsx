import React, { useContext, useEffect, useState } from 'react';
import { resetServerContext } from 'react-beautiful-dnd';
import { GetServerSideProps } from 'next';
import EditRecipe from '../components/EditRecipe/EditRecipe';
import { Recipe } from '../lib/types';

interface CreateRecipeProps {
    recipe?: Recipe
}

export default function CreateRecipe(props: CreateRecipeProps) {
    return (
        <EditRecipe />
    );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    resetServerContext(); // <-- CALL RESET SERVER CONTEXT, SERVER SIDE

    return { props: { data: [] } };
};
