import { Button, Group } from '@mantine/core';
import { ChevronLeft, ChevronRight } from 'tabler-icons-react';

interface ChevronButtonsProps {
    onChange: Function,
    text: string
}

export function ChevronButtons(props: ChevronButtonsProps) {
    const { onChange, text } = props;

    const decrement = () => {
        onChange(false);
    };

    const increment = () => {
        onChange(true);
    };

    return (
        <Group>
            <Button onClick={() => decrement()} type="button" variant="subtle">
                <ChevronLeft />
            </Button>
            <div>{text}</div>
            <Button onClick={() => increment()} type="button" variant="subtle">
                <ChevronRight />
            </Button>
        </Group>
    );
}

export default ChevronButtons;
