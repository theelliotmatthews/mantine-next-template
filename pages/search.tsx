import { TextInput, TextInputProps, ActionIcon, useMantineTheme, Group, Center, Container, Autocomplete, MultiSelect, ThemeIcon } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Search, ArrowRight, ArrowLeft } from 'tabler-icons-react';
import { SearchBar } from '../components/SearchBar/SearchBar';
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
    // Recipe search fitlers

    return (
        <>
            <SearchBar placeholder="Search recipes" />
        </>
    );
}
