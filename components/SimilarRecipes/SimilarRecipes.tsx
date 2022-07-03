/* eslint-disable no-restricted-syntax */
import { Button, Center, Loader, Text } from '@mantine/core';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCombinations, keywords, searchRecipes } from '../../lib/search/recipe-search';
import RecipesContainer from '../RecipesContainer/RecipesContainer';

interface SimilarRecipesProps {
    title: string,
    id: string,
    channel?: string,
    sectionTitle?: string,
    buttonText?: string,
    buttonLink?: string,
}

export function SimilarRecipes(props: SimilarRecipesProps) {
    const { title, id, channel, sectionTitle, buttonText, buttonLink } = props;

    const limit = 4;

    const [recipes, setRecipes] = useState([]);
    const [combinations, setCombinations] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [currentCombination, setCurrentCombination] = useState(0);
    const [showLoadMore, setShowLoadMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadMoreSimilarRecipes = async () => {
        setLoadingMore(true);
        const newRecipes = [];

        let currentCombinationCopy = currentCombination;
        // Now we can search for recipes from this combination index
        while (newRecipes.length < limit) {
            const res: any = await searchRecipes('', [], limit, lastVisible, channel, null, [], [], null, null, null, combinations[currentCombinationCopy], null);
            let newRecipeCount = 0;

            if (res && res.results && res.results.length === 0) {
                currentCombinationCopy++;
            } else if (res && res.results && (res.results.length >= 1)) {
                for (const result of res.results) {
                    if (newRecipes.length >= limit) {
                        break;
                    }
                    // Make sure not already included in results
                    const found = recipes.find(x => (x.id === result.id));
                    // Make sure it's not the same as current recipe
                    const found2 = newRecipes.find(x => (x.id === id) || (x.id === result.id));

                    if (!found && !found2 && (result.id !== id)) {
                        newRecipeCount++;
                        newRecipes.push(result);
                    }
                }
                setLastVisible(res.lastVisible);
                if (newRecipeCount === 0) {
                    console.log('New recipe count is 0');
                    currentCombinationCopy++;
                }
            } else {
                // Hide load more buttono if there's no more results
                if (res && res.reults && (res.results.length === 0)) {
                    if (currentCombination === (combinations.length - 1)) {
                        setShowLoadMore(false);
                        break;
                    } else {
                        setCurrentCombination(currentCombination + 1);
                    }
                }
            }
        }

        setRecipes((prev) => (
            [
                ...prev,
                ...newRecipes,
            ]));
        setLoadingMore(false);
    };

    useEffect(() => {
        setLoading(true);
        setRecipes([]);
        const fetchSimilarRecipes = async () => {
            // setRecipes([])
            let strippedTitle: any = title
                .replace(/['.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
                .toLowerCase()
                .trim();

            strippedTitle = keywords(strippedTitle);
            strippedTitle = strippedTitle.split(' ');

            const combis = await getCombinations(strippedTitle);
            setCombinations(combis);

            const promises = [];
            let breakLoop = false;
            const newRecipes = [];

            // We need to find the first instance of a combination that returns results
            for (let x = 0; x < combis.length; x++) {
                if (breakLoop) break;

                const promise = searchRecipes('', [], 4, null, channel, null, [], [], null, null, null, combis[x], null);
                promises.push(promise);

                if ((x % 3 === 0) || x === (combis.length - 1)) {
                    await Promise.all(promises).then((values) => {
                        for (const v of values) {
                            if (v.results.length > 2) {
                                setCurrentCombination(x);
                                breakLoop = true;
                                break;
                            }
                        }
                    });
                }
            }

            let currentCombinationCopy = currentCombination;
            let whileCount = 0;
            let channelExhausted = false;
            // Now we can search for recipes from this combination index
            while (newRecipes.length < limit) {
                whileCount++;
                if (combis[currentCombinationCopy] || channelExhausted) {
                    const res: any = await searchRecipes('', [], channel ? 10 : limit + 1, channelExhausted ? null : lastVisible, channel, null, [], [], null, null, null, channelExhausted ? [] : combis[currentCombinationCopy], null);
                    let newRecipeCount = 0;
                    if (res.results.length === 0) {
                        currentCombinationCopy++;
                    } else if (res && res.results && (res.results.length >= 1)) {
                        for (const result of res.results) {
                            if (newRecipes.length >= limit) {
                                break;
                            }
                            // Make sure not already included in results
                            const found = recipes.find(x => (x.id === result.id));
                            // Make sure it's not the same as current recipe
                            const found2 = newRecipes.find(x => (x.id === id) || (x.id === result.id));

                            if (!found && !found2 && (result.id !== id)) {
                                newRecipeCount++;
                                newRecipes.push(result);
                            }
                        }
                        setLastVisible(res.lastVisible);
                        if (newRecipeCount === 0) {
                            currentCombinationCopy++;
                        }
                    } else {
                        // Hide load more buttono if there's no more results
                        if (res && res.reults && (res.results.length === 0)) {
                            if (currentCombination === (combinations.length - 1)) {
                                setShowLoadMore(false);
                                break;
                            } else {
                                setCurrentCombination(currentCombination + 1);
                            }
                        }
                    }
                } else {
                    if (whileCount > 100) {
                        if (!channelExhausted) {
                            channelExhausted = true;
                        } else {
                            break;
                        }
                    }
                    // if (channel) {

                    // }
                }
            }

            setRecipes((prev) => (
                [
                    // ...prev,
                    ...newRecipes,
                ]));

            setLoading(false);
        };

        fetchSimilarRecipes();
    }, [title]);

    return (
        <div>
            {loading ? <Center my={24}><Loader /></Center> :
                // <RecipesContainer recipes={recipes} title={sectionTitle} />
                <>
                    <Text>{sectionTitle}</Text>
                    <RecipesContainer recipes={recipes} />
                </>
            }
            {buttonLink ?
                !loading ? (
                    <Center my={8}>
                        <Link href={buttonLink}>
                            <Button>{buttonText}</Button>
                        </Link>
                    </Center>) : null
                :
                loadingMore ? <Loader /> :
                    !loading ?
                        <Center my={8}>
                            <Button onClick={() => loadMoreSimilarRecipes()} >Load more</Button>
                        </Center> : null
            }
        </div>
    );
}

export default SimilarRecipes;
