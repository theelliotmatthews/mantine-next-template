import React, { useEffect, useState } from 'react';
import { createStyles, UnstyledButton, Menu, Image, Group, Loader } from '@mantine/core';
import { ChevronDown } from 'tabler-icons-react';


const useStyles = createStyles((theme, { opened }: { opened: boolean }) => ({
    control: {
        width: 200,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 15px',
        borderRadius: theme.radius.md,
        border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[2]
            }`,
        transition: 'background-color 150ms ease',
        backgroundColor:
            theme.colorScheme === 'dark'
                ? theme.colors.dark[opened ? 5 : 6]
                : opened
                    ? theme.colors.gray[0]
                    : theme.white,

        '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
        },
    },

    label: {
        fontWeight: 500,
        fontSize: theme.fontSizes.sm,
    },

    icon: {
        transition: 'transform 150ms ease',
        transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
    },
}));

interface DropdownSelectProps {
    options: { label: string, image: string | null, id: string }[],
    select: Function;
}

export function DropdownSelect(props: DropdownSelectProps) {
    const { options, select } = props
    const [opened, setOpened] = useState(false);
    const { classes } = useStyles({ opened });
    const [selected, setSelected] = useState();
    const [items, setItems] = useState()

    useEffect(() => {
        if (options.length > 0) {
            // console.log('Options', options)
            if (!selected) setSelected(options[0])

            const i = options.map((item) => (
                <Menu.Item
                    icon={item.image ? <Image src={item.image} width={18} height={18} /> : null}
                    onClick={() => {
                        setSelected(item);
                        select(item);
                    }}
                    key={item.label}
                >
                    {item.label}
                </Menu.Item>
            ));

            setItems(i)
        }
    }, [options])


    return (
        <>
            {options && selected ?
                <Menu
                    transition="pop"
                    transitionDuration={150}
                    onOpen={() => setOpened(true)}
                    onClose={() => setOpened(false)}
                    radius="md"
                    control={
                        <UnstyledButton className={classes.control}>
                            <Group spacing="xs">
                                {selected.image ? <Image src={selected.image} width={22} height={22} /> : null}
                                <span className={classes.label}>{selected.label}</span>
                            </Group>
                            <ChevronDown size={16} className={classes.icon} />
                        </UnstyledButton>
                    }
                >
                    {items}
                </Menu>
                : <Loader />}
            {/* {JSON.stringify(selected)} */}
        </>

        // <div>{JSON.stringify(options)}</div>
    );
}