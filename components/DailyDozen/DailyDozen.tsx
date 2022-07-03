/* eslint-disable no-restricted-syntax */
import { Button, Center, Grid, Group, Image, LoadingOverlay, Popover, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Checkbox, InfoCircle, Square } from 'tabler-icons-react';
import { fetchIngredientData } from '../../lib/ingredients/ingredients';
import { fetchDataForIngredients } from '../../lib/search/ingredient-search';
import { Recipe } from '../../lib/types';

interface DailyDozenProps {
    recipes: Recipe[]
}

export function DailyDozen(props: DailyDozenProps) {
    const { recipes } = props;

    const [dailyDozenCalculated, setDailyDozenCalculated] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const runDailyDozen = async () => {
            setLoading(true);
            // console.log('Recipes through', recipes);
            const dailyDozen = [
                {
                    group: 'exercise',
                    servingsAchieved: 0,

                    servingsPerDay: 1,
                    name: 'exercise',
                },

                {
                    group: 'nuts',
                    servingsAchieved: 0,

                    servingsPerDay: 1,
                    name: 'nut',
                    servingSize: 30,
                },

                {
                    group: 'berries',
                    servingsAchieved: 0,

                    name: 'berry',
                    servingSize: '50',
                    servingsPerDay: 1,
                },

                {
                    group: 'cruciferous',
                    servingsAchieved: 0,

                    servingSize: 50,
                    name: 'cruciferous_veg',
                    servingsPerDay: 1,
                },

                {
                    group: 'turmeric',
                    servingsAchieved: 0,

                    servingSize: 1,
                    servingsPerDay: 1,
                },

                {
                    group: 'fruits',
                    servingsAchieved: 0,

                    servingSize: 40,
                    name: 'fruit',
                    servingsPerDay: 3,
                },

                {
                    group: 'vegetables',
                    servingsAchieved: 0,

                    servingsPerDay: 2,
                    servingSize: 50,
                    name: 'non_leafy_veg',
                },

                {
                    group: 'beans',
                    servingsAchieved: 0,

                    servingsPerDay: 3,
                    servingSize: 130,
                    name: 'pulse',
                },

                {
                    group: 'grains',
                    servingsAchieved: 0,

                    servingSize: 100,
                    servingsPerDay: 3,
                    name: 'grain',
                },

                {
                    group: 'flaxseed',
                    servingsAchieved: 0,

                    name: 'flax',
                    servingSize: 1,
                    servingsPerDay: 1,
                },

                {
                    group: 'greens',
                    servingsAchieved: 0,

                    name: 'leafy_green_veg',
                    servingSize: 70,
                    servingsPerDay: 2,
                },

                {
                    group: 'beverages',
                    servingsAchieved: 0,

                    servingSize: 250,
                    name: 'beverages',
                    servingsPerDay: 5,
                },

            ];

            const dailyDozenCounts = [];

            for (const recipe of recipes) {
                // eslint-disable-next-line no-await-in-loop
                const ingredientsWithData = await fetchDataForIngredients(recipe.v2 ? recipe.ingredients : recipe.ingredients_formatted);

                // console.log('Ingredients with data', ingredientsWithData)
                for (const ingredient of recipe.v2 ? recipe.ingredients : recipe.ingredients_formatted) {
                    // console.log('Ingredient in DD', ingredient)
                    for (const group of dailyDozen) {
                        const checkName = group.name ? group.name : group.group;

                        // if (!ingredient.data) {
                        //     ingredient.data = loadIn()
                        // }

                        if (ingredient.data) {
                            // console.log('Ingredient data', ingredient.data)
                            if (ingredient.data[checkName]) {
                                // console.log('Yes ingredient data checkName', checkName)

                                // Check to see if we have achieved enough of the desired amount
                                // Flaxseed and turmeric
                                if (group.name == 'flaxseed' || group.name == 'turmeric') {
                                    if (
                                        group.servingsAchieved <
                                        group.servingsPerDay
                                    ) { group.servingsAchieved++; }
                                } else {
                                    // This may or may not be grams, but we will convert it if not
                                    // Divide by servings as well
                                    let quantityInGrams = ingredient.quantity / (recipe.servings ? recipe.servings : 1);
                                    // If unit is cup or cups, convert to grams
                                    if (ingredient.unit == 'cup') {
                                        quantityInGrams *= 128;
                                    }

                                    if (
                                        group.servingsAchieved <
                                        group.servingsPerDay
                                        // eslint-disable-next-line no-plusplus
                                    ) { group.servingsAchieved++; }

                                    if (ingredient.unit == null) {
                                        if (
                                            group.servingsAchieved <
                                            group.servingsPerDay
                                        ) { group.servingsAchieved++; }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // console.log('Daily dozen', dailyDozen);
            setDailyDozenCalculated(dailyDozen);
            setLoading(false);
        };
        runDailyDozen();
        // console.log('Daily Dozen', dailyDozen)
    }, [recipes]);

    const [opened, setOpened] = useState(false);

    return (
        <div style={{ position: 'relative', minHeight: '200px' }}>
            <LoadingOverlay visible={loading} style={{ minHeight: '200px' }} />
            <Center mb={12}>

                <Popover
                    opened={opened}
                    gutter={0}
                    onClose={() => setOpened(false)}
                    position="bottom"
                    placement="center"
                    withArrow
                    style={{ cursor: 'pointer' }}
                    closeOnEscape={false}
                    transition="pop-top-left"
                    width={260}
                    target={
                        <Button size="xs" variant="subtle" onClick={() => setOpened(!opened)} style={{ textDecoration: 'underline' }}>What is the daily dozen?</Button>
                    }

                >
                    <div style={{ display: 'flex', zIndex: 90 }}>
                        <Image
                            src="https://pbs.twimg.com/profile_images/1237104550592614406/RVXlE1hp_400x400.jpg"
                            width={40}
                            height={40}
                            sx={{ minWidth: 40 }}
                            mr="md"
                            radius="xl"
                        />
                        <Text size="sm"> The <a href="https://nutritionfacts.org/daily-dozen-challenge/" target="blank" className="underline">Daily Dozen</a> is a recommended checklist of everything your body needs formulated by <a href="https://nutritionfacts.org" target="blank" className="underline">NutritionFacts.org</a> founder and author of <a href="https://www.amazon.co.uk/gp/product/1509852506/ref=as_li_tl?ie=UTF8&amp;camp=1634&amp;creative=6738&amp;creativeASIN=1509852506&amp;linkCode=as2&amp;tag=stayingvega00-21&amp;linkId=236790220652a7221f32f7953dcb9e4f" target="blank" className="underline">How Not To Die</a>, Dr. Michael Greger M.D.</Text>
                    </div>
                </Popover>
            </Center>

            <Grid>
                {dailyDozenCalculated.map((group, i) => (
                    <Grid.Col span={6} key={i}>
                        <div className="flex items-center">
                            <Text size="xs" transform="capitalize">{group.group}</Text>
                            <div className="flex items-center space-x-1">
                                {[...Array(group.servingsAchieved)].map((e, i) => <Checkbox key={i} size={18} />)}
                                {[...Array(group.servingsPerDay - group.servingsAchieved)].map((e, i) => <Square key={i} size={18} />)}

                            </div>
                            {/* <span className="input-label">key: {i} Name: {subjects[group]}</span> */}
                        </div>
                    </Grid.Col>
                ))}
            </Grid>
        </div>

    );
}

export default DailyDozen;
