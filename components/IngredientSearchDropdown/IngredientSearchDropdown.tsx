/* eslint-disable no-restricted-syntax */
import { Group, Select, Text } from '@mantine/core';
import { useState, useEffect, useRef, useContext, forwardRef } from 'react';
import { useModals } from '@mantine/modals';
import { number } from 'zod';
import { loadIngredientFile } from '../../lib/search/ingredient-search';
import { AddIngredientToList } from '../AddIngredientToList/AddIngredientToList';
import { UserContext } from '../../lib/context';
import { firestorePromiseAdd } from '../../lib/ingredients/ingredients';
import { unitsList } from '../../lib/lists';

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
    image: string;
    label: string;
    description: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ image, label, description, ...others }: ItemProps, ref) => (
        <div ref={ref} {...others}>
            <Group noWrap>

                <div>
                    <Text size="sm">{label}</Text>
                </div>
            </Group>
        </div>
    )
);

interface IngredientSearchDropdownProps {
    placeholder: string;
    select: Function;
    allowCustomIngredients?: boolean;
    disallowModal?: boolean
}

export function IngredientSearchDropdown(props: IngredientSearchDropdownProps) {
    const modals = useModals();
    const { user } = useContext(UserContext);
    const { placeholder, select, allowCustomIngredients, disallowModal } = props;
    const [ingredients, setIngredients] = useState<any>([]);
    const [modalIncrement, setModalIncrement] = useState(0);
    const [units, setUnits] = useState<string[]>([]);

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

        setUnits([
            // '',
            ...unitsSimplified.sort()]);
    }, []);

    useEffect(() => {
        const getData = async () => {
            const data = await loadIngredientFile(false);
            console.log('INGRED FILE', data);
            setIngredients(data.map(i => i.ingredient));
        };

        getData();
    }, []);

    const [searchValue, setSearchValue] = useState('');
    const [defaultValue, setDefaultValue] = useState('Hello');
    const [ingredientToAdd, setIngredientToAdd] = useState<{ ingredient: string; quantity?: string; unit?: string }>();
    const ref = useRef<any>();

    const addToList = async () => {
        const document = {
            checked: false,
            ingredient: ingredientToAdd?.ingredient,
            quantity: ingredientToAdd?.quantity,
            unit: ingredientToAdd?.unit || null,
            listId: user.uid,
            recipe: {
                id: null,
                title: null,
            },
        };

        await firestorePromiseAdd('list_items', [document]);
        ref.current.blur();
    };

    const openIngredientModal = async (ingredient: string) => {
        // const ingredientData = await fetchIngredientData(ingredient);
        ref.current.blur();

        modals.openConfirmModal({
            title: 'Add to list',
            children: (
                <>
                    <AddIngredientToList ingredient={ingredient} ingredientFile={ingredients} updateIngredientToAdd={setIngredientToAdd} />
                </>
            ),
            labels: { confirm: 'Add to list', cancel: 'Cancel' },
            onConfirm: () => {
                console.log('CONFIRM INGREDIENTS TO ADD', ingredientToAdd);
                // addToList();
                setModalIncrement(modalIncrement + 1);
            },
        });
    };

    useEffect(() => {
        if (modalIncrement > 0) addToList();
    }, [modalIncrement]);

    interface SmartSearchResult {
        unit: string,
        quantity: number,
        ingredient: string,
    }

    const [smartSearchResult, setSmartSearchResult] = useState<SmartSearchResult | null>(null);

    const analyseSearchTerm = (term: string) => {
        console.log('Analysing search term', term);
        console.log('Checking for units', units);

        const numberInTerm = term.replace(/[^0-9]/g, '');
        const unitInTerm = units.filter(unit => term.includes(unit));
        const ingredientInTerm = ingredients.filter(ingredient => term.includes(ingredient));

        console.log('Ingredient in term', ingredientInTerm);
        if (ingredientInTerm && (numberInTerm || unitInTerm[0])) {
            setSmartSearchResult({
                unit: unitInTerm[0],
                quantity: parseFloat(numberInTerm),
                ingredient: ingredientInTerm.sort((a: any, b: any) => b.length - a.length)[0],
            });
        } else {
            setSmartSearchResult(null);
        }

        console.log(`Number in term: ${numberInTerm} --- Unit in term ${unitInTerm[0]} -- Ingredient in term ${ingredientInTerm[0]}`);
    };

    return (
        <div>
            <Select
                searchable
                nothingFound="No options"
                data={ingredients}
                creatable={allowCustomIngredients}
                onChange={(e) => {
                    console.log('E on change', e);
                    if (e) {
                        setSearchValue('');
                        setDefaultValue('');
                        if (smartSearchResult) {
                            console.log('Selecting the smart result', smartSearchResult);
                            select(e, smartSearchResult);
                        } else {
                            select(e);
                        }
                        if (!disallowModal) openIngredientModal(e);
                        // ref.current.blur();
                    }
                }
                }
                getCreateLabel={(q) => smartSearchResult && smartSearchResult.ingredient ? `Smart result ${q}` : `+ New ingredient ${q}`}
                placeholder={placeholder}
                value={searchValue}
                defaultValue={defaultValue}
                ref={ref}
                limit={20}
                itemComponent={SelectItem}
                onSearchChange={(e) => analyseSearchTerm(e)}
            />
            {/* <div className="relative">
                <input className={className} placeholder={placeholder} onChange={search} onKeyDown={handleKeyDown} value={searchTerm} />
            </div>
            {results.length > 0 ?
                <div className="w-full relative">
                    <div
                        className="absolute w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                    >
                        <div className="py-1" role="none">
                            {results.map((result, index) => (s
                                    <div
                                        key={index}
                                        className={`px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center cursor-pointer ${index === selected ? 'bg-gray-100' : ''}`}
                                        role="menuitem"
                                        onClick={() => select(result)}
                                    >
                                        {result.ingredient}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
                : null} */}
        </div>

    );
}

export default IngredientSearchDropdown;
