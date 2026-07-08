import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';

function App() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-6">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <Card className="max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-h4 text-foreground">
            PropertyFlow
          </CardTitle>
          <CardDescription>
            Shadcn UI, Tailwind, and dark mode are working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Get Started</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;