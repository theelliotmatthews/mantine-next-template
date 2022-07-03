import { Badge, Button, Divider, Group, Stack, Text, TextInput } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { Check, Folder } from 'tabler-icons-react';
import { addRecipeToCollections, checkWhichCollectionsContainRecipe, createCollection, getCollections } from '../../lib/collections';
import { UserContext } from '../../lib/context';
import { Collection, Recipe } from '../../lib/types';

interface AddToCollectionProps {
    recipe: Recipe;
    closeModal: Function;
}

export default function AddToCollection(props: AddToCollectionProps) {
    const { recipe, closeModal } = props;
    const { user } = useContext(UserContext);
    const router = useRouter();

    const [collections, setCollections] = useState<Collection[]>([]);
    const [addingToCollections, setAddingToCollections] = useState<string[]>([]);
    const [newCollection, setNewCollection] = useState<string>('');
    const [recipeInCollections, setRecipeInCollections] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            const fetchCollections = async () => {
                const res = await getCollections(user.uid);
                console.log('Collections res', res);
                setCollections(res);
            };

            const checkCollections = async () => {
                const res = await checkWhichCollectionsContainRecipe(recipe.id, user.uid);
                console.log('Collections containing recipe', res);
                setRecipeInCollections(res);
            };

            fetchCollections();
            checkCollections();
        }
    }, []);

    const toggleSelectCollection = (collectionId: string) => {
        if (addingToCollections.includes(collectionId)) {
            // Remove from collection
            let copy = [...addingToCollections];
            copy = copy.filter(item => item !== collectionId);
            setAddingToCollections(copy);
        } else {
            // Add to collection
            setAddingToCollections((prev) => (
                [
                    ...prev,
                    collectionId,
                ]));
        }
    };

    const createNewCollection = async () => {
        await createCollection(user.uid, newCollection);
        const res = await getCollections(user.uid);
        setCollections(res);

        const foundCollection = res.find(x => x.title === newCollection);
        toggleSelectCollection(foundCollection.id);
        setNewCollection('');
        // Select this collection by default
    };

    const addToCollections = async () => {
        await addRecipeToCollections(user.uid, recipe.id, addingToCollections);
        // hideModal();
        closeModal();

        showNotification({
            title: 'Added to collection',
            message: 'Click here to view your collections',
            onClick: () => {
                router.push('/planner');
            },
            icon: <Folder size={12} />,
            style: { cursor: 'pointer' },
        });
    };

    return (
        <Stack>
            {/* List of collections */}
            {collections.length > 0 &&
                <>
                    <Text>Your collections</Text>
                    <Stack>
                        {collections.map((collection, index) => (
                            <Group
                                onClick={() => (recipeInCollections.includes(collection.id)) ? null : toggleSelectCollection(collection.id)}
                                key={index}
                                position="apart"
                            >
                                <div>
                                    {collection.title}
                                </div>
                                {addingToCollections.includes(collection.id) && <Check />}
                                {recipeInCollections.includes(collection.id) && <Badge className="bg-primary-medium text-white">In collection</Badge>}
                            </Group>)
                        )}
                    </Stack>
                </>
            }
            {collections.length > 0 ? <Divider /> : null}
            {/* Create new collection  */}
            <Text>Create a collection</Text>
            <Stack spacing="xs">
                <TextInput value={newCollection} onChange={(e) => setNewCollection(e.target.value)} placeholder="Collection name" className="flex-grow" />
                {newCollection.length > 2 && <Button onClick={() => createNewCollection()}>Create collection</Button>}
            </Stack>

            <Group position="right">
                <Button onClick={() => closeModal && closeModal()} mt="md" variant="outline" color="gray">
                    Cancel
                </Button>
                {addingToCollections.length > 0 ?
                    <Button onClick={() => addToCollections()} mt="md">
                        {addingToCollections.length > 1 ? 'Add to collections' : 'Add to collection'}
                    </Button> : null}
            </Group>
        </Stack>
    );
}
