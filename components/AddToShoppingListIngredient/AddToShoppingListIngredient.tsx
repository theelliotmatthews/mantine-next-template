import { Button, Group } from '@mantine/core';
import { useEffect } from 'react';
import { Check } from 'tabler-icons-react';

interface AddToShoppingListIngredientProps {
    ingredient: any;
    select: Function;
    multiplier: number;
}

export function AddToShoppingListIngredient(props: AddToShoppingListIngredientProps) {
    const { ingredient, select, multiplier } = props;

    // const [selected, setSelected] = useState(ingredient.checked)
    const selected = ingredient.checked;

    const toggleSelect = () => {
        // setSelected(!selected)
        select(ingredient);
    };

    useEffect(() => {
        console.log('Multi changing', multiplier);
    }, [multiplier]);

    const unitQuantity = (ingredient.quantity || ingredient.unit) ? `${ingredient.quantity ? (ingredient.quantity / multiplier).toFixed(2) : ''} ${ingredient.unit ? ingredient.unit : ''}` : null;

    return (
        <Group position="apart">
            <div>{ingredient.ingredient}</div>
            <Button
                variant={selected ? 'filled' : 'outline'}
                leftIcon={selected ? <Check size={16} /> : null}
                onClick={toggleSelect}
                size="xs"
                radius="lg"
            >{unitQuantity}
            </Button>
        </Group>

    );
}

export default AddToShoppingListIngredient;
