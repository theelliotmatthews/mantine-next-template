import { Button, Stack } from '@mantine/core';
import { useEffect, useContext, useState, Key } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useDrop } from 'react-dnd';
import { UserContext } from '../../lib/context';
import { ITEM_TYPES, Recipe } from '../../lib/types';
import DropWrapper from '../DropWrapper/DropWrapper';
import Micronutrients, { NutrientStats } from '../NutrientStats/NutrientStats';
import RecipeCard from '../RecipeCard/RecipeCard';

interface PlannerDayProps {
    recipes: any[];
    removeFromPlanner?: Function;
    date?: Date;
    changeDateOfRecipeInPlanner?: Function;
    reorderRecipeInPlanner?: Function;
    adjustServings?: Function;
    servingsChanged?: number;
    collaborativePlannerId?: string;
    collaborative?: boolean
    // isOver?: boolean;
    visibleWeek?: {
        day: Date,
        recipes: Recipe[]
    };
    moveItem: Function;
    columnId: string;
}

export function PlannerDay(props: PlannerDayProps) {
    const { recipes, removeFromPlanner, date, changeDateOfRecipeInPlanner, reorderRecipeInPlanner, adjustServings, servingsChanged, collaborative, collaborativePlannerId, visibleWeek, moveItem, columnId } = props;
    const { user } = useContext(UserContext);

    const [showMicronutrients, setShowMicronutrients] = useState(false);

    useEffect(() => {
        console.log('Servings changed? ');
    }, [servingsChanged]);

    const addRecipeToThisDay = async () => {

    };

    const addRecipeToPlanner = async () => {
        console.log('Adding recipe to planner from slideout');
        console.log('User', user.uid);
        console.log(collaborative ? collaborativePlannerId : user.uid);
    };

    const addDayToList = async () => {
        console.log('Adding day to list');
    };

    const toggleMicronutrients = async () => {
        console.log('Showing micronutrients');
        setShowMicronutrients(!showMicronutrients);
    };

    const buttons = [
        {
            type: 'add',
            action: addRecipeToPlanner,
            icon: 'plus',
            text: 'Add recipe',
        },
        {
            type: 'list',
            action: addDayToList,
            icon: 'list',
            text: 'Add to list',
        },
        {
            type: 'micronutrients',
            action: toggleMicronutrients,
            icon: 'barGraph',
            text: 'Micronutrients',
        },
    ];

    // Planner drag and drop functionality
    const [items, setItems] = useState();

    useEffect(() => {
        setItems(recipes);
        // console.log('ITEMS', recipes);
    }, [recipes]);

    // const onDrop = (item, monitor, status) => {
    //     // const mapping = statuses.find(si => si.status === status);
    //     console.log('Dropping item', item)
    //     console.log('Current items', items)
    //     setItems(prevState => {
    //         const newItems = prevState
    //             .filter(i => i.id !== item.id)
    //             .concat({
    //                 ...item,
    //                 // status, icon: mapping.icon
    //             });
    //         return [...newItems];
    //     });
    // };

    // const moveItem = (dragIndex, hoverIndex) => {
    //     console.log(`Moving item with dragIndex ${dragIndex} to hoverIndex ${hoverIndex}`)

    //     const item = items[dragIndex];
    //     setItems(prevState => {
    //         const newItems = prevState.filter((i, idx) => idx !== dragIndex);
    //         newItems.splice(hoverIndex, 0, item);
    //         return [...newItems];
    //     });
    // };

    return (
        <div>
            {/* {recipes.length > 0 && <Macros recipes={recipes} />} */}

            {/* <div className="flex space-x-1">
                {buttons.map((b, index) => (
                    <div key={index}>
                        <Button onClick={() => b.action()}>{b.text}</Button>
                    </div>
                ))}
            </div> */}

            {<NutrientStats recipes={recipes} />}
            {/* <NutrientStats */}
            {/* <DropWrapper onDrop={onDrop} visibleWeek={visibleWeek}> */}
            <Droppable droppableId={columnId} key={columnId}>
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                            background: snapshot.isDraggingOver
                                ? '#E9ECEF'
                                : '#F8F9FA',
                            paddingBottom: 60,
                            height: '100%',
                            // width: 250,
                            minHeight: 120,
                        }}
                    >
                        <Stack>
                            {recipes.map((item, index) => (
                                <Draggable
                                    key={item.id}
                                    draggableId={item.id}
                                    index={index}
                                >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                                userSelect: 'none',
                                                // backgroundColor: snapshot.isDragging
                                                //     ? '#263B4A'
                                                //     : '#456C86',
                                                // color: 'white',
                                                ...provided.draggableProps.style,
                                            }}
                                        >
                                            <RecipeCard
                                                key={index}
                                                recipe={item}
                                                small
                                                item={item}
                                                index={index}
                                                plannerDay={date}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                        </Stack>
                        {/* {provided.placeholder} */}
                    </div>
                )}
            </Droppable>
            {/* <div>

                <Stack>
                    {recipes.map((recipe, index) => <RecipeCard
                        key={index}
                        recipe={recipe}
                        small
                        item={recipe}
                        index={index}
                        plannerDay={date}
                    />)}
                </Stack>
            </div> */}

            {/* </DropWrapper> */}

            {/* {items && items.map((item: { title: any; }, i: Key | null | undefined) => <div key={i}>{item && item.title}</div>)} */}

        </div>
    );
}

export default PlannerDay;
