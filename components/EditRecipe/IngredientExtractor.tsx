import { Alert, Center, Group, Loader, Select, Stack, Textarea } from '@mantine/core';
import React, { useState } from 'react';
import { Bolt } from 'tabler-icons-react';
import { IngredientGroup } from '../../lib/types';

interface IngredientExtractorProps {
    groups: IngredientGroup[],
    addIngredients: Function,
}

export default function IngredientExtractor(props: IngredientExtractorProps) {
    const { groups, addIngredients } = props;

    const [selectedGroup, setSelectedGroup] = useState(null);
    const [ingredients, setIngredients] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchNutrition = async (input) => {
        if (input.length == 0) return;
        setLoading(true);

        console.log('Fetching nutrition', input);
        let updated = input.replaceAll(',', '');
        const original_ingredients = updated.split(/\r?\n/);
        updated = updated.split(/\r?\n/).join(', ');

        const numberOfLineBreaks = (input.match(/\n/g) || []).length;
        console.log(`Number of breaks: ${numberOfLineBreaks}`);
        console.log('Cleaned nutrition', updated);

        await fetch('/api/ingredient-extractor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({ ingredient_input: updated, servings: 1 }),
        })
            .then(async (response) => {
                const res = await response.json();
                console.log('Res from ingredient extractor', res);
                console.log('Selected group: ', JSON.stringify(selectedGroup))
                addIngredients(res.response.ingredients_formatted, selectedGroup);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        setLoading(false);

        setIngredients('');
    };

    return (
        <div>
            <Alert
                title={
                    <Group spacing="xs">
                        <Bolt />
                        Ingredient Extractor
                    </Group>}
                variant="light"
                p={32}
            >
                <Stack>

                    Paste in a list of ingredients and we&apos;ll automatically extract out the relevant data
                    {loading ?
                        <Center>
                            <Loader />
                        </Center>
                        :
                        <>
                            {(groups.length > 0) && <Select label="Select group" data={groups.map(g => ({ value: g.id, label: g.name }))} onChange={(e) => setSelectedGroup(e)} placeholder="Optional" />}
                            <Textarea
                                label="Enter ingredients"
                                onChange={(e) => fetchNutrition(e.target.value)}
                                value={ingredients}
                                placeholder="Paste in your ingredients, 1 on each line"
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
