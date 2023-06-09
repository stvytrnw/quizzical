import React from "react";
import he from "he"
import { nanoid } from 'nanoid'
import {useState, useEffect} from "react"

export default function Quiz(props){
    const [questions, setQuestions] = useState([])
    const [finishedGame, setFinishedGame] = useState(false)
    const [fetchApi, setFetchApi] = useState(false)
    let score = 0

    useEffect(() => {
        fetchData();
    }, [fetchApi])

    useEffect(() => {
        if(!finishedGame){
            setFetchApi(prevState => !prevState);
        } 
    }, [finishedGame])

    async function fetchData() {
        const url = new URL('https://opentdb.com/api.php')
        url.searchParams.set('amount', props.values.count)
        props.values.category !== '0' && url.searchParams.set('category', props.values.category)
        props.values.difficulty !== '0' && url.searchParams.set('difficulty', props.values.difficulty.toLowerCase())

        const response = await fetch(url)
        const data = await response.json();
        setQuestions(data.results.map(question => {
            let answersArray = question.incorrect_answers.concat(question.correct_answer)
            let currentIndex = answersArray.length, randomIndex;

            while (currentIndex !== 0){
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [answersArray[currentIndex], answersArray[randomIndex]] = [answersArray[randomIndex], answersArray[currentIndex]];
            }

            return {...question, randomAnswers: answersArray, id: nanoid()}
        }))
    }
    
    function setAnswer(e) {
        setQuestions(prevState => prevState.map(question => {
            return question.id === e.target.name ?
            {...question, selectedAnswer: he.decode(e.target.innerHTML)} :
            {...question}
        }))
    }

    const questionsHtml = questions.map(question => {
        const buttons = question.randomAnswers.map(answer => {

            if(he.decode(question.correct_answer) ===  he.decode(answer) && question.selectedAnswer ===  he.decode(answer)) {
                score++
            }

            function getBackgroundColor() {
                if(finishedGame){
                    if(he.decode(question.correct_answer) ===  he.decode(answer)){
                        return "#94D7A2"
                    }else if (question.selectedAnswer ===  he.decode(answer)) {
                        return "#F8BCBC"
                    }
                } else {
                    return question.selectedAnswer === he.decode(answer) ? "#D6DBF5" : "transparent"
                }
            }

            return (
                    <button 
                    key={nanoid()}
                    onClick={setAnswer} 
                    disabled={finishedGame}
                    style={{backgroundColor: getBackgroundColor(),
                    borderColor: question.selectedAnswer === he.decode(answer) ? "#D6DBF5" : "#293264",
                    opacity: finishedGame && answer !== question.correct_answer ? "50%" : "100%"}} 
                    name={question.id}>{he.decode(answer)}
                    </button>
            )
        })
        return (
            <div key={nanoid()} className="quiz--questions_cnt">
                <h2>{he.decode(question.question)}</h2>
                <div className="quiz--btn_cnt">
                    {buttons}
                </div>
            </div>
        )
    })

    function changeFinishedGame() {
        setFinishedGame(prevState => !prevState)
    }

    return (
        <div className="quiz--cnt">
            {questions && questionsHtml}
            {finishedGame && <p className="quiz--score">You scored {score}/{questions.length} correct answers</p>}
            <button className="quiz--finish_btn" onClick={changeFinishedGame}>{!finishedGame ? "Check Answers" : "Play Again"}</button>
        </div>
    )
}