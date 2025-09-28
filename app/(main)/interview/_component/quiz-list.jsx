"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QuizResult from "./quiz-result";


const QuizList = ({ assessments }) => {
  const router = useRouter();
  const [selectQuiz, setSelectedQuiz] = useState(null);

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="gradient-title text-3xl md:text-4xl">Recent Quizes</CardTitle>
            <CardDescription>Review your past quiz performance</CardDescription>
          </div>
          <Button onClick={() => router.push("/interview/mock")}>Start New Quiz</Button>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {assessments.map((assessment, i) => (
              <motion.div
                key={assessment.id || i} // ensure unique key
                initial={{ opacity: 0, y: 50 }} // start invisible and below
                whileInView={{ opacity: 1, y: 0 }} // animate in
                viewport={{ once: true, amount: 0.3 }} // trigger once when 30% visible
                transition={{ duration: 0.5, delay: i * 0.1 }} // staggered effect
              >
                <Card
                key={assessment.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedQuiz(assessment)}
                >
                  <CardHeader>
                    <CardTitle>Quiz {i + 1}</CardTitle>
                    <CardDescription className="flex justify-between w-full">
                      <div>Score: {assessment.quizScore.toFixed(1)}%</div>
                      <div>
                        {format(new Date(assessment.createdAt), "MMMM dd, yyyy HH:mm")}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{assessment.improvementTip}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

<Dialog open={!!selectQuiz} onOpenChange={() => setSelectedQuiz(null)}>
  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle></DialogTitle>
    </DialogHeader>

<QuizResult 
result={selectQuiz}
onStartNew={() => router.push("/interview/mock")}
hideStartNew
/>
  </DialogContent>
</Dialog>

    </div>
  );
};

export default QuizList;
