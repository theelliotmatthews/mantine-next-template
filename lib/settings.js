import { useState, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";

export function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return <p className="text-success">{username} is available!</p>;
  } else if (username && !isValid) {
    return <p className="text-danger">That username is taken!</p>;
  } else {
    return <p></p>;
  }
}

export function createUsername(firstName, lastName) {
  return (
    firstName +
    "-" +
    lastName +
    "-" +
    Math.ceil(Math.random() * 9999999999999)
  )
    .replace(/[^a-z0-9_]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}
