import React, { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import TextInput from '../ui/text-input/text-input';
import Button from '../ui/button/button';
import SingleIngredientGroup from './SingleIngredientGroup'
import { IngredientGroup, RecipeIngredient } from '../../lib/types';
import IngredientSearchDropdown from '../ui/ingredient-search-dropdown/ingredient-search-dropdown';
import { unitsList } from '../../lib/lists';
import Dropdown from '../ui/dropdown/dropdown';

interface AddSingleIngredientProps {
    addIngredient?: Function;
    groups?: IngredientGroup[];
    selectedGroup?: string;
    editing?: boolean;
    ingredientToEdit?: RecipeIngredient;
    hideGroupSelect?: boolean;
    editIngredient?: Function;
    cancel?: Function;
}

export default function AddSingleIngredient(props: AddSingleIngredientProps) {
    const { addIngredient, groups, selectedGroup, editing, ingredientToEdit, editIngredient, cancel } = props

    const [addingIngredient, setAddingIngredient] = useState(null)
    const [unit, setUnit] = useState('bulb')
    const [note, setNote] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [units, setUnits] = useState([])
    const [group, setGroup] = useState(selectedGroup ? selectedGroup : 'No group')


    const ingredientSchema = z.object({
        ingredient: z.string({
            required_error: "Ingredient is required",
            invalid_type_error: "Ingredient must be a string",
        }).nonempty({ message: 'An ingredient is required' }).min(3),

        quantity: z.number(),
        unit: z.string(),
        note: z.string(),
    })

    const onSubmit = (data: any) => {

        if (!addingIngredient) return

        // console.log('Submit', data)
        const newIngredient = {
            ingredient: addingIngredient,
            quantity: quantity ? quantity : (!quantity && unit) ? 1 : null,
            unit: unit ? unit : null,
            group: group ? group : null,
            id: ingredientToEdit ? ingredientToEdit.id : null,
            note: note ? note : "",
        }

        // let groupsLowercase = []
        // groups.forEach(group => {
        //     groupsLowercase.push((group.name.toLowerCase()))
        // })

        // if (groupsLowercase.includes(data.name.toLowerCase())) {
        //     setError("name", {
        //         type: "manual",
        //         message: "A group with this name already exists",
        //     })
        //     return
        // }

        editing ? editIngredient(newIngredient) : addIngredient(newIngredient)
        setAddingIngredient(null)
        setQuantity(null)
        setUnit(null)
    }

    // Fetch units and common servings 
    useEffect(() => {
        const unitObject = unitsList()
        let unitsSimplified = []
        for (const unit of unitObject) {
            for (const [key, value] of Object.entries(unit)) {
                unit.unit = key;
                unitsSimplified.push(key)
            }
        }

        setUnits([
            '',
            ...unitsSimplified.sort()])
    }, [])

    // Select a unit from the dropdown
    const selectUnit = (unit) => {
        console.log('Selecting unit', unit)
        setUnit(unit)
    }

    const selectGroup = (group) => {
        setGroup(group)
    }

    const handleIngredientChange = (change) => {
        console.log('Handling ingredient change', change)
        if (change && change.ingredient) setAddingIngredient(change.ingredient)
    }

    useEffect(() => {
        console.log('Adding ingredient changing', addingIngredient)
    }, [addingIngredient])

    useEffect(() => {
        if (ingredientToEdit) {
            setUnit(ingredientToEdit.unit)
            setQuantity(ingredientToEdit.quantity)
            setNote(ingredientToEdit.note)
            setAddingIngredient(ingredientToEdit.ingredient)
        }
    }, [ingredientToEdit])

    const methods = useForm({ resolver: zodResolver(ingredientSchema), mode: 'onChange' });
    const { handleSubmit, formState: { errors, isValid }, setValue, clearErrors, setError } = methods

    return (
        <div>
            {!editing && <h1>Add ingredient</h1>}

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* <TextInput errorMessage={errors.ingredient?.message} label="Group name" registerAs="ingredient" type="text" /> */}

                    {!editing &&

                        <>
                            <IngredientSearchDropdown placeholder="Search for ingredient" onClick={handleIngredientChange} allowCustomIngredients={true} />

                            {addingIngredient && <div className="flex">
                                <div>{addingIngredient}</div>
                                <Button as="button" type="button" background="primary-medium" onClick={() => setAddingIngredient(null)}>Remove</Button>

                            </div>
                            }
                        </>}
                    <input type="number" value={quantity} onChange={(e) => setQuantity((parseFloat(e.target.value)))} />
                    <Dropdown side="left" items={units} select={selectUnit} selected={unit} htmlSelect={true} />
                    {!selectedGroup && !editing && <Dropdown side="left" items={[...groups.map((group) => group.name)]} select={selectGroup} selected={group} htmlSelect={true} />}
                    <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />

                    <div className="flex items-center w-full justify-between">
                        <Button as="button" type="button" background="primary-medium" onClick={onSubmit} disabled={!addingIngredient}>{editing ? 'Edit ingredient' : "+ Add ingredient"} </Button>
                        {cancel && <Button as="button" type="button" background="primary-medium" onClick={cancel}>Cancel</Button>}
                    </div>
                </form>
            </FormProvider>
        </div>
    )
}
