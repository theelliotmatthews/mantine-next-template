import { Button, Grid, Group, NumberInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/hooks';
import type { Editor, RichTextEditorProps } from '@mantine/rte';

import React, { SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
import { convertTimerToString, timerIsEmpty } from '../../lib/timer';
import { Ingredient, MethodItem, Timer } from '../../lib/types';
import ImageUpload from '../ImageUpload/ImageUpload';
import MediaContainer from '../MediaContainer/MediaContainer';
import PhotoContainer from '../PhotoContainer/PhotoContainer';

interface AddEditMethodItemProps {
    item?: MethodItem;
    method: any;
    methodIds: string[];
    setMethod: Function;
    setMethodIds: Function;
    ingredients: Ingredient[];
    setEditing?: Function
}

export default function AddEditMethodItem(props: AddEditMethodItemProps) {
    if (typeof window !== 'undefined') {
        const { RichTextEditor } = require('@mantine/rte');

        const { method, methodIds, setMethod, setMethodIds, ingredients, setEditing } = props;

        const [addingTimer, setAddingTimer] = useState(false);
        const [suggestedTimer, setSuggestedTimer] = useState({ hours: 0, minutes: 0, seconds: 0 });
        const [timersMatch, setTimersMatch] = useState(false)

        const { item } = props;
        const form = useForm({
            initialValues: {
                instruction: '',
                hours: 0,
                minutes: 0,
                seconds: 0,
                image: '',
                video: '',
            },

            // validate: {
            //     email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            // },
        });

        useEffect(() => {
            if (item) {
                form.setValues(item);
            }
        }, [item]);

        const onSubmit = (data) => {
            console.log('Submitting form with data', data);
            const element = document.getElementsByClassName('ql-editor');

            if (data.instruction.length === 0) return;
            // Update
            if (item) {
                let methodCopy = { ...method }

                const newMethod = {
                    id: item.id.toString(),
                    ...data
                }

                methodCopy[item.id.toString()] = newMethod

                setMethod(methodCopy)
                setEditing && setEditing(false)
            } else {

                // console.log("Adding new instruction")

                const newId = `${methodIds.length + 2}`;

                const instructionsCopy = { ...method };
                instructionsCopy[newId] = {
                    id: newId,
                    ...data,
                };

                setMethod(instructionsCopy);

                setMethodIds(prevState => [...prevState, newId]);

                // setNewInstruction('');

                element[0].innerHTML = '';
            }

            form.setFieldValue('instruction', '');
            form.reset();
            setAddingTimer(false)
        };

        const [winReady, setwinReady] = useState(false);
        useEffect(() => {
            setwinReady(true);
        }, []);

        console.log('ADD EDIT INGREDIENTS', ingredients)

        const mentions = useMemo(
            () => ({
                allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
                mentionDenotationChars: ['@'],
                source: (searchTerm, renderList, mentionChar) => {
                    const list = ingredients;
                    const includesSearchTerm = list.filter((item) =>
                        item.ingredient.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    renderList(includesSearchTerm);
                },
                onSelect: (item, insertItem) => {
                    console.log('On select', item, insertItem);
                    console.log('Found item', ingredients.find(x => x.id.toString() === item.id));
                    insertItem(item);
                },
            }),
            []
        );

        // Create ref for the editor so we can clear on submit
        const editorRef = useRef<Editor>();

        // Listen for changes in instruction, suggest a timer if so
        useEffect(() => {
            const value: Timer = form.values.instruction;

            const types = ['hour', 'minute', 'second'];
            if (value && (value.length > 0)) {
                const update = {
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                };
                for (const type of types) {
                    let found = null;
                    if (type === 'hour') {
                        found = value.includes('hour') ? value.match(/([\d.]+) *hour/)[1] : null;
                    } else if (type === 'minute') {
                        found = value.includes('minute') ? value.match(/([\d.]+) *minute/)[1] : null;
                    } else if (type === 'second') {
                        found = value.includes('second') ? value.match(/([\d.]+) *second/)[1] : null;
                    }

                    if (found
                        // && (parseInt(found) !== (parseInt(value[type + 's'])))
                    ) {
                        // console.log('Found ' + type, found)
                        // console.log('Value object', value[type + 's'])
                        if (type === 'hour') {
                            update[`${type}s`] = parseInt(found);

                        } else if ((parseInt(found) < 60)) {
                            update[`${type}s`] = parseInt(found);
                        }
                    }
                }
                // if (!timersMatchCheck(value)) {
                if (
                    (value.hours !== update.hours) ||
                    (value.minutes !== update.minutes) ||
                    (value.seconds !== update.seconds)

                ) {
                    setSuggestedTimer(update);
                }
                // }
            } else {
                setSuggestedTimer(null);
            }
        }, [form.values.instruction]);

        const addSuggestedTimer = () => {
            setAddingTimer(true);
            form.setFieldValue('hours', suggestedTimer.hours);
            form.setFieldValue('minutes', suggestedTimer.minutes);
            form.setFieldValue('seconds', suggestedTimer.seconds);
            setSuggestedTimer(null);
        };

        return (
            <div>
                {winReady ?

                    <div style={{ position: 'relative', zIndex: 999 }}>
                        {/* {JSON.stringify(ingredients)} */}
                        <Grid>
                            {/* <TextInput
                    required
                    label="Instruction"
                    placeholder="E.g boil the rice for 10 minutes"
                    {...form.getInputProps('instruction')}
                /> */}
                            <Grid.Col span={6}>
                                <Stack>
                                    <RichTextEditor
                                        value={form.values.instruction}
                                        {...form.getInputProps('instruction')}
                                        // onChange={(e) => form.setFieldValue('instruction', e)}
                                        controls={[
                                            ['bold'],
                                            [],
                                            [],
                                            [],
                                        ]}
                                        mentions={mentions}
                                        placeholder="Add your step and tag ingredients with @"
                                        ref={editorRef}
                                    />

                                    {!timerIsEmpty(suggestedTimer) && !timersMatch &&
                                        <Group>
                                            <Button onClick={() => addSuggestedTimer()}>
                                                Add timer for {
                                                    convertTimerToString(suggestedTimer)
                                                }
                                            </Button>
                                        </Group>
                                    }

                                    {addingTimer ? (
                                        <Group>
                                            <NumberInput value={form.values.hours} label="Hours" onChange={(e: number) => form.setFieldValue('hours', e)} min={0} />
                                            <NumberInput value={form.values.minutes} label="Minutes" onChange={(e: number) => form.setFieldValue('minutes', e)} min={0} max={59} />
                                            <NumberInput value={form.values.seconds} label="Seconds" onChange={(e: number) => form.setFieldValue('seconds', e)} min={0} max={59} />
                                        </Group>) : null
                                    }

                                    <Group>
                                        {!addingTimer ? <Button onClick={() => setAddingTimer(true)} variant="light">Add timer</Button>
                                            : (
                                                <Button
                                                    onClick={() => {
                                                        setAddingTimer(false);
                                                        form.setFieldValue('hours', 0);
                                                        form.setFieldValue('minutes', 0);
                                                        form.setFieldValue('seconds', 0);
                                                    }}
                                                    variant="light"
                                                >Remove timer
                                                </Button>)
                                        }
                                    </Group>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                {(!form.values.image && !form.values.video) ?
                                    <ImageUpload
                                        id={1}
                                        setUrl={(e: string) => {
                                            form.setFieldValue('image', e);
                                            form.setFieldValue('video', '');
                                        }}
                                        setVideoUrl={(e: string) => {
                                            form.setFieldValue('video', e);
                                            form.setFieldValue('image', '');
                                        }}
                                        small
                                        title="Add an image or video to your instruction"
                                        buttonOnly

                                    /> : <MediaContainer
                                        remove={() => form.values.image ? form.setFieldValue('image', '') : form.setFieldValue('video', '')}
                                        media={form.values.image ? form.values.image : form.values.video}
                                        type={form.values.image ? 'image' : 'video'}
                                    />}
                            </Grid.Col>
                        </Grid>

                        <Group position="right" mt="md">
                            <Button type="button" onClick={() => onSubmit(form.values)}>{item ? 'Update' : 'Add'}</Button>
                        </Group>
                    </div> : null
                }
            </div>
        );
    }

    return <div></div>;
}
