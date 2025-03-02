
import dotenv from "dotenv";
//import {q1, q2, q3, q4, q5, q6, a1, a2, a3, a4, a5, a6} from "./personalityTest.js";
import { GoogleGenerativeAI } from "@google/generative-ai";


dotenv.config();
dotenv.config({ path: `.env.local`, override: true });
 



const q1 = "You're in a room full of people, what do you do?";
const q2 = "What do you enjoy the most in your free time?";
const q3 = "You're given an empty box. What's your next move?";
const q4 = "You discover your human has left and you're all alone. How do you react?";
const q5 = "You're trying to get some alone time, but your human keeps bothering you. What do you do?";
const q6 = "What do you think about climbing trees?";
let a1, a2, a3, a4, a5, a6;

const genAI = new GoogleGenerativeAI(process.env.API_KEY);


async function runAI(answersObject, key) {
    const answersArray = answersObject.answers;
    console.log(answersArray);
    
    a1 =answersArray[0]; 
    a2 =answersArray[1];
    a3 =answersArray[2];
    a4 = answersArray[3];
    a5 =answersArray[4];
    a6 =answersArray[5];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt =
    `you're the deciding factor in a cat personality quiz.  Sort the user into one of the following personality types and give a cute short blurb about their personality :(Dismissive Diva) 
(Trouble Maker )
(Snacker)
(Cuddle Monster) 
(Window Watcher) 
(Backyard Wanderer) 
Question 1: [${q1}]
the user answered: (${a1})
Question 2: [${q2}]
the user answered: (${a2})
Question 3: [${q3}]
the user answered: (${a3})
Question 4: [${q4}]
the user answered: (${a4})
Question 5: [${q5}]
the user answered: (${a5})
Question 6: [${q6}]
the user answered: (${a6})
`
const result = await model.generateContent(prompt);
console.log(result.response.text());
return result.response.text();
}
//runAI();
export {runAI}