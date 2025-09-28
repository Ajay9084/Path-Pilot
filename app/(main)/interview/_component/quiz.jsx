"use client"

import { generateQuiz, saveQuizResult } from "@/actions/interview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useFetch from "@/hooks/use-fetch";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";
import QuizResult from "./quiz-result";

const Quiz = () => {
 const  [CurrentQuestion, setCurrentQuestion] = useState(0);
 const [answers , setAnswers] = useState([]);
 const [showExplaination, setShowExplaination] = useState(false);

const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
} = useFetch(generateQuiz);

const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,

} = useFetch(saveQuizResult);

console.log(resultData)

useEffect(() => {
    if(quizData) {
        setAnswers(new Array(quizData.length).fill(null));
    }
}, [quizData]); 

const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[CurrentQuestion] = answer;
    setAnswers(newAnswers)
};

const handleNext = () => {
    if(CurrentQuestion < quizData.length - 1) {
        setCurrentQuestion(CurrentQuestion + 1);
        setShowExplaination(false);
    } else {
        finishQuiz()
    }
};

const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
        if(answer === quizData[index].correctAnswer) {
            correct++;
        }
    });
    return (correct / quizData.length) * 100;
};


const finishQuiz = async () => {
    const score = calculateScore();
    try {
        await saveQuizResultFn(quizData, answers, score);
        toast.success("Quiz completed!");
    } catch (error) {
        toast.error(error.message || "Failed to save quiz results");
    }
}

const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplaination(false);
    generateQuizFn();
    setResultData(null);
};


if(generatingQuiz) {
    return <BarLoader className="mt-4" width={"100%"} color="gray"/>
}

//show results if quiz is completed
if(resultData) {
    return (
        <div className="mx-2">
            <QuizResult result={resultData} onStartNew={startNewQuiz}/>
        </div>
    );
}

if(!quizData) {
    return (
        <Card className="mx-2">
  <CardHeader>
    <CardTitle>Ready to test your knowledge</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foregroundt">
        This quiz contain 10 questions specific to your industry and skills. Take your time and choose the best answere for each question.
    </p>
  </CardContent>
  <CardFooter>
    <Button className="w-full" onClick={generateQuizFn}>
        Start Quiz</Button>
  </CardFooter>
</Card>
    )
}


const question = quizData[CurrentQuestion];
    return (
   <Card className="mx-2">
  <CardHeader>
    <CardTitle>Question {CurrentQuestion + 1} of {quizData.length}</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <p className="text-lg  font-medium">
     {question.question}   
    </p>

    <RadioGroup className="space-y-2"
    onValueChange={handleAnswer}
    value={answers[CurrentQuestion]}
    >
        {question.options.map((option, index) => {
      return (
        <div className="flex items-center space-x-2" key={index}>
    <RadioGroupItem value={option} id={`option-${index}`} />
    <Label htmlFor={`option-${index}`}>{option}</Label>
  </div>
      );
        })}      
</RadioGroup>

{showExplaination && (
    <div className="mt-4 p-4 bg-muted rounded-lg">
        <p className="font-medium">Explanation:</p>
        <p className="text-muted-foreground">{question.explanation}</p>
    </div>
)}
  </CardContent>

  <CardFooter>
  {!showExplaination && (
    <Button onClick={() => setShowExplaination(true)}
    variant="outline"
    disabled={!answers[CurrentQuestion]}>Show Explanation</Button>
  )}

<Button onClick={handleNext}
   className="ml-auto"
    disabled={!answers[CurrentQuestion] || savingResult}
    >
        {savingResult && (
            <Loader2 className="mt-4 " width={"100%"} color="gray"/>
        )}
    {CurrentQuestion < quizData.length - 1
        ? "Next Question"
        : "Finish Quiz"}
    </Button>

  </CardFooter>
</Card>
    )
};

export default Quiz;