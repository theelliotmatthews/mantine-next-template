import { TextInput, TextInputProps, ActionIcon, useMantineTheme, Group, Center, Container, Autocomplete, MultiSelect, ThemeIcon } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Search, ArrowRight, ArrowLeft } from 'tabler-icons-react';
import { loadIngredientFile, searchIngredients } from '../lib/search/ingredient-search';

function InputWithButton(props: TextInputProps) {
    const theme = useMantineTheme();

    return (
        <TextInput
            icon={<Search size={18} />}
            radius="xl"
            size="md"
            rightSection={
                <ActionIcon size={32} radius="xl" color={theme.primaryColor} variant="filled">
                    {theme.dir === 'ltr' ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                </ActionIcon>
            }
            placeholder="Search recipes"
            rightSectionWidth={42}
            {...props}
        />
    );
}

export default function SearchRecipes() {
    const [ingredients, setIngredients] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const theme = useMantineTheme();

    useEffect(() => {
        const getData = async () => {
            const data = await loadIngredientFile(true);
            setIngredients(data);
            console.log('Data', data)
        };

        getData();
    }, []);

    // const selectIngredient = (ingredient: {
    //     value: string
    // }) => {
    //     console.log('Selecting ingredient', ingredient);
    //     setSelectedIngredients([...selectedIngredients, ingredient.value]);
    // };

    return (
        <Container size="md" py="xs">
            <Group direction="column" grow spacing="xs">
                <InputWithButton />
                <MultiSelect
                    placeholder="Add ingredients"
                    searchable
                    creatable={false}
                    clearable
                    data={ingredients}
                    limit={10}
                    radius="xl"
                    onChange={(e) => {
                        console.log('e', e);
                        // setIngredients(e)
                    }}
                    styles={{
                        wrapper: { color: 'red' },
                        dropdown: { color: 'red' },
                        item: { color: 'red' },
                        hovered: { color: 'red' },
                        disabled: { color: 'red' },
                        nothingFound: { color: 'red' },
                        values: { color: 'red' },
                        value: { color: 'red' },
                        searchInput: { color: 'red' },
                        defaultValue: { color: 'red' },
                        defaultValueRemove: { color: 'red' },
                        separator: { color: 'red' },
                        separatorLabel: { color: 'red' },
                        defaultVariant: { color: 'red' },
                        filledVariant: { color: 'red' },
                        unstyledVariant: { color: 'red' },
                        invalid: { color: 'red' },
                        icon: { color: 'red' },
                        withIcon: { color: 'red' },
                        input: { color: 'red' },
                        root: { color: 'red' },
                        label: { color: 'red' },
                        error: { color: 'red' },
                        description: { color: 'red' },
                        required: { color: 'red' },
                    }}
                />
            </Group>

            <Group>
                {selectedIngredients.map((ingredient => <p>{ingredient}</p>
                ))}
            </Group>

        </Container>
    );
}
