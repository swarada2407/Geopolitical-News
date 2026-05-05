import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import QuizResult from "../models/QuizResult.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateQuiz = async (req, res) => {
  try {
    const { topic = "Current Affairs" } = req.body;

    const localQuestionsPath = path.join(__dirname, "..", "data", "Main Quiz.json");
    
    if (!fs.existsSync(localQuestionsPath)) {
      return res.status(404).json({ message: "Quiz data file not found." });
    }

    const localData = JSON.parse(fs.readFileSync(localQuestionsPath, 'utf8'));
    
    let filtered = localData.filter(q => 
      q.subject?.toLowerCase() === topic.toLowerCase() || 
      q.topic?.toLowerCase() === topic.toLowerCase() ||
      q.question?.toLowerCase().includes(topic.toLowerCase())
    );

    const useRandomFallback = filtered.length === 0;
    const pool = useRandomFallback ? localData : filtered;

    const mappedData = pool.map(q => {
      const correctIdx = Array.isArray(q.options) 
        ? q.options.findIndex(opt => opt.trim() === q.answer.trim()) 
        : -1;
      
      return {
        question: q.question,
        options: q.options,
        correctAnswer: correctIdx !== -1 ? correctIdx : 0,
        explanation: q.explanation || "No explanation provided.",
        isFromTopic: !useRandomFallback
      };
    });

    const shuffled = mappedData.sort(() => 0.5 - Math.random());
    const finalQuiz = shuffled.slice(0, 5);

    return res.json(finalQuiz);
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    res.status(500).json({ message: "Failed to generate quiz from local data." });
  }
};

export const saveQuizResult = async (req, res) => {
  try {
    const { topic, score, totalQuestions, percentage, userId } = req.body;

    const result = new QuizResult({
      user: userId || null,
      topic,
      score,
      totalQuestions,
      percentage,
    });

    await result.save();
    res.status(201).json({ message: "Quiz result saved successfully", result });
  } catch (error) {
    console.error("Save Quiz Result Error:", error);
    res.status(500).json({ message: "Failed to save quiz result" });
  }
};

export const getQuizStats = async (req, res) => {
  try {
    const totalQuizzes = await QuizResult.countDocuments();
    const averageScore = await QuizResult.aggregate([
      { $group: { _id: null, avg: { $avg: "$percentage" } } }
    ]);
    
    const topicStats = await QuizResult.aggregate([
      { $group: { _id: "$topic", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalQuizzes,
      averageScore: averageScore.length > 0 ? Math.round(averageScore[0].avg) : 0,
      topicStats
    });
  } catch (error) {
    console.error("Get Quiz Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch quiz statistics" });
  }
};
