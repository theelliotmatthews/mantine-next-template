const microLabels = [
  "NA",
  "CA",
  "MG",
  "K",
  "FE",
  "ZN",
  "P",
  "VITA_RAE",
  "VITC",
  "THIA",
  "RIBF",
  "NIA",
  "VITB6A",
  "FOLDFE",
  "VITB12",
  "VITD",
  "TOPCHA",
  "VITK1",
];

const microNutrientsWithRecs = {
  NA: {
    unit: "mg",
    lower_rec: 1500,
    upper_rec: 2300,
    total: 0,
    link: "https://www.healthline.com/nutrition/sodium-per-day//bottom-line",
    label: "Sodium",
  },
  CA: {
    unit: "mg",
    lower_rec: 1000,
    upper_rec: 1200,
    total: 0,
    link: "https://www.healthline.com/nutrition/15-calcium-rich-foods//:~:text=The%20recommended%20daily%20intake%20(RDI,advised%20to%20consume%201%2C300%20mg.",
  },
  MG: {
    unit: "mg",
    lower_rec: 310,
    upper_rec: 420,
    total: 0,
    link: "https://www.healthline.com/nutrition/magnesium-dosage",
  },
  K: {
    unit: "mg",
    lower_rec: 3500,
    upper_rec: 4700,
    total: 0,
    link: "https://www.healthline.com/nutrition/how-much-potassium-per-day//:~:text=In%20short%2C%20aim%20to%20consume,of%20potassium%20daily%20from%20foods.",
  },
  FE: {
    unit: "mg",
    lower_rec: 18,
    upper_rec: 8,
    total: 0,
    link: "https://www.healthline.com/nutrition/increase-iron-absorption//:~:text=Iron%20is%20also%20a%20component,for%20pregnant%20women%20(2).",
  },
  ZN: {
    unit: "mg",
    lower_rec: 8,
    upper_rec: 11,
    total: 0,
    link: "https://www.healthline.com/nutrition/zinc//:~:text=The%20recommended%20daily%20intake%20(RDI,day%2C%20respectively%20(%2037%20).",
  },
  P: {
    unit: "mg",
    lower_rec: 700,
    upper_rec: 1250,
    total: 0,
    link: "https://www.healthline.com/health/phosphorus-in-diet//dietary-recommendations",
  },

  VITA_RAE: {
    unit: "mcg",
    lower_rec: 700,
    upper_rec: 900,
    total: 0,
    link: "https://www.healthline.com/nutrition/vitamin-a//toxicity-and-dosage",
  },
  VITC: {
    unit: "mg",
    lower_rec: 75,
    upper_rec: 90,
    total: 0,
    link: "https://www.healthline.com/nutrition/vitamin-c-benefits//:~:text=The%20recommended%20daily%20intake%20for,taking%20a%20vitamin%20C%20supplement.",
  },
  THIA: {
    unit: "mg",
    lower_rec: 1.1,
    upper_rec: 1.2,
    total: 0,
    link: "https://www.healthline.com/nutrition/thiamine-deficiency-symptoms//:~:text=The%20recommended%20daily%20intake%20for,and%201.1%20mg%20for%20women.",
  },
  RIBF: {
    unit: "mg",
    lower_rec: 1.1,
    upper_rec: 1.3,
    total: 0,
    link: "https://www.healthline.com/health/vitamin-watch-what-does-b2-do//getting-enough",
  },
  NIA: {
    unit: "mg",
    lower_rec: 14,
    upper_rec: 16,
    total: 0,
    link: "https://www.healthline.com/nutrition/niacin-benefits//:~:text=Summary%20The%20recommended%20amount%20of,need%2014%20mg%20per%20day.",
  },
  VITB6A: {
    unit: "mg",
    lower_rec: 1.3,
    upper_rec: 1.7,
    total: 0,
    link: "https://www.healthline.com/nutrition/vitamin-b6-benefits//TOC_TITLE_HDR_11",
  },
  FOLDFE: {
    unit: "mcg",
    lower_rec: 400,
    upper_rec: 400,
    total: 0,
    link: "https://www.healthline.com/nutrition/folic-acid-side-effects//:~:text=The%20RDI%20for%20folate%20is,%E2%80%93800%20mcg%20(1).",
  },
  VITB12: {
    unit: "mcg",
    lower_rec: 2.4,
    upper_rec: 2.4,
    total: 0,
    link: "https://www.healthline.com/nutrition/too-much-vitamin-b12//:~:text=For%20reference%2C%20the%20recommended%20daily,a%20higher%20need%20(11).",
  },
  VITD: {
    unit: "mcg",
    lower_rec: 10,
    upper_rec: 20,
    total: 0,
    link: "https://www.healthline.com/nutrition/how-much-vitamin-d-to-take//:~:text=Vitamin%20D%20intake%20is%20recommended,to%20maintain%20optimal%20blood%20levels.",
  },
  // TOPCHA: {
  //   unit: "mcg",
  //   lower_rec: 15,
  //   upper_rec: 15,
  //   total: 0,
  //   link:
  //     "https://www.healthline.com/health/vitamin-e-for-skin//:~:text=The%20amount%20of%20vitamin%20E,E%20in%20their%20daily%20diet.",
  // },
  VITK1: {
    unit: "mcg",
    lower_rec: 90,
    upper_rec: 120,
    total: 0,
    link: "https://www.healthline.com/health/foods-high-in-vitamin-k",
  },
};

export function calculateNutrients(nutrientObject, servings) {
  let totalMicroNutrients = {
    NA: {
      unit: "mg",
      lower_rec: 1500,
      upper_rec: 2300,
      total: 0,
      link: "https://www.healthline.com/nutrition/sodium-per-day//bottom-line",
      label: "Sodium",
    },
    CA: {
      unit: "mg",
      lower_rec: 1000,
      upper_rec: 1200,
      total: 0,
      link: "https://www.healthline.com/nutrition/15-calcium-rich-foods//:~:text=The%20recommended%20daily%20intake%20(RDI,advised%20to%20consume%201%2C300%20mg.",
    },
    MG: {
      unit: "mg",
      lower_rec: 310,
      upper_rec: 420,
      total: 0,
      link: "https://www.healthline.com/nutrition/magnesium-dosage",
    },
    K: {
      unit: "mg",
      lower_rec: 3500,
      upper_rec: 4700,
      total: 0,
      link: "https://www.healthline.com/nutrition/how-much-potassium-per-day//:~:text=In%20short%2C%20aim%20to%20consume,of%20potassium%20daily%20from%20foods.",
    },
    FE: {
      unit: "mg",
      lower_rec: 18,
      upper_rec: 8,
      total: 0,
      link: "https://www.healthline.com/nutrition/increase-iron-absorption//:~:text=Iron%20is%20also%20a%20component,for%20pregnant%20women%20(2).",
    },
    ZN: {
      unit: "mg",
      lower_rec: 8,
      upper_rec: 11,
      total: 0,
      link: "https://www.healthline.com/nutrition/zinc//:~:text=The%20recommended%20daily%20intake%20(RDI,day%2C%20respectively%20(%2037%20).",
    },
    P: {
      unit: "mg",
      lower_rec: 700,
      upper_rec: 1250,
      total: 0,
      link: "https://www.healthline.com/health/phosphorus-in-diet//dietary-recommendations",
    },

    VITA_RAE: {
      unit: "mcg",
      lower_rec: 700,
      upper_rec: 900,
      total: 0,
      link: "https://www.healthline.com/nutrition/vitamin-a//toxicity-and-dosage",
    },
    VITC: {
      unit: "mg",
      lower_rec: 75,
      upper_rec: 90,
      total: 0,
      link: "https://www.healthline.com/nutrition/vitamin-c-benefits//:~:text=The%20recommended%20daily%20intake%20for,taking%20a%20vitamin%20C%20supplement.",
    },
    THIA: {
      unit: "mg",
      lower_rec: 1.1,
      upper_rec: 1.2,
      total: 0,
      link: "https://www.healthline.com/nutrition/thiamine-deficiency-symptoms//:~:text=The%20recommended%20daily%20intake%20for,and%201.1%20mg%20for%20women.",
    },
    RIBF: {
      unit: "mg",
      lower_rec: 1.1,
      upper_rec: 1.3,
      total: 0,
      link: "https://www.healthline.com/health/vitamin-watch-what-does-b2-do//getting-enough",
    },
    NIA: {
      unit: "mg",
      lower_rec: 14,
      upper_rec: 16,
      total: 0,
      link: "https://www.healthline.com/nutrition/niacin-benefits//:~:text=Summary%20The%20recommended%20amount%20of,need%2014%20mg%20per%20day.",
    },
    VITB6A: {
      unit: "mg",
      lower_rec: 1.3,
      upper_rec: 1.7,
      total: 0,
      link: "https://www.healthline.com/nutrition/vitamin-b6-benefits//TOC_TITLE_HDR_11",
    },
    FOLDFE: {
      unit: "mcg",
      lower_rec: 400,
      upper_rec: 400,
      total: 0,
      link: "https://www.healthline.com/nutrition/folic-acid-side-effects//:~:text=The%20RDI%20for%20folate%20is,%E2%80%93800%20mcg%20(1).",
    },
    VITB12: {
      unit: "mcg",
      lower_rec: 2.4,
      upper_rec: 2.4,
      total: 0,
      link: "https://www.healthline.com/nutrition/too-much-vitamin-b12//:~:text=For%20reference%2C%20the%20recommended%20daily,a%20higher%20need%20(11).",
    },
    VITD: {
      unit: "mcg",
      lower_rec: 10,
      upper_rec: 20,
      total: 0,
      link: "https://www.healthline.com/nutrition/how-much-vitamin-d-to-take//:~:text=Vitamin%20D%20intake%20is%20recommended,to%20maintain%20optimal%20blood%20levels.",
    },
    // TOPCHA: {
    //   unit: "mcg",
    //   lower_rec: 15,
    //   upper_rec: 15,
    //   total: 0,
    //   link:
    //     "https://www.healthline.com/health/vitamin-e-for-skin//:~:text=The%20amount%20of%20vitamin%20E,E%20in%20their%20daily%20diet.",
    // },
    VITK1: {
      unit: "mcg",
      lower_rec: 90,
      upper_rec: 120,
      total: 0,
      link: "https://www.healthline.com/health/foods-high-in-vitamin-k",
    },
  };

  let nutrients = [];

  for (const [key, value] of Object.entries(nutrientObject)) {
    if (microLabels.includes(key)) {
      nutrients.push({ label: key, info: value });
    }
  }

  let totalPercentage = 0;
  nutrients.forEach((nutrient) => {
    if (totalMicroNutrients && totalMicroNutrients[nutrient.label]) {
      totalMicroNutrients[nutrient.label].total =
        nutrient.info.quantity / servings;
    }
    totalMicroNutrients[nutrient.label].label = nutrient.info.label;

    let percentage =
      Math.ceil(
        (Math.ceil(nutrient.info.quantity / servings) /
          totalMicroNutrients[nutrient.label].lower_rec) *
          100
      ) > 99
        ? 100
        : Math.ceil(
            (nutrient.info.quantity /
              servings /
              totalMicroNutrients[nutrient.label].lower_rec) *
              100
          );
    totalPercentage += percentage;
  });

  if (nutrients.length == 0) {
    totalMicroNutrients = null;
    return;
  }

  // Macros
  let totalProtein =
    Math.round((nutrientObject["PROCNT"].quantity / servings) * 10) / 10;
  let totalCarbs =
    Math.round((nutrientObject["CHOCDF"].quantity / servings) * 10) / 10;
  let totalFat =
    Math.round((nutrientObject["FAT"].quantity / servings) * 10) / 10;
  let totalCalories = Math.ceil(
    totalProtein * 4 + totalCarbs * 4 + totalFat * 9
  );

  // Working before
  let totalMicroNutrientScore = Math.ceil(totalPercentage / nutrients.length);

  return {
    score: totalMicroNutrientScore,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat,
    calories: totalCalories,
  };
}

// export function totalNutrients(recipes) {
//   let totalMicroNutrients = {
//     NA: {
//       unit: "mg",
//       lower_rec: 1500,
//       upper_rec: 2300,
//       total: 0,
//       link: "https://www.healthline.com/nutrition/sodium-per-day//bottom-line",
//       label: "Sodium",
//     },
//     CA: {
//       unit: "mg",
//       lower_rec: 1000,
//       upper_rec: 1200,
//       total: 0,
//       link: "https://www.healthline.com/nutrition/15-calcium-rich-foods//:~:text=The%20recommended%20daily%20intake%20(RDI,advised%20to%20consume%201%2C300%20mg.",
//     },
//     MG: {
//       unit: "mg",
//       lower_rec: 310,
//       upper_rec: 420,
//       total: 0,
//       link: "https://www.healthline.com/nutrition/magnesium-dosage",
//     },
//     K: {
//       unit: "mg",
//       lower_rec: 3500,
//       upper_rec: 4700,
//       total: 0,
//       link: "https://www.healthline.com/nutrition/how-much-potassium-per-day//:~:text=In%20short%2C%20aim%20to%20consume,of%20potassium%20daily%20from%20foods.",
//     },
//     FE: {
//       unit: "mg",
//       lower_rec: 18,
//       upper_rec: 8,
//       total: 0,
//       link: "https://www.healthline.com/nutrition/increase-iron-absorption//:~:text=Iron%20is%20also%20a%20component,for%20pregnant%20women%20(2).",
//     },
//     ZN: {
//       unit: "mg",
//       lower_rec: 8,
//       upper_rec: 11,
//       total: 0,
//       link: "https://www.healthline.com/nutrition/zinc//:~:text=The%20recommended%20daily%20intake%20(RDI,day%2C%20respectively%20(%2037%20).",
//     },
//     P: {
//       unit: "mg",
//       lower_rec: 700,
//       upper_rec: 1250,
//       total: 0,
//       link: "https://www.healthline.com/health/phosphorus-in-diet//dietary-recommendations",
//     },

//     VITA_RAE: {
//       unit: "mcg",
//       lower_rec: 700,
//       upper_rec: 900,
//       total: 0,
//       link: "https://www.healthline.com/nutrition/vitamin-a//toxicity-and-dosage",
//     },
//     VITC: {
//       unit: "mg",
//       lower_rec: 75,
//       upper_rec: 90,
//       total: 0,
//       link: "https://www.healthline.com/nutrition/vitamin-c-benefits//:~:text=The%20recommended%20daily%20intake%20for,taking%20a%20vitamin%20C%20supplement.",
//     },
//     THIA: {
//       unit: "mg",
//       lower_rec: 1.1,
//       upper_rec: 1.2,
//       total: 0,
//       link: "https://www.healthline.com/nutrition/thiamine-deficiency-symptoms//:~:text=The%20recommended%20daily%20intake%20for,and%201.1%20mg%20for%20women.",
//     },
//     RIBF: {
//       unit: "mg",
//       lower_rec: 1.1,
//       upper_rec: 1.3,
//       total: 0,
//       link: "https://www.healthline.com/health/vitamin-watch-what-does-b2-do//getting-enough",
//     },
//     NIA: {
//       unit: "mg",
//       lower_rec: 14,
//       upper_rec: 16,
//       total: 0,
//       link: "https://www.healthline.com/nutrition/niacin-benefits//:~:text=Summary%20The%20recommended%20amount%20of,need%2014%20mg%20per%20day.",
//     },
//     VITB6A: {
//       unit: "mg",
//       lower_rec: 1.3,
//       upper_rec: 1.7,
//       total: 0,
//       link: "https://www.healthline.com/nutrition/vitamin-b6-benefits//TOC_TITLE_HDR_11",
//     },
//     FOLDFE: {
//       unit: "mcg",
//       lower_rec: 400,
//       upper_rec: 400,
//       total: 0,
//       link: "https://www.healthline.com/nutrition/folic-acid-side-effects//:~:text=The%20RDI%20for%20folate%20is,%E2%80%93800%20mcg%20(1).",
//     },
//     VITB12: {
//       unit: "mcg",
//       lower_rec: 2.4,
//       upper_rec: 2.4,
//       total: 0,
//       link: "https://www.healthline.com/nutrition/too-much-vitamin-b12//:~:text=For%20reference%2C%20the%20recommended%20daily,a%20higher%20need%20(11).",
//     },
//     VITD: {
//       unit: "mcg",
//       lower_rec: 10,
//       upper_rec: 20,
//       total: 0,
//       link: "https://www.healthline.com/nutrition/how-much-vitamin-d-to-take//:~:text=Vitamin%20D%20intake%20is%20recommended,to%20maintain%20optimal%20blood%20levels.",
//     },
//     // TOPCHA: {
//     //   unit: "mcg",
//     //   lower_rec: 15,
//     //   upper_rec: 15,
//     //   total: 0,
//     //   link:
//     //     "https://www.healthline.com/health/vitamin-e-for-skin//:~:text=The%20amount%20of%20vitamin%20E,E%20in%20their%20daily%20diet.",
//     // },
//     VITK1: {
//       unit: "mcg",
//       lower_rec: 90,
//       upper_rec: 120,
//       total: 0,
//       link: "https://www.healthline.com/health/foods-high-in-vitamin-k",
//     },
//   };

//   let totalCarbs = 0;
//   let totalFat = 0;
//   let totalProtein = 0;

//   recipes.forEach((recipe) => {
//     let nutrients = [];

//     //console.log('Recipe nutrients', recipe.nutrients)
//     if (!recipe.nutrients) return;

//     console.log("Recipe.servings", recipe.servings);
//     console.log("Recipe.servingsAdjusted", recipe.servingsAdjusted);
//     console.log("Recipe", recipe);
//     for (const [key, value] of Object.entries(recipe.nutrients)) {
//       if (microLabels.includes(key)) {
//         nutrients.push({ label: key, info: value });
//       }
//     }

//     nutrients.forEach((nutrient) => {
//       if (totalMicroNutrients && totalMicroNutrients[nutrient.label]) {
//         totalMicroNutrients[nutrient.label].total +=
//           nutrient.info.quantity / recipe.servings;
//         // recipe.servingsAdjusted
//         //   ? recipe.servingsAdjusted
//         //   : recipe.servings;
//       }
//       totalMicroNutrients[nutrient.label].label = nutrient.info.label;
//     });

//     if (recipe.nutrients["PROCNT"] == undefined) {
//       return;
//     }

//     totalProtein +=
//       Math.round(
//         (recipe.nutrients["PROCNT"].quantity /
//           (recipe.servingsAdjusted
//             ? recipe.servingsAdjusted
//             : recipe.servings)) *
//           10
//       ) / 10;
//     totalCarbs +=
//       Math.round(
//         (recipe.nutrients["CHOCDF"].quantity /
//           (recipe.servingsAdjusted
//             ? recipe.servingsAdjusted
//             : recipe.servings)) *
//           10
//       ) / 10;
//     totalFat +=
//       Math.round(
//         (recipe.nutrients["FAT"].quantity /
//           (recipe.servingsAdjusted
//             ? recipe.servingsAdjusted
//             : recipe.servings)) *
//           10
//       ) / 10;
//   });

//   let totalCalories = Math.ceil(
//     totalProtein * 4 + totalCarbs * 4 + totalFat * 9
//   );

//   // Sort into final array
//   let microNutrients = [];
//   for (const [key, value] of Object.entries(totalMicroNutrients)) {
//     if (microLabels.includes(key)) {
//       microNutrients.push({ label: key, info: value });
//     }
//   }

//   function compare(a, b) {
//     if (a.info.label < b.info.label) {
//       return -1;
//     }
//     if (a.info.label > b.info.label) {
//       return 1;
//     }
//     return 0;
//   }

//   microNutrients.sort(compare);

//   let totalPercentage = 0;
//   let nutrientsLength = 0;
//   microNutrients.forEach((nutrient) => {
//     let percentage =
//       Math.ceil(
//         (Math.ceil(nutrient.info.total) / nutrient.info.lower_rec) * 100
//       ) > 99
//         ? 100
//         : Math.ceil((nutrient.info.total / nutrient.info.lower_rec) * 100);
//     nutrient.percentage = percentage;
//     totalPercentage += percentage;
//     nutrientsLength++;
//   });

//   // Working before
//   let totalMicroNutrientScore = Math.ceil(totalPercentage / nutrientsLength);

//   return {
//     score: totalMicroNutrientScore,
//     protein: totalProtein,
//     carbs: totalCarbs,
//     fat: totalFat,
//     calories: totalCalories,
//     microNutrients: microNutrients,
//   };
// }

// Used when users are creating their own recipes

export function totalNutrients(calculatorRecipes) {
  //console.log('Content', context)
  //console.log('state', store)
  let totalMicroNutrients = {
    NA: {
      unit: "mg",
      lower_rec: 1500,
      upper_rec: 2300,
      total: 0,
      link: "https://www.healthline.com/nutrition/sodium-per-day//bottom-line",
      label: "Sodium",
    },
    CA: {
      unit: "mg",
      lower_rec: 1000,
      upper_rec: 1200,
      total: 0,
      link: "https://www.healthline.com/nutrition/15-calcium-rich-foods//:~:text=The%20recommended%20daily%20intake%20(RDI,advised%20to%20consume%201%2C300%20mg.",
    },
    MG: {
      unit: "mg",
      lower_rec: 310,
      upper_rec: 420,
      total: 0,
      link: "https://www.healthline.com/nutrition/magnesium-dosage",
    },
    K: {
      unit: "mg",
      lower_rec: 3500,
      upper_rec: 4700,
      total: 0,
      link: "https://www.healthline.com/nutrition/how-much-potassium-per-day//:~:text=In%20short%2C%20aim%20to%20consume,of%20potassium%20daily%20from%20foods.",
    },
    FE: {
      unit: "mg",
      lower_rec: 18,
      upper_rec: 8,
      total: 0,
      link: "https://www.healthline.com/nutrition/increase-iron-absorption//:~:text=Iron%20is%20also%20a%20component,for%20pregnant%20women%20(2).",
    },
    ZN: {
      unit: "mg",
      lower_rec: 8,
      upper_rec: 11,
      total: 0,
      link: "https://www.healthline.com/nutrition/zinc//:~:text=The%20recommended%20daily%20intake%20(RDI,day%2C%20respectively%20(%2037%20).",
    },
    P: {
      unit: "mg",
      lower_rec: 700,
      upper_rec: 1250,
      total: 0,
      link: "https://www.healthline.com/health/phosphorus-in-diet//dietary-recommendations",
    },

    VITA_RAE: {
      unit: "mcg",
      lower_rec: 700,
      upper_rec: 900,
      total: 0,
      link: "https://www.healthline.com/nutrition/vitamin-a//toxicity-and-dosage",
    },
    VITC: {
      unit: "mg",
      lower_rec: 75,
      upper_rec: 90,
      total: 0,
      link: "https://www.healthline.com/nutrition/vitamin-c-benefits//:~:text=The%20recommended%20daily%20intake%20for,taking%20a%20vitamin%20C%20supplement.",
    },
    THIA: {
      unit: "mg",
      lower_rec: 1.1,
      upper_rec: 1.2,
      total: 0,
      link: "https://www.healthline.com/nutrition/thiamine-deficiency-symptoms//:~:text=The%20recommended%20daily%20intake%20for,and%201.1%20mg%20for%20women.",
    },
    RIBF: {
      unit: "mg",
      lower_rec: 1.1,
      upper_rec: 1.3,
      total: 0,
      link: "https://www.healthline.com/health/vitamin-watch-what-does-b2-do//getting-enough",
    },
    NIA: {
      unit: "mg",
      lower_rec: 14,
      upper_rec: 16,
      total: 0,
      link: "https://www.healthline.com/nutrition/niacin-benefits//:~:text=Summary%20The%20recommended%20amount%20of,need%2014%20mg%20per%20day.",
    },
    VITB6A: {
      unit: "mg",
      lower_rec: 1.3,
      upper_rec: 1.7,
      total: 0,
      link: "https://www.healthline.com/nutrition/vitamin-b6-benefits//TOC_TITLE_HDR_11",
    },
    FOLDFE: {
      unit: "mcg",
      lower_rec: 400,
      upper_rec: 400,
      total: 0,
      link: "https://www.healthline.com/nutrition/folic-acid-side-effects//:~:text=The%20RDI%20for%20folate%20is,%E2%80%93800%20mcg%20(1).",
    },
    VITB12: {
      unit: "mcg",
      lower_rec: 2.4,
      upper_rec: 2.4,
      total: 0,
      link: "https://www.healthline.com/nutrition/too-much-vitamin-b12//:~:text=For%20reference%2C%20the%20recommended%20daily,a%20higher%20need%20(11).",
    },
    VITD: {
      unit: "mcg",
      lower_rec: 10,
      upper_rec: 20,
      total: 0,
      link: "https://www.healthline.com/nutrition/how-much-vitamin-d-to-take//:~:text=Vitamin%20D%20intake%20is%20recommended,to%20maintain%20optimal%20blood%20levels.",
    },
    // TOPCHA: {
    //   unit: "mcg",
    //   lower_rec: 15,
    //   upper_rec: 15,
    //   total: 0,
    //   link:
    //     "https://www.healthline.com/health/vitamin-e-for-skin//:~:text=The%20amount%20of%20vitamin%20E,E%20in%20their%20daily%20diet.",
    // },
    VITK1: {
      unit: "mcg",
      lower_rec: 90,
      upper_rec: 120,
      total: 0,
      link: "https://www.healthline.com/health/foods-high-in-vitamin-k",
    },
  };

  let totalCarbs = 0;
  let totalFat = 0;
  let totalProtein = 0;

  calculatorRecipes.forEach((recipe) => {
    let nutrients = [];

    //console.log('Recipe nutrients', recipe.nutrients)
    if (!recipe.nutrients) return;
    for (const [key, value] of Object.entries(recipe.nutrients)) {
      if (microLabels.includes(key)) {
        nutrients.push({ label: key, info: value });
      }
    }

    nutrients.forEach((nutrient) => {
      if (totalMicroNutrients && totalMicroNutrients[nutrient.label]) {
        totalMicroNutrients[nutrient.label].total +=
          nutrient.info.quantity / recipe.servings;
      }
      totalMicroNutrients[nutrient.label].label = nutrient.info.label;

      // let percentage =
    });

    if (recipe.nutrients["PROCNT"] == undefined) {
      return;
    }

    totalProtein +=
      Math.round((recipe.nutrients["PROCNT"].quantity / recipe.servings) * 10) /
      10;
    totalCarbs +=
      Math.round((recipe.nutrients["CHOCDF"].quantity / recipe.servings) * 10) /
      10;
    totalFat +=
      Math.round((recipe.nutrients["FAT"].quantity / recipe.servings) * 10) /
      10;
  });

  // if (nutrients.length == 0) {
  //     totalMicroNutrients = null;
  //     return;
  // }

  //console.log('TMN', totalMicroNutrients)

  let totalCalories = Math.ceil(
    totalProtein * 4 + totalCarbs * 4 + totalFat * 9
  );

  // Working before
  // let totalMicroNutrientScore = Math.ceil(
  //     totalPercentage / nutrients.length
  // );

  // Sort into final array
  let microNutrients = [];
  for (const [key, value] of Object.entries(totalMicroNutrients)) {
    if (microLabels.includes(key)) {
      microNutrients.push({ label: key, info: value });
    }
  }

  function compare(a, b) {
    if (a.info.label < b.info.label) {
      return -1;
    }
    if (a.info.label > b.info.label) {
      return 1;
    }
    return 0;
  }

  microNutrients.sort(compare);

  let totalPercentage = 0;
  let nutrientsLength = 0;
  microNutrients.forEach((nutrient) => {
    let percentage =
      Math.ceil(
        (Math.ceil(nutrient.info.total) / nutrient.info.lower_rec) * 100
      ) > 99
        ? 100
        : Math.ceil((nutrient.info.total / nutrient.info.lower_rec) * 100);
    nutrient.percentage = percentage;
    totalPercentage += percentage;
    nutrientsLength++;
  });

  // Working before
  let totalMicroNutrientScore = Math.ceil(totalPercentage / nutrientsLength);

  return {
    score: totalMicroNutrientScore,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat,
    calories: totalCalories,
    microNutrients: microNutrients,
  };
}

export async function calculateCreatedRecipeNutrients(ingredientsFormatted) {
  let nutrients = {
    VITD: {
      unit: "µg",
      label: "Vitamin D",
      quantity: 0,
    },
    ASH: {
      label: "Ash",
      unit: "g",
      quantity: 0,
    },
    NIA: {
      quantity: 0,
      unit: "mg",
      label: "Vitamin B3",
    },
    ZN: {
      label: "Zinc",
      quantity: 0,
      unit: "mg",
    },
    FASAT: {
      label: "Saturated Fat",
      unit: "g",
      quantity: 0,
    },
    SE: {
      quantity: 0,
      unit: "µg",
      label: "Selenium",
    },
    MN: {
      quantity: 0,
      unit: "mg",
      label: "Manganese",
    },
    PROCNT: {
      quantity: 0,
      label: "Protein",
      unit: "g",
    },
    MG: {
      label: "Magnesium",
      unit: "mg",
      quantity: 0,
    },
    P: {
      label: "Phosphorus",
      quantity: 0,
      unit: "mg",
    },
    FAPU: {
      label: "Polyunsaturated Fat",
      quantity: 0,
      unit: "g",
    },
    FAT: {
      quantity: 0,
      label: "Total Fat",
      unit: "g",
    },
    FIBTG: {
      label: "Fiber",
      quantity: 0,
      unit: "g",
    },
    FAMS: {
      quantity: 0,
      unit: "g",
      label: "Monounsaturated Fat",
    },
    RIBF: {
      unit: "mg",
      label: "Vitamin B2",
      quantity: 0,
    },
    NA: {
      label: "Sodium",
      quantity: 0,
      unit: "mg",
    },
    FE: {
      label: "Iron",
      unit: "mg",
      quantity: 0,
    },
    CHOCDF: {
      quantity: 0,
      label: "Total Carbs",
      unit: "g",
    },
    VITC: {
      quantity: 0,
      unit: "mg",
      label: "Vitamin C",
    },
    VITK1: {
      quantity: 0,
      label: "Vitamin K",
      unit: "µg",
    },
    K: {
      unit: "mg",
      quantity: 0,
      label: "Potassium",
    },
    SUGAR: {
      quantity: 0,
      unit: "g",
      label: "Total Sugars",
    },
    VITB12: {
      quantity: 0,
      label: "Vitamin B12",
      unit: "µg",
    },
    CU: {
      quantity: 0,
      unit: "mg",
      label: "Copper",
    },
    VITB6A: {
      unit: "mg",
      quantity: 0,
      label: "Vitamin B6",
    },
    VITA_RAE: {
      quantity: 0,
      label: "Vitamin A",
      unit: "µg",
    },
    THIA: {
      quantity: 0,
      label: "Vitamin B1",
      unit: "mg",
    },
    FOLDFE: {
      quantity: 0,
      label: "Vitamin B9",
      unit: "µg",
    },
    CA: {
      unit: "mg",
      label: "Calcium",
      quantity: 0,
    },
    TOCPHA: {
      quantity: 0,
      label: "Vitamin E",
      unit: "mg",
    },
  };

  console.log(
    "Calculating nutrients for created recipe:",
    ingredientsFormatted
  );

  for (const ingredient of ingredientsFormatted) {
    // Return ingredient from database
    let res = await db
      .collection("ingredients")
      .where("ingredient", "==", ingredient.ingredient)
      .get();
    //console.log('Res', res)
    if (res.docs[0]) {
      let data = res.docs[0].data();
      let unitsToGrams = null;
      //console.log('Data for ingredient', data)
      if (ingredient.unit !== "g") {
        if (data.usda_data.grams_per_cup) {
          let gramsPerCup = data.usda_data.grams_per_cup;
          unitsToGrams = convertUnitsToGrams(
            ingredient.quantity,
            ingredient.unit,
            gramsPerCup,
            ingredient.ingredient
          );
          if (!unitsToGrams) {
            unitsToGrams =
              data.usda_data.grams_per_quantity * ingredient.quantity;
          }
          //console.log(`Units to grams for ${ingredient.ingredient}`, unitsToGrams)
        } else if (data.usda_data.grams_per_quantity) {
          unitsToGrams =
            data.usda_data.grams_per_quantity * ingredient.quantity;
          //console.log(`Units to grams for ${ingredient.ingredient} is ${unitsToGrams}`)
        }
      } else {
        unitsToGrams = ingredient.quantity;
      }

      if (data.usda_data.usda_nutrition) {
        let multiplier = unitsToGrams / 100;
        //console.log('Multiplier: ' + multiplier)
        //console.log('Recipe servings: ' + servings)
        let finalMultiplier = multiplier;
        //console.log('finalMultiplier: ' + finalMultiplier)

        data.usda_data.usda_nutrition.forEach((nutrient) => {
          for (const [key, value] of Object.entries(nutrient)) {
            //console.log('Keys', key)
            //console.log('Value ', value.quantity)
            if (nutrients[key]) {
              nutrients[key].quantity += value.quantity * finalMultiplier;
            }
            // Multiplier
          }
        });
      } else {
        return;
      }
    }
  }

  return nutrients;
}

export function convertUnitsToGrams(amount, unit, grams_per_cup, ingredient) {
  // Search through the categories to see if we can assign the ingredient to one with the ingredient check variable
  let gram_weight = false;
  let serving_in_cups = 0;

  try {
    //'Ingredient' is a dict so change it to a string

    // print(ingredient)

    //Units with volume
    //Cup
    if (unit == "cup") {
      //We already have the volume in the required unit
      serving_in_cups = amount;
      // print('')
      // print('Serving in cups: ', serving_in_cups)
      // print('')
      //We just need to convert it into grams
      gram_weight = serving_in_cups * grams_per_cup;
    }

    //Tablespoon
    else if (
      unit == "tbsp" ||
      unit == "heaping" ||
      unit == "dollop" ||
      unit == "scoop" ||
      unit == "handful"
    ) {
      // print('')

      //Convert into cups
      serving_in_cups = amount * 0.0625;
      // print('Serving in cups', serving_in_cups)
      // print('')

      //Find the gram weight from the weight per cup
      gram_weight = serving_in_cups * grams_per_cup;
    }

    //Teaspoon
    else if (unit == "tsp" || unit == "sprig" || unit == "sprinkle") {
      // print('')

      // Convert into cups
      serving_in_cups = amount * 0.0208333;
      // print('Serving in cups', serving_in_cups)
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = serving_in_cups * grams_per_cup;
    }

    //Other small volumes we are classing as 0.5 tsp
    else if (unit == "drop" || unit == "pinch") {
      // print('')

      // Convert into cups
      serving_in_cups = amount * 0.0208333;
      serving_in_cups = serving_in_cups / 2;
      // print('Serving in cups', serving_in_cups)
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = serving_in_cups * grams_per_cup;
    }

    //Fluid ounces
    else if (unit == "floz") {
      // print('')

      // Convert into cups
      serving_in_cups = amount * 0.125;
      // print('Serving in cups', serving_in_cups)
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = serving_in_cups * grams_per_cup;
    }

    //Dashes
    else if (unit == "dash") {
      // print('')

      // Convert into cups
      serving_in_cups = amount * 0.0026;
      // print('Serving in cups', serving_in_cups)
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = serving_in_cups * grams_per_cup;
    }

    //Millilitres
    else if (unit == "ml") {
      // print('')

      // Convert into cups
      serving_in_cups = amount * 0.00422675;
      // print('Serving in cups', serving_in_cups)
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = serving_in_cups * grams_per_cup;
    }

    //Litre
    else if (unit == "litre") {
      // print('')

      // Get the gram weight from the oz
      serving_in_cups = amount * 4.22675;
      // print('Serving in cups', serving_in_cups)
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = serving_in_cups * grams_per_cup;
    }

    //Pint
    else if (unit == "pint") {
      // print('')

      // Get the gram weight from the oz
      serving_in_cups = amount * 2.4019;
      // print('Serving in cups', serving_in_cups)
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = serving_in_cups * grams_per_cup;
    }

    //Gals
    else if (unit == "gals") {
      // print('')

      // Get the gram weight from the oz
      serving_in_cups = amount * 19.2152;
      // print('Serving in cups', serving_in_cups)
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = serving_in_cups * grams_per_cup;
    }

    //Gills
    else if (unit == "gill") {
      // print('')

      // Get the gram weight from the oz
      serving_in_cups = amount * 0.5;
      // print('Serving in cups', serving_in_cups)
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = serving_in_cups * grams_per_cup;
    }

    //Quart
    else if (unit == "quart") {
      // print('')

      // Get the gram weight from the oz
      serving_in_cups = amount * 4;
      // print('Serving in cups', serving_in_cups)
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = serving_in_cups * grams_per_cup;
    }

    //DL
    else if (unit == "dl") {
      // print('')

      // Get the gram weight from the oz
      serving_in_cups = amount * 0.422675;
      // print('Serving in cups', serving_in_cups)
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = serving_in_cups * grams_per_cup;
    }

    //GL
    else if (unit == "gl") {
      // print('')

      // Get the gram weight from the oz
      serving_in_cups = amount * 19.2152;
      // print('Serving in cups', serving_in_cups)
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = serving_in_cups * grams_per_cup;

      //Weight
      //MG
    } else if (unit == "mg") {
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = amount / 1000;

      //Ounce
    } else if (unit == "oz") {
      // print('')

      // Get the gram weight from the oz
      gram_weight = amount * 28.3495;

      // print('')

      //Pound
    } else if (unit == "lb") {
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = amount * 453.592;

      //KG
    } else if (unit == "kg") {
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = amount * 1000;

      //Calculating the weight of ginger based on the cm
      //cm
    } else if (unit == "cm") {
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = amount * 8;

      //inch
    } else if (unit == "inch") {
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = amount * 24;

      //Grams
    } else if (unit == "g" || unit == "grams") {
      gram_weight = amount;

      //Can && Tins
    } else if (unit == "can" || unit == "tin" || "unit" == "cans") {
      one_unit = parseFloat(400);
      gram_weight = one_unit * amount;

      //Slice(bread)
    } else if (unit == "slice") {
      one_unit = 38;
      gram_weight = one_unit * amount;

      //Wedge(Lime)
    } else if (unit == "wedge" && ingredient == "lime") {
      one_unit = 15;
      gram_weight = one_unit * amount;

      //Bulb(Garlic)
    } else if (unit == "bulb" && ingredient == "garlic") {
      one_unit = 30;
      gram_weight = one_unit * amount;

      //Clove(Garlic)
    } else if (unit == "clove" || unit == "cloves") {
      one_unit = 5;
      gram_weight = one_unit * amount;

      //Pack
    } else if (unit == "pack") {
      one_unit = 300;
      gram_weight = one_unit * amount;

      //Jar
    } else if (unit == "jar") {
      one_unit = 107;
      gram_weight = one_unit * amount;

      //Carton
    } else if (unit == "carton") {
      one_unit = 1000;
      gram_weight = one_unit * amount;

      //Pot
    } else if (unit == "pot") {
      one_unit = 500;
      gram_weight = one_unit * amount;
    }
    //Garnish
    else if (
      (unit == "garnish" && ingredient.includes("nut")) ||
      ingredient.includes("cashew")
    ) {
      // Convert into cups
      serving_in_cups = amount * 0.0625;
      // print('Serving in cups', serving_in_cups)
      // print('')

      // Find the gram weight from the weight per cup
      gram_weight = serving_in_cups * grams_per_cup;

      // Find the gram weight from the weight per cup
      gram_weight = serving_in_cups * grams_per_cup;
    } else {
      gram_weight = null;
      console.log("Cannot find gram weight for this ingredient");
    }

    return gram_weight;
  } catch (error) {
    console.log(error);
  }
}

export function calculateMicroNutrientScore(nutrients, servings) {
  console.log("Nutrients", nutrients);
  console.log("Servings", servings);

  let overallNutrientsSatisfied = [];

  let caloriesPerServings = nutrients.CHOCDF.quantity / servings;
  let ratioOfDailyTotal = 2250 / caloriesPerServings;

  for (const [key, value] of Object.entries(nutrients)) {
    let code = key;

    console.log("Code", code);
    let nutrient = value["label"];
    let quantity = value["quantity"];
    let quantityPerServing = parseFloat(quantity / servings);

    let sodiumCount = 0;

    if (microNutrientsWithRecs[code] && code !== "NA") {
      let recommendedQuantity = microNutrientsWithRecs[code].lower_rec;

      let percentageSatisfied = parseFloat(
        quantityPerServing / recommendedQuantity
      );
      let individualNutrientScore = ratioOfDailyTotal * percentageSatisfied;

      if (individualNutrientScore > 1) individualNutrientScore = 1;

      overallNutrientsSatisfied.push(individualNutrientScore);

      console.log("Recommended quantity", recommendedQuantity);
    } else if (code == "NA") {
      console.log("IN HERE WITH SALT BABAY");
      let saltRecommendedQuantity = 2300;

      let percentageSatisfied = parseFloat(
        quantityPerServing / saltRecommendedQuantity
      );
      let individualNutrientScore = ratioOfDailyTotal * percentageSatisfied;

      if (individualNutrientScore > 1) {
        let subtract = parseFloat(individualNutrientScore - 1);
        individualNutrientScore = 1 - subtract;

        if (individualNutrientScore < 0) {
          individualNutrientScore = 0;
          console.log("Sodium reached zero");
        }
      }

      overallNutrientsSatisfied.push(individualNutrientScore);
    } else {
      console.log("NOT FOUND: ", code);
    }
  }

  // Calculate mean percentage
  var sum = 0;
  for (var i = 0; i < overallNutrientsSatisfied.length; i++) {
    sum += parseInt(overallNutrientsSatisfied[i], 10); //don't forget to add the base
  }

  let nutrientPercentage = sum / overallNutrientsSatisfied.length;
  let nutrientScore = nutrientPercentage * 10;
  nutrientScore = parseFloat(nutrientScore.toFixed(2));

  console.log("Nutrient score:", nutrientScore);
  return nutrientScore;
}

export function calorieGroup(calories_per_serving) {
  if (calories_per_serving < 0 && calories_per_serving < 99) {
    return "calories_0_99";
  } else if (calories_per_serving > 99 && calories_per_serving < 200) {
    return "calories_100_199";
  } else if (calories_per_serving > 199 && calories_per_serving < 300) {
    return "calories_200_299";
  } else if (calories_per_serving > 299 && calories_per_serving < 400) {
    return "calories_300_399";
  } else if (calories_per_serving > 399 && calories_per_serving < 500) {
    return "calories_400_499";
  } else if (calories_per_serving > 499 && calories_per_serving < 600) {
    return "calories_500_599";
  } else if (calories_per_serving > 599 && calories_per_serving < 700) {
    return "calories_600_699";
  } else if (calories_per_serving > 699 && calories_per_serving < 800) {
    return "calories_700_799";
  } else if (calories_per_serving > 799 && calories_per_serving < 900) {
    return "calories_800_899";
  } else if (calories_per_serving > 899 && calories_per_serving < 1000) {
    return "calories_900_999";
  } else if (calories_per_serving > 999 && calories_per_serving < 1100) {
    return "calories_1000_1099";
  } else if (calories_per_serving > 1099 && calories_per_serving < 1200) {
    return "calories_1100_1199";
  } else if (calories_per_serving > 1200) {
    return "calories_1200_plus";
  }
}

export function carbGroup(amount) {
  if (amount > 300) {
    return "carbs_300_plus";
  } else {
    for (let x = 0; x < 20; x++) {
      let limit = x * 20;
      if (amount <= limit + 19) {
        return `carbs_${limit}_${limit + 19}`;
      } else {
        // console.log("Not found");
      }
      // console.log("Top limit", limit + 19);
    }
  }
}

export function fatGroup(amount) {
  if (amount > 300) {
    return "fat_300_plus";
  } else {
    for (let x = 0; x < 20; x++) {
      let limit = x * 5;
      console.log(`Amount: ${amount} | Limit: ${limit}`);
      if (amount <= limit + 4) {
        return `fat_${limit}_${limit + 4}`;
      }
    }
  }
}

export function proteinGroup(amount) {
  if (amount > 300) {
    return "protein_300_plus";
  } else {
    for (let x = 0; x < 20; x++) {
      let limit = x * 5;
      if (amount <= limit + 4) {
        return `protein_${limit}_${limit + 4}`;
      }
    }
  }
}
