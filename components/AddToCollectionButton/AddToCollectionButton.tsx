import { useModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { Notes } from 'tabler-icons-react';
import { UserContext } from '../../lib/context';
import { firestorePromiseAdd } from '../../lib/ingredients/ingredients';
import { Recipe } from '../../lib/types';
import AddToCollection from '../AddToCollection/AddToCollection';

interface AddToCollectionButtonProps {
    recipe: Recipe;
    children: React.ReactNode;
}

export default function AddToCollectionButton(props: AddToCollectionButtonProps) {
    const { recipe, children } = props;

    const router = useRouter();
    const { user } = useContext(UserContext);
    const modals = useModals();
    const [ingredientsToAdd, setIngredientsToAdd] = useState([]);
    const [modalIncrement, setModalIncrement] = useState(0);

    const addTo = async () => {
        console.log('Adding to list', ingredientsToAdd);

        //Construct a clean list of ingredients
        // const ingredients: AddToListItemProps[] = [];

        // ingredientsToAdd.forEach((i: AddToListItemProps) => {
        //     if (i.checked) {
        //         const document = {
        //             checked: false,
        //             ingredient: i.ingredient,
        //             quantity: i.quantity,
        //             unit: i.unit,
        //             listId: user.uid,
        //             recipe: i.recipe,
        //         };
        //         console.log('Doc', document);
        //         ingredients.push(document);
        //     }
        // });

        // console.log('Ingredients to add to final list:', ingredients);
        // ingredients.forEach(i => {
        //     console.log(`${i.quantity} ${i.unit} ${i.ingredient}`);
        // });
        // await firestorePromiseAdd('list_items', ingredients);

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

    const addToCollectionModal = () => {
        const id = modals.openModal({
            title: 'Add to list',
            children: (
                <>
                    {/* <AddToList recipes={recipes} updateIngredientsProp={setIngredientsToAdd} /> */}
                    <AddToCollection
                        recipe={recipe}
                        closeModal={(update?: boolean) => {
                            modals.closeModal(id);
                            // update && getPlanners && getPlanners(true, recipe.plannerData.id);
                        }} />
                </>
            ),

        });
    };

    useEffect(() => {
        if (modalIncrement > 0) addTo();
    }, [modalIncrement]);

    return (
        <div
            onClick={() => addToCollectionModal()}
            onKeyDown={() => null}
            role="button"
            tabIndex={0}
            style={{ display: 'inline', width: 'auto' }}
        >{children}
        </div>
    );
}
