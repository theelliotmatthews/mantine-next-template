import React, { useEffect, useState } from 'react';
import { createStyles, Text } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Edit, GripVertical, Trash } from 'tabler-icons-react';
import { IngredientGroup, Instruction, RecipeIngredient } from '../../../lib/types';
import AddInstruction from '../AddInstruction';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import TextInput from '../ui/text-input/text-input';
import Button from '../ui/button/button';

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
    data: RecipeIngredient[];
    // renameGroup: Function,
    // reorderGroup: Function,
    // removeGroup: Function,
    // groups: IngredientGroup[],
    // reorderInstruction: Function;
    // removeInstruction: Function;
    // renameInstruction: Function;
    // editInstruction?: Function;
}

export function DndIngredients({ data,
    // renameGroup,
    // groups,
    // // reorderGroup,
    // removeGroup,
    // reorderInstruction, removeInstruction, renameInstruction, editInstruction

}: DndListHandleProps) {
    const { classes, cx } = useStyles();
    const [state, handlers] = useListState(data);

    const [winReady, setwinReady] = useState(false);
    useEffect(() => {
        setwinReady(true);
    }, []);

    useEffect(() => {
        handlers.setState(data)
    }, [data])

    const items = state.map((item, index) => (
        <EditableIngredient
            item={item}
            index={index}

        />

    ));

    return (
        <>{winReady ?
            <DragDropContext
                onDragEnd={({ destination, source }) => {
                    handlers.reorder({ from: source.index, to: destination.index })
                    // reorderGroup(source.index, destination.index)
                    // console.log('From', source.index)
                    // console.log('Source', source)
                    // console.log('To', destination.index)
                }

                }
            >
                <Droppable droppableId="dnd-list-ingredient" direction="vertical">
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

interface EditableIngredientProps {
    // groups: IngredientGroup[],
    // renameGroup: Function,
    // removeGroup: Function,
    item: RecipeIngredient;
    index: number
}


export function EditableIngredient({
    item,
    index,
    // groups,
    // renameGroup,
    // removeGroup

}
    : EditableIngredientProps) {
    const { classes, cx } = useStyles();

    const [editingIngredient, setEditingIngredient] = useState(false)

    return (
        <Draggable key={item.ingredient} index={index} draggableId={item.ingredient}>
            {(provided, snapshot) => (

                <div
                    className={cx(classes.item, { [classes.itemDragging]: snapshot.isDragging })}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                >

                    <div {...provided.dragHandleProps} className={classes.dragHandle}>
                        <GripVertical size={18} />
                    </div>
                    {!editingIngredient ?
                        <div className="flex justify-between w-full">
                            <div className="space-y-2">
                                <div className="flex items-start space-x-2">
                                    <Text>{item.ingredient}</Text>
                                </div>
                            </div>
                            <div>
                                <Edit onClick={() => setEditingIngredient(true)} className="flex-shrink-0" />
                                {/* <Trash onClick={() => removeGroup(index, item.name)} /> */}
                            </div>
                        </div> :
                        <div>
                            <div className="flex items-center">
                                Editing ingredient
                            </div>
                        </div>
                    }

                </div>


            )}
        </Draggable>
    )
}