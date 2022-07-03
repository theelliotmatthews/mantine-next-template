import { Alert, Card, Grid, Group, Stack, Text, Title } from '@mantine/core';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { DotsVertical, ExclamationMark, GripVertical, HandGrab, Trash } from 'tabler-icons-react';

import { setgroups } from 'process';
import { DragColumn, DragResult, Ingredient, IngredientGroup } from '../../lib/types';
import AddEditIngredient from './AddEditIngredient';
import IngredientGroupSingle from './IngredientGroupSingle';
import AddIngredientGroup from './AddIngredientGroup';
import EditIngredientGroupName from './EditIngredientGroupName';
import IngredientExtractor from './IngredientExtractor';

interface EditIngredientsProps {
    ingredients: RecipeIngredient[],
    setIngredients: Function,
    ingredientGroups: IngredientGroup[],
    setIngredientGroups: Function,
    children?: React.ReactNode,
}

export default function EditIngredients(props: EditIngredientsProps) {
    const { ingredients, setIngredients, ingredientGroups, setIngredientGroups, children } = props;


    const onDragEnd = (result: DragResult, columns: DragColumn, setColumns: Function) => {
        console.log('On drag end result', result);

        console.log('Ingredient groups on drag end', columns);

        if (!result.destination) return;
        const { source, destination } = result;

        console.log('Destination', result.destination);
        if ((result.type === 'group')) {
            console.log('Group drag');

            const groupsCopy = [...columns];

            const removed = groupsCopy[source.index];

            groupsCopy.splice(source.index, 1);
            groupsCopy.splice(destination.index, 0, removed);

            setColumns(groupsCopy);
        } else {
            const columnsCopy = [...columns];
            // const sourceColumn = columns.find(x => x.ingredients.includes(result.draggableId))
            const sourceColumn = columnsCopy.find(x => x.id === result.source.droppableId);
            const destColumn = columnsCopy.find(x => x.id === result.destination.droppableId);

            console.log('Source column', sourceColumn.name, sourceColumn);
            console.log('dest column', destColumn.name, destColumn);

            const removed = sourceColumn.ingredients[source.index];
            console.log('Removed', removed);
            // sourceColumn.ingredients = sourceColumn.ingredients.splice(source.index, 1)
            // sourceColumn.ingredients = sourceColumn.ingredients.splice(source.index, 1)

            // const sourceColumn = columns[source.droppableId];
            // const destColumn = columns[destination.droppableId];
            // const sourceItems = [...sourceColumn.ingredients];
            // const destItems = [...destColumn.ingredients];
            console.log(`Removing at source index: ${source.index}`);
            // sourceColumn.ingredients.filter(item => item !== removed);
            sourceColumn.ingredients.splice(source.index, 1);

            destColumn.ingredients.splice(destination.index, 0, removed);
            console.log('Columns, copy', columnsCopy);
            setColumns(columnsCopy);
            // setColumns({
            //     ...columns,
            //     [source.droppableId]: {
            //         ...sourceColumn,
            //         ingredients: sourceItems,
            //     },
            //     [destination.droppableId]: {
            //         ...destColumn,
            //         ingredients: destItems,
            //     },
            // });
        }

        // else {
        //     console.log('ELSE BABY');
        //     const column = columns[source.droppableId];
        //     const copiedItems = [...column.ingredients];
        //     const [removed] = copiedItems.splice(source.index, 1);
        //     copiedItems.splice(destination.index, 0, removed);
        //     setColumns({
        //         ...columns,
        //         [source.droppableId]: {
        //             ...column,
        //             ingredients: copiedItems,
        //         },
        //     });
        // }

        // setWeekUpdated(weekUpdated + 1);
    };

    const deleteGroup = (id: string) => {
        console.log('Deleting group with id', id);

        const ingredientsToDelete = [...ingredientGroups.find(x => x.id === id)?.ingredients];
        console.log('Ingredients to delete', ingredientsToDelete);

        setIngredientGroups(prevState => [...prevState.filter(i => i.id !== id)]);

        setIngredients(prevState => [...prevState.filter(i => !ingredientsToDelete.includes(i.id))]);
    };

    const deleteIngredient = (id: string) => {
        console.log('Deleting ingredient with id', id);

        const groupCopy = [...ingredientGroups];
        const groupContainingIngredient = groupCopy.find(x => x.ingredients.includes(id));
        groupContainingIngredient.ingredients = groupContainingIngredient?.ingredients.filter(i => i !== id);

        setIngredientGroups(groupCopy);

        setIngredients(prevState => [...prevState.filter(i => i.id !== id)]);
    };

    const addGroup = (name: string) => {
        const newGroup = {
            id: uuidv4(),
            ingredients: [
            ],
            name,
        };

        setIngredientGroups(prevState => [newGroup, ...prevState]);
    };

    const editGroupName = (id: string, name: string) => {
        console.log(`Editing group name wiht id ${id} new name ${name}`);

        const groupCopy = [...ingredientGroups];
        groupCopy.find(x => x.id == id).name = name;
        setIngredientGroups(groupCopy);
    };

    const addExtractedIngredients = (extractedIngredients: Ingredient[], group: string) => {
        console.log(`Adding extracted into group ${group}`, extractedIngredients);
        const extractedIngredientsCopy = [...extractedIngredients];
        const ingredientIds = [];
        const addingToGroupId = group || ingredientGroups.find(x => x.name === 'No group').id;
        for (const ingredient of extractedIngredientsCopy) {
            ingredient.group = addingToGroupId;
            const ingredientId = uuidv4();
            ingredient.id = ingredientId;
            ingredientIds.push(ingredientId);
            ingredient.note = '';
        }

        const groupsCopy = [...ingredientGroups];
        const groupAddingTo = groupsCopy.find(x => x.id === addingToGroupId);
        if (groupAddingTo) {
            groupAddingTo.ingredients = [...groupAddingTo.ingredients, ...ingredientIds];
        }

        console.log('ingredient IDs', ingredientIds);
        console.log('extractedIngredientsCopy', extractedIngredientsCopy);
        console.log('groupsCopy', groupsCopy);
        setIngredients(prevState => [...prevState, ...extractedIngredientsCopy]);
        setIngredientGroups(groupsCopy);
    };

    return (
        <div>
            {/* <h1>Edit ingredients</h1>
            <div style={{ fontSize: 12, display: 'flex' }}>
                <pre>{JSON.stringify(ingredients, null, 2)}</pre>
                <br />
                <br />
                <pre> {JSON.stringify(ingredientGroups, null, 2)}</pre>
            </div> */}
            <Title mb="md" order={2}>Ingredients</Title>
            <Grid>
                <Grid.Col span={6}>

                    <DragDropContext
                        onDragEnd={result => onDragEnd(result, ingredientGroups, setIngredientGroups)}
                    >
                        {/* {visibleWeek.map((day, index) => ( */}
                        <Droppable droppableId="group123112321" type="group">
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                    <Stack>
                                        {ingredients.length === 0 &&
                                            <Alert title={<Group spacing="xs"><ExclamationMark />  Ingredients missing!</Group>} variant="light" color="red">
                                                Add at least one ingredient
                                            </Alert>
                                        }
                                        {ingredientGroups.map((group, index) => (
                                            <Draggable draggableId={group.id} index={index} key={group.id}>
                                                {(p) => (
                                                    <div
                                                        ref={p.innerRef}
                                                        {...p.draggableProps}
                                                    >
                                                        <Card>
                                                            <Group align="center" position="apart">
                                                                <Group>
                                                                    <div {...p.dragHandleProps}>
                                                                        <GripVertical size={16} />
                                                                    </div>
                                                                    <EditIngredientGroupName group={group} editName={editGroupName} />
                                                                </Group>
                                                                {group.name !== 'No group' &&
                                                                    <Group>
                                                                        <Trash onClick={() => deleteGroup(group.id)} />
                                                                    </Group>
                                                                }
                                                            </Group>
                                                            <IngredientGroupSingle
                                                                ingredientsInGroup={group.ingredients}
                                                                ingredientGroups={ingredientGroups}
                                                                ingredientGroup={group}
                                                                groupId={group.id}
                                                                allIngredients={ingredients}
                                                                deleteIngredient={deleteIngredient}
                                                                groups={ingredientGroups}
                                                                ingredients={ingredients}
                                                                setIngredients={setIngredients}
                                                                setIngredientGroups={setIngredientGroups}
                                                            />
                                                        </Card>
                                                    </div>)}
                                            </Draggable>
                                        ))}
                                    </Stack>
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Stack>
                        <AddEditIngredient
                            groups={ingredientGroups}
                            ingredients={ingredients}
                            setIngredients={setIngredients}
                            ingredientGroups={ingredientGroups}
                            setIngredientGroups={setIngredientGroups}
                        />
                        <AddIngredientGroup addGroup={addGroup} />
                        <IngredientExtractor groups={ingredientGroups} addIngredients={addExtractedIngredients} />
                        {children && children}
                    </Stack>
                </Grid.Col>
            </Grid>
        </div>
    );
}
