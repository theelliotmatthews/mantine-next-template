import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import TextInput from '../ui/text-input/text-input';
import Button from '../ui/button/button';
import SingleIngredientGroup from './SingleIngredientGroup'
import { IngredientGroup } from '../../lib/types';
import AddIngredientGroup from './AddIngredientGroup';

interface CreateRecipeIngredientsProps {

}

export default function CreateRecipeIngredients(props: CreateRecipeIngredientsProps) {

    const [groups, setGroups] = useState([])
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [ingredient, setIngredient] = useState(null)
    const [quantity, setQuantity] = useState(null)
    const [unit, setUnit] = useState(null)
    const [note, setNote] = useState(null)
    const [ingredients, setIngredients] = useState([])

    const createGroup = (data: any) => {
        console.log('Create group data', data)

        const newGroup = {
            name: data.name,
            order: groups.length
        }

        setGroups(prev => (
            [
                ...prev,
                newGroup
            ]
        ))
    }

    const renameGroup = (oldName: string, newName: string) => {
        console.log(`${oldName} ---> ${newName}`)
        if (oldName === newName) return
        // Change group of all ingredients


        // Rename group
        const copy = [...groups]

        for (const group of copy) {
            if (group.name === oldName) {
                group.name = newName
            }
        }

        setGroups(copy)
    }


    return (
        <div>
            <AddIngredientGroup createGroup={createGroup} groups={groups} />
            {groups.length > 0 && <div>
                <h2>Groups:</h2>
                <div className="space-y-2 my-8">{groups.map((group, index) => {
                    return <SingleIngredientGroup key={index} group={group} ingredients={ingredients} groups={groups} renameGroup={renameGroup} />
                })}</div>
            </div>
            }
        </div>
    )
}
