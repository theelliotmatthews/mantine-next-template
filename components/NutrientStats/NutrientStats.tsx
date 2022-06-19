import { useEffect, useContext, useState } from 'react';

import { createStyles, Progress, Box, Text, Group, Paper, SimpleGrid } from '@mantine/core';
import { ArrowUpRight, DeviceAnalytics } from 'tabler-icons-react';
import { totalNutrients } from '../../lib/nutrients/nutrients';
import { StatsSegments } from '../StatsSegment/StatsSegment';

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

    const [nutrients, setNutrients] = useState(null);
    const { classes } = useStyles();
    const [data, setData] = useState([]);

    useEffect(() => {
        if (recipes) {
            const keys = ['calories', 'carbs', 'fat', 'protein']
            // console.log('Recipes', recipes)
            const res = totalNutrients(recipes);
            console.log('Nutrient res', res);
            setNutrients(res);

            const dataStream = [];

            Object.keys(res).forEach((key) => {
                console.log(res[key]);
                console.log('Key', key);

                if (keys.includes(key)) {

                    dataStream.push({
                        label: key,
                        count: res[key],
                        part: res[key],
                        color: 'red',
                    });
                }
            });

            setData(dataStream);
            console.log('Data stream', dataStream)
        }
    }, [recipes]);

    const labels = [
        {
            label: 'calories',
            unit: '',
        },
        {
            label: 'carbs',
            unit: 'g',
        },
        {
            label: 'protein',
            unit: 'g',
        },
        {
            label: 'fat',
            unit: 'g',
        },
    ];

    return (
        <>
            {nutrients &&

                <StatsSegments total="2000" diff={20} data={data} />
                // <div className="bg-white rounded-md p-8">
                //     <h3 className="mb-4 text-lg font-semibold">Micronutrients</h3>

                //     <div className="grid grid-cols-2 md:grid-cols-4">
                //         {labels.map((label, index) => <div key={index} className="bg-primary-light text-black text-center p-4">
                //             <div>{nutrients[label.label]}{label.unit}</div>
                //             <div>{label.label}</div>
                //         </div>)}
                //     </div>

                //     {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                //         {nutrients.microNutrients.map((nutrient, index) => {
                //             return <MicronutrientScoreBar key={index} nutrient={nutrient} />
                //         })}
                //     </div> */}
                // </div>
            }
        </>

    );
}

export default NutrientStats;
