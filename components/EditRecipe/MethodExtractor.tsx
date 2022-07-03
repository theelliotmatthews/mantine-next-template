import { Alert, Group, Loader, Stack, Text, Textarea } from '@mantine/core';
import { useState } from 'react';
import { Bolt } from 'tabler-icons-react';

export interface MethodExtractorProps {
    method: any;
    methodIds: string[];
    setMethod: Function;
    setMethodIds: Function;
}

export default function MethodExtractor(props: MethodExtractorProps) {
    const { method, methodIds, setMethod, setMethodIds } = props;

    // const [methodInput, setMethod] = useState('');
    const [loading, setLoading] = useState(false);

    const extractMethod = async (input) => {
        if (input.length == 0) return;
        setLoading(true);

        const isValidStep = (step: string) => {
            console.log('Checking if valid step', step);

            if (step.toLowerCase().includes('step') && step.length < 8) return false;
            if (step.length === 0) return false;

            return true;
        };

        let method_steps = input.split(/\r?\n/);
        method_steps = method_steps.filter((step: string) => (isValidStep(step)));
        // || (!step.toLowerCase().includes('step') && (step.length > 7))
        console.log('Method steps', method_steps);

        const instructionsCopy = { ...method };
        const newInstructionsToAdd = [];
        for (let x = 0; x < method_steps.length; x++) {
            const newId = `${methodIds.length + 1 + x}`;
            console.log('New iD', newId);

            instructionsCopy[newId] = {
                id: newId,
                instruction: method_steps[x],
                hours: 0,
                minutes: 0,
                seconds: 0,
                image: '',
                video: '',
            };

            newInstructionsToAdd.push(newId);
        }

        setMethod(instructionsCopy);
        setMethodIds(prevState => [...prevState, ...newInstructionsToAdd]);

        setLoading(false);
    };

    return (
        <div>
            <Alert
                title={
                    <Group spacing="xs">
                        <Bolt />
                        Method Extractor
                    </Group>}
                variant="light"
                p={32}
            >
                <Stack>
                    Paste in a method and our tool will automatically extract the data
                    {loading ?
                        <Loader />
                        :
                        <>
                            <Textarea
                                onChange={(e) => extractMethod(e.target.value)}
                                placeholder="Paste in your method, 1 on each line"
                                rows={4}
                                className="w-full shadow-sm border p-2 px-4 text-sm focus:outline-none sm:text-sm border-gray-300 rounded-md border-focus-1"
                            />
                        </>
                    }
                </Stack>
            </Alert>
        </div>
    );
}
