import { Badge, Button, Card, Group, Image, Popover, Stack, Text, Tooltip } from '@mantine/core';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Draggable } from 'react-beautiful-dnd';
import { Clock, Edit, Trash } from 'tabler-icons-react';
import rehypeRaw from 'rehype-raw';
import { convertTimerToString } from '../../lib/timer';
import { Ingredient, MethodItem } from '../../lib/types';
import PopoverIngredient from './PopoverIngredient';
import AddEditMethodItem from './AddEditMethodItem';

interface DraggableMethodProps {
    instruction: MethodItem,
    index: number,
    children: string
    ingredients: Ingredient[];
    method: any;
    methodIds: string[];
    setMethod: Function;
    setMethodIds: Function;

}

export default function DraggableMethod(props: DraggableMethodProps) {
    const { instruction, index, children, ingredients, method, methodIds, setMethod, setMethodIds } = props;

    const [editing, setEditing] = useState(false)
    const markdown = children;

    const deleteInstruction = () => {
        console.log('Deleting with id: ', instruction.id);

        const methodCopy = { ...method };
        delete methodCopy[instruction.id.toString()];

        setMethodIds(prevState => prevState.filter(s => s !== instruction.id));
        setMethod(methodCopy);
    };


    return (
        <Draggable draggableId={instruction.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <Card shadow="xs">
                        <Stack>
                            <Group position="apart" noWrap>
                                <Group>
                                    <Text>{index + 1}.</Text>
                                    <ReactMarkdown
                                        children={markdown}
                                        components={{
                                            // Map `h1` (`# heading`) to use `h2`s.
                                            p: ({ node, ...propsMarkdown }) => <p style={{ margin: 0 }} {...propsMarkdown} />,
                                            // Rewrite `em`s (`*like so*`) to `i` with a red foreground color.
                                            span: ({ node, ...propsMarkdown }) => (
                                                <PopoverIngredient {...propsMarkdown} ingredients={ingredients} />
                                            ),
                                        }}
                                        rehypePlugins={[rehypeRaw]}
                                    />
                                </Group>

                                <Group>

                                    {instruction.image ? <Image src={instruction.image} height={30} width={30} style={{ borderRadius: '5px', overflow: 'hidden' }} /> : null}
                                    {instruction.video ? <video src={instruction.video} height={30} width={30} autoPlay loop muted style={{ borderRadius: '5px', overflow: 'hidden' }} /> : null}

                                    {convertTimerToString(instruction) ?
                                        <Badge size="lg" radius="lg" leftSection={<Group><Clock size={16} /></Group>} variant="filled">
                                            <Text transform="lowercase" weight="lighter" size="sm">{convertTimerToString(instruction)}</Text>
                                        </Badge> : null
                                    }
                                    <Edit onClick={() => setEditing(!editing)} style={{ cursor: 'pointer' }} />
                                    <Trash onClick={() => deleteInstruction()} style={{ cursor: 'pointer' }} />
                                </Group>

                            </Group>
                            {editing ?

                                <AddEditMethodItem
                                    item={instruction}
                                    method={method}
                                    methodIds={methodIds}
                                    setMethod={setMethod}
                                    setMethodIds={setMethodIds}
                                    ingredients={ingredients}
                                    setEditing={setEditing}
                                /> : null
                            }
                        </Stack>
                    </Card>
                </div>)}
        </Draggable>
    );
}
