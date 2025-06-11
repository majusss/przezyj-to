import { Pencil } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";

interface WritingAnswerProps {
  scenario: string;
  onSubmitAnswer: (answer: string) => void;
}

export default function WritingAnswer({
  scenario,
  onSubmitAnswer,
}: WritingAnswerProps) {
  const [answer, setAnswer] = useState("");
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Co zrobisz by przeżyć: {scenario}?
        </h2>
        <Label htmlFor="answer" className="flex items-center gap-2">
          <Pencil className="w-4 h-4" />
          Odpowiedź
        </Label>
        <Input
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Wymyśl swoją odpowiedź..."
        />
      </div>

      <Button
        className="w-full"
        onClick={() => onSubmitAnswer(answer.trim())}
        disabled={!answer.trim()}
      >
        Gotowy
      </Button>
    </div>
  );
}
