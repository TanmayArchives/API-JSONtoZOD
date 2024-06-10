export const EXAMPLE_PROMPT = `DATA: 
"Tanmay is 19 years old and is self-taught"

-----------
Expected JSON format: 
{
  name: { type: "string" },
  age: { type: "number" },
  isSelfTaught: { type: "boolean" },
  skills: {
    type: "array",
    items: { type: "string" },
  },
}

-----------
Valid JSON output in expected format:`

export const EXAMPLE_ANSWER = `{
  name: "Tanmay",
  age: 19,
  isSelfTaught: true,
  skills: ["programming", "web development"],
}`
