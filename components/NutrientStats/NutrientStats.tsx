import { useEffect, useContext, useState } from 'react';

import { createStyles, Progress, Box, Text, Group, Paper, SimpleGrid, Grid, Stack, Button, Tooltip } from '@mantine/core';
import { ArrowUpRight, ChevronDown, ChevronUp, DeviceAnalytics, InfoCircle } from 'tabler-icons-react';
import { totalNutrients } from '../../lib/nutrients/nutrients';
import { StatsSegments } from '../StatsSegment/StatsSegment';
import { Nutrients } from '../../lib/types';
import DailyDozen from '../DailyDozen/DailyDozen';
import ChangeAmountButton from '../ChangeAmountButton/ChangeAmountButton';

const useStyles = createStyles((theme) => ({
    progressLabel: {
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
        lineHeight: 1,
        fontSize: theme.fontSizes.sm,
    },

    stat: {
        borderBottom: '3px solid',
        paddingBottom: 5,
    },

    statCount: {
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
        lineHeight: 1.3,
    },

    diff: {
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
        display: 'flex',
        alignItems: 'center',
    },

    icon: {
        color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4],
    },
}));

interface NutrientStatsProps {
    recipes: any;
    recipePage?: boolean;
    servings?: number;
    hideAdjustServings?: boolean;
}

export function NutrientStats(props: NutrientStatsProps) {
    const { recipes, recipePage, servings, hideAdjustServings } = props;

    const [nutrients, setNutrients] = useState<Nutrients>();
    const [data, setData] = useState([]);
    const [showMicroNutrients, setShowMicroNutrients] = useState<boolean>(false);
    const [showDailyDozen, setShowDailyDozen] = useState<boolean>(false);
    const [serves, setServes] = useState(recipePage ? recipes[0].servings : 1);
    const [recipesWithUpdatedServings, setRecipesWithUpdatedServings] = useState(recipes);
    const [score, setScore] = useState(0)

    const multipliers = [1, 2, 3, 4];

    useEffect(() => {
        if (recipesWithUpdatedServings) {
            const units = {
                calories: { unit: 'kcal', oneDp: false },
                carbs: { unit: 'g', oneDp: true },
                fat: { unit: 'g', oneDp: true },
                protein: { unit: 'g', oneDp: true },
            };
            // console.log('Recipes', recipes)
            const res: Nutrients = totalNutrients(recipesWithUpdatedServings);
            // console.log('Nutrient res', res);
            setNutrients(res);

            console.log('Nutrients', nutrients)
            setScore(res.score);

            const dataStream: ((prevState: never[]) => never[]) | { label: string; count: number; part: any; color: string; unit: any; }[] = [];

            Object.keys(res).forEach((key) => {
                // console.log(res[key]);
                // console.log('Key', key);

                if (units[key]) {
                    dataStream.push({
                        label: key,
                        count: units[key].oneDp ? Math.round(res[key] * 10) / 10 : Math.ceil(res[key]),
                        part: res[key],
                        color: 'red',
                        unit: units[key].unit,
                    });
                }
            });

            setData(dataStream);
            // console.log('Data stream', dataStream);
        }
    }, [recipesWithUpdatedServings]);

    useEffect(() => {
        console.log('Servings changing', servings);
        const recipesCopy = [...recipesWithUpdatedServings];

        recipesCopy[0].servings = serves;
        if (servings) { recipesCopy[0].servings = servings }
        setRecipesWithUpdatedServings(recipesCopy);
    }, [serves, servings, recipes]);

    return (
        <>
            {nutrients &&
                <Paper withBorder={!recipePage} px={recipePage ? 0 : 'lg'} py={recipePage ? 0 : 'md'} radius="md">
                    <Stack>
                        {recipePage ? (
                            <Group position="apart">
                                <Text size="lg">Nutrition</Text>
                                {!hideAdjustServings &&
                                    <Group>
                                        <ChangeAmountButton onChange={setServes} amount={serves} iconPrefix="1 of" iconSuffix="servings" />
                                    </Group>
                                }

                            </Group>) : null}

                        <StatsSegments total="2000" diff={20} data={data} />

                        {!recipePage ?
                            <Grid>
                                <Grid.Col span={6}>
                                    <Button
                                        size="xs"
                                        variant="subtle"
                                        leftIcon={showMicroNutrients ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                        onClick={() => {
                                            if (!showMicroNutrients) setShowDailyDozen(false);
                                            setShowMicroNutrients(!showMicroNutrients);
                                        }
                                        }
                                    >
                                        Micronutrients
                                    </Button>
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Button
                                        size="xs"
                                        variant="subtle"
                                        leftIcon={showDailyDozen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                        onClick={() => {
                                            if (!showDailyDozen) setShowMicroNutrients(false);
                                            setShowDailyDozen(!showDailyDozen);
                                        }}
                                    >
                                        Daily Dozen
                                    </Button>
                                </Grid.Col>
                            </Grid>
                            : null

                        }

                        {nutrients && (showMicroNutrients || recipePage) ? (
                            <Grid>
                                {nutrients.microNutrients.map((nutrient, index) =>
                                    <Grid.Col key={index} span={6}>
                                        <Group position="apart">
                                            <Text size="xs">{nutrient.info.label}</Text>
                                            <Text size="xs">{nutrient.percentage}%</Text>
                                        </Group>
                                        <Progress value={nutrient.percentage} size="sm" radius="xl" />
                                    </Grid.Col>
                                    // return <MicronutrientScoreBar key={index} nutrient={nutrient} />
                                )}
                            </Grid>
                        ) : null
                        }

                        {showDailyDozen || recipePage ? (
                            <DailyDozen recipes={recipes} />
                        ) : null
                        }

                        {recipePage ?
                            <>
                                <Group position="apart">
                                    <Group align="bottom" spacing="xs">

                                        <Text size="md">Micronutrient Score</Text>
                                        <Tooltip
                                            label="The micronutrient score is a measure of the nutrient balance and density of a recipe. Recipes rated high on the scale are those which are likely to contain a balanced range of nutrients relative to the amount of calories. For example, if a recipe satisfies an estimated average of 90% of your intake across all recommended micronutrients, in only half of your desired calories, this would be given a very high score."
                                            withArrow
                                            width={350}
                                            wrapLines
                                        >
                                            <InfoCircle size={16} />
                                        </Tooltip>
                                    </Group>
                                    <Text size="xs">{score / 10} / 10</Text>
                                </Group>
                                <Progress value={score} size="sm" radius="xl" />
                            </>
                            : null
                        }
                    </Stack>

                </Paper>
            }
        </>

    );
}

export default NutrientStats;
