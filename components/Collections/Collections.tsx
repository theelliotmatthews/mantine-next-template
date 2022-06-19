import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Button, Center, Grid, Loader } from '@mantine/core';
import { searchCollections } from '../../lib/collections';
import CollectionCard from '../CollectionCard/CollectionCard';

interface CollectionsProps {
    userId: string

}

export function Collections(props: CollectionsProps) {
    const { userId } = props;
    const [results, setResults] = useState([]);
    const [startAt, setStartAt] = useState(null);
    const [query, setQuery] = useState('');
    const [limit, setLimit] = useState(8);
    const [showLoadMore, setShowLoadMore] = useState(false);
    const [loading, setLoading] = useState(false);

    const className = classNames(
        'w-full'
    );

    // Construct a new search
    const search = async () => {
        // if (query.length === 0) return

        // Reset state
        setResults([]);
        setLoading(true);
        setShowLoadMore(false);
        setStartAt(null);

        // Call searchRecipes function
        /* eslint-disable-next-line */
        const result: { results: any[], lastVisible: any } = await searchCollections(query, limit, null, userId)

        // Set results and start at
        setResults(result.results);
        setStartAt(result.lastVisible);

        setLoading(false);

        // Choose to show load more based on length of the result
        setShowLoadMore(result && result.results ? (result.results.length === limit) : false);
    };

    // Paginate results
    const loadMore = async () => {
        // setLoading(true)
        setShowLoadMore(false);

        /* eslint-disable-next-line */
        const result: { results: any[], lastVisible: any } = await searchCollections(query, limit, startAt, userId)

        /* eslint-disable-next-line */
        setResults((prevResults) => (
            [
                ...prevResults,
                ...result.results,
            ]));
        setStartAt(result.lastVisible);

        setLoading(false);
        setShowLoadMore(result.results.length === limit);
    };

    // Handle searchbar keydown event
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            search();
        }
    };
    // Search by default if we are checking user recipes
    useEffect(() => {
        console.log('Searching', userId);
        if (userId) search();
    }, []);

    // // Listen for a change in the user recipe type - used on choose recipe slideover
    // useEffect(() => {
    //   // console.log('User recipe type changing', userRecipeType)
    //   search()
    // }, [userId])

    return (
        <div>

            {/* Display recipes  */}
            {loading ? (
                <Center py="xl">
                    <Loader />
                </Center>)
                :
                // <RecipesContainer recipes={results} slideover={slideover} chooseRecipe={chooseRecipe} />
                <Grid justify="stretch">
                    {results.map((result, i) => (
                        <Grid.Col xs={12} sm={6} md={4} lg={3}>
                            <CollectionCard collection={result} key={i} />
                        </Grid.Col>
                    )
                    )}
                </Grid>
            }

            {/* Load more button  */}
            {
                showLoadMore ?
                    <Button type="button" onClick={loadMore}>Load more</Button>
                    : null
            }
        </div>
    );
}

export default Collections;
