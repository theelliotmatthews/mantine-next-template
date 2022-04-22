/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
import { Button, Group, Header, Loader, Stack, Text, Title } from '@mantine/core';
import { useEffect, useContext, useState } from 'react';
import { BrandGoogle, Share, Trash } from 'tabler-icons-react';
import { UserContext } from '../../lib/context';
import { firestore } from '../../lib/firebase';
import { fetchIngredientData } from '../../lib/ingredients/ingredients';
import { AddToListIngredient, CombinedAmount, IngredientFormatted, ListCategory, ListIngredient, Recipe } from '../../lib/types';
import Dropdown from '../Dropdown/Dropdown';
import IngredientSearchDropdown from '../IngredientSearchDropdown/IngredientSearchDropdown';
import ShoppingListIngredient from '../ShoppingListIngredient.tsx/ShoppingListIngredient';

// import IngredientSearchDropdown from '../ui/ingredient-search-dropdown/ingredient-search-dropdown';
// import Dropdown from '../ui/dropdown/dropdown';

const aisleCategories: ListCategory[] = [
    {
        dbName: 'fruit_veg',
        name: 'Fruit and vegetables',
    },
    {
        dbName: 'herb_spice',
        name: 'Herbs and spices',
    },
    {
        dbName: 'meat_dairy',
        name: 'Meat and dairy alternatives',
    },
    {
        dbName: 'pulse',
        name: 'Pulses',
    },
    {
        dbName: 'nuts_seeds',
        name: 'Nuts and seeds',
    },
    {
        dbName: 'grain',
        name: 'Grains',
    },
    {
        dbName: 'condiment',
        name: 'Condiment',
    },
    {
        dbName: 'drink',
        name: 'Drinks',
    },
    {
        dbName: 'supermarket_product',
        name: 'Supermarket Product',
    },
    {
        dbName: 'specialist',
        name: 'Specialist',
    },

];

export default function ShoppingList() {
    // const { showModal } = useContext(ModalContext);
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState<ListIngredient[]>([]);
    const [listWithData, setListWithData] = useState<ListIngredient[]>([]);
    const [visibleList, setVisibleList] = useState<ListCategory[]>([]);
    const [checkedOffList, setCheckedOffList] = useState([]);
    const [aisleView, setAisleView] = useState(true);
    const [unit, setUnit] = useState('original');

    // Store modified / delete ingredients in their own lists
    const [addedIngredients, setAddedIngredients] = useState<ListIngredient[]>([]);
    const [modifiedIngredients, setModifiedIngredients] = useState<ListIngredient[]>([]);
    const [deletedIngredients, setDeletedIngredients] = useState<ListIngredient[]>([]);
    const [updates, setUpdates] = useState(0);

    useEffect(() => {
        if (user) {
            // Moved inside "useEffect" to avoid re-creating on render
            const handleIngredientChanges = (snapshot: any) => {
                const changes = snapshot.docChanges();

                const added: ListIngredient[] = [];
                const modified: ListIngredient[] = [];
                const deleted: ListIngredient[] = [];
                console.log('Start of changes');
                changes.forEach((change: { type: string, doc: any }) => {
                    if (change.type === 'added') {
                        // console.log("New ingredient: ", change.doc.data());
                        const ingredient = {
                            id: change.doc.id,
                            ...change.doc.data(),
                        };

                        if (!list.find((x: { id: string }) => x.id === change.doc.id)) {
                            added.push(ingredient);
                        }

                        // console.log('List', list)
                    }
                    if (change.type === 'modified') {
                        // console.log("Modified ingredient: ", change.doc.data());
                        // setList(list.filter(item => item.id !== change.doc.id));
                        const ingredient = {
                            id: change.doc.id,
                            ...change.doc.data(),
                        };
                        modified.push(ingredient);
                    }
                    if (change.type === 'removed') {
                        const ingredient = {
                            id: change.doc.id,
                            ...change.doc.data(),
                        };

                        deleted.push(ingredient);
                    }
                });

                // console.log('End of changes');
                setAddedIngredients((prev: ListIngredient[]) => (
                    [
                        ...prev,
                        ...added,
                    ]));
                setModifiedIngredients((prev: ListIngredient[]) => (
                    [
                        ...prev,
                        ...modified,
                    ]));
                setDeletedIngredients((prev: ListIngredient[]) => (
                    [
                        ...prev,
                        ...deleted,
                    ]));

                // Use the setState callback
                // console.log('List outside changes', list)
            };

            const query = firestore.collection('list_items')
                .where('listId', '==', user.uid);

            // Create the DB listener
            const unsuscribe = query.onSnapshot(handleIngredientChanges,
                err => console.log(err));

            return () => {
                unsuscribe();
            };
        }
        return () => false;
    }, [user]);

    // Check a single item
    // const checkSingleItem = async (ingredient: ListIngredient) => {
    //     console.log('Checking off ingredient', ingredient);
    //     await firestore.collection('list_items').doc(ingredient.id).update({ checked: !ingredient.checked });
    // };

    // Check off all occurance of item
    const checkOffAllIngredientOccurances = async (ingredient: ListIngredient, check: boolean) => {
        // console.log('Checking off all occurances of this ingredient', ingredient);
        // console.log('Update all to ', check);

        const promises: Promise<any>[] = [];
        ingredient.combinedAmounts.forEach(amount => {
            amount.ids.forEach(id => {
                const promise = firestore.collection('list_items').doc(id).update({ checked: check });
                promises.push(promise);
            });
        });

        await Promise.all(promises);
    };

    // Check off the combined amount of an ingredient
    const checkCombinedAmount = async (amount: CombinedAmount) => {
        // console.log('Checking combined amount: ', amount);
        // console.log('Ingredient ', ingredient);

        const promises: Promise<any>[] = [];
        amount.ids.forEach(id => {
            const promise = firestore.collection('list_items').doc(id).update({ checked: !amount.checked });
            promises.push(promise);
        });

        await Promise.all(promises);
    };

    // Delete an ingredient -- for testing
    const deleteIngredient = async (ingredient: ListIngredient) => {
        // console.log('Deleting ingredient', ingredient)
        await firestore.collection('list_items').doc(ingredient.id).delete();
    };

    // Trigger popup
    const addToList = (ingredient: AddToListIngredient) => {
        console.log('Adding ingredient to list', ingredient);
        // showModal('ingredient', [{
        //     ingredient: ingredient.ingredient,
        //     amount: 1,
        //     exampleServings: ingredient.example_servings ? ingredient.example_servings : [],
        // }]);
    };

    // Trigger share list popup
    const shareList = () => {
        console.log('Sharing list');
    };

    // Order on Amazon
    const orderOnAmazon = () => {
        console.log('Ordering on Amazon');
        // showModal('amazon', checkedOffList);
    };

    const clearList = async () => {
        console.log('Clearing list');

        setList([]);

        const promises: Promise<any>[] = [];

        list.forEach((item: { id: string }) => {
            console.log('Item', item);
            const promise = firestore.collection('list_items').doc(item.id).delete();
            promises.push(promise);
        });

        await Promise.all(promises);
    };

    const changeUnit = (u: string) => {
        console.log('Changing unit to ', u);
        setUnit(u);
    };

    const changeView = (view: string) => {
        console.log('Changing view to ', view);

        setAisleView(view === 'Aisle View');
    };

    // Listen to new ingredients
    useEffect(() => {
        // Check for added ingredients
        if (addedIngredients.length > 0) {
            addedIngredients.forEach(ingredient => {
                const copy = [...list];
                copy.push(ingredient);
                // setList(copy)
                setList((prev) => (
                    [
                        ...prev,
                        ingredient,
                    ]));
            });

            setAddedIngredients([]);
            setUpdates(updates + 1);
        }
    }, [addedIngredients]);

    // Listen to modified ingredients
    useEffect(() => {
        // Check for modified ingredients
        if (modifiedIngredients.length > 0) {
            const copy = [...list];

            modifiedIngredients.forEach(ingredient => {
                const i: ListIngredient | undefined = list.find((x: { id: string }) => x.id === ingredient.id);
                if (i) {
                    const index: number = copy.indexOf(i);
                    console.log('Index', index);
                    console.log('Found i ingredient', i);
                    console.log('Modified ingredient', ingredient);
                    copy[index] = ingredient;
                }
            });

            setList(copy);
            setModifiedIngredients([]);
            setUpdates(updates + 1);
        }
    }, [modifiedIngredients]);

    useEffect(() => {
        // Check for deleted ingredients
        if (deletedIngredients.length > 0) {
            deletedIngredients.forEach(ingredient => {
                const copy = [...list].filter(item => item.id !== ingredient.id);
                setList(copy);
            });

            setDeletedIngredients([]);
            setUpdates(updates + 1);
        }
    }, [deletedIngredients]);

    // Fetch ingredient data whenever the list changes
    useEffect(() => {
        // console.log('List changing', list)

        const fetchData = async () => {
            const promises: Promise<any>[] = [];
            const copy = [...list];

            list.forEach((ingredient: ListIngredient) => {
                if (!ingredient.dataFetched) {
                    const promise = fetchIngredientData(ingredient.ingredient);
                    promises.push(promise);
                }
            });

            // Match up
            if (promises.length > 0) {
                await Promise.all(promises).then((values) => {
                    // console.log('Promise values', values)
                    // Match up
                    // eslint-disable-next-line no-restricted-syntax
                    for (const ingredient of copy) {
                        // eslint-disable-next-line no-restricted-syntax
                        for (const r of values) {
                            if (r && (ingredient.ingredient === r.ingredient)) {
                                ingredient.dataFetched = { ...r };
                                break;
                            }
                        }
                    }
                });
            }
            setListWithData(copy);
            setLoading(false);
        };

        fetchData();
    }, [updates]);

    // Listen to list with data changes, then sort into category or aisle view
    useEffect(() => {
        // Sort into aisle or recipe view
        console.log('LWD', listWithData);

        if (aisleView) {
            // Sort by category
            const categories = [];

            aisleCategories.forEach(category => {
                const categoryIngredients: ListIngredient[] = [];
                listWithData.forEach((ingredient: ListIngredient) => {
                    // Check if ingredient is checked
                    // if (ingredient.checked && (checkedIngredients.find(x => x.id === ingredient.id) === undefined)) {
                    //   ingredient.hasCategory = true
                    //   checkedIngredients.push(ingredient)
                    // } else
                    if (ingredient.dataFetched && (ingredient.dataFetched.shopping_list_category === category.dbName)) {
                        // console.log(ingredient.ingredient, 'Yes ingredient data', ingredient.data)
                        categoryIngredients.push(ingredient);
                        // eslint-disable-next-line no-param-reassign
                        ingredient.hasCategory = true;
                    }
                });

                categories.push({
                    name: category.name,
                    ingredients: categoryIngredients,
                });
            });

            const ingredientsWithoutCategory: ListIngredient[] = [];

            listWithData.forEach((ingredient: ListIngredient) => {
                if (!ingredient.hasCategory) {
                    ingredientsWithoutCategory.push(ingredient);
                }
            });

            categories.push({
                name: 'Other',
                ingredients: ingredientsWithoutCategory,
            });

            // Combine ingredients together into the same units
            categories.forEach((category: any) => {
                // eslint-disable-next-line no-param-reassign
                category.combinedIngredients = [];

                category.ingredients.forEach((ingredient: ListIngredient) => {
                    // Check if combined ingredients already includes this ingredient
                    const foundCombinedIngredient = category.combinedIngredients.find((i: { ingredient: string }) => i.ingredient === ingredient.ingredient);

                    // Ingredient not already added
                    if (foundCombinedIngredient === undefined) {
                        category.combinedIngredients.push({
                            ingredient: ingredient.ingredient,
                            combinedAmounts: [
                                {
                                    unit: ingredient.unit,
                                    quantity: ingredient.quantity,
                                    ids: [
                                        ingredient.id,
                                    ],
                                    checked: ingredient.checked,
                                },
                            ],
                            data: ingredient.dataFetched,
                        });
                    } else {
                        // Check if the unit has already been added
                        const foundUnit = foundCombinedIngredient.combinedAmounts.find((i: { unit: string }) => i.unit === ingredient.unit);

                        // This is a new unit, add it to the combined amounts array
                        if (foundUnit === undefined) {
                            foundCombinedIngredient.combinedAmounts.push({
                                unit: ingredient.unit,
                                quantity: ingredient.quantity,
                                ids: [
                                    ingredient.id,
                                ],
                                checked: ingredient.checked,
                            });
                        } else {
                            // Combine together the quantities for this unit
                            foundUnit.quantity += ingredient.quantity;
                            foundUnit.ids.push(ingredient.id);
                            foundUnit.checked = ingredient.checked;
                        }
                    }
                });
            });

            console.log('Categories', categories);
            setVisibleList(categories);
        } else {
            // Sort recipes into array
            const recipes: Recipe[] = [];
            listWithData.forEach((ingredient: any) => {
                let recipeAlreadyAdded = false;
                recipes.forEach((recipe: Recipe) => {
                    if (recipe.id === ingredient.recipe?.id) {
                        recipeAlreadyAdded = true;
                        recipe.ingredients.push(ingredient);
                    }
                });
                recipeAlreadyAdded === false && recipes.push({ ...ingredient.recipe, ingredients: [ingredient] });
            });

            // Combine recipe ingredients into the same units
            recipes.forEach((category: any) => {
                // eslint-disable-next-line no-param-reassign
                category.combinedIngredients = [];

                category.ingredients.forEach((ingredient: ListIngredient) => {
                    // Check if combined ingredients already includes this ingredient
                    const foundCombinedIngredient = category.combinedIngredients.find((i: { ingredient: string }) => i.ingredient === ingredient.ingredient);

                    // Ingredient not already added
                    if (foundCombinedIngredient === undefined) {
                        category.combinedIngredients.push({
                            ingredient: ingredient.ingredient,
                            combinedAmounts: [
                                {
                                    unit: ingredient.unit,
                                    quantity: ingredient.quantity,
                                    ids: [
                                        ingredient.id,
                                    ],
                                    checked: ingredient.checked,
                                },
                            ],
                            data: ingredient.dataFetched,
                        });
                    } else {
                        // Check if the unit has already been added
                        const foundUnit = foundCombinedIngredient.combinedAmounts.find((i: { unit: string }) => i.unit === ingredient.unit);

                        // This is a new unit, add it to the combined amounts array
                        if (foundUnit === undefined) {
                            foundCombinedIngredient.combinedAmounts.push({
                                unit: ingredient.unit,
                                quantity: ingredient.quantity,
                                ids: [
                                    ingredient.id,
                                ],
                                checked: ingredient.checked,
                            });
                        } else {
                            // Combine together the quantities for this unit
                            foundUnit.quantity += ingredient.quantity;
                            foundUnit.ids.push(ingredient.id);
                            foundUnit.checked = ingredient.checked;
                        }
                    }
                });
            });

            console.log('Ingredients in recipes', recipes);
            setVisibleList(recipes);
        }
    }, [listWithData, aisleView]);

    // Listen to changes in the visibleList, then update the checked items accordingly
    useEffect(() => {
        const copy = [];

        const checkedIngredients = [];
        for (const category of visibleList) {
            // console.log('Cat', category)
            const newCategory = {
                name: aisleView ? category.name : category.title,
                combinedIngredients: [],
            };
            if (!category.combinedIngredients) continue;
            for (const ingredient of category.combinedIngredients) {
                let allChecked = true;
                if (ingredient.combinedAmounts) {
                    for (const amount of ingredient.combinedAmounts) {
                        if (!amount.checked) allChecked = false;
                    }
                }

                if (allChecked) {
                    checkedIngredients.push(ingredient);
                } else {
                    newCategory.combinedIngredients.push(ingredient);
                }
            }

            copy.push(newCategory);
        }

        copy.push({
            name: 'Checked',
            combinedIngredients: checkedIngredients,
        });

        setCheckedOffList(copy);

        console.log('Checked off list', checkedOffList);
    }, [visibleList]);

    const buttons = [
        {
            label: 'Share',
            icon: <Share size={12} />,
            action: shareList,
        },
        {
            label: 'Order',
            icon: <BrandGoogle size={12} />,
            action: orderOnAmazon,
        },
        {
            label: 'Clear',
            icon: <Trash size={12} />,
            action: clearList,
        },
    ];

    const dropdowns = [
        {
            options: [
                {
                    label: 'metric',
                    value: 'metric',
                },
                {
                    label: 'imperial',
                    value: 'imperial',
                },
            ],
            selectItem: changeUnit,
        },
        {
            default: aisleView ? 'Aisle View' : 'Recipe View',
            options: [
                {
                    label: 'Aisle View',
                    value: 'Aisle View',
                },
                {
                    label: 'Recipe View',
                    value: 'Recipe View',
                },
            ],
            selectItem: changeView,
        },
    ];

    return (
        <Stack>
            {loading ?
                <Loader /> :
                <>
                    <Group position="apart">
                        <Group>
                            <Title order={2}>Shopping list</Title>
                            {buttons.map((button, index) => <Button key={index} leftIcon={button.icon} onClick={button.action} variant="light" radius="lg" size="xs">{button.label}</Button>)}
                        </Group>

                        <Group>
                            {dropdowns.map((dropdown, index) => <Dropdown key={index} items={dropdown.options} selectItem={dropdown.selectItem} />)}
                        </Group>
                    </Group>

                    <Stack>

                        <IngredientSearchDropdown placeholder="Search for ingredients" allowCustomIngredients select={addToList} />
                        {/* <IngredientSearchDropdown placeholder="Add item to shopping list" onClick={addToList} allowCustomIngredients /> */}
                        {checkedOffList.map((category: ListCategory, index: number) => (
                            <div key={index}>
                                {category.combinedIngredients && category.combinedIngredients.length > 0 &&
                                    <div>
                                        <Text>{aisleView ? category.name : category.name ? category.name : 'No recipe'}</Text>
                                        <Stack spacing="xs">
                                            {category.combinedIngredients && category.combinedIngredients.map((ingredient, i) => (
                                                <ShoppingListIngredient
                                                    ingredient={ingredient}
                                                    key={i}
                                                    checkCombinedAmount={checkCombinedAmount}
                                                    checkOffAllIngredientOccurances={checkOffAllIngredientOccurances}
                                                    deleteIngredient={deleteIngredient}
                                                    category={category}
                                                    list={listWithData}
                                                    measurement={unit}
                                                />
                                            ))}
                                        </Stack>
                                    </div>
                                }
                            </div>
                        ))}
                    </Stack>
                </>
            }
        </Stack>
    );
}
