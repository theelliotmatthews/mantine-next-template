import React, { useEffect, useState } from 'react'
import { IngredientFormatted, IngredientGroup, RecipeGroup, RecipeIngredient } from '../../../lib/types'
import { useDrag } from 'react-dnd'
import { useDrop } from 'react-dnd'
import IngredientSingle from './ingredient-single'
import Icon from '../ui/icon/icon'
import AddSingleIngredient from '../AddSingleIngredient'
import Button from '../ui/button/button'

interface IngredientGroupSingleProps {
    group: IngredientGroup,
    index: number,
    reorderGroup: Function,
    reorderIngredient: Function,
    ingredients: RecipeGroup[],
    removeIngredient: Function;
    renameGroup: Function;
    addIngredient: Function;
    groups: IngredientGroup[];
    editIngredient: Function;
    removeGroup: Function
}

export default function IngredientGroupSingle(props: IngredientGroupSingleProps) {
    const { group, index, reorderGroup, ingredients, reorderIngredient, removeIngredient, renameGroup, addIngredient, groups, editIngredient, removeGroup } = props

    // Drag and drop functionality for planner
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'IngredientGroup',
        item: {
            group: group
        },
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),

        }),
    }), [group, index, ingredients])

    // Drop functionality 
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'IngredientGroup',
        // drop: (item: { recipe: any }) => console.log('Dropping'),
        hover: (item: { group: IngredientGroup }) => {
            console.log('Dropping group', item.group, group, index)
            reorderGroup(item.group, index)
        },
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
    }), [group, index, ingredients])

    useEffect(() => {
        console.log('Index and group changing', index)
    }, [group, index, ingredients])

    const [groupIngredients, setGroupIngredients] = useState([])
    // Listen to ingredients change
    useEffect(() => {
        console.log('Ingredients changing', ingredients)
        let inGroup = []
        ingredients.forEach(i => {
            if (i.group === group.name) {
                inGroup = i.ingredients
            }
        })

        setGroupIngredients(inGroup)

    }, [ingredients, group, index])

    const [editingGroup, setEditingGroup] = useState(false)
    const [newGroupName, setNewGroupName] = useState(group.name)
    const [addingIngredient, setAddingIngredient] = useState(false)

    const updateGroupName = async () => {
        setEditingGroup(false)
        renameGroup(group.name, newGroupName)
    }

    const addIngredientToGroup = (e) => {
        addIngredient(e)
        setAddingIngredient(false)
    }


    return (
        <div ref={drop}>

            <div ref={drag} className="bg-white rounded-md shadow p-4">
                <div className="w-full flex items-center justify-between">
                    {!editingGroup ?
                        <div className="flex items-center space-x-2">
                            <div>{group.name}</div>
                            {group.name !== 'No group' && <div onClick={() => setEditingGroup(true)}>
                                <Icon type="edit" />
                            </div>
                            }
                        </div>
                        :
                        <div className="flex items-center space-x-2">
                            <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
                            {newGroupName.length > 0 && <div onClick={() => updateGroupName()}>
                                <Icon type="check" />
                            </div>
                            }
                        </div>
                    }
                    {group.name !== 'No group' &&
                        <div onClick={() => removeGroup(group)}>
                            <Icon type="delete" />
                        </div>
                    }
                </div>

                {groupIngredients.length > 0 ? <div className="space-y-2">
                    {groupIngredients.map((ingredient, i) => {
                        return <IngredientSingle
                            ingredient={ingredient}
                            index={i}
                            key={i}
                            reorderIngredient={reorderIngredient}
                            group={group}
                            groupIndex={index}
                            removeIngredient={removeIngredient}
                            editIngredient={editIngredient}
                        />
                    })}
                </div> :
                    <EmptyIngredientDrop reorderIngredient={reorderIngredient} group={group} index={index} />
                }
                {addingIngredient ?
                    <AddSingleIngredient addIngredient={addIngredientToGroup} groups={groups} selectedGroup={group.name} cancel={() => setAddingIngredient(false)} />
                    :
                    <Button as="button" type="button" onClick={() => setAddingIngredient(true)} background="primary-medium" textColor="white">Add ingredient</Button>
                }
            </div>
        </div >
    )
}

interface EmptyIngredientDropProps {
    group: IngredientGroup,
    index: number,
    reorderIngredient: Function,

}

function EmptyIngredientDrop(props: EmptyIngredientDropProps) {
    const { reorderIngredient, group, index } = props
    // Drop functionality 
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'Ingredient',
        // drop: (item: { recipe: any }) => console.log('Dropping'),
        drop: (item: { ingredient: any }) => {
            // console.log('Dropping group', item.ingredient, ingredient, index)
            reorderIngredient(item.ingredient, 0, index, group)
        },
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
    }), [group, index])

    return <div ref={drop} className={`border-2 border-dashed p-4 ${isOver ? ' border-primary-medium' : 'border-gray-200'}`} >Drop ingredients here</div>

}
