import React, { useEffect, useState } from 'react'
import { IngredientFormatted, IngredientGroup, Instruction, RecipeGroup, RecipeIngredient } from '../../lib/types'
import { useDrag } from 'react-dnd'
import { useDrop } from 'react-dnd'
import IngredientSingle from './unused/ingredient-single'
import Icon from '../ui/icon/icon'
import AddSingleIngredient from './AddSingleIngredient'
import Button from '../ui/button/button'
import AddInstruction from './AddInstruction'

interface MethodSingleProps {
    instruction: Instruction,
    index: number,
    reorderInstruction: Function,
    method: Instruction[],
    removeInstruction: Function;
    renameInstruction: Function;
    editInstruction?: Function;

}

export default function MethodSingle(props: MethodSingleProps) {
    const { instruction, index, reorderInstruction, removeInstruction, method, renameInstruction, editInstruction } = props

    // Drag and drop functionality for planner
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'method',
        item: {
            instruction: instruction
        },
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),

        }),
    }), [method, index, instruction])

    // Drop functionality 
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'method',
        // drop: (item: { recipe: any }) => console.log('Dropping'),
        hover: (item: { instruction: Instruction }) => {
            console.log('Dropping group', item.instruction, instruction, index)
            reorderInstruction(item.instruction, index)
        },
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
    }), [method, index, instruction])

    useEffect(() => {
        // console.log('Index and group changing', index)
        setNewInstructionName(instruction.name)
    }, [instruction])

    const [groupIngredients, setGroupIngredients] = useState([])


    const [editingInstruction, setEditingInstruction] = useState(false)
    const [newInstructionName, setNewInstructionName] = useState(instruction.name)
    const [addingIngredient, setAddingIngredient] = useState(false)

    const updateName = async () => {
        setEditingInstruction(false)
        renameInstruction(instruction.id, newInstructionName)
    }

    const finishEditing = (e) => {
        editInstruction(e)
        setEditingInstruction(false)
    }

    const stopEditing = () => {
        setEditingInstruction(false)
    }

    return (
        <div ref={drop}>

            <div ref={drag} className="bg-white rounded-md shadow p-4">
                <div className="w-full flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-primary-medium">{index + 1}</div>
                        {!editingInstruction ?
                            <div className="flex flex-col items-start space-x-2">
                                <div>{instruction.name} - {index}</div>
                                {instruction.name !== 'No group' && <div onClick={() => setEditingInstruction(true)}>
                                    <Icon type="edit" />
                                </div>
                                }
                                {instruction.image && <img src={instruction.image} className="w-full h-full object-cover" />}
                                {instruction.video && <video src={instruction.video} className="w-full h-full" controls />}
                            </div>
                            :
                            <div className="flex items-center space-x-2">

                                <AddInstruction editing={instruction} editInstruction={finishEditing} stopEditing={stopEditing} />
                                {/* <input value={newInstructionName} onChange={(e) => setNewInstructionName(e.target.value)} />
                                {newInstructionName.length > 0 && <div onClick={() => updateName()}>
                                    <Icon type="check" />
                                </div>
                                } */}
                            </div>
                        }
                    </div>
                    <div onClick={() => removeInstruction(instruction)}>
                        <Icon type="delete" />
                    </div>
                </div>
            </div>
        </div >
    )
}

