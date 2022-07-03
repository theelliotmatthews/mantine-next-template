/* eslint-disable no-restricted-syntax */
import { useEffect, useContext, useState } from 'react';
import {
    startOfWeek,
    lastDayOfWeek,
    add,
    isSameDay,
    isToday,
} from 'date-fns';
import { Badge, Button, Group, Input, Stack, Text } from '@mantine/core';
import { Calendar, Check } from 'tabler-icons-react';
import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/router';
import { UserContext } from '../../lib/context';

// Functions
import { getAllCollaborativePlanners, getNumberOfRecipesOnDate } from '../../lib/planner/planner';
import { formatDate } from '../../lib/formatting';
import { ChevronButtons } from '../ChevronButtons/ChevronButtons';
import { Recipe } from '../../lib/types';
import { firestorePromiseAdd } from '../../lib/ingredients/ingredients';
import { firestore } from '../../lib/firebase';

interface AddToPlannerProps {
    switchDay?: boolean;
    recipes: Recipe[]
    updatePlannerRecipes: Function;
    selectedDay?: Date;
    setNewPlannerDay?: Function;
    closeModal?: Function;
}

interface PlannerDay {
    date: Date;
    recipes: Recipe[]
}

export function AddToPlanner(props: AddToPlannerProps) {
    const { switchDay, recipes, updatePlannerRecipes, selectedDay, setNewPlannerDay, closeModal } = props;
    const { user } = useContext(UserContext);
    const router = useRouter();

    const [sharedPlanners, setSharedPlanners] = useState<{ title: string }[]>([]);
    const [sharedPlannersFiltered, setSharedPlannersFiltered] = useState<{ title: string }[]>([]);
    const [selectedSharedPlanners, setSelectedSharedPlanners] = useState<string[]>([]);
    const [addingToSharedPlanner, setAddingToSharedPlanner] = useState(false);
    const [showSharedPlanner, setShowSharedPlanner] = useState(false);
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [visibleWeek, setVisibleWeek] = useState<Date[]>([]);
    const [weekStart, setWeekStart] = useState<Date>(new Date());
    const [weekEnd, setWeekEnd] = useState<Date>(new Date());

    // Check if current date is passed through
    useEffect(() => {
        if (selectedDay) {
            setSelectedDates([selectedDay]);
        }
    }, [selectedDay]);

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

    // Check if a day is currently selected
    const checkIfDayIsSelected = (day: Date) => {
        let selected = false;

        selectedDates.forEach(date => {
            if (isSameDay(date, day)) {
                selected = true;
            }
        });

        return selected;
    };

    // Toggle the selected day
    const toggleSelectDay = (day: Date) => {
        console.log('Toggle select day: ', day, switchDay)
        if (checkIfDayIsSelected(day) && !switchDay) {
            // Day is already selected so remove it
            setSelectedDates(selectedDates.filter(item => !isSameDay(item, day)));
            console.log('Remove it')
        } else {
            if (switchDay) {
                setSelectedDates([day])
            } else {
                setSelectedDates(prevState => {
                    return [...prevState, day]
                })
            }

        }
    };

    // Check if a planner is selected
    const checkIfPlannerIsSelected = (plannerId: string) => selectedSharedPlanners.includes(plannerId);

    // Toggle a planner select
    const toggleSharedPlannerSelect = (plannerId: string) => {
        if (checkIfPlannerIsSelected(plannerId)) {
            // Day is already selected so remove it
            setSelectedSharedPlanners(selectedSharedPlanners.filter(item => item !== plannerId));
        } else {
            setSelectedSharedPlanners((prev) => (
                [
                    ...prev,
                    plannerId,
                ]));
        }
    };

    // Listen for changes on the planner search
    const handleSearchPlannerChange = (e: any) => {
        const { value } = e.target;

        // Filter the search results
        if (value) {
            setSharedPlannersFiltered(sharedPlanners.filter(item => item.title.toLowerCase().includes(value.toLowerCase())));
        } else {
            setSharedPlannersFiltered(sharedPlanners);
        }
    };

    // Load in all collaborative planners
    useEffect(() => {
        if (user) {
            const getPlanners = async () => {
                const res = await getAllCollaborativePlanners(user.uid, false, true, false);
                setSharedPlanners(res);
                setSharedPlannersFiltered(res);
            };
            getPlanners();
        }
    }, [user]);

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
        if (weekStart) {
            const week = [];
            for (let x = 0; x < 7; x += 1) {
                week.push(add(weekStart, { days: x }));
            }
            setVisibleWeek(week);
        }
    }, [weekStart]);

    // Listen for change to shared planner
    useEffect(() => {
        if (addingToSharedPlanner === true) {
            setShowSharedPlanner(true);
        }
    }, [addingToSharedPlanner]);

    // Load in the current day if switching
    useEffect(() => {
        if (switchDay) {
            setSelectedDates([recipes[0].plannerData.date]);
        }
    }, []);

    // Buttons for selecting the planner type, personal or shared
    const selectButtons = [
        {
            label: 'My planner',
            shared: false,
            action: (shared: boolean) => {
                setAddingToSharedPlanner(shared);
                setShowSharedPlanner(false);
            },
        },
        {
            label: 'Shared planner',
            shared: true,
            action: (shared: boolean) => {
                setAddingToSharedPlanner(shared);
                setShowSharedPlanner(true);
            },
        },
    ];



    // Listen to any updates and pass these through to updatePlanner function for modal
    useEffect(() => {
        console.log('Something changing');
        updatePlannerRecipes({
            selectedDates,
            addingToSharedPlanner,
            selectedSharedPlanners,
            data: recipes,
            switchDay,
        });
    }, [selectedDates,
        addingToSharedPlanner,
        selectedSharedPlanners,
        recipes,
        switchDay]);

    useEffect(() => {
        console.log('Selected dates changing', selectedDates);
        setNewPlannerDay(selectedDates);
    }, [selectedDates]);

    const addRecipesToPlanner = async () => {
        // console.log('Adding to planner with data: ', recipesToAddToPlanner);

        // Store all docs to add in an array
        const docs = [];

        let sameDaySameRecipe = null;

        for (const date of selectedDates) {
            // Adding to a planner normally
            if (!switchDay) {
                // console.log('Date were adding', date)
                if (addingToSharedPlanner && (selectedSharedPlanners.length > 0)) {
                    for (const planner of selectedSharedPlanners) {
                        // Get number of recipes on this date
                        const numberOfRecipesOnDate = await getNumberOfRecipesOnDate(date, planner, user.uid);

                        for (let x = 0; x < recipes.length; x += 1) {
                            const doc = {
                                addedBy: user.uid,
                                meal: recipes[x],
                                date,
                                plannerId: planner,
                                collaborative: true,
                                order: numberOfRecipesOnDate + x,
                            };
                            docs.push(doc);
                        }
                    }
                } else {
                    // Get number of recipes on this date
                    const numberOfRecipesOnDate = await getNumberOfRecipesOnDate(date, null, user.uid);

                    for (let x = 0; x < recipes.length; x += 1) {
                        const doc = {
                            addedBy: user.uid,
                            meal: recipes[x],
                            date,
                            collaborative: false,
                            createdBy: user.uid,
                            order: numberOfRecipesOnDate + x,
                        };
                        docs.push(doc);
                    }
                }
            } else {
                // Updating an existing planner

                console.log('Updating with switch day', recipes[0]);
                if (isSameDay(selectedDates[0], recipes[0].plannerData.date)) {
                    console.log('Is same day');
                    closeModal && closeModal();
                    return;
                } else {
                    // Get number of recipes on this date
                    const numberOfRecipesOnDate = await getNumberOfRecipesOnDate(selectedDates[0], null, user.uid);

                    await firestore.collection('planner').doc(recipes[0].plannerData.id).update({
                        date: selectedDates[0],
                        order: numberOfRecipesOnDate
                    })

                    closeModal && closeModal(true)

                    // for (let x = 0; x < recipes.length; x += 1) {
                    //     const doc: {
                    //         addedBy: string,
                    //         meal: Recipe,
                    //         date: Date,
                    //         collaborative: boolean,
                    //         order: number,
                    //         plannerId?: string,
                    //         createdBy?: string
                    //     } = {
                    //         addedBy: user.uid,
                    //         meal: recipes[x],
                    //         date,
                    //         collaborative: !!recipes[x].plannerData.collaborativePlannerId,
                    //         order: numberOfRecipesOnDate + x,
                    //     };

                    //     if (recipes[x].plannerData.collaborativePlannerId !== undefined) {
                    //         doc.plannerId = recipes[x].plannerData.collaborativePlannerId;
                    //     } else {
                    //         doc.createdBy = user.uid;
                    //     }
                    //     docs.push(doc);
                    // }
                }
            }
        }

        // if ((sameDaySameRecipe === null) && switchDay) {
        //     await removeRecipeFromPlanner(recipes[0].plannerData.id, true, recipes, user.uid);
        // }

        // console.log('Docs to add', docs)
        await firestorePromiseAdd('planner', docs);

        closeModal && closeModal();

        showNotification({
            title: 'Added to planner',
            message: 'Click here to view your planner',
            onClick: () => {
                router.push('/planner');
            },
            icon: <Calendar size={12} />,
            style: { cursor: 'pointer' },
        });
    };

    return (
        <Stack>
            {/* <div className="">{recipes[0].title}</div> */}

            <Group>
                {selectButtons.map((button, index) => <Button key={index} onClick={() => button.action(button.shared)} variant={button.shared === addingToSharedPlanner ? 'filled' : 'outline'}>{button.label}</Button>)}
            </Group>

            <div>Switch day: {switchDay}</div>

            {showSharedPlanner && !switchDay ?
                <Stack>
                    <Input type="text" onChange={handleSearchPlannerChange} placeholder="Search planners" />
                    <Stack spacing="xs">
                        {sharedPlannersFiltered.map((planner, index) => (
                            <Group key={index} onClick={() => toggleSharedPlannerSelect(planner.id)} position="apart">
                                <Text>{planner.title}</Text>
                                {checkIfPlannerIsSelected(planner.id) &&
                                    <Group pr={8}>
                                        <Check size={18} />
                                    </Group>
                                }
                            </Group>
                        ))}
                    </Stack>
                    <Button onClick={() => setShowSharedPlanner(false)}>Select dates</Button>
                </Stack>
                :
                <>
                    <ChevronButtons onChange={changeWeek} text={`${formatDate(weekStart, 1)} - ${formatDate(weekEnd, 1)}`} />
                    <Stack>
                        {visibleWeek.map((day, index) => (
                            <Group key={index} onClick={() => toggleSelectDay(day)} position="apart">
                                <Group className="flex items-center space-x-2">
                                    <div>{formatDate(day, 2)}</div>
                                    {isToday(day) ?
                                        <Badge>Today</Badge>
                                        : null}
                                </Group>
                                {checkIfDayIsSelected(day) && <Check />}
                            </Group>
                        ))}
                    </Stack>
                </>
            }

            <Group position="right">
                <Button onClick={() => closeModal && closeModal()} mt="md" variant="outline" color="gray">
                    Cancel
                </Button>
                {selectedDates.length > 0 ?
                    <Button onClick={() => addRecipesToPlanner()} mt="md">
                        {switchDay ? 'Update' : 'Add to planner'}
                    </Button> : null}
            </Group>

        </Stack>
    );
}

export default AddToPlanner;
