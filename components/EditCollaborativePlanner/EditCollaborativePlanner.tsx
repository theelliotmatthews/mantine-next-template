import { Button, Checkbox, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/hooks';
import React, { useContext } from 'react'
import { UserContext } from '../../lib/context';
import { createCollaborativePlanner, updateCollaborativePlanner } from '../../lib/planner/planner';
import { CollaborativePlanner } from '../../lib/types';

interface EditCollaborativePlannerProps {
    // editId?: string;
    planner?: CollaborativePlanner;
    getCollabPlanners?: getCollabPlanners;
    setEditing: Function
}

export default function EditCollaborativePlanner(props: EditCollaborativePlannerProps) {
    const { planner, setEditing, getCollabPlanners } = props
    const { user } = useContext(UserContext)
    const form = useForm({
        initialValues: {
            title: planner ? planner.title : '',
            collaborative: planner ? planner.collaborative : false,
        },
        // validate: {
        //     title: (value: string) => (value.length > 0 ? null : 'Your planner must have a title'),
        // },
    });
    const submit = async (values: { title: string, collaborative: boolean }) => {
        console.log('Form values', values);

        if (planner) {
            await updateCollaborativePlanner(planner.id, values);
        } else {
            await createCollaborativePlanner({ ...values, users: [user.uid], created: new Date(), createdBy: user.uid })
        }
        getCollabPlanners && await getCollabPlanners();
        setEditing(false);
    };
    return (
        <form onSubmit={form.onSubmit((values) => submit(values))}>
            <TextInput
                required
                label="Title"
                placeholder="E.g My Shared Planner"
                {...form.getInputProps('title')}
                error={form.values.title.length === 0 ? 'Please add a title' : null}
            />

            <Checkbox
                mt="md"
                label="Allow others in this planner to edit recipes"
                {...form.getInputProps('collaborative', { type: 'checkbox' })}
            />

            <Group position="right" mt="md" spacing="xs">
                <Button
                    onClick={() => {
                        setEditing(false);
                        // form.setFieldValue('title', planner.title);
                    }}
                    variant="light"
                >
                    Cancel
                </Button>
                {form.values.title.length > 0 ?
                    <Button type="submit">Submit</Button> : null
                }
            </Group>

        </form>
    )
}
