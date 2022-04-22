/* eslint-disable no-restricted-syntax */
import { Select } from '@mantine/core';
import { useState, useEffect, useRef } from 'react';
import { useModals } from '@mantine/modals';
import { fetchIngredientData } from '../../lib/ingredients/ingredients';
import { loadIngredientFile } from '../../lib/search/ingredient-search';
import AddIngredientToList from '../AddIngredientToList/AddIngredientToList';

interface IngredientSearchDropdownProps {
    placeholder: string;
    select: Function;
    allowCustomIngredients?: boolean
}

export function IngredientSearchDropdown(props: IngredientSearchDropdownProps) {
    const modals = useModals();
    const { placeholder, select, allowCustomIngredients } = props;
    const [ingredients, setIngredients] = useState<any>([]);

    useEffect(() => {
        const getData = async () => {
            const data = await loadIngredientFile(false);
            setIngredients(data);
        };

        getData();
    }, []);

    const [searchValue, setSearchValue] = useState('');
    const [defaultValue, setDefaultValue] = useState('Hello');
    const ref = useRef<any>();

    const openIngredientModal = async (ingredient: string) => {
        const ingredientData = await fetchIngredientData(ingredient);

        modals.openConfirmModal({
            title: 'Add to list',
            children: (
                <>
                    <AddIngredientToList ingredient={ingredientData} />
                </>
            ),
            labels: { confirm: 'Add to list', cancel: 'Cancel' },
            onConfirm: () => {
                console.log('CONFIRM INGREDIENTS TO ADD', ingredientsToAdd);
                // addToList();
                setModalIncrement(modalIncrement + 1);
            },
        });
    }

    return (
        <div>
            <Select
                searchable
                nothingFound="No options"
                data={ingredients}
                creatable={allowCustomIngredients}
                onChange={(e) => {
                    setSearchValue('');
                    setDefaultValue('');
                    select(e);
                    openIngredientModal(e);
                    console.log(e)
                    ref.current.blur();
                }
                }
                getCreateLabel={(q) => `+ New ingredient ${q}`}
                placeholder={placeholder}
                value={searchValue}
                defaultValue={defaultValue}
                ref={ref}
                limit={20}
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
