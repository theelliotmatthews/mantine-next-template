import React, { useEffect, useState } from 'react'
import IngredientGroupSingle from './unused/ingredient-group'
import { useDrop } from 'react-dnd'
import { IngredientGroup, Instruction, RecipeIngredient } from '../../lib/types'
import AddIngredientGroup from './AddIngredientGroup'
import AddSingleIngredient from './AddSingleIngredient'
import { v4 as uuidv4 } from 'uuid';
import MethodSingle from './MethodSingle'
import AddInstruction from './AddInstruction'
import { MethodExtractor } from './MethodExtractor'
import { DndListHandle } from './unused/method-items'

interface EditMethodProps {
    updateMethod: Function;
    existingMethod?: Instruction[]
}

export default function EditMethod(props: EditMethodProps) {
    const { updateMethod, existingMethod } = props

    const [method, setMethod] = useState(
        // (existingMethod.length > 0) ? existingMethod :
        [
            {

                name: 'Boil the rice',
                id: uuidv4(),
                image: null,
                video: 'https://d1ko11x0ybxl0h.cloudfront.net/madcowfilms/production/clips/07e49e59-f5a0-4c84-a350-77653cad7070-1280x720.2500.webm?1647600514677',
            },
            {

                name: 'Cook the tofu',
                id: uuidv4(),
                image: 'https://realfood.tesco.com/media/images/RFO-1400x919-MeatFreeBalls-39a70fe8-f550-432b-b563-7b5b666c27e6-0-1400x919.jpg',
                video: null,
            },
            {

                name: 'Serve the meal',
                id: uuidv4(),
                image: null,
                video: null,
            },
        ])

    const [methodCopy, setMethodCopy] = useState([])

    const createInstruction = (data: any) => {
        console.log('Create group data', data)

        const newInstruction = {
            name: data.name,
            id: uuidv4(),
            image: data.image,
            video: data.video,
            timer: data.timer
        }

        setMethod(prev => (
            [
                ...prev,
                newInstruction
            ]
        ))
    }

    const addInstructions = (steps: any) => {
        console.log('Adding multiple instructions', steps)
        steps.forEach((step) => {
            if (step.length > 0) {
                if (!step.toLowerCase().includes("step ") && (step.length > 5)) {
                    createInstruction({
                        name: step,
                        image: null,
                        video: null,
                    });
                }
            }
        });
    }

    const renameInstruction = (id: string, newName: string) => {

        // Rename group
        const copy = [...method]

        for (const instruction of copy) {
            if (instruction.id === id) {
                instruction.name = newName
            }
        }

        setMethod(copy)
    }

    const reorderInstruction = (indexOfGroup: number, newIndex: number) => {

        // Find index of the group we are moving 
        // const indexOfGroup = method.indexOf(method.find(x => x.id === group.id))
        // console.log('Index of group', indexOfGroup)

        console.log('Reording from to ', indexOfGroup, newIndex)

        let methodCopy = [...method]
        methodCopy.splice(newIndex, 0, methodCopy.splice(indexOfGroup, 1)[0])

        setMethodCopy(methodCopy)
    }

    const removeInstruction = (group: any) => {

        if (method.length === 1) {
            setMethod([])
        } else {
            const indexOfInstruction = method.indexOf(method.find(x => x.id === group.id))
            console.log('Index of group', indexOfInstruction)

            let copy = [...method]
            copy.splice(indexOfInstruction, 1)

            setMethodCopy(copy)
        }
    }

    const editInstruction = (instruction: Instruction) => {
        console.log('Editing instruction', instruction)

        let methodCopy = [...method]

        // Find the index this ingredient came from
        let fromIndex = 0
        for (let x = 0; x < methodCopy.length; x++) {
            console.log('Method copy[x]', methodCopy[x].id)
            console.log('Instruction', instruction)
            if (methodCopy[x].id === instruction.id) fromIndex = x

        }

        methodCopy.splice(fromIndex, 1)

        // Insert into new group index
        methodCopy.splice(fromIndex, 0, instruction)

        setMethod(methodCopy)
    }


    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'method',
        // drop: (item: { recipe: any }) => changeDateOfRecipeInPlanner(date, item.recipe),
        drop: (item: { group: IngredientGroup }) => {
            console.log('Dropping', drop)
            // return reorderRecipeInPlanner(item.recipe, 0, date)
        },
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
    }), [method])

    useEffect(() => {
        // console.log('Our groups are changing order', method)
        updateMethod(method)
    }, [method])

    useEffect(() => {
        if (methodCopy.length > 0) setMethod(methodCopy)

    }, [methodCopy])

    useEffect(() => {
        if (existingMethod.length > 0) {
            setMethod(existingMethod)
        }
    }, [existingMethod])

    return (
        <div>
            <div>Add your method</div>

            <MethodExtractor addInstructions={addInstructions} />

            <div className="grid grid-cols-2 gap-4">
                {/* Ingredient droppable group container */}
                {/* <div className="space-y-4">
                    {method.map((instruction, index) => {
                        return <MethodSingle
                            instruction={instruction}
                            key={index}
                            index={index}
                            reorderInstruction={reorderInstruction}
                            method={method}
                            removeInstruction={removeInstruction}
                            renameInstruction={renameInstruction}
                            editInstruction={editInstruction}

                        />
                    })}
                </div> */}
                {method &&
                    <>
                        <DndListHandle
                            data={method}
                            reorderInstruction={reorderInstruction}
                            removeInstruction={removeInstruction}
                            renameInstruction={renameInstruction}
                            editInstruction={editInstruction}
                        />
                        <pre>{JSON.stringify(method, null, 2)}</pre>
                    </>
                }

                <div className="space-y-4">
                    <AddInstruction createInstruction={createInstruction} />
                </div>
            </div>
        </div>
    )
}
