import React, { useEffect, useState } from 'react';
import { Button, createStyles, Text } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Edit, GripVertical } from 'tabler-icons-react';
import { Instruction } from '../../../lib/types';
import AddInstruction from '../AddInstruction';

const useStyles = createStyles((theme) => ({
    item: {
        display: 'flex',
        alignItems: 'center',
        borderRadius: theme.radius.md,
        border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
            }`,
        padding: `${theme.spacing.sm}px ${theme.spacing.xl}px`,
        paddingLeft: theme.spacing.xl - theme.spacing.md, // to offset drag handle
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.white,
        marginBottom: theme.spacing.sm,
    },

    itemDragging: {
        boxShadow: theme.shadows.sm,
    },

    symbol: {
        fontSize: 30,
        fontWeight: 700,
        width: 60,
    },

    dragHandle: {
        ...theme.fn.focusStyles(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[6],
        paddingLeft: theme.spacing.md,
        paddingRight: theme.spacing.md,
    },
}));

interface DndListHandleProps {
    data: {
        name: string;
        id: string;
        image: string;
        video: string;
    }[];
    reorderInstruction: Function;
    removeInstruction: Function;
    renameInstruction: Function;
    editInstruction?: Function;
}

export function DndListHandle({ data, reorderInstruction, removeInstruction, renameInstruction, editInstruction }: DndListHandleProps) {
    const { classes, cx } = useStyles();
    const [state, handlers] = useListState(data);

    const [winReady, setwinReady] = useState(false);
    useEffect(() => {
        setwinReady(true);
    }, []);

    useEffect(() => {
        console.log('Data changing', data)
        handlers.setState(data)
    }, [data])

    const items = state.map((item, index) => (
        <EditableMethod
            item={item}
            index={index}
            removeInstruction={removeInstruction}
            renameInstruction={renameInstruction}
            editInstruction={editInstruction}
        />

    ));

    return (
        <>{winReady ?
            <DragDropContext
                onDragEnd={({ destination, source }) => {
                    handlers.reorder({ from: source.index, to: destination.index })
                    reorderInstruction(source.index, destination.index)
                    console.log('From', source.index)
                    console.log('Source', source)
                    console.log('To', destination.index)
                }

                }
            >
                <Droppable droppableId="dnd-list" direction="vertical">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {items}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext> : null}
        </>
    );
}

interface EditableMethodProps {
    removeInstruction: Function;
    renameInstruction: Function;
    editInstruction?: Function;
    item: Instruction;
    index: number
}


export function EditableMethod({
    item,
    index,
    removeInstruction,
    renameInstruction,
    editInstruction

}
    : EditableMethodProps) {
    const { classes, cx } = useStyles();

    const [editingInstruction, setEditingInstruction] = useState(false)
    const [newInstructionName, setNewInstructionName] = useState(item.name)
    const finishEditing = (e) => {
        editInstruction(e)
        setEditingInstruction(false)
    }

    const stopEditing = () => {
        setEditingInstruction(false)
    }
    return (
        <Draggable key={item.id} index={index} draggableId={item.id}>
            {(provided, snapshot) => (

                <div
                    className={cx(classes.item, { [classes.itemDragging]: snapshot.isDragging })}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                >

                    <div {...provided.dragHandleProps} className={classes.dragHandle}>
                        <GripVertical size={18} />
                    </div>
                    {!editingInstruction ?
                        <div className="flex justify-between w-full">
                            <div className="space-y-2">
                                <div className="flex items-start space-x-2">
                                    <Text>{index + 1}.</Text>
                                    <Text>{item.name}</Text>
                                </div>
                                {/* Image or video  */}
                                {item.image && <img src={item.image} className="w-1/2 object-cover rounded-lg" />}
                                {item.video && <video src={item.video} className="w-1/2 rounded-lg" controls />}

                            </div>
                            <Edit onClick={() => setEditingInstruction(true)} className="flex-shrink-0" />
                        </div> :
                        <div>
                            <AddInstruction editing={item} editInstruction={finishEditing} stopEditing={stopEditing} />

                        </div>
                    }

                </div>


            )}
        </Draggable>
    )
}