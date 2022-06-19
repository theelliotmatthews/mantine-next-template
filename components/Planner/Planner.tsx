/* eslint-disable no-restricted-syntax */
import React, { useContext, useEffect, useState } from 'react';
import { Badge, Grid, Group, Stack, Tabs } from '@mantine/core';
import { Settings, MessageCircle, Coin, Calendar, Users } from 'tabler-icons-react';
import {
    getDay,
    startOfWeek,
    lastDayOfWeek,
    format,
    add,
    isSameWeek,
    isSameDay,
    isToday,
} from 'date-fns';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { array, date } from 'zod';
import { isSameDate } from '@mantine/dates';
import { UserContext } from '../../lib/context';
import { getRecipesInPlanner, updateOrderOfRecipesInVisiblePlanner } from '../../lib/planner/planner';
import { Recipe } from '../../lib/types';
import ChevronButtons from '../ChevronButtons/ChevronButtons';
import { formatDate } from '../../lib/formatting';
import PlannerDay from '../PlannerDay/PlannerDay';

interface PlannerProps {
    collaborativePlannerId?: string;
    collaborative: boolean;
    slideover?: boolean;
}

interface PlannerDay { day: Date; recipes: Recipe[] }

export default function Planner(props: PlannerProps) {
    const { collaborativePlannerId, collaborative } = props;

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [visibleWeek, setVisibleWeek] = useState<PlannerDay[]>([]);
    const [weekStart, setWeekStart] = useState<Date>();
    const [weekEnd, setWeekEnd] = useState<Date>();
    const [planner, setPlanner] = useState([]);
    const [updated, setUpdated] = useState(false);
    const [servingsChanged, setServingsChanged] = useState(0);

    const { user } = useContext(UserContext);

    // Switch the week
    const changeWeek = (future) => {
        if (future) {
            setWeekStart(add(weekStart, { weeks: 1 }));
            setWeekEnd(add(weekEnd, { weeks: 1 }));
        } else {
            setWeekStart(add(weekStart, { weeks: -1 }));
            setWeekEnd(add(weekEnd, { weeks: -1 }));
        }
    };

    // Remove a recipe from a planner
    const removeFromPlanner = async (recipeToRemove) => {
        if (!recipeToRemove.plannerData) return;

        // Remove from firestore
        await removeRecipeFromPlanner(recipeToRemove.plannerData.id);

        reorderRecipeInPlanner(recipeToRemove, 0, recipeToRemove.plannerData.date, true);
    };

    // Change the date of a recipe in the planner
    const changeDateOfRecipeInPlanner = async (date, recipeToUpdate) => {
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

    const reorderRecipeInPlanner = async (recipeToReorder, newOrder, date, del) => {
        // return
        let movingToADifferentDay = false;

        if (!isSameDay(date, recipeToReorder.plannerData.date)) {
            movingToADifferentDay = true;
        }

        // Make sure it's not the same order and same day
        if (recipeToReorder.plannerData.order === newOrder && recipeToReorder.date === date) return;

        // Find recipes that have the same date
        let plannerCopy = [...planner];

        const currentOrder = recipeToReorder.plannerData.order;
        const diffInOrder = newOrder - recipeToReorder.plannerData.order;
        const currentDate = recipeToReorder.plannerData.date;

        // Store bulk updates in promises
        const promises = [];

        // Cycle through each recipe
        for (const recipe of plannerCopy) {
            const recipeCurrentOrder = recipe.plannerData.order;
            if (movingToADifferentDay) {
                // Update the order of the new day
                if (isSameDay(date, recipe.plannerData.date)) {
                    // Check to see if this is the recipe we have dragged
                    if (recipe.plannerData.id !== recipeToReorder.plannerData.id) {
                        // If it is then set this as the new order
                        if (recipeCurrentOrder >= newOrder) {
                            recipe.plannerData.order = recipeCurrentOrder + 1;
                            const promise = updatePlannerRecipe(recipe.plannerData.id, { order: recipeCurrentOrder + 1 });
                            promises.push(promise);
                        }
                    }
                }

                // Update the order of the old day - should be only if
                if (isSameDay(currentDate, recipe.plannerData.date)) {
                    // Check to see if this is the recipe we have dragged
                    if (recipe.plannerData.id === recipeToReorder.plannerData.id) {
                        // If it is then set this as the new order

                        if (!del) {
                            recipe.plannerData.order = newOrder;
                            recipe.plannerData.date = date;
                            const promise = updatePlannerRecipe(recipe.plannerData.id, { order: newOrder, date });
                            promises.push(promise);
                        }
                    } else {
                        // Update anything with a lower index
                        if (recipeCurrentOrder > currentOrder) {
                            recipe.plannerData.order = recipeCurrentOrder - 1;
                            const promise = updatePlannerRecipe(recipe.plannerData.id, { order: recipeCurrentOrder - 1 });
                            promises.push(promise);
                        }
                    }
                }
            } else {
                // Check if same day
                if (isSameDay(recipeToReorder.plannerData.date, recipe.plannerData.date)) {
                    // Check to see if this is the recipe we have dragged
                    if (recipe.plannerData.id === recipeToReorder.plannerData.id) {
                        if (!del) {
                            // If it is then set this as the new order
                            recipe.plannerData.order = newOrder;
                            const promise = updatePlannerRecipe(recipe.plannerData.id, { order: newOrder });
                            promises.push(promise);
                        }
                    } else {
                        if (!del) {
                            // Check if this is an increase of decrease
                            if (diffInOrder < 0 && ((recipeCurrentOrder < currentOrder) && (recipeCurrentOrder > newOrder - 1))) {
                                recipe.plannerData.order = recipeCurrentOrder + 1;
                                const promise = updatePlannerRecipe(recipe.plannerData.id, { order: recipeCurrentOrder + 1 });
                                promises.push(promise);
                            }

                            if (diffInOrder > 0 && ((recipeCurrentOrder <= newOrder) && (recipeCurrentOrder > currentOrder))) {
                                recipe.plannerData.order = recipeCurrentOrder - 1;
                                const promise = updatePlannerRecipe(recipe.plannerData.id, { order: recipeCurrentOrder - 1 });
                                promises.push(promise);
                            }
                        }

                        // For when we delete from a day
                        if (del && (recipeCurrentOrder > currentOrder)) {
                            recipe.plannerData.order = recipeCurrentOrder - 1;
                            const promise = updatePlannerRecipe(recipe.plannerData.id, { order: recipeCurrentOrder - 1 });
                            promises.push(promise);
                        }
                    }
                }
            }
        }

        // Delete the recipe if we need to
        if (del) {
            // Filter the current visible week
            const copy = [];
            plannerCopy.forEach(recipe => {
                if (recipe.plannerData.id !== recipeToReorder.plannerData.id) {
                    copy.push(recipe);
                }
            });
            plannerCopy = [...copy];
        }

        setPlanner([...plannerCopy]);
        setUpdated(!updated);

        await Promise.all(promises);
    };

    // Clear planner for the week
    const clear = async () => {
        const ids = [];
        planner.forEach(recipe => {
            ids.push(recipe.plannerData.id);
        });

        const promises = [];
        ids.forEach(id => {
            const promise = removeRecipeFromPlanner(id);
            promises.push(promise);
        });

        await Promise.all(promises).then((values) => {

        });
        setPlanner([]);
    };

    // Adjust the servings of a recipe
    const adjustServings = (recipeToAdjust, newServings) => {
        const copy = [...planner];
        for (const recipe of copy) {
            if (recipe.plannerData.id === recipeToAdjust.plannerData.id) {
                recipe.servingsAdjusted = newServings;
            }
        }

        setPlanner(copy);

        setServingsChanged(servingsChanged + 1);
    };

    const getPlanners = async () => {
        const res = await getRecipesInPlanner(user.uid, weekStart, weekEnd, true, collaborativePlannerId);

        console.log('Getting planner res', res);
        setRecipes(res);
        setPlanner(res);
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

    // Change the visible week when the week start changes
    useEffect(() => {
        // console.log('Weekstart or planner changing', planner)
        if (weekStart) {
            const week = {};
            for (let x = 0; x < 7; x++) {
                const day = {
                    date: add(weekStart, { days: x }),
                    recipes: [],
                    id: (x + 1).toString(),
                };

                // Cycle through and find matching recipes
                let hardcodedIndex = 0;
                planner.forEach(recipe => {
                    if (recipe && isSameDay(recipe.plannerData.date, day.date)) {
                        day.recipes.push({ ...recipe, hardcodedIndex });
                        hardcodedIndex += 1;
                    }
                });

                day.recipes = day.recipes.sort((a, b) =>
                    a.plannerData.order < b.plannerData.order ? -1 : a.plannerData.order > b.plannerData.order ? 1 : 0
                );

                // week.push(day);
                week[(x + 1).toString()] = day;
            }
            setVisibleWeek(week);
            console.log('Visible week', week);
        }

        console.log('Planner', planner);
    }, [weekStart, planner, updated]);

    const tabs = [
        {
            label: 'My Planner',
            icon: <Calendar size={14} />,
            href: '/planner',
        },
        {
            label: 'Shared Planners',
            icon: <Users size={14} />,
            href: '/shared-planners',
        },
    ];

    const [activeTab, setActiveTab] = useState(0);
    const onChange = (active: number) => {
        setActiveTab(active);
    };

    const [weekUpdated, setWeekUpdated] = useState(0);

    const onDragEnd = (result, columns, setColumns) => {
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
            console.log('Visible week changing', visibleWeek);
            const update = async () => {
                await updateOrderOfRecipesInVisiblePlanner(visibleWeek);
                // await getPlanners();
            };

            update();
        }
        // Update order of recipes in visible week
    }, [weekUpdated]);

    return (
        <Stack>
            <Tabs active={activeTab} onTabChange={onChange}>
                {tabs.map((tab, index) => (
                    <Tabs.Tab key={index} label={tab.label} icon={tab.icon} />))}
            </Tabs>

            <ChevronButtons onChange={changeWeek} text={`${formatDate(weekStart, 1)} - ${formatDate(weekEnd, 1)}`} />

            <Grid gutter={16}>
                <DragDropContext
                    onDragEnd={result => onDragEnd(result, visibleWeek, setVisibleWeek)}
                >
                    {/* {visibleWeek.map((day, index) => ( */}
                    {Object.entries(visibleWeek).map(([columnId, day], index) => (
                        <Grid.Col xs={12} sm={6} md={4} lg={3}>
                            <Stack key={index}>
                                <Group>
                                    <div>{formatDate(day.date, 2)}</div>
                                    {isToday(day.date) ?
                                        <Badge size="xs">Today</Badge>
                                        : null}
                                </Group>

                                <PlannerDay
                                    recipes={day.recipes}
                                    removeFromPlanner={removeFromPlanner}
                                    date={day.date}
                                    changeDateOfRecipeInPlanner={changeDateOfRecipeInPlanner}
                                    reorderRecipeInPlanner={reorderRecipeInPlanner}
                                    adjustServings={adjustServings}
                                    servingsChanged={servingsChanged}
                                    collaborativePlannerId={collaborativePlannerId}
                                    collaborative={collaborative}
                                    visibleWeek={visibleWeek}
                                    columnId={day.id}

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
