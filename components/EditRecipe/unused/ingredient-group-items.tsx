import React, { useEffect, useState } from 'react';
import { createStyles, Text } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Edit, GripVertical, Trash } from 'tabler-icons-react';
import { IngredientGroup, Instruction, RecipeGroup } from '../../../lib/types';
import AddInstruction from '../AddInstruction';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import TextInput from '../ui/text-input/text-input';
import Button from '../ui/button/button';
import { DndIngredients } from './ingredient-items';

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
    }[];
    renameGroup: Function,
    reorderGroup: Function,
    removeGroup: Function,
    groups: IngredientGroup[],
    ingredients: RecipeGroup[],
    // reorderInstruction: Function;
    // removeInstruction: Function;
    // renameInstruction: Function;
    // editInstruction?: Function;
}

export function DndListHandle({ data,
    renameGroup,
    groups,
    ingredients,
    reorderGroup,
    removeGroup,
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
        <EditableIngredientGroup
            item={item}
            index={index}
            renameGroup={renameGroup}
            removeGroup={removeGroup}
            groups={groups}
            ingredients={ingredients}
        // removeInstruction={removeInstruction}
        // renameInstruction={renameInstruction}
        // editInstruction={editInstruction}
        />

    ));

    return (
        <>{winReady ?
            <DragDropContext
                onDragEnd={({ destination, source }) => {
                    handlers.reorder({ from: source.index, to: destination.index })
                    reorderGroup(source.index, destination.index)
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

interface EditableIngredientGroupProps {
    groups: IngredientGroup[],
    renameGroup: Function,
    removeGroup: Function,
    item: IngredientGroup;
    index: number,
    ingredients: RecipeGroup[],
}


export function EditableIngredientGroup({
    item,
    index,
    groups,
    renameGroup,
    removeGroup,
    ingredients,

}
    : EditableIngredientGroupProps) {
    const { classes, cx } = useStyles();

    const [editingGroup, setEditingGroup] = useState(false)
    const groupNameSchema = z.object({
        groupName: z.string({
            required_error: "Group name is required",
            invalid_type_error: "Group name must be a string",
        }).nonempty({ message: 'A group name is required' }).min(3)
    })

    const onSubmit = (data: any) => {
        console.log('Submit', data)

        let groupsLowercase = []
        groups.forEach(group => {
            groupsLowercase.push((group.name.toLowerCase()))
        })

        if (groupsLowercase.includes(data.groupName.toLowerCase()) && (data.groupName !== item.name)) {
            setError("groupName", {
                type: "manual",
                message: "A group with this name already exists",
            })
            return
        }

        renameGroup(item.name, data.groupName)
        setEditingGroup(false)

        // createGroup(data)
    }

    // Set the group name by default
    useEffect(() => {
        setValue("groupName", item.name)
    }, [item])

    const methods = useForm({ resolver: zodResolver(groupNameSchema), mode: 'onChange' });
    const { handleSubmit, formState: { errors, isValid }, setValue, clearErrors, setError } = methods

    // Fetch ingredients in the current group 
    const [ingredientsInGroup, setIngredientsInGroup] = useState([])

    useEffect(() => {
        let inGroup = []

        for (const group of ingredients) {
            if (group.group === item.name) {
                inGroup = group.ingredients
            }
        }

        setIngredientsInGroup(inGroup)

        console.log('Ingredients coming through', ingredients)
        console.log('Current group', item.name)
    }, [ingredients])

    return (
        <Draggable key={item.id} index={index} draggableId={item.id}>
            {(provided, snapshot) => (

                <div
                    className={cx(classes.item, { [classes.itemDragging]: snapshot.isDragging })}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                >
                    <div className="flex flex-col items-start w-full">
                        <div className="flex items-center w-full">
                            <div {...provided.dragHandleProps} className={classes.dragHandle}>
                                <GripVertical size={18} />
                            </div>
                            {!editingGroup ?
                                <div className="flex justify-between w-full">
                                    <div className="space-y-2">
                                        <div className="flex items-start space-x-2">
                                            <Text>{item.name} here</Text>
                                        </div>
                                    </div>
                                    <div>
                                        <Edit onClick={() => setEditingGroup(true)} className="flex-shrink-0" />
                                        <Trash onClick={() => removeGroup(index, item.name)} />
                                    </div>
                                </div> :
                                <div>
                                    <div className="flex items-center">
                                        <FormProvider {...methods}>
                                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex items-center">
                                                <TextInput errorMessage={errors.groupName?.message} label="Group name" registerAs="groupName" type="text" />
                                                {isValid && <Button as="button" type="submit" background="primary-medium" disabled={!isValid} icon="check"></Button>
                                                }
                                            </form>
                                        </FormProvider>
                                    </div>
                                </div>

                            }
                        </div>

                        <div className="border-t border-gray-200 w-full">
                            <DndIngredients data={ingredientsInGroup} />
                        </div>
                    </div>
                </div>


            )}
        </Draggable>
    )
}