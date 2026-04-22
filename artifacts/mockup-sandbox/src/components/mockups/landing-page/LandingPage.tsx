import React, { useState, useEffect } from "react";
import { 
  ChevronRight, 
  Upload, 
  Cpu, 
  CheckCircle2, 
  FileText, 
  Camera, 
  FileCode, 
  PenTool, 
  GraduationCap, 
  Clock,
  Zap,
  Globe2,
  Atom,
  Binary
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

export function LandingPage() {
  const [selectedRole, setSelectedRole] = useState("student");
  const [selectedTasks, setSelectedTasks] = useState<Record<string, boolean>>({});
  
  const roles = {
    student: {
      label: "Student",
      tasks: [
        { id: "s1", label: "Solving a complex calculus problem", oldTime: 45, newTime: 3, unit: "min" },
        { id: "s2", label: "Understanding organic chemistry mechanisms", oldTime: 60, newTime: 5, unit: "min" },
        { id: "s3", label: "Reviewing an essay draft", oldTime: 30, newTime: 2, unit: "min" },
        { id: "s4", label: "Building a study guide for midterms", oldTime: 120, newTime: 10, unit: "min" }
      ]
    },
    teacher: {
      label: "Teacher",
      tasks: [
        { id: "t1", label: "Grading 30 essays with detailed feedback", oldTime: 180, newTime: 15, unit: "min" },
        { id: "t2", label: "Creating a curriculum-aligned quiz", oldTime: 45, newTime: 3, unit: "min" },
        { id: "t3", label: "Generating step-by-step solutions for homework", oldTime: 30, newTime: 2, unit: "min" },
        { id: "t4", label: "Differentiating instruction for different reading levels", oldTime: 60, newTime: 5, unit: "min" }
      ]
    },
    researcher: {
      label: "Researcher",
      tasks: [
        { id: "r1", label: "Reviewing 10 related papers", oldTime: 240, newTime: 20, unit: "min" },
        { id: "r2", label: "Extracting methodologies from PDFs", oldTime: 90, newTime: 5, unit: "min" },
        { id: "r3", label: "Formatting citations and bibliography", oldTime: 45, newTime: 2, unit: "min" },
        { id: "r4", label: "Summarizing data tables", oldTime: 60, newTime: 4, unit: "min" }
      ]
    }
  };

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  useEffect(() => {
    // Reset selections when role changes to have all selected by default
    const currentTasks = roles[selectedRole as keyof typeof roles].tasks;
    const initialSelections: Record<string, boolean> = {};
    currentTasks.forEach(t => initialSelections[t.id] = true);
    setSelectedTasks(initialSelections);
  }, [selectedRole]);

  const calculateSavings = () => {
    const currentTasks = roles[selectedRole as keyof typeof roles].tasks;
    let oldTotal = 0;
    let newTotal = 0;
    
    currentTasks.forEach(task => {
      if (selectedTasks[task.id]) {
        oldTotal += task.oldTime;
        newTotal += task.newTime;
      }
    });
    
    return {
      saved: oldTotal - newTotal,
      percentage: oldTotal > 0 ? Math.round(((oldTotal - newTotal) / oldTotal) * 100) : 0,
      hours: Math.round((oldTotal - newTotal) / 60 * 10) / 10
    };
  };

  const savings = calculateSavings();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Hero Section */}
      <section className="relative w-full pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Image / Effects */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/__mockup/images/hero-science.png" 
            alt="Abstract scientific background" 
            className="w-full h-full object-cover opacity-30 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/80 to-zinc-950 z-10"></div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMjcyNzJhIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0wIDYwaDYwIi8+PHBhdGggZD0iTTYwIDB2NjAiLz48L2c+PC9zdmc+')] opacity-20 z-10"></div>
        </div>

        <div className="container relative z-20 mx-auto px-4 md:px-6 flex flex-col items-center text-center">
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 mb-6 py-1.5 px-4 backdrop-blur-sm">
            <Atom className="w-3 h-3 mr-2" />
            Powered by Claude 3.5 Sonnet
          </Badge>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 max-w-4xl text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-500">
            Science-Grade Solutions, <br className="hidden md:block"/>
            <span className="text-emerald-400">Instantly.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 font-light">
            Solve what others can't. Upload complex math, physics, chemistry, or writing problems and get step-by-step, curriculum-aware breakdowns engineered for breakthrough clarity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 px-8 py-6 text-lg rounded-none">
              Try It Free
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 backdrop-blur-sm px-8 py-6 text-lg rounded-none">
              View Examples
            </Button>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=18181b`} alt="User avatar" className="w-full h-full opacity-80" />
                </div>
              ))}
            </div>
            <p>Trusted by <strong className="text-zinc-300">50,000+</strong> students across <strong className="text-zinc-300">120</strong> countries</p>
          </div>
        </div>
      </section>

      {/* 2. How It Works */}
      <section className="py-24 bg-zinc-950 relative border-t border-zinc-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Crack hard problems in seconds</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Our pipeline processes complex inputs, analyzes them through a pedagogical lens, and outputs structured clarity.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0 -translate-y-1/2 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:border-emerald-500/50 transition-colors duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Upload className="w-8 h-8 text-zinc-300 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Upload Context</h3>
              <p className="text-zinc-500 leading-relaxed">Snap a photo of your textbook, paste a PDF, or type the raw equation.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:border-emerald-500/50 transition-colors duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Cpu className="w-8 h-8 text-zinc-300 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Deep Analysis</h3>
              <p className="text-zinc-500 leading-relaxed">Claude AI analyzes the problem space, mapping it to standard curricula.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:border-emerald-500/50 transition-colors duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CheckCircle2 className="w-8 h-8 text-zinc-300 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Breakthrough</h3>
              <p className="text-zinc-500 leading-relaxed">Receive a step-by-step breakdown, beautifully typeset and fully explained.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section className="py-24 bg-zinc-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-zinc-950/0 to-zinc-950 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Card className="bg-zinc-900/50 border-zinc-800 rounded-none hover:bg-zinc-900 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-center mb-4">
                  <Binary className="w-5 h-5 text-emerald-500" />
                </div>
                <CardTitle className="text-zinc-100">Step-by-Step Breakdowns</CardTitle>
                <CardDescription className="text-zinc-400">Never just the final answer. See the logical derivation of every step, mimicking expert human tutoring.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 rounded-none hover:bg-zinc-900 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-center mb-4">
                  <Globe2 className="w-5 h-5 text-emerald-500" />
                </div>
                <CardTitle className="text-zinc-100">Curriculum Aligned</CardTitle>
                <CardDescription className="text-zinc-400">Solutions are mapped to standard frameworks (AP, IB, A-Level) to ensure the methodology matches what you learn.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 rounded-none hover:bg-zinc-900 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-center mb-4">
                  <FileCode className="w-5 h-5 text-emerald-500" />
                </div>
                <CardTitle className="text-zinc-100">Native Math Rendering</CardTitle>
                <CardDescription className="text-zinc-400">Flawless TeX and LaTeX display. Complex equations, matrices, and integral calculus render perfectly.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 rounded-none hover:bg-zinc-900 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-center mb-4">
                  <Camera className="w-5 h-5 text-emerald-500" />
                </div>
                <CardTitle className="text-zinc-100">Multi-Format Input</CardTitle>
                <CardDescription className="text-zinc-400">Handwritten notes, blurry textbook photos, or raw text. Our vision models extract the problem precisely.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 rounded-none hover:bg-zinc-900 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-center mb-4">
                  <PenTool className="w-5 h-5 text-emerald-500" />
                </div>
                <CardTitle className="text-zinc-100">Deep Writing Analysis</CardTitle>
                <CardDescription className="text-zinc-400">Beyond grammar. Get structural critiques, argumentation flaws, and stylistic improvements for essays.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 rounded-none hover:bg-zinc-900 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-center mb-4">
                  <GraduationCap className="w-5 h-5 text-emerald-500" />
                </div>
                <CardTitle className="text-zinc-100">Smart Exam Generation</CardTitle>
                <CardDescription className="text-zinc-400">Generate infinite practice variants of hard problems to master the underlying concepts before test day.</CardDescription>
              </CardHeader>
            </Card>

          </div>
        </div>
      </section>

      {/* 4. Time Savings Simulator (CRITICAL) */}
      <section className="py-24 bg-zinc-950 border-t border-zinc-900 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 mb-4 bg-zinc-950">ROI Calculator</Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Quantify your efficiency</h2>
              <p className="text-zinc-400">See exactly how much time you save when you augment your brain with our pipeline.</p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-1 md:p-8 rounded-sm shadow-2xl backdrop-blur-xl">
              
              <Tabs defaultValue="student" onValueChange={setSelectedRole} className="w-full">
                <div className="flex justify-center mb-8">
                  <TabsList className="bg-zinc-950 border border-zinc-800 p-1">
                    {Object.entries(roles).map(([key, role]) => (
                      <TabsTrigger 
                        key={key} 
                        value={key}
                        className="px-6 py-2 text-sm font-medium data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-none transition-all"
                      >
                        {role.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {Object.entries(roles).map(([key, role]) => (
                  <TabsContent key={key} value={key} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-3">
                      {role.tasks.map((task) => (
                        <div 
                          key={task.id} 
                          className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 border transition-all duration-300 bg-zinc-950/50 ${selectedTasks[task.id] ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-zinc-800 hover:border-zinc-700'}`}
                        >
                          <div className="flex items-center gap-4 mb-4 md:mb-0">
                            <Checkbox 
                              id={`task-${task.id}`} 
                              checked={!!selectedTasks[task.id]}
                              onCheckedChange={() => handleTaskToggle(task.id)}
                              className="border-zinc-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 rounded-sm"
                            />
                            <label htmlFor={`task-${task.id}`} className="text-zinc-200 font-medium cursor-pointer flex-1">
                              {task.label}
                            </label>
                          </div>
                          
                          <div className="flex items-center gap-6 self-end md:self-auto w-full md:w-auto pl-8 md:pl-0">
                            <div className="text-right">
                              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Without AI</p>
                              <p className="text-zinc-400 line-through decoration-zinc-600">{task.oldTime} {task.unit}</p>
                            </div>
                            
                            <ChevronRight className="w-4 h-4 text-zinc-600" />
                            
                            <div className="text-right">
                              <p className="text-xs text-emerald-500 uppercase tracking-wider mb-1">With Tool</p>
                              <p className="text-emerald-400 font-bold">{task.newTime} {task.unit}</p>
                            </div>
                            
                            <Badge className="ml-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 shrink-0">
                              Save {task.oldTime - task.newTime}m
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Total Summary */}
              <div className="mt-8 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <p className="text-zinc-400 font-medium uppercase tracking-widest text-xs">Your Potential Time Savings</p>
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-bold text-zinc-100 tracking-tighter">
                      {savings.hours}
                    </span>
                    <span className="text-xl text-zinc-500 font-light mb-1">hours / week</span>
                  </div>
                </div>
                
                <div className="w-full md:flex-1 md:max-w-xs px-4 hidden md:block">
                  {/* Visual progress bar representation */}
                  <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-1000 ease-out"
                      style={{ width: `${savings.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs font-mono text-zinc-500">
                    <span>Manual</span>
                    <span className="text-emerald-400">{savings.percentage}% faster</span>
                  </div>
                </div>

                <Button size="lg" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white rounded-none py-6">
                  <Zap className="w-4 h-4 mr-2" />
                  Start saving time
                </Button>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* 5. Subjects Covered */}
      <section className="py-24 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-4 text-center">
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest mb-8">Supported Disciplines</p>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "Literature", "History", "Economics", "Philosophy", "Engineering"].map((subject) => (
              <div 
                key={subject}
                className="px-6 py-3 border border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:border-emerald-500/50 hover:bg-emerald-950/20 hover:text-emerald-300 transition-all cursor-default font-medium text-sm backdrop-blur-sm"
              >
                {subject}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-12 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Atom className="w-6 h-6 text-emerald-500" />
            <span className="text-xl font-bold tracking-tighter text-zinc-100">Solv<span className="text-emerald-500">AI</span></span>
          </div>
          <p className="text-zinc-500 text-sm">
            NASA mission control meets academic rigor. © {new Date().getFullYear()}
          </p>
          <div className="flex gap-4 text-sm text-zinc-500">
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
