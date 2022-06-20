import { useModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react'
import { Notes } from 'tabler-icons-react';
import { UserContext } from '../../lib/context';
import { firestorePromiseAdd } from '../../lib/ingredients/ingredients';
import { Recipe } from '../../lib/types';
import { AddToList, AddToListItemProps } from '../AddToList/AddToList';

interface AddToListButtonProps {
    recipes: Recipe[];
    children: React.ReactNode;
}

export default function AddToListButton(props: AddToListButtonProps) {
    const { recipes, children } = props

    const router = useRouter();
    const { user } = useContext(UserContext);
    const modals = useModals();
    const [ingredientsToAdd, setIngredientsToAdd] = useState([]);
    const [listModalIncrement, setListModalIncrement] = useState(0);

    const addToList = async () => {
        console.log('Adding to list', ingredientsToAdd);

        //Construct a clean list of ingredients
        const ingredients: AddToListItemProps[] = [];

        ingredientsToAdd.forEach((i: AddToListItemProps) => {
            if (i.checked) {
                const document = {
                    checked: false,
                    ingredient: i.ingredient,
                    quantity: i.quantity,
                    unit: i.unit,
                    listId: user.uid,
                    recipe: i.recipe,
                };
                console.log('Doc', document);
                ingredients.push(document);
            }
        });

        console.log('Ingredients to add to final list:', ingredients);
        ingredients.forEach(i => {
            console.log(`${i.quantity} ${i.unit} ${i.ingredient}`);
        });
        await firestorePromiseAdd('list_items', ingredients);

        showNotification({
            title: 'Added to list',
            message: 'Click here to view your list',
            onClick: () => {
                router.push('/list');
            },
            icon: <Notes size={12} />,
            style: { cursor: 'pointer' },
        });
    };

    const addToListModal = () => {
        modals.openConfirmModal({
            title: 'Add to list',
            children: (
                <>
                    <AddToList recipes={recipes} updateIngredientsProp={setIngredientsToAdd} />
                </>
            ),
            labels: { confirm: 'Add to list', cancel: 'Cancel' },
            onConfirm: () => {
                console.log('CONFIRM INGREDIENTS TO ADD', ingredientsToAdd);
                // addToList();
                setListModalIncrement(listModalIncrement + 1);
            },
        });
    };

    useEffect(() => {
        if (listModalIncrement > 0) addToList();
    }, [listModalIncrement]);

    return (
        <div
            onClick={() => addToListModal()}
            onKeyDown={(e) => console.log(e)}
            role="button"
            tabIndex={0}
        >{children}
        </div>
    )
}
