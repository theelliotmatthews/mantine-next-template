import { useEffect, useContext, useState } from 'react';
import {
    startOfWeek,
    lastDayOfWeek,
    add,
    isSameDay,
    isToday,
} from 'date-fns';
import { Badge, Button, Group, Input, Stack, Text } from '@mantine/core';
import { Check } from 'tabler-icons-react';
import { UserContext } from '../../lib/context';

// Functions
import { getAllCollaborativePlanners, getNumberOfRecipesOnDate, removeRecipeFromPlanner } from '../../lib/planner/planner';

import { formatDate } from '../../lib/formatting';
import { firestorePromiseAdd } from '../../lib/ingredients/ingredients';
import { ChevronButtons } from '../ChevronButtons/ChevronButtons';
import { Recipe } from '../../lib/types';

interface AddToPlannerProps {
    switchDay?: boolean;
    recipes: Recipe[]
    updatePlannerRecipes: Function;
}

export function AddToPlanner(props: AddToPlannerProps) {
    const { switchDay, recipes, updatePlannerRecipes } = props;
    const { user } = useContext(UserContext);
    const [sharedPlanners, setSharedPlanners] = useState([]);
    const [sharedPlannersFiltered, setSharedPlannersFiltered] = useState([]);
    const [selectedSharedPlanners, setSelectedSharedPlanners] = useState([]);
    const [addingToSharedPlanner, setAddingToSharedPlanner] = useState(false);
    const [showSharedPlanner, setShowSharedPlanner] = useState(false);
    const [selectedDates, setSelectedDates] = useState([]);
    const [visibleWeek, setVisibleWeek] = useState([]);
    const [weekStart, setWeekStart] = useState(null);
    const [weekEnd, setWeekEnd] = useState(null);

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

    // Toggle the selected day
    const toggleSelectDay = (day) => {
        if (checkIfDayIsSelected(day)) {
            // Day is already selected so remove it
            setSelectedDates(selectedDates.filter(item => !isSameDay(item, day)));
        } else {
            setSelectedDates((prev) => (
                [
                    ...prev,
                    day,
                ]));
        }
    };

    // Check if a day is currently selected
    const checkIfDayIsSelected = (day) => {
        let selected = false;

        selectedDates.forEach(date => {
            if (isSameDay(date, day)) {
                selected = true;
            }
        });

        return selected;
    };

    // Toggle a planner select
    const toggleSharedPlannerSelect = (plannerId) => {
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

    // Check if a planner is selected
    const checkIfPlannerIsSelected = (plannerId: string) => selectedSharedPlanners.includes(plannerId);

    // Listen for changes on the planner search
    const handleSearchPlannerChange = (e) => {
        const { value } = e.target;
        console.log('Search value', value);

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
                console.log('collab planners', res);
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
            for (let x = 0; x < 7; x++) {
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
            action: (shared) => {
                setAddingToSharedPlanner(shared);
                setShowSharedPlanner(false);
            },
        },
        {
            label: 'Shared planner',
            shared: true,
            action: (shared) => {
                setAddingToSharedPlanner(shared);
                setShowSharedPlanner(true);
            },
        },
    ];

    // Listen to any updates and pass these through to updatePlanner function for modal
    useEffect(() => {
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

    return (
        <Stack>
            {/* <div className="">{recipes[0].title}</div> */}

            <Group>
                {selectButtons.map((button, index) => <Button key={index} onClick={() => button.action(button.shared)} variant={button.shared === addingToSharedPlanner ? 'filled' : 'outline'}>{button.label}</Button>)}
            </Group>

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

        </Stack>
    );
}

export default AddToPlanner;
