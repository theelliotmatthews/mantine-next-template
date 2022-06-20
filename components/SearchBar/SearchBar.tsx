import { useEffect, useState } from 'react';
import { TextInput, ActionIcon, useMantineTheme, Group, Container, MultiSelect, Loader, Center, Button, Stack } from '@mantine/core';
import { Search, ArrowRight, ArrowLeft } from 'tabler-icons-react';
import { searchRecipes } from '../../lib/search/recipe-search';
import { loadIngredientFile } from '../../lib/search/ingredient-search';
import { Recipe } from '../../lib/types';
import RecipesContainer from '../RecipesContainer/RecipesContainer';

// Lists

interface SearchBarProps {
    placeholder: string;
    // filters: any[];
    hideAdvancedByDefault?: boolean;
    recipeCreatorId?: string;
    creatorType: string;
    userRecipeType?: string;
    slideover?: boolean;
    chooseRecipe?: boolean;
    collectionId?: string;
    buttonText?: string;
    userRecipeSearch?: boolean;
    selectMode?: boolean;
    selectedRecipes?: string[];
    selectRecipe?: Function;
}

export default function SearchBar(props: SearchBarProps) {
    const { placeholder, hideAdvancedByDefault, recipeCreatorId, creatorType, userRecipeType, slideover, chooseRecipe, collectionId, buttonText, userRecipeSearch, selectMode, selectedRecipes, selectRecipe } = props;

    const [results, setResults] = useState<Recipe[]>([]);
    const [startAt, setStartAt] = useState(null);
    const [query, setQuery] = useState('');
    const [limit, setLimit] = useState(4);
    const [showLoadMore, setShowLoadMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [ingredients, setIngredients] = useState([]);
    const [filters, setFilters] = useState([]);
    const [activeFilters, setActiveFilters] = useState([]);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [macros, setMacros] = useState(null);
    const [avoidances, setAvoidances] = useState([]);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(!hideAdvancedByDefault);

    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);



    const theme = useMantineTheme();

    // Construct a new search
    const search = async () => {
        console.log('Searching');
        // console.log(query.length)
        // console.log(activeFilters.length)
        // console.log(ingredients.length)
        if ((query.length === 0 && activeFilters.length === 0 && selectedIngredients.length === 0) && !recipeCreatorId && !collectionId) return;

        // console.log('Continuing')

        // Reset state
        setResults([]);
        setLoading(true);
        setShowLoadMore(false);

        // Call searchRecipes function
        /* eslint-disable-next-line */
        const result = await searchRecipes(query, selectedIngredients, limit, null, '', macros, avoidances, activeFilters, creatorType, recipeCreatorId ? recipeCreatorId : '', userRecipeType ? userRecipeType : '', [], collectionId ? collectionId : '') as Results

        // Set results and start at
        setResults(result.results);
        setStartAt(result.lastVisible);

        setLoading(false);

        // Choose to show load more based on length of the result
        setShowLoadMore(result && result.results ? (result.results.length === limit) : false);
    };

    // Paginate results
    const loadMore = async () => {
        setLoadingMore(true);
        setShowLoadMore(false);

        /* eslint-disable-next-line */
        const result = await searchRecipes(query, selectedIngredients, limit, startAt, null, macros, avoidances, activeFilters, creatorType, recipeCreatorId, userRecipeType, [], collectionId) as Results

        /* eslint-disable-next-line */
        setResults((prevResults) => (
            [
                ...prevResults,
                ...result.results,
            ]));
        setStartAt(result.lastVisible);

        setLoadingMore(false);
        setShowLoadMore(result.results.length === limit);
    };

    useEffect(() => {
        const getData = async () => {
            const data = await loadIngredientFile(true);
            setIngredients(data);
        };

        getData();

        if (userRecipeSearch) {
            search();
        }
    }, []);

    return (
        <>

            <Stack mb={8}>
                <TextInput
                    icon={<Search size={18} />}
                    radius="xl"
                    size="md"
                    rightSection={
                        <ActionIcon size={32} radius="xl" color={theme.primaryColor} variant="filled" onClick={search}>
                            {theme.dir === 'ltr' ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                        </ActionIcon>
                    }
                    placeholder="Search recipes"
                    rightSectionWidth={42}
                    value={query}
                    onChange={(event) => setQuery(event.currentTarget.value)}
                    onKeyPress={(event) => {
                        event.key === 'Enter' && search();
                    }}
                />
                {!userRecipeSearch ?
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
                            setIngredients(e)
                        }}
                        styles={{
                            value: { backgroundColor: theme.colors[theme.primaryColor][5], color: 'white' },
                            defaultValueRemove: { backgroundColor: theme.colors[theme.primaryColor][5], color: 'white', borderRadius: '32px' },
                        }}
                    />
                    : null}
            </Stack>

            <Group>
                {selectedIngredients.map((ingredient => <p>{ingredient}</p>
                ))}
            </Group>

            {loading ?
                <Center py="xl">
                    <Loader />
                </Center>
                :
                <RecipesContainer recipes={results} selectMode={selectMode} selectRecipe={selectRecipe}
                    selectedRecipes={selectedRecipes}
                />
            }

            {showLoadMore &&
                <Center py="xl">
                    <Button onClick={loadMore}>Load more</Button>
                </Center>
            }

            {loadingMore &&
                <Center py="xl">
                    <Loader />
                </Center>
            }

        </>
    );
}
