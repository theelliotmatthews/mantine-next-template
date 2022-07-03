/* eslint-disable no-restricted-syntax */
import React, { useContext, useEffect, useState } from 'react';
import { Button, Grid, Group, Stack, Tabs, Text } from '@mantine/core';
import { Calendar, Users, Notes, Trash } from 'tabler-icons-react';
import {
    startOfWeek,
    lastDayOfWeek,
    add,
    isSameDay,
} from 'date-fns';
import { DragDropContext } from 'react-beautiful-dnd';
import { useModals } from '@mantine/modals';
import { UserContext } from '../../lib/context';
import { clearVisibleWeekOfPlanner, getCollaborativePlannerById, getRecipesInPlanner, removeRecipeFromPlanner, updateOrderOfRecipesInVisiblePlanner } from '../../lib/planner/planner';
import { CollaborativePlanner, DragColumn, DragResult, Recipe } from '../../lib/types';
import { formatDate } from '../../lib/formatting';
import { PlannerDay } from '../PlannerDay/PlannerDay';
import AddToListButton from '../AddToListButton/AddToListButton';
import ChevronButtons from '../ChevronButtons/ChevronButtons';

interface PlannerProps {
    collaborativePlannerId?: string;
    collaborative: boolean;
    slideover?: boolean;
}

interface PlannerDay { day: Date; recipes: Recipe[] }

export default function Planner(props: PlannerProps) {
    const { collaborativePlannerId, collaborative, slideover } = props;

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [visibleWeek, setVisibleWeek] = useState<PlannerDay[]>([]);
    const [recipesInWeek, setRecipesInWeek] = useState<Recipe[]>([]);
    const [weekStart, setWeekStart] = useState<Date>(new Date());
    const [weekEnd, setWeekEnd] = useState<Date>(new Date());
    const [planner, setPlanner] = useState<Recipe[]>([]);
    const [updated, setUpdated] = useState(false);
    const [servingsChanged, setServingsChanged] = useState(0);
    const [recipesToSkipUpdate, setRecipesToSkipUpdate] = useState<string[]>([]);
    const [userCanEdit, setUserCanEdit] = useState<boolean>(false);

    const modals = useModals();

    const { user } = useContext(UserContext);

    // Switch the week
    const changeWeek = (future: boolean) => {
        if (future) {
            setWeekStart(add(weekStart, { weeks: 1 }));
            setWeekEnd(add(weekEnd, { weeks: 1 }));
        } else {
            setWeekStart(add(weekStart, { weeks: -1 }));
            setWeekEnd(add(weekEnd, { weeks: -1 }));
        }
    };

    // Change the date of a recipe in the planner
    const changeDateOfRecipeInPlanner = async (date: Date, recipeToUpdate: Recipe) => {
        // Search through recipes and update
        const plannerCopy = [...planner];
        for (const recipe of plannerCopy) {
            if (recipe.plannerData.id === recipeToUpdate.plannerData.id) {
                recipe.plannerData.date = date;
            }
        }

        setPlanner(plannerCopy);
        //await updatePlannerRecipe(recipeToUpdate.plannerData.id, { date: date })
    };

    // Clear planner for the week
    const clear = async () => {
        const ids: string[] = [];
        planner.forEach(recipe => {
            ids.push(recipe.plannerData.id);
        });

        const promises: any = [];
        ids.forEach(id => {
            const promise = removeRecipeFromPlanner(id);
            promises.push(promise);
        });

        await Promise.all(promises);
        setPlanner([]);
    };

    // Adjust the servings of a recipe
    const adjustServings = (recipeToAdjust: Recipe, newServings: number) => {
        const copy = [...planner];
        for (const recipe of copy) {
            if (recipe.plannerData.id === recipeToAdjust.plannerData.id) {
                recipe.servingsAdjusted = newServings;
            }
        }

        setPlanner(copy);

        setServingsChanged(servingsChanged + 1);
    };

    const getPlanners = async (updateOrder?: boolean, skipRecipe?: string) => {
        const res = await getRecipesInPlanner(user.uid, weekStart, weekEnd, true, collaborativePlannerId);
        console.log('PLANNER', res)
        setRecipes(res);
        setPlanner(res);

        setRecipesToSkipUpdate([skipRecipe]);

        // if (updateOrder) {
        //     await updateOrderOfRecipesInVisiblePlanner(visibleWeek);
        // }

        // if (updateOrder && skipRecipe) {
        //     console.log('Updating and skipping')
        //     await updateOrderOfRecipesInVisiblePlanner(visibleWeek);
        // }
    };

    // Load in recipes for this planner
    useEffect(() => {
        if (user && weekStart && weekEnd && (collaborative !== undefined)) {
            getPlanners();
        }
    }, [weekStart, collaborative, user]);

    // Preload in the current week
    useEffect(() => {
        const today = new Date();

        setWeekStart(startOfWeek(today, {
            weekStartsOn: 1,
        }));
        setWeekEnd(lastDayOfWeek(today, {
            weekStartsOn: 1,
        }));
    }, []);

    // Check if the user can edit
    useEffect(() => {
        const canEdit = async () => {
            console.log('collaborativePlannerId', collaborativePlannerId);
            const res: CollaborativePlanner = await getCollaborativePlannerById(collaborativePlannerId, true);
            console.log('Shared planner', res);
            return setUserCanEdit(res.collaborative || (res.createdBy === user.uid));
        };
        if (!collaborative) {
            console.log('Users own planner');
            setUserCanEdit(true);
        } else {
            canEdit();
        }
    }, []);

    // Change the visible week when the week start changes
    useEffect(() => {
        // console.log('Weekstart or planner changing', planner)
        if (weekStart) {
            const week: any = {};
            const allRecipes: Recipe[] = [];
            for (let x = 0; x < 7; x += 1) {
                const day: {
                    date: Date,
                    recipes: Recipe[],
                    id: string
                } = {
                    date: add(weekStart, { days: x }),
                    recipes: [],
                    id: (x + 1).toString(),
                };

                // Cycle through and find matching recipes
                planner.forEach((recipe: Recipe) => {
                    if (recipe && isSameDay(recipe.plannerData.date, day.date)) {
                        day.recipes.push({ ...recipe });
                    }
                });

                day.recipes = day.recipes.sort((a, b) =>
                    a.plannerData.order < b.plannerData.order ? -1 : a.plannerData.order > b.plannerData.order ? 1 : 0
                );

                day.recipes.forEach(recipe => {
                    allRecipes.push(recipe);
                });

                // week.push(day);
                week[(x + 1).toString()] = day;
            }
            setVisibleWeek(week);
            setRecipesInWeek(allRecipes);
        }
    }, [weekStart, planner, updated]);

    useEffect(() => {
        const update = async () => {
            updateOrderOfRecipesInVisiblePlanner(visibleWeek, recipesToSkipUpdate[0]);
        };

        update();

        console.log('Visible week', visibleWeek)
    }, [visibleWeek]);

    const [weekUpdated, setWeekUpdated] = useState(0);

    const onDragEnd = (result: DragResult, columns: DragColumn, setColumns: Function) => {
        if (!result.destination) return;
        const { source, destination } = result;

        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = columns[source.droppableId];
            const destColumn = columns[destination.droppableId];
            const sourceItems = [...sourceColumn.recipes];
            const destItems = [...destColumn.recipes];
            const [removed] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...sourceColumn,
                    recipes: sourceItems,
                },
                [destination.droppableId]: {
                    ...destColumn,
                    recipes: destItems,
                },
            });
        } else {
            const column = columns[source.droppableId];
            const copiedItems = [...column.recipes];
            const [removed] = copiedItems.splice(source.index, 1);
            copiedItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...column,
                    recipes: copiedItems,
                },
            });
        }

        setWeekUpdated(weekUpdated + 1);
    };

    useEffect(() => {
        if (weekUpdated !== 0) {
            const update = async () => {
                await updateOrderOfRecipesInVisiblePlanner(visibleWeek);
                // await getPlanners();
            };

            update();
        }
        // Update order of recipes in visible week
    }, [weekUpdated]);

    // Remove a recipe from a planner
    const removeFromPlanner = async (recipesToRemove: Recipe[]) => {
        const promises: any = [];

        // Remove from visibleWeek

        setPlanner(prevState => prevState.filter((recipe: Recipe) => !recipesToRemove.includes(recipe.plannerData.id)));

        // Remove from firestore
        for (const recipeId of recipesToRemove) {
            const promise = removeRecipeFromPlanner(recipeId);
            promises.push(promise);
        }

        await Promise.all(promises);

        setWeekUpdated(weekUpdated + 1);

        // reorderRecipeInPlanner(recipeToRemove, 0, recipeToRemove.plannerData.date, true);
    };

    const openClearWeekModal = () => {
        modals.openConfirmModal({
            title: 'Delete your profile',
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to clear the week of recipes?
                </Text>
            ),
            labels: { confirm: 'Clear week', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                const recipeIdsToDelete = recipesInWeek.map((recipe => recipe.plannerData.id));
                await clearVisibleWeekOfPlanner(recipeIdsToDelete);
                await getPlanners();
                console.log('Recipes to delete', recipeIdsToDelete);
            },
        });
    };

    return (
        <Stack>

            <ChevronButtons onChange={changeWeek} text={`${formatDate(weekStart, 1)} - ${formatDate(weekEnd, 1)}`} />
            <div>Can edit: {JSON.stringify(userCanEdit)}</div>
            {recipesInWeek.length > 0 ? (
                <Group>
                    <AddToListButton recipes={recipesInWeek}>
                        <Button leftIcon={<Notes size={14} />}>Add week to list</Button>
                    </AddToListButton>
                    {userCanEdit ? <Button leftIcon={<Trash size={14} />} onClick={() => openClearWeekModal()} color="red">Clear week</Button> : null}
                </Group>

            ) : null}

            <Grid gutter={16}>
                <DragDropContext
                    onDragEnd={result => onDragEnd(result, visibleWeek, setVisibleWeek)}
                >
                    {/* {visibleWeek.map((day, index) => ( */}
                    {Object.entries(visibleWeek).map(([columnId, day], index) => (
                        <Grid.Col key={columnId} xs={12} sm={6} md={4} lg={3}>
                            <Stack>

                                <PlannerDay
                                    recipes={day.recipes}
                                    removeFromPlanner={removeFromPlanner}
                                    date={day.date}
                                    changeDateOfRecipeInPlanner={changeDateOfRecipeInPlanner}
                                    adjustServings={adjustServings}
                                    servingsChanged={servingsChanged}
                                    collaborativePlannerId={collaborativePlannerId}
                                    collaborative={collaborative}
                                    visibleWeek={visibleWeek}
                                    columnId={day.id}
                                    getPlanners={getPlanners}
                                    userCanEdit={userCanEdit}

                                />

                            </Stack>
                        </Grid.Col>
                    ))}
                </DragDropContext>
            </Grid>

            {/* {JSON.stringify(visibleWeek)} */}
        </Stack>
    );
}
