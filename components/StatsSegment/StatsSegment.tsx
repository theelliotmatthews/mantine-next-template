import React from 'react';
import { createStyles, Progress, Box, Text, Group, Paper, SimpleGrid } from '@mantine/core';
import { ArrowUpRight, DeviceAnalytics } from 'tabler-icons-react';

const useStyles = createStyles((theme) => ({
    progressLabel: {
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
        lineHeight: 1,
        fontSize: theme.fontSizes.sm,
    },

    stat: {


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

interface StatsSegmentsProps {
    total: string;
    diff: number;
    data: {
        label: string;
        count: string;
        part: number;
        color: string;
        unit: string;
    }[];
}

export function StatsSegments({ total, diff, data }: StatsSegmentsProps) {

    console.log('Data in component', data)
    const { classes } = useStyles();

    const segments = data.map((segment) => ({
        value: segment.part,
        color: segment.color,
        label: segment.part > 10 ? `${segment.part}%` : null,
    }));

    const descriptions = data.map((stat) => (
        <Box key={stat.label} className={classes.stat}>
            <Text transform="capitalize" size="xs" color="dimmed" weight={700}>
                {stat.label}
            </Text>

            <Group position="apart" align="flex-end" spacing={0}>
                <Text weight={700} size="sm">{stat.count}{stat.unit}</Text>
                {/* <Text color={stat.color} weight={700} size="sm" className={classes.statCount}>
                    {stat.part}g
                </Text> */}
            </Group>
        </Box>
    ));

    return (


        <SimpleGrid cols={4} breakpoints={[{ maxWidth: 'xs', cols: 1 }]}>
            {descriptions}
        </SimpleGrid>

    );
}