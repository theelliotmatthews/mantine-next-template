import { Button, Card, Stack, TextInput } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { CirclePlus } from 'tabler-icons-react';
import AddEditMethodItem from './AddEditMethodItem';
import DraggableMethod from './DraggableMethod';
import MethodExtractor from './MethodExtractor';

interface ReorderMethodProps {
    method: any;
    methodIds: string[];
    setMethod: Function;
    setMethodIds: Function;
    ingredients: Ingredient[];
}

export default function ReorderMethod(props: ReorderMethodProps) {
    const { method, methodIds, setMethod, setMethodIds, ingredients } = props
    // const [instructions, setInstructions] = useState({
    //     'task-1': { id: 'task-1', content: 'Take out the garbage' },
    //     'task-2': { id: 'task-2', content: 'Watch my favorite show' },
    //     'task-3': { id: 'task-3', content: 'Charge my phone' },
    //     'task-4': { id: 'task-4', content: 'Cook dinner' },
    // });

    // const [instructionIds, setInstructionIds] = useState(['task-1', 'task-2', 'task-3', 'task-4']);

    const [newInstruction, setNewInstruction] = useState('');

    const addNewInstruction = () => {

    };

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) { return; }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const newIds = Array.from(methodIds);
        newIds.splice(source.index, 1);
        newIds.splice(destination.index, 0, draggableId);

        setMethodIds(newIds);
    };

    const [winReady, setwinReady] = useState(false);
    useEffect(() => {
        setwinReady(true);
    }, []);

    return (
        <div>
            <Stack mb={12}>
                {winReady ?
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="1">
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                    <Stack>
                                        {methodIds.map((id, index) => (
                                            <DraggableMethod
                                                key={method[id].id}
                                                index={index}
                                                instruction={method[id]}
                                                ingredients={ingredients}
                                                method={method}
                                                methodIds={methodIds}
                                                setMethod={setMethod}
                                                setMethodIds={setMethodIds}
                                            >
                                                {method[id].instruction}
                                            </DraggableMethod>))}
                                    </Stack>
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext> : null}

                {/* <TextInput
                label="Add new instruction"
                placeholder="E.g boil the rice for 10 minute  ss"
                rightSection={<CirclePlus onClick={() => addNewInstruction()} />}
                onKeyDown={(e) => e.key === 'Enter' ? addNewInstruction() : null}
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
            /> */}
                <AddEditMethodItem method={method} methodIds={methodIds} setMethod={setMethod} setMethodIds={setMethodIds} ingredients={ingredients} />

                <MethodExtractor method={method} methodIds={methodIds} setMethod={setMethod} setMethodIds={setMethodIds} />
            </Stack>
        </div>
    );
}
