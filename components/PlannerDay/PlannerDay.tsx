import { Button, Group, Stack, Badge, Menu, Divider, ScrollArea, LoadingOverlay } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { isToday } from 'date-fns';
import { useRouter } from 'next/router';
import { useEffect, useContext, useState, Key } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useDrop } from 'react-dnd';
import { Notes, Soup, Trash } from 'tabler-icons-react';

import { UserContext } from '../../lib/context';
import { firestore } from '../../lib/firebase';
import { formatDate } from '../../lib/formatting';
import { firestorePromiseAdd } from '../../lib/ingredients/ingredients';
import { getNumberOfRecipesOnDate } from '../../lib/planner/planner';
import { ITEM_TYPES, Recipe } from '../../lib/types';
import AddToList, { AddToListItemProps } from '../AddToList/AddToList';
import AddToListButton from '../AddToListButton/AddToListButton';
import DropWrapper from '../DropWrapper/DropWrapper';
import Micronutrients, { NutrientStats } from '../NutrientStats/NutrientStats';
import RecipeCard from '../RecipeCard/RecipeCard';
import UserRecipes from '../UserRecipes/UserRecipes';

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
    getPlanners?: Function;
}

export function PlannerDay(props: PlannerDayProps) {
    const { recipes, removeFromPlanner, date, changeDateOfRecipeInPlanner, reorderRecipeInPlanner, adjustServings, servingsChanged, collaborative, collaborativePlannerId, visibleWeek, moveItem, columnId, getPlanners } = props;
    const { user } = useContext(UserContext);
    const modals = useModals();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('Servings changed? ');
    }, [servingsChanged]);


    const addRecipeToPlanner = (id: string, date: Date) => {
        console.log(`Adding to planner with id ${id} on date ${date}`);
    };

    const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);

    const selectRecipe = async (recipe: Recipe) => {
        console.log(`Recipe selected: ${recipe.id} for day ${date}`);
        // if (selectedRecipes.includes(id)) {
        //     setSelectedRecipes(prevState => prevState.filter(recipe => recipe !== id));
        // } else {
        //     setSelectedRecipes(prevState => [...prevState, id]);
        // }
        const numberOfRecipesOnDate = await getNumberOfRecipesOnDate(date, collaborativePlannerId, user.uid);
        const doc =
            collaborativePlannerId ?
                {
                    addedBy: user.uid,
                    meal: recipe,
                    date,
                    plannerId: collaborativePlannerId,
                    collaborative: true,
                    order: numberOfRecipesOnDate,
                }
                :
                {
                    addedBy: user.uid,
                    createdBy: user.uid,
                    meal: recipe,
                    date,
                    collaborative: false,
                    order: numberOfRecipesOnDate,
                };

        setLoading(true);
        await firestore.collection('planner').add(doc);
        getPlanners && await getPlanners();
        setLoading(false);

        console.log('Doc', doc);
    };

    const openRecipeSelectModal = () => {
        const id = modals.openModal({
            title: 'Add recipe to planner',
            children: (
                <>
                    <div style={{ maxHeight: '70vh', overflowY: 'scroll', overflowX: 'hidden' }}>
                        <UserRecipes
                            addRecipeToPlanner={addRecipeToPlanner}
                            recipeCreatorId={user.uid}
                            hideCollections
                            selectMode
                            selectRecipe={(recipeId: string) => {
                                selectRecipe(recipeId);
                                modals.closeModal(recipeId);
                            }
                            }
                            selectedRecipes={selectedRecipes}
                        />
                    </div>
                    <Group position="right">
                        <Button onClick={() => modals.closeModal(id)} mt="md" variant="outline" color="gray">
                            Cancel
                        </Button>
                        {selectedRecipes.length > 0 ?
                            <Button onClick={() => modals.closeModal(id)} mt="md">
                                Submit
                            </Button> : null}
                    </Group>
                </>
            ),
            // labels: { confirm: , cancel: 'Cancel' },
            // onConfirm: () => {
            //     console.log('CONFIRM INGREDIENTS TO ADD', ingredientsToAdd);
            //     // addToList();
            //     setListModalIncrement(listModalIncrement + 1);
            // },
            size: '80vw',
        });
    };



    return (
        <div style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} color="#F8F9FA" />
            {/* {recipes.length > 0 && <Macros recipes={recipes} />} */}

            {/* <div className="flex space-x-1">
                {buttons.map((b, index) => (
                    <div key={index}>
                        <Button onClick={() => b.action()}>{b.text}</Button>
                    </div>
                ))}
            </div> */}

            <Group mb={8} position="apart">
                <Group>
                    <div>{formatDate(date, 2)}</div>
                    {isToday(date) ?
                        <Badge size="xs">Today</Badge>
                        : null}
                </Group>
                <Menu>
                    {/* <Menu.Label>Application</Menu.Label> */}
                    <Menu.Item icon={<Soup size={14} />} onClick={() => openRecipeSelectModal()}>Add recipe</Menu.Item>
                    {/* {recipes.length > 0 ? <Menu.Item icon={<Notes size={14} />} onClick={() => addToListModal()}>Add to list</Menu.Item> : null} */}
                    {recipes.length > 0 ?
                        <AddToListButton recipes={recipes}>
                            <Menu.Item icon={<Notes size={14} />}>Add to list</Menu.Item>
                        </AddToListButton>
                        : null}
                    <Divider />

                    {/* <Menu.Label>Danger zone</Menu.Label> */}
                    {/* <Menu.Item icon={<ArrowsLeftRight size={14} />}>Transfer my data</Menu.Item> */}
                    <Menu.Item color="red" icon={<Trash size={14} />}>Clear day</Menu.Item>
                </Menu>
            </Group>

            {recipes.length > 0 ? <NutrientStats recipes={recipes} /> : null}
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
                        <Stack mt={8}>
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
