import React, { useEffect, useState } from 'react'
import { IngredientFormatted, IngredientGroup, RecipeIngredient } from '../../../lib/types'
import { useDrag } from 'react-dnd'
import { useDrop } from 'react-dnd'
import Icon from '../ui/icon/icon'
import AddSingleIngredient from '../AddSingleIngredient'

interface IngredientSingleProps {
    ingredient: RecipeIngredient,
    index: number,
    reorderIngredient: Function,
    group: any;
    groupIndex: number;
    removeIngredient: Function;
    editIngredient: Function
}

export default function IngredientSingle(props: IngredientSingleProps) {
    const { ingredient, index, reorderIngredient, group, groupIndex, removeIngredient, editIngredient } = props

    // Drag and drop functionality for planner
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'Ingredient',
        item: {
            ingredient: ingredient
        },
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),

        }),
    }), [ingredient, index])

    // Drop functionality 
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'Ingredient',
        // drop: (item: { recipe: any }) => console.log('Dropping'),
        drop: (item: { ingredient: any }) => {
            console.log('Dropping group', item.ingredient, ingredient, index)
            reorderIngredient(item.ingredient, index, groupIndex, group)
        },
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
        hover: (item: { ingredient: any }) => {
            // console.log('Dropping group', item.ingredient, ingredient, index)
            reorderIngredient(item.ingredient, index, groupIndex, group)
        },
    }), [ingredient, index])

    useEffect(() => {
        console.log('Index and group changing', index)
    }, [ingredient, index])

    const [editingIngredient, setEditingIngredient] = useState(false)

    const editSingleIngredient = (e) => {
        console.log('Editing single ingredient', e)
        setEditingIngredient(false)
        editIngredient(e)
    }

    return (
        <div ref={drop}>

            <div ref={drag} className="bg-white  border border-dashed border-red-500 p-2 w-full  ">
                <div className="flex items-center w-full justify-between">
                    <div className="flex items-center space-x-4">
                        <div>
                            <div>{ingredient.quantity && ingredient.quantity} {ingredient.unit && ingredient.unit} <span className="font-semibold">{ingredient.ingredient}</span></div>

                        </div>
                        <div onClick={() => setEditingIngredient(!editingIngredient)}>
                            <Icon type="edit" />
                        </div>
                    </div>

                    <div onClick={() => removeIngredient(ingredient.id)}><Icon type="delete" /></div>
                </div>
                {ingredient.note && <div className="text-sm opacity-70">{ingredient.note}</div>}
                {editingIngredient && <AddSingleIngredient editing={true} ingredientToEdit={ingredient} editIngredient={editSingleIngredient} />}
            </div>
        </div>
    )
}
