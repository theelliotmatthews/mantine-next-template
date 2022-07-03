import { FC, useState, useCallback, useEffect } from 'react'
import { Card } from './card'
import update from 'immutability-helper'
import Button from '../ui/button/button'
import AddIngredientGroup from '../AddIngredientGroup'
import AddSingleIngredient from '../AddSingleIngredient'

const style = {
    width: 400,
}

export interface Item {
    id: number
    name: string
}

export interface ContainerState {
    groups: Item[]
}

export const Container: FC = () => {
    {
        const [groups, setGroups] = useState([
            {
                id: 1,
                name: 'For the sauce',
            },
            {
                id: 2,
                name: 'Crispy tofu',
            }

        ])

        const [addingNewGroup, setAddingNewGroup] = useState(false)
        const [addingNewIngredient, setAddingNewIngredient] = useState(false)
        const [ingredients, setIngredients] = useState([
            {
                group: "For the sauce",
                ingredients: [
                    { "ingredient": "tofu", "quantity": 1, "unit": "bulb", "group": "For the sauce", "id": 1 },
                    { "ingredient": "red rice", "quantity": 1, "unit": "bulb", "group": "For the sauce", "id": 2 },
                ]
            },
            {
                group: "Crispy tofu",
                ingredients: [
                    { "ingredient": "broccoli", "quantity": 1, "unit": "bulb", "group": "Crispy tofu", "id": 3 },
                    { "ingredient": "garlic", "quantity": 1, "unit": "bulb", "group": "Crispy tofu", "id": 4 }
                ]
            }
        ])

        const createGroup = (data: any) => {
            console.log('Create group data', data)

            const newGroup = {
                name: data.name,
                id: groups.length + 1
            }

            setGroups(prev => (
                [
                    ...prev,
                    newGroup
                ]
            ))

            setAddingNewGroup(false)
        }

        const renameGroup = (oldName: string, newName: string) => {
            console.log(`${oldName} ---> ${newName}`)
            if (oldName === newName) return
            // Change group of all ingredients


            // Rename group
            const copy = [...groups]

            for (const group of copy) {
                if (group.name === oldName) {
                    group.name = newName
                }
            }

            setGroups(copy)
        }

        const addIngredient = (ingredient: any) => {


            // Work out index of current ingredient and assign id
            let ingredientsInSameGroup = 0
            ingredients.forEach(group => {
                group.ingredients.forEach(i => {
                    ingredientsInSameGroup++
                })
            })

            const orderedIngredient = {
                ...ingredient,
                id: ingredientsInSameGroup + 1
            }

            console.log('Ordered ingredient', orderedIngredient)

            let ingredientsCopy = [...ingredients]
            for (const group of ingredientsCopy) {
                if (group.group === ingredient.group) {
                    group.ingredients.push(orderedIngredient)
                }
            }

            setIngredients((prev) => (
                ingredientsCopy
            ))
            setAddingNewIngredient(false)
        }

        const moveIngredient = (ingredient: any, newGroup: string) => {
            console.log('--------------------------------------')
            console.log('Moving ingredient', ingredient)
            console.log('To new group', newGroup)


        }

        const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
            setGroups((prevCards: Item[]) =>
                update(prevCards, {
                    $splice: [
                        [dragIndex, 1],
                        [hoverIndex, 0, prevCards[dragIndex] as Item],
                    ],
                }),
            )
        }, [])

        const renderGroup = useCallback(
            (card: { id: number; name: string }, index: number) => {
                return (
                    <Card
                        key={card.id}
                        index={index}
                        id={card.id}
                        text={card.name}
                        moveCard={moveCard}
                        groups={groups}
                        ingredients={ingredients}
                        renameGroup={renameGroup}
                        addIngredient={addIngredient}
                        moveIngredient={moveIngredient}
                    />
                )
            },
            [ingredients],
        )

        useEffect(() => {
            console.log('Render again with ingredients change', ingredients)
        }, [ingredients])

        return (
            <>
                <div style={style}>{groups.map((group, i) => renderGroup(group, i))}</div>

                {!addingNewGroup ?
                    <Button
                        as="button"
                        type="button"
                        background="primary-medium"
                        textColor="white"
                        onClick={() => setAddingNewGroup(true)}
                    >
                        Add new group
                    </Button>
                    :
                    <AddIngredientGroup createGroup={createGroup} groups={groups} />

                }
                {!addingNewIngredient ?
                    <Button
                        as="button"
                        type="button"
                        background="primary-medium"
                        textColor="white"
                        onClick={() => setAddingNewIngredient(true)}
                    >
                        Add new ingredient
                    </Button>
                    :
                    <AddSingleIngredient addIngredient={addIngredient} groups={groups} />

                }

                <pre>{JSON.stringify(groups)}</pre>
                <pre>{JSON.stringify(ingredients)}</pre>
            </>
        )
    }
}
