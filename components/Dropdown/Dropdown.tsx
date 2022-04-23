import React, { useEffect, useState } from 'react';
import { createStyles, UnstyledButton, Menu, Image, Group, ScrollArea } from '@mantine/core';
import { ChevronDown } from 'tabler-icons-react';

const useStyles = createStyles((theme, { opened }: { opened: boolean }) => ({
    control: {
        width: 'auto',
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
        marginRight: '5px',
    },

    icon: {
        transition: 'transform 150ms ease',
        transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
    },
}));

interface DropdownItem {
    label: string;
    value: string;
    image?: string;
}
interface DropdownProps {
    items: DropdownItem[];
    selectItem: Function;
    default?: DropdownItem
}

export default function Dropdown(props: DropdownProps) {
    const [opened, setOpened] = useState(false);
    const { classes } = useStyles({ opened });
    const [selected, setSelected] = useState(props.default ? props.default : props.items[0]);
    const items = props.items.map((item) => (
        <Menu.Item
            icon={item.image ? <Image src={item.image} width={18} height={18} /> : null}
            onClick={() => {
                setSelected(item);
                props.selectItem(item.value);
            }
            }
            key={item.label}
        >
            {item.label}
        </Menu.Item>
    ));

    useEffect(() => {
        if (props.default) setSelected(props.default);
    }, [props.default]);

    return (
        <>
            {selected ?
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
                    <ScrollArea style={{ maxHeight: 250, overflowY: 'scroll' }} type="scroll">
                        {items}
                    </ScrollArea>
                </Menu> : null
            }
        </>
    );
}
