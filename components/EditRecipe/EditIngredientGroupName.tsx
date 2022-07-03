import { Group, groupOptions, Text, TextInput } from '@mantine/core';
import React, { useState } from 'react';
import { Check, Cross, Edit, X } from 'tabler-icons-react';
import { IngredientGroup } from '../../lib/types';

interface EditIngredientGroupNameProps {
    editName: Function;
    group: IngredientGroup;
}

export default function EditIngredientGroupName(props: EditIngredientGroupNameProps) {
    const { editName, group } = props;
    const [editing, setEditing] = useState(false);
    const [newName, setNewName] = useState(group.name);

    return (
        <Group>
            {!editing ?
                <Group>
                    <Text>{group.name}</Text>
                    {group.name !== 'No group' && <Edit onClick={() => setEditing(true)} color="grey" size={16} />}
                </Group>
                :
                <Group>
                    <TextInput value={newName} onChange={(e) => setNewName(e.target.value)} />
                    {newName.length > 0 && <Check
                        onClick={() => {
                            editName(group.id, newName);
                            setEditing(false);
                        }}
                        style={{ cursor: 'pointer' }}
                    />
                    }
                    <X
                        onClick={() => setEditing(false)}
                        style={{ cursor: 'pointer' }}
                    />
                </Group>
            }
        </Group>
    );
}
