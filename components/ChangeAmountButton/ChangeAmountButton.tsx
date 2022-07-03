import { Button, Group, Text } from '@mantine/core';
import { useState } from 'react';
import { CircleMinus, CirclePlus } from 'tabler-icons-react';

interface ChangeAmountButtonProps {
    onChange: Function,
    amount: number,
    iconPrefix?: string,
    iconSuffix?: string,
    amountPrefix?: string,
    amountSuffix?: string,
}

export function ChangeAmountButton(props: ChangeAmountButtonProps) {
    const { onChange, iconPrefix, iconSuffix, amountPrefix, amountSuffix } = props;

    const [amount, setAmount] = useState(props.amount);

    const decrement = () => {
        if (amount !== 1) {
            setAmount(amount - 1);
            onChange(amount - 1);
        }
    };

    const increment = () => {
        setAmount(amount + 1);
        onChange(amount + 1);
    };

    return (
        <Group spacing="xs">
            {iconPrefix && <div>{iconPrefix}</div>}
            <Button onClick={() => decrement()} variant="subtle" px={0}>
                <CircleMinus />
            </Button>
            <Group spacing="xs">
                {amountPrefix && <Text>{amountPrefix}</Text>}
                <Text>{props.amount}</Text>
                {amountSuffix && <Text>{amountSuffix}</Text>}
            </Group>
            <Button onClick={() => increment()} variant="subtle" px={0}>

                <CirclePlus />
            </Button>
            {iconSuffix && <Text>{iconSuffix}</Text>}
        </Group>

    );
}

export default ChangeAmountButton;
