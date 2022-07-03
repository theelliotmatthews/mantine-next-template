/* eslint-disable prefer-destructuring */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
import { useModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { isSameDay } from 'date-fns';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { Calendar } from 'tabler-icons-react';
import { UserContext } from '../../lib/context';
import { firestorePromiseAdd } from '../../lib/ingredients/ingredients';
import { getNumberOfRecipesOnDate, removeRecipeFromPlanner } from '../../lib/planner/planner';
import { Recipe } from '../../lib/types';
import AddToPlanner from '../AddToPlanner/AddToPlanner';

interface RecipesToAddToPlanner {
    selectedDates: Date[];
    addingToSharedPlanner: boolean;
    selectedSharedPlanners: string[];
    data: Recipe[];
    switchDay: boolean;
}

interface AddToPlannerButtonProps {
    children: React.ReactNode;
    recipe: Recipe
    switchDay?: boolean;
    currentDate?: Date;
    getPlanners?: Function;
}

export default function AddToPlannerButton(props: AddToPlannerButtonProps) {
    const router = useRouter();
    const { user } = useContext(UserContext);
    const modals = useModals();

    const { children, recipe, switchDay, currentDate, getPlanners } = props;

    const [recipesToAddToPlanner, setRecipesToAddToPlanner] = useState<RecipesToAddToPlanner>({
        selectedDates: [],
        addingToSharedPlanner: false,
        selectedSharedPlanners: [],
        data: [],
        switchDay: false,
    });
    const [plannerModalIncrement, setPlannerModalIncrement] = useState(0);
    const [newPlannerDay, setNewPlannerDay] = useState<Date>(new Date());

    useEffect(() => {
        // console.log('RAP changing', recipesToAddToPlanner)
    }, [recipesToAddToPlanner]);


    const addToPlannerModal = () => {
        const id = modals.openModal({
            title: 'Add to planner',
            children: (
                <>
                    <AddToPlanner
                        recipes={[recipe]}
                        updatePlannerRecipes={setRecipesToAddToPlanner}
                        selectedDay={currentDate}
                        switchDay={switchDay}
                        setNewPlannerDay={setNewPlannerDay}
                        closeModal={(update?: boolean) => {
                            modals.closeModal(id);
                            update && getPlanners && getPlanners(true, recipe.plannerData.id);
                        }}
                    />
                </>
            ),
            // labels: { confirm: 'Add to planner', cancel: 'Cancel' },
            // onConfirm: () => {
            //     console.log('Confirming')
            //     setPlannerModalIncrement(plannerModalIncrement + 1);
            //     addRecipesToPlanner()
            //     console.log('New days', newPlannerDay)
            // },
        });
    };

    // useEffect(() => {
    //     // console.log('Increment updating', plannerModalIncrement)
    //     if (plannerModalIncrement > 0) {
    //         addRecipesToPlanner();
    //         // console.log('New planner day', newPlannerDay)
    //     }
    // }, [plannerModalIncrement]);

    useEffect(() => {
        // console.log('New planner day changing', newPlannerDay)
    }, [newPlannerDay]);

    return (
        <div
            onClick={() => addToPlannerModal()}
            onKeyDown={(e) => console.log(e)}
            role="button"
            tabIndex={0}
            style={{ display: 'inline', width: 'auto' }}
        >{children}
        </div>
    );
}
