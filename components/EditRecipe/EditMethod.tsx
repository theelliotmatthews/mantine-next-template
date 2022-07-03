import { Alert, Group, Title } from '@mantine/core';
import React, { useState } from 'react';
import { ExclamationMark } from 'tabler-icons-react';
import { Ingredient } from '../../lib/types';
import ReoderMethod, { DndListHandle } from './ReorderMethod';

interface EditMethodProps {
    method: any;
    methodIds: string[];
    setMethod: Function;
    setMethodIds: Function;
    ingredients: Ingredient[];
}

export default function EditMethod(props: EditMethodProps) {
    const { method, methodIds, setMethod, setMethodIds, ingredients } = props

    return (
        <div>
            <Title mb="md" order={2}>Method</Title>
            {methodIds.length === 0 &&
                <Alert title={<Group spacing="xs"><ExclamationMark />  Method missing!</Group>} variant="light" color="red">
                    Add at least one instruction
                </Alert>
            }
            <ReoderMethod method={method} methodIds={methodIds} setMethod={setMethod} setMethodIds={setMethodIds} ingredients={ingredients} />
        </div>
    );
}
