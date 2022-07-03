import { useEffect, useState, useContext } from 'react';
import { fetchIngredientData } from '../../lib/ingredients/ingredients';
import { Recipe } from '../../lib/types';
import { ChangeAmountButton } from '../ChangeAmountButton/ChangeAmountButton';
import { DailyDozen } from '../DailyDozen/DailyDozen';

interface RecipeNutritionProps {
    recipe: Recipe;
}

export function RecipeNutrition(props: RecipeNutritionProps) {
    const { recipe } = props;

    const [view, setView] = useState('formatted');
    const [unit, setUnit] = useState('original');
    const [serves, setServes] = useState(recipe.servings ? recipe.servings : 1);
    const [servesMultiplier, setServesMultiplier] = useState(1);
    const [ingredientsInGroups, setIngredientsInGroups] = useState([]);
    const [ingredientsWithData, setIngredientsWithData] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [amazonFormattedIngredients, setAmazonFormattedIngredients] = useState([]);

    // Listen to serves change to update multiplier
    useEffect(() => {
        setServesMultiplier((recipe.servings ? recipe.servings : 1) / serves);
    }, [serves]);

    // Fetch data for each ingredient
    useEffect(() => {
        const fetchData = async () => {
            const copy = [...recipe.ingredients_formatted];
            const promises = [];
            for (const ingredient of copy) {
                if (!ingredient.data) {
                    const promise = fetchIngredientData(ingredient.ingredient);
                    promises.push(promise);
                }
            }

            // Match up
            if (promises.length > 0) {
                await Promise.all(promises).then((values) => {
                    // Match up
                    for (const ingredient of copy) {
                        for (const r of values) {
                            if (r && (ingredient.ingredient === r.ingredient)) {
                                ingredient.data = { ...r };
                                break;
                            }
                        }
                    }
                });
            }

            setIngredientsWithData(copy);
            setDataFetched(true);
        };

        fetchData();
    }, []);

    // Sort ingredients into groups
    useEffect(() => {
        if (ingredientsWithData && dataFetched) {
            const groups = [{
                name: null,
                ingredients: [],
            }];

            recipe.ingredients_formatted.forEach(ingredient => {
                if (ingredient.group) {
                    const namedGroup = groups.find(x => x.name === ingredient.group);

                    if (namedGroup) {
                        namedGroup.ingredients.push(ingredient);
                    } else {
                        groups.push({
                            name: ingredient.group,
                            ingredients: [ingredient],
                        });
                    }
                } else {
                    const noNameGroup = groups.find(x => x.name === null);
                    noNameGroup.ingredients.push(ingredient);
                }
            });

            setIngredientsInGroups(groups);
        }
    }, [ingredientsWithData, dataFetched]);

    // Populate Amazon fresh basket
    useEffect(() => {
        const amazonIngredients = [];
        for (const ingredient of recipe.ingredients_formatted) {
            amazonIngredients.push({ ...ingredient, combinedAmounts: [{ unit: ingredient.unit, quantity: ingredient.quantity }] });
        }
        setAmazonFormattedIngredients([{
            combinedIngredients: amazonIngredients,
        }]);
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>Nutrient Breakdown</div>
                <ChangeAmountButton onChange={setServes} amount={serves} iconPrefix="1 of" iconSuffix="servings" />
            </div>

            {/* <Micronutrients recipes={[{ ...recipe, servings: serves }]} /> */}

            {/* <ScoreBar score={recipe.micronutrient_score} /> */}

            <DailyDozen recipes={[{ ...recipe, servings: serves }]} />

        </div>
    );
}

export default RecipeNutrition;
