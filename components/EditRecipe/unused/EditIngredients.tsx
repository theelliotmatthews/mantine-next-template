import React, { useEffect, useState } from 'react'
import IngredientGroupSingle from './unused/ingredient-group'
import { useDrop } from 'react-dnd'
import { IngredientGroup, RecipeGroup, RecipeIngredient } from '../../lib/types'
import AddIngredientGroup from './AddIngredientGroup'
import AddSingleIngredient from './AddSingleIngredient'
import { v4 as uuidv4 } from 'uuid';
import { IngredientExtractor } from './IngredientExtractor'
import Spinner from '../ui/Spinner'
import Micronutrients from '../nutrition/micro-nutrients'
import MicronutrientScoreBar from '../nutrition/micronutrient-score-bar'
import ScoreBar from '../ui/score-bar/score-bar'
import SimpleScoreBar from '../recipe/micronutrient-score-bar/micronutrient-score-bar'
import { DndListHandle } from './unused/ingredient-group-items'

interface EditIngredientsProps {
    updateIngredients: Function;
    setRecipeNutrients: Function;
    servings: number;
    existingIngredients?: RecipeGroup[];
    existingIngredientGroups?: IngredientGroup[]
}

export default function EditIngredients(props: EditIngredientsProps) {
    const { updateIngredients, setRecipeNutrients, servings, existingIngredients, existingIngredientGroups } = props

    const [groups, setGroups] = useState(
        // (existingIngredientGroups.length > 0) ? existingIngredientGroups :
        [
            {
                id: uuidv4(),
                name: 'No group',
            },
            {
                id: uuidv4(),
                name: 'For the sauce',
            },
            {
                id: uuidv4(),
                name: 'Crispy tofu',
            },
            {
                id: uuidv4(),
                name: 'Salad',
            },
            {
                id: uuidv4(),
                name: 'Baguette',
            }
        ])

    const [groupsCopy, setGroupsCopy] = useState([])

    const [addingNewGroup, setAddingNewGroup] = useState(false)
    const [addingNewIngredient, setAddingNewIngredient] = useState(false)
    const [ingredients, setIngredients] = useState(
        // (existingIngredients.length > 0) ? existingIngredients :
        [
            {
                group: "No group",
                ingredients: [],
            },
            {
                group: "For the sauce",
                ingredients: [
                    { "ingredient": "tofu", "quantity": 200, "unit": "g", "id": 1, "note": "" },
                    { "ingredient": "red rice", "quantity": 1, "unit": "cup", "id": 2, "note": "" },
                ]
            },
            {
                group: "Crispy tofu",
                ingredients: [
                    { "ingredient": "broccoli", "quantity": 200, "unit": "g", "id": 3, "note": "Big juicy heads" },
                    { "ingredient": "garlic", "quantity": 1, "unit": "clove", "id": 4, "note": "" }
                ]
            },
            {
                group: "Salad",
                ingredients: []
            },
            {
                group: "Baguette",
                ingredients: []
            }
        ])
    const [ingredientsCopy, setIngredientsCopy] = useState([])
    const [loadingNutrients, setLoadingNutrients] = useState(false)
    const [nutrients, setNutrients] = useState({})
    const [micronutrientScore, setMicronutrientScore] = useState(0)

    const createGroup = (data: any) => {
        console.log('Create group data', data)

        const newGroup = {
            name: data.name,
            id: uuidv4()
        }

        setGroups(prev => (
            [
                ...prev,
                newGroup
            ]
        ))

        const newIngredientGroup = {
            group: data.name,
            ingredients: []
        }

        setIngredients(prev => (
            [
                ...prev,
                newIngredientGroup
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

        const ingredientsCopy = [...ingredients]
        for (const group of ingredientsCopy) {
            if (group.group === oldName) {
                group.group = newName
            }
        }

        setGroups(copy)
        setIngredients(ingredientsCopy)
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
            id: uuidv4()
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

    const addIngredients = (ingredients: any[], group: IngredientGroup) => {
        console.log('Adding multiple ingredients', ingredients)
        for (const ingredient of ingredients) {
            addIngredient({
                ...ingredient,
                group: group ? group : 'No group'
            })
        }
    }

    const reorderGroup = (indexOfGroup: number, newIndex: number) => {
        // console.log(`Moving group ${group.name} to index ${newIndex}`)

        // // Find index of the group we are moving 
        // const indexOfGroup = groups.indexOf(groups.find(x => x.name === group.name))
        // console.log('Index of group', indexOfGroup)

        let groupCopy = [...groups]
        groupCopy.splice(newIndex, 0, groupCopy.splice(indexOfGroup, 1)[0])

        setGroupsCopy(groupCopy)
    }

    const removeGroup = (indexOfGroup: number, groupName: string) => {
        // const indexOfGroup = groups.indexOf(groups.find(x => x.name === group.name))
        // console.log('Index of group', indexOfGroup)

        let groupCopy = [...groups]
        groupCopy.splice(indexOfGroup, 1)

        setGroupsCopy(groupCopy)

        // Remove from ingredients as well
        const indexOfIngredientGroup = ingredients.indexOf(ingredients.find(x => x.group === groupName))
        console.log('Index of ingredient group', indexOfIngredientGroup)

        let ingredientCopy = [...ingredients]
        ingredientCopy.splice(indexOfIngredientGroup, 1)

        setIngredientsCopy(ingredientCopy)
    }

    const reorderIngredient = (ingredient: any, newIndex: number, oldGroupIndex: number, newGroup: any) => {
        console.log(`Moving ingredient ${ingredient.ingredient} to index ${newIndex} and from group index ${oldGroupIndex} into new group`, newGroup)

        let ingredientsCopy = [...ingredients]

        // Find the index this ingredient came from
        let fromGroupIndex = 0
        for (let x = 0; x < ingredientsCopy.length; x++) {
            for (const i of ingredientsCopy[x].ingredients) {
                if (i.id === ingredient.id) fromGroupIndex = x
            }
        }

        console.log('From group index', fromGroupIndex)

        // Find index of the ingredient we're moving to
        let toGroupIndex = 0
        for (let x = 0; x < ingredients.length; x++) {
            // console.log(`${newGroup.name} - ${ingredients[x].group}`)
            if (newGroup.name === ingredients[x].group) {
                toGroupIndex = x
            }
        }

        if (fromGroupIndex === toGroupIndex) {
            const indexOfIngredient = ingredientsCopy[fromGroupIndex].ingredients.indexOf(ingredientsCopy[fromGroupIndex].ingredients.find(x => x.id === ingredient.id))
            // console.log('Index of ingredient', indexOfIngredient)

            ingredientsCopy[fromGroupIndex].ingredients.splice(newIndex, 0, ingredientsCopy[fromGroupIndex].ingredients.splice(indexOfIngredient, 1)[0])
        } else {
            // Splice from old group index 
            const indexOfIngredient = ingredientsCopy[fromGroupIndex].ingredients.indexOf(ingredientsCopy[fromGroupIndex].ingredients.find(x => x.id === ingredient.id))

            ingredientsCopy[fromGroupIndex].ingredients.splice(indexOfIngredient, 1)

            // Insert into new group index
            ingredientsCopy[toGroupIndex].ingredients.splice(newIndex, 0, ingredient)
        }

        setIngredients(ingredientsCopy)
        // console.log('To group index', toGroupIndex)


        // // Find index of the group we are moving 
        // const indexOfGroup = groups.indexOf(groups.find(x => x.name === group.name))
        // console.log('Index of group', indexOfGroup)

        // let groupCopy = [...groups]
        // groupCopy.splice(newIndex, 0, groupCopy.splice(indexOfGroup, 1)[0])

        // // for (let x = 0; x < groupCopy.length; x++) {
        // //     groupCopy[x].order = x
        // // }

        // setGroupsCopy(groupCopy)
    }

    const removeIngredient = (id: number) => {
        console.log('Removing ingredient with ID: ', id)

        let ingredientsCopy = [...ingredients]

        // Find the index this ingredient came from
        let fromGroupIndex = 0
        for (let x = 0; x < ingredientsCopy.length; x++) {
            for (const i of ingredientsCopy[x].ingredients) {
                if (i.id === id) fromGroupIndex = x
            }
        }

        const indexOfIngredient = ingredientsCopy[fromGroupIndex].ingredients.indexOf(ingredientsCopy[fromGroupIndex].ingredients.find(x => x.id === id))

        ingredientsCopy[fromGroupIndex].ingredients.splice(indexOfIngredient, 1)

        setIngredientsCopy(ingredientsCopy)
    }

    const editIngredient = (ingredient: RecipeIngredient) => {
        console.log('Editing', ingredient)

        let ingredientsCopy = [...ingredients]

        // Find the index this ingredient came from
        let fromGroupIndex = 0
        for (let x = 0; x < ingredientsCopy.length; x++) {
            for (const i of ingredientsCopy[x].ingredients) {
                if (i.id === ingredient.id) fromGroupIndex = x
            }
        }

        // Splice from old group index 
        const indexOfIngredient = ingredientsCopy[fromGroupIndex].ingredients.indexOf(ingredientsCopy[fromGroupIndex].ingredients.find(x => x.id === ingredient.id))

        ingredientsCopy[fromGroupIndex].ingredients.splice(indexOfIngredient, 1)

        // Insert into new group index
        ingredientsCopy[fromGroupIndex].ingredients.splice(indexOfIngredient, 0, ingredient)

        setIngredientsCopy(ingredientsCopy)
    }

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'IngredientGroup',
        // drop: (item: { recipe: any }) => changeDateOfRecipeInPlanner(date, item.recipe),
        drop: (item: { group: IngredientGroup }) => {
            console.log('Dropping', drop)
            // return reorderRecipeInPlanner(item.recipe, 0, date)
        },
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
    }), [groups])

    // useEffect(() => {
    //     console.log('Our groups are changing order', groups)
    // }, [groups])

    useEffect(() => {
        if (groupsCopy.length > 0) setGroups(groupsCopy)
        if (ingredientsCopy.length > 0) setIngredients(ingredientsCopy)
    }, [groupsCopy, ingredientsCopy])

    useEffect(() => {
        updateIngredients({
            ingredients: ingredients,
            groups: groups
        })
    }, [ingredients, groups])

    useEffect(() => {
        const fetchNutrition = async () => {
            setLoadingNutrients(true)
            let ingredientsString = ''

            for (const group of ingredients) {
                for (const ingredient of group.ingredients) {
                    let string = ''
                    if (ingredient.quantity) string += `${ingredient.quantity} `
                    if (ingredient.unit) string += `${ingredient.unit} `
                    string += ingredient.ingredient
                    ingredientsString += `${string}, `
                }
            }

            await fetch("/api/ingredient-extractor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify({ ingredient_input: ingredientsString, servings: servings }),
            })
                .then(async (response) => {
                    let res = await response.json();
                    console.log('Nutrition res', res)
                    console.log('Nutrition res', res.response.nutrition_data.nutrients)

                    setRecipeNutrients({
                        nutritionPerServings: res.response.nutrition_data.nutrition_per_serving,
                        microNutrientScore: res.response.nutrition_data.micronutrient_score,
                    })

                    setNutrients(res.response.nutrition_data.nutrients)
                    setMicronutrientScore(res.response.nutrition_data.micronutrient_score)
                    setLoadingNutrients(false)


                })
                .catch(function (error) {
                    console.error("Error:", error);
                    return false
                });
            setLoadingNutrients(false)
        }

        fetchNutrition()

    }, [ingredients, servings])

    useEffect(() => {
        if (existingIngredients.length > 0) {
            setIngredients(existingIngredients)
        }
    }, [existingIngredients])

    // useEffect(() => {
    //     if (existingIngredientGroups.length > 0) {
    //         setGroups(existingIngredientGroups)
    //     }
    // }, [existingIngredientGroups])
    return (
        <div>
            <div>Add your ingredients</div>

            {/* <IngredientExtractor groups={groups} addIngredients={addIngredients} /> */}


            <div className="grid grid-cols-2 gap-4">
                {/* Ingredient droppable group container */}
                <div className="space-y-4">
                    {/* {groups.map((group, index) => {
                        return <IngredientGroupSingle
                            group={group}
                            key={index}
                            index={index}
                            reorderGroup={reorderGroup}
                            reorderIngredient={reorderIngredient}
                            ingredients={ingredients}
                            removeIngredient={removeIngredient}
                            renameGroup={renameGroup}
                            addIngredient={addIngredient}
                            groups={groups}
                            editIngredient={editIngredient}
                            removeGroup={removeGroup}
                        />
                    })} */}
                </div>
                {ingredients &&
                    <>
                        <DndListHandle
                            data={groups}
                            renameGroup={renameGroup}
                            groups={groups}
                            reorderGroup={reorderGroup}
                            removeGroup={removeGroup}
                            ingredients={ingredients}
                        // reorderInstruction={reorderInstruction}
                        // removeInstruction={removeInstruction}
                        // renameInstruction={renameInstruction}
                        // editInstruction={editInstruction}
                        />
                        <pre>{JSON.stringify(groups, null, 2)}</pre>
                        <pre>{JSON.stringify(ingredients, null, 2)}</pre>
                    </>
                }
                <div className="space-y-4">
                    {/* <AddIngredientGroup createGroup={createGroup} groups={groups} /> */}
                    {/* <AddSingleIngredient addIngredient={addIngredient} groups={groups} /> */}

                </div>

                {/* <pre>{JSON.stringify(ingredients, null, 2)}</pre> */}
            </div>

            <h1>Nutrition</h1>
            <p>Estimated recipe nutrients for {servings} servings</p>
            {loadingNutrients ? <Spinner /> :
                <>
                    <Micronutrients recipes={[{ servings: servings, nutrients: nutrients }]} />
                    {micronutrientScore && <SimpleScoreBar score={(micronutrientScore)} />}
                </>

            }
        </div>
    )
}
