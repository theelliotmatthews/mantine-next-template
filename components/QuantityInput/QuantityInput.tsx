import React, { useEffect, useRef, useState } from 'react';
import { createStyles, NumberInput, NumberInputHandlers, ActionIcon, Text, Group } from '@mantine/core';
import { Plus, Minus } from 'tabler-icons-react';

const useStyles = createStyles((theme) => ({
    wrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 4px',
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.white,

        '&:focus-within': {
            borderColor: theme.colors[theme.primaryColor][6],
        },
    },

    control: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        border: `1px solid ${theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[3]}`,
        borderRadius: '999px',

        '&:disabled': {
            borderColor: theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[3],
            opacity: 0.8,
            backgroundColor: 'transparent',
        },
    },

    input: {
        textAlign: 'center',
        paddingRight: `${0}px !important`,
        paddingLeft: `${0}px !important`,
        height: 28,
        flex: 0,
        margin: '0 !important',
        width: '20px',

    },

    label: {
        flexShrink: '0',
    },
}));

interface QuantityInputProps {
    min?: number;
    max?: number;
    defaultValue?: number;
    updateValue?: Function;
    label?: string;
}

export function QuantityInput({ min = 1, max, defaultValue = 1, updateValue, label }: QuantityInputProps) {
    const { classes } = useStyles();
    const handlers = useRef<NumberInputHandlers>();
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        console.log('Value changing', value);

        if (value && updateValue) {
            updateValue(value);
        }
    }, [value]);

    useEffect(() => {
        console.log('Default value changing', defaultValue);
        setValue(defaultValue);
    }, [defaultValue]);

    return (
        <Group noWrap>
            {label ? <Text className={classes.label}>{label}</Text> : null}

            <ActionIcon<'button'>
                size={28}
                variant="transparent"
                onClick={() => handlers.current.decrement()}
                disabled={value === min}
                className={classes.control}
                onMouseDown={(event) => event.preventDefault()}
            >
                <Minus size={16} />
            </ActionIcon>



            <NumberInput
                variant="unstyled"
                min={min}
                max={max}
                handlersRef={handlers}
                value={value}
                onChange={setValue}
                classNames={{ input: classes.input }}
            />


            <ActionIcon<'button'>
                size={28}
                variant="transparent"
                onClick={() => handlers.current.increment()}
                disabled={value === max}
                className={classes.control}
                onMouseDown={(event) => event.preventDefault()}
            >
                <Plus size={16} />
            </ActionIcon>
        </Group>
    );
}
