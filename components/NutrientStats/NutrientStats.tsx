import { useEffect, useContext, useState } from 'react';

import { createStyles, Progress, Box, Text, Group, Paper, SimpleGrid, Grid, Stack, Button } from '@mantine/core';
import { ArrowUpRight, ChevronDown, ChevronUp, DeviceAnalytics } from 'tabler-icons-react';
import { totalNutrients } from '../../lib/nutrients/nutrients';
import { StatsSegments } from '../StatsSegment/StatsSegment';
import { Nutrients } from '../../lib/types';


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
    recipes: any
}

export function NutrientStats(props: NutrientStatsProps) {
    const { recipes } = props;

    const [nutrients, setNutrients] = useState<Nutrients>();
    const [data, setData] = useState([]);
    const [showMicroNutrients, setShowMicroNutrients] = useState<boolean>(false);

    useEffect(() => {
        if (recipes) {
            const units = {
                calories: { unit: 'kcal', oneDp: false },
                carbs: { unit: 'g', oneDp: true },
                fat: { unit: 'g', oneDp: true },
                protein: { unit: 'g', oneDp: true },
            };
            // console.log('Recipes', recipes)
            const res: Nutrients = totalNutrients(recipes);
            console.log('Nutrient res', res);
            setNutrients(res);

            const dataStream: ((prevState: never[]) => never[]) | { label: string; count: number; part: any; color: string; unit: any; }[] = [];

            Object.keys(res).forEach((key) => {
                console.log(res[key]);
                console.log('Key', key);

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
            console.log('Data stream', dataStream);
        }
    }, [recipes]);

    return (
        <>
            {nutrients &&
                <Paper withBorder px="lg" py="md" radius="md">
                    <Stack>
                        <StatsSegments total="2000" diff={20} data={data} />

                        <Button
                            size="xs"
                            variant="subtle"
                            leftIcon={showMicroNutrients ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            onClick={() => setShowMicroNutrients(!showMicroNutrients)}
                        >
                            Micronutrients
                        </Button>
                        {nutrients && showMicroNutrients ? (
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
                    </Stack>

                </Paper>
            }
        </>

    );
}

export default NutrientStats;
