import { Button, Group, NumberInput, Select, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { v4 as uuidv4 } from 'uuid';
import { group } from 'console';
import React, { useEffect, useState } from 'react';
import { CircleX } from 'tabler-icons-react';
import { string } from 'zod';
import { unitsList } from '../../lib/lists';
import { IngredientGroup, RecipeIngredient } from '../../lib/types';
import { IngredientSearchDropdown } from '../IngredientSearchDropdown/IngredientSearchDropdown';

interface AddEditIngredientProps {
    item?: RecipeIngredient,
    groups: IngredientGroup[],
    ingredients: RecipeIngredient[],
    setIngredients: Function,
    ingredientGroups: IngredientGroup[],
    setIngredientGroups: Function,
    cancelEditing?: Function,
    addingToGroup?: string,
}

export default function AddEditIngredient(props: AddEditIngredientProps) {
    const { item, groups, ingredients, setIngredients, ingredientGroups, setIngredientGroups, cancelEditing, addingToGroup } = props;

    const form = useForm({
        initialValues: {
            ingredient: '',
            quantity: null,
            unit: null,
            note: '',
            group: '',
        },

        // validate: {
        //     email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        // },
    });

    useEffect(() => {
        if (item) {
            form.setValues(item);
        }
    }, [item]);

    useEffect(() => {
        if (addingToGroup) {
            form.setFieldValue('group', addingToGroup)
        }
    }, [addingToGroup])

    const onSubmit = (data) => {
        console.log('Submit data', data);

        if (!item) {
            const newId = uuidv4();
            const ingredient = {
                ...data,
                id: newId,
            };

            setIngredients((prevState: RecipeIngredient[]) => [...prevState, ingredient]);

            const groupsCopy = [...groups];
            if (data.group) {
                groupsCopy.find(x => x.id === data.group)?.ingredients.push(newId);
            } else {
                groupsCopy.find(x => x.name === 'No group')?.ingredients.push(newId);
            }
            setIngredientGroups(groupsCopy);

            form.reset();
        } else {
            console.log('Editin g item', item)
            let ingredientCopy = [...ingredients];
            ingredientCopy = ingredientCopy.filter(x => x.id !== item.id)
            ingredientCopy.push(data)
            console.log('New copy', ingredientCopy)
            setIngredients(ingredientCopy);

            // if (data.group !== item.group) {
            //     const groupsCopy = [...groups]
            //     let currentGroup = groupsCopy.find(x => x.id === item.group)
            //     currentGroup.ingredients = currentGroup.ingredients.filter(x => x !== data.id)

            //     let newGroup = groupsCopy.find(x => x.id === data.group)
            //     newGroup?.ingredients.push(data.group)

            //     setIngredientGroups(groupsCopy)
            // }

        }
        cancelEditing && cancelEditing();
    };

    const [units, setUnits] = useState([]);
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

    return (

        <div >
            <Stack>

                {!item &&
                    <IngredientSearchDropdown
                        placeholder="Search for ingredient"
                        select={(e, smartResult) => {
                            console.log('Select e', e);

                            if (smartResult) {
                                console.log('Smart result', smartResult)
                                form.setFieldValue('ingredient', smartResult.ingredient);
                                form.setFieldValue('unit', smartResult.unit)
                                form.setFieldValue('quantity', parseFloat(smartResult.quantity))
                            } else {
                                form.setFieldValue('ingredient', e);
                            }
                        }}
                        disallowModal
                        allowCustomIngredients
                    />
                }

                {form.values.ingredient && !item ? (
                    <Group>
                        <Text transform="capitalize">{form.values.ingredient}</Text>

                        <Button
                            leftIcon={<CircleX size={16} />}
                            size="xs"
                            radius="sm"
                            variant="subtle"
                            onClick={() => form.setFieldValue('ingredient', '')}
                        >Remove
                        </Button>
                    </Group>) : null
                }

                <NumberInput
                    label="Quantity"
                    {...form.getInputProps('quantity')}
                    min={1}
                />

                <Select
                    label="Unit"
                    placeholder="Select a unit"
                    searchable
                    nothingFound="No options"
                    maxDropdownHeight={280}
                    data={units}
                    {...form.getInputProps('unit')}
                />


                <TextInput
                    label="Note"
                    placeholder="Add a note to your ingredient"
                    {...form.getInputProps('note')}
                />

                {groups.length > 0 && !item && !addingToGroup ?
                    <Select
                        label="Group"
                        placeholder="Select a group"
                        searchable
                        nothingFound="No options"
                        maxDropdownHeight={280}
                        data={groups.filter(x => x.name !== 'No group').map(g => ({ value: g.id, label: g.name }))}
                        {...form.getInputProps('group')}
                        clearable

                    />
                    : null}

                {/* {JSON.stringify(form.values)} */}

                <Group position="right" mt="md">
                    {(item || addingToGroup) && <Button variant="light" onClick={() => cancelEditing && cancelEditing()}>Cancel</Button>}
                    <Button disabled={!form.values.ingredient} onClick={() => onSubmit(form.values)}>{item ? 'Update' : 'Add ingredient'}</Button>
                </Group>
            </Stack>
        </div>

    );
}
