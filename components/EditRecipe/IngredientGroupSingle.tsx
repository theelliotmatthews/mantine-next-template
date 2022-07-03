import { ActionIcon, Box, Card, Center, Group, Stack, Text, useMantineTheme } from '@mantine/core'
import React, { useEffect, useState } from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import { GripVertical, Plus } from 'tabler-icons-react'
import { IngredientGroup, RecipeIngredient } from '../../lib/types'
import AddEditIngredient from './AddEditIngredient'
import SingleIngredient from './SingleIngredient'

interface IngredientGroupSingleProps {
    ingredientsInGroup: any[],
    ingredientGroup: any,
    groupId: string,
    allIngredients: any[],
    deleteIngredient: Function,
    groups: IngredientGroup[],
    ingredients: RecipeIngredient[],
    setIngredients: Function,
    ingredientGroups: IngredientGroup[],
    setIngredientGroups: Function,
}

export default function IngredientGroupSingle(props: IngredientGroupSingleProps) {
    const { ingredientsInGroup, ingredientGroup, groupId, allIngredients, deleteIngredient, ingredients, setIngredients, ingredientGroups, setIngredientGroups } = props
    const theme = useMantineTheme();

    const [ingredientDetails, setIngredientDetails] = useState({})
    const [addingNewIngredientToGroup, setAddingNewIngredientToGroup] = useState(false)

    return (
        <Stack style={{ width: '100%' }}>

            <Droppable droppableId={groupId.toString()} key={groupId} type="ingredient" >
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                            background: !snapshot.isDraggingOver
                                ? 'white'
                                : '#F8F9FA',
                            paddingBottom: snapshot.isDraggingOver ? 60 : 0,
                            height: '100%',
                            width: '100%',
                            minHeight: 50,
                        }}
                    >
                        <Stack mt={8}>
                            {ingredientsInGroup.length === 0 &&
                                <Box
                                    sx={(theme) => ({
                                        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors[theme.primaryColor][0],
                                        textAlign: 'center',
                                        padding: theme.spacing.xl,
                                        borderRadius: theme.radius.md,
                                        '&:hover': {
                                            backgroundColor:
                                                theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
                                        },
                                    })}
                                >
                                    Drag an ingredient here
                                </Box>
                            }
                            {ingredientsInGroup.map((item, index) => (
                                <Draggable
                                    key={item}
                                    draggableId={item}
                                    index={index}

                                >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}

                                            style={{
                                                userSelect: 'none',
                                                // backgroundColor: snapshot.isDragging
                                                //     ? '#263B4A'
                                                //     : '#456C86',
                                                // color: 'white',
                                                ...provided.draggableProps.style,
                                            }}
                                        >
                                            <Card withBorder>
                                                <Group noWrap>
                                                    <div {...provided.dragHandleProps}>
                                                        <GripVertical size={16} />
                                                    </div>

                                                    <SingleIngredient
                                                        ingredient={allIngredients.find(x => x.id === item)}
                                                        deleteIngredient={deleteIngredient}
                                                        groups={ingredientGroups}
                                                        ingredients={ingredients}
                                                        setIngredients={setIngredients}
                                                        ingredientGroups={ingredientGroups}
                                                        setIngredientGroups={setIngredientGroups}
                                                    />
                                                </Group>
                                            </Card>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {!addingNewIngredientToGroup ?
                                <Center>
                                    <ActionIcon
                                        variant="light"
                                        color={theme.primaryColor}
                                        radius="xl"
                                        onClick={() => setAddingNewIngredientToGroup(true)}
                                    >
                                        <Plus />
                                    </ActionIcon>
                                </Center> :
                                <AddEditIngredient
                                    groups={ingredientGroups}
                                    ingredients={ingredients}
                                    setIngredients={setIngredients}
                                    ingredientGroups={ingredientGroups}
                                    setIngredientGroups={setIngredientGroups}
                                    cancelEditing={() => setAddingNewIngredientToGroup(false)}
                                    addingToGroup={groupId}
                                />
                            }
                        </Stack>
                        {/* {provided.placeholder} */}
                    </div>
                )}

            </Droppable>
        </Stack>
    )
}
