import { useEffect, useContext, useState } from 'react';
import { UserContext } from '../../lib/context';
// import ModalWrapper from '../ui/modal/modal-wrapper';

// Functions
import { firestorePromiseAdd } from '../../lib/ingredients/ingredients';
import { unitsList } from '../../lib/lists';
import { IngredientFormatted } from '../../lib/types';

interface AddIngredientToListProps {
    ingredient: IngredientFormatted;
}

export function AddIngredientToList(props: AddIngredientToListProps) {
    const { ingredient } = props;
    const { user } = useContext(UserContext);
    // const { data } = useContext(ModalContext);
    // console.log('Recipes in modal ', recipes)
    // const [servings, setServings] = useState(recipe.servings)

    const [units, setUnits] = useState([]);
    // const [commonServings, setCommonServings] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(data[0].amount.unit);
    const [selectedQuantity, setSelectedQuantity] = useState(data[0].amount.quantity);

    const addToList = async () => {
        console.log('Adding to list');
        console.log('Ingredient', ingredient);
        console.log('quantity', selectedQuantity);
        console.log('unit', selectedUnit);

        const document = {
            checked: false,
            ingredient: ingredient.ingredient,
            quantity: selectedQuantity,
            unit: selectedUnit || null,
            listId: user.uid,
            recipe: {
                id: null,
                title: null,
            },
        };

        await firestorePromiseAdd('list_items', [document]);
    };

    // Select a unit from the dropdown
    const selectUnit = (unit) => {
        console.log('Selecting unit', unit);
        setSelectedUnit(unit);
    };

    // Add a common serving
    const addCommonServing = (serving) => {
        setSelectedUnit(serving.unit);
        setSelectedQuantity(serving.quantity);
    };

    // Fetch units and common servings
    useEffect(() => {
        const unitObject = unitsList();
        const unitsSimplified = [];
        for (const unit of unitObject) {
            for (const [key, value] of Object.entries(unit)) {
                unit.unit = key;
                unitsSimplified.push(key);
            }
        }

        setUnits(unitsSimplified.sort());
    }, []);

    return (
        <div>
            <ModalWrapper title="Add ingredient to list" confirmButtonColor="bg-primary-medium" confirmButtonText="Add" onClick={addToList} hideConfirmButton={isNaN(selectedQuantity)}>
                <h2 className="capitalize mb-2 text-lg">{data[0].ingredient}</h2>
                {data[0].exampleServings.length > 0 &&
                    <div>
                        <h3>Common servings</h3>
                        <div className="flex items-center justify-center flex-wrap -px-1 my-4">
                            {data[0].exampleServings.map((serving, index) => <div onClick={() => addCommonServing(serving)} className="cursor-pointer flex items-center bg-primary-light text-black rounded-full px-2 py-1 text-sm m-1">
                                {serving.quantity} {serving.unit}
                            </div>)}
                        </div>
                    </div>
                }
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={selectedQuantity} onChange={(e) => setSelectedQuantity(parseFloat(e.target.value))} />
                    <Dropdown side="left" items={units} select={selectUnit} selected={selectedUnit} />
                </div>
            </ModalWrapper>
        </div>
    );
}

export default AddIngredientToList;
