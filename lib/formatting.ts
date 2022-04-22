import { format } from "date-fns";
import convert from "convert-units";

export function formatTime(time) {
  // Update hours and minutes

  //console.log("Recipe time: ", time);
  let hours = Math.floor(parseInt(time) / 60);
  let minutes = parseInt(time) % 60;

  let string = "";
  if (hours > 0) {
    string = string + hours + (hours > 1 ? " hours " : " hour ");
  }

  if (minutes > 0) {
    string = string + minutes + (minutes > 1 ? " minutes " : " minute ");
  }

  return string;
}

export function formatDate(date, type) {
  if (date) {
    if (type === 1) {
      return format(date, "do MMMM");
    } else if (type === 2) {
      return format(date, "iiii do MMMM");
    }
  }
}

// Original, metric, imperial
export function formatIngredient(ingredient, measurement, multiplier) {
  if (ingredient.unit == null || ingredient.quantity == null) {
    return {
      quantity: ingredient.quantity ? ingredient.quantity * multiplier : null,
      unit: ingredient.unit ? ingredient.unit : null,
      ingredient: ingredient.ingredient,
    };
  }

  // If cup then find the most common unit in the example servings
  let weightUnits = ["g", "oz", "mg", "lb", "kg"];
  let volumeUnits = ["ml", "pint", "litre", "dl", "gl", "gallon", "floz"];

  // Keywords for liquids
  let liquids = ["milk", "milks", "juice", "water", "broth", "aquafaba"];

  function containsLiquid(ingredient) {
    let containsL = false;
    liquids.forEach((liquid) => {
      if (ingredient.includes(liquid)) containsL = true;
    });
    return containsL;
  }

  // Metric units: litre, ml, g, kg,
  // Imperial units: oz, lb, floz,
  let metricVolumes = ["litre", ""];

  let convertToWeight = false;
  let convertToVolume = false;
  if (ingredient.unit == "cup") {
    if (ingredient.data && ingredient.data.example_servings) {
      for (const example of ingredient.data.example_servings) {
        if (
          volumeUnits.includes(example.unit) ||
          containsLiquid(ingredient.ingredient) ||
          ingredient.drink
        ) {
          convertToVolume = true;
          break;
        } else {
          convertToWeight = true;
          break;
        }
      }
    }
  }

  // Metric
  if (measurement == "metric") {
    // Convert cups to gram weight
    if (convertToWeight) {
      return {
        quantity:
          multiplier *
          (ingredient.data.usda_data.grams_per_cup *
            (ingredient.quantity ? ingredient.quantity : 1 * multiplier)),
        unit: "g",
        ingredient: ingredient.ingredient,
      };
      // Convert cups to ML
    } else if (convertToVolume) {
      return {
        quantity:
          multiplier *
          convert(ingredient.quantity).from(ingredient.unit).to("ml"),
        unit: "ml",
        ingredient: ingredient.ingredient,
      };
      // Convert normally
    } else {
      // Just convert normally
      if (ingredient.unit == "oz" || ingredient.unit == "lb") {
        return {
          quantity:
            multiplier *
            convert(ingredient.quantity).from(ingredient.unit).to("g"),
          unit: "g",
          ingredient: ingredient.ingredient,
        };
      } else {
        // Just return original
        return {
          quantity:
            multiplier * (ingredient.quantity ? ingredient.quantity : 1),
          unit: ingredient.unit,
          ingredient: ingredient.ingredient,
        };
      }
    }
  } else if (measurement == "imperial") {
    // Convert cups to gram weight
    if (convertToWeight) {
      return {
        quantity:
          multiplier *
          convert(ingredient.data.usda_data.grams_per_cup * ingredient.quantity)
            .from("g")
            .to("oz"),
        unit: "oz",
        ingredient: ingredient.ingredient,
      };
      // Convert cups to ML
    } else if (convertToVolume) {
      return {
        quantity:
          multiplier *
          convert(ingredient.quantity).from(ingredient.unit).to("fl-oz"),
        unit: "floz",
        ingredient: ingredient.ingredient,
      };
      // Convert normally
    } else {
      // Just convert normally
      if (
        ingredient.unit == "g" ||
        ingredient.unit == "kg" ||
        ingredient.unit == "mg"
      ) {
        return {
          quantity:
            multiplier *
            convert(ingredient.quantity).from(ingredient.unit).to("oz"),
          unit: "oz",
          ingredient: ingredient.ingredient,
        };
      } else {
        // Just return original
        console.log("JUST RETURN NORMAL");
        return {
          quantity:
            multiplier * (ingredient.quantity ? ingredient.quantity : 1),
          unit: ingredient.unit,
          ingredient: ingredient.ingredient,
        };
      }
    }
  } else {
    return {
      quantity: multiplier * (ingredient.quantity ? ingredient.quantity : null),
      unit: ingredient.unit,
      ingredient: ingredient.ingredient,
    };
  }
}

export function formatQuantity(amount, measurement, item) {
  let copy = { ...item };
  copy.quantity = amount.quantity;
  copy.unit = amount.unit;
  let formatted = formatIngredient(copy, measurement, 1);
  let preformattedQuantity = formatted.quantity;
  let roundedQuantity = formatted.quantity
    ? formatted.quantity % 1 == 0
      ? formatted.quantity
      : formatted.quantity.toFixed(2)
    : null;
  // console.log("Rounded quantity", roundedQuantity);
  return roundedQuantity;
}

export function formatUnit(amount, measurement, item) {
  let copy = { ...item };
  copy.quantity = amount.quantity;
  copy.unit = amount.unit;
  let formatted = formatIngredient(copy, measurement, 1);
  return formatted.unit;
}
