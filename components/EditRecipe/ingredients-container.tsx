import { FC, useState, useCallback, useEffect } from 'react'
import { Card } from './card'
import update from 'immutability-helper'
import Button from '../ui/button/button'
import AddIngredientGroup from './AddIngredientGroup'
import AddSingleIngredient from './AddSingleIngredient'
import { IngredientCard } from './unused/ingredient-card'

const style = {
    width: 400,
}

interface IngredientContainerProps {
    ingredients: any[],
    ingredientGroups: any[],
    addIngredient: Function,
    selectedGroup?: string,
    moveIngredient: Function,
}

export interface Item {
    id: number
    name: string
}

export interface ContainerState {
    groups: Item[]
}

export const IngredientsContainer = (props: IngredientContainerProps) => {

    // console.log('PROPS', props)
    const { ingredients, ingredientGroups, addIngredient, selectedGroup, moveIngredient } = props
    const [groups, setGroups] = useState(ingredients)
    const [addingNewIngredient, setAddingNewIngredient] = useState(false)


    const moveCard = useCallback((dragIndex: number, hoverIndex: number, id: number, ingredient: string) => {
        console.log('Ingredients in move card', ingredients)
        console.log('Groups in move card', groups)
        // console.log('Move ingredient function', moveIngredient)
        console.log(`Drag index: ${dragIndex}`)
        console.log(`Hover index: ${hoverIndex}`)
        console.log(`Selected group: ${selectedGroup}`)
        console.log(`Ingredient ID: ${id}`)
        console.log(`Ingredient name: ${ingredient}`)
        console.log('-----------------------------------')
        setGroups((prevCards: Item[]) =>
            update(prevCards, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, prevCards[dragIndex] as Item],
                ],
            }),
        )


        moveIngredient(groups[dragIndex], selectedGroup)

        console.log('Updated ingredients in order', ingredients)
    }, [])

    const renderGroup = useCallback(
        (card: { id: number; ingredient: string }, index: number) => {
            return (
                <IngredientCard
                    key={card.id}
                    index={index}
                    id={card.id}
                    text={card.ingredient}
                    moveCard={moveCard}

                />
            )
        },
        [],
    )

    useEffect(() => {
        console.log('INGREDIENTS THROUGH PROPS', ingredients)
        setGroups(ingredients)
    }, [ingredients])

    useEffect(() => {
        console.log('Groups updating HERE', groups)

    }, [groups])

    return (
        <>
            <div style={style}>{groups.map((ingredient, i) => renderGroup(ingredient, i))}</div>
            <div className="grid grid-cols-2 gap-4">
                <div className="border border-dashed border-blue-500 p-4 flex items-center justify-center">Drag items here</div>
                {!addingNewIngredient &&
                    <Button
                        as="button"
                        type="button"
                        background="primary-medium"
                        textColor="white"
                        onClick={() => setAddingNewIngredient(true)}
                    >
                        Add new ingredient
                    </Button>
                }
            </div>
            {addingNewIngredient && <AddSingleIngredient groups={ingredientGroups} addIngredient={(e) => {
                addIngredient(e)
                setAddingNewIngredient(false)

            }}
                selectedGroup={selectedGroup} />}
            <pre>{JSON.stringify(groups)}</pre>
        </>
    )

}
