import { Card, Badge, Text, Group, createStyles } from '@mantine/core';
import React, { useState } from 'react';
import { CircleCheck } from 'tabler-icons-react';

interface RecipeInstructionProps {
    index: number;
    instruction: string;
}

const useStyles = createStyles((theme) => ({
    active: {
        backgroundColor: theme.colors[theme.primaryColor][6],
        color: '#FFFFFF',
    },
}));

export default function RecipeInstruction(props: RecipeInstructionProps) {
    const { index, instruction } = props;
    const { classes, theme, cx } = useStyles();
    const [clicked, setClicked] = useState(false)

    return (
        <Card withBorder onClick={() => setClicked(!clicked)} className={clicked ? classes.active : ''}>
            <Group noWrap align="top">
                {clicked ? <CircleCheck /> : <Text>{index}.</Text>}
                <Text>{instruction}</Text>
            </Group>
        </Card>
    );
}
