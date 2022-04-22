import { Container } from '@mantine/core';
import ShoppingList from '../components/ShoppingList/ShoppingList';

export default function List() {
    return (
        <Container size="md" py="xs">
            <ShoppingList />
        </Container>
    );
}
