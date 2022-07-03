import { Button, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/hooks';
import React from 'react';

interface AddIngredientGroupProps {
    addGroup: Function;
}

export default function AddIngredientGroup(props: AddIngredientGroupProps) {
    const { addGroup } = props;

    const form = useForm({
        initialValues: {
            name: '',
        },
    });

    return (
        <div>
            <TextInput
                label="Add new group"
                placeholder="Group name"
                {...form.getInputProps('name')}
            />

            <Group position="right" mt="md">
                <Button
                    type="button"
                    onClick={() => {
                        addGroup(form.values.name);
                        form.reset();
                    }}
                    disabled={form.values.name.length === 0}
                >Submit
                </Button>
            </Group>
        </div>

    );
}
