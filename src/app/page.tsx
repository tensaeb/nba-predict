import RegisterForm from "@/components/register-form";
import { Mountain } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white dark:bg-gray-950 bg-opacity-95 backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Mountain className="h-6 w-6" />
            <span className="text-xl font-bold">NBA Playoff Predictor</span>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container mx-auto grid items-center gap-6 pb-8 pt-6 md:py-10 px-4">
          <div className="flex max-w-[980px] flex-col items-center gap-2">
            <h1 className="text-center text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl lg:text-5xl lg:leading-[1.1]">
              Predict the NBA Champion
            </h1>
            <p className="max-w-[700px] text-center text-lg text-gray-500 dark:text-gray-400">
              Make your predictions for each playoff matchup and see if you can
              correctly pick the NBA champion!
            </p>
          </div>
          <div className="w-full max-w-md mx-auto">
            <RegisterForm />
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row px-4">
          <p className="text-center text-sm leading-loose text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} NBA Playoff Predictor. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
