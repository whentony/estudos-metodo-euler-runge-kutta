import React, { useState } from 'react';

type Language = 'python' | 'javascript' | 'c';

interface MemoryState {
  [key: string]: string | number;
}

interface Step {
  id: number;
  explain: string;
  memory: MemoryState;
  activeLines: number[] | ((lang: string) => number[]);
}

export default function CodeSimulator() {
  const [lang, setLang] = useState<Language>('python');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // O código fonte completo para cada linguagem
  const codeBlocks = {
    python: [
      "def runge_kutta_4(f, y0, t0, tf, h):",
      "    t = t0",
      "    y = y0",
      "    while t < tf:",
      "        # RK4 Step",
      "        k1 = f(t, y)",
      "        k2 = f(t + h/2, y + h*k1/2)",
      "        k3 = f(t + h/2, y + h*k2/2)",
      "        k4 = f(t + h, y + h*k3)",
      "        ",
      "        # Atualiza y",
      "        y = y + (h/6) * (k1 + 2*k2 + 2*k3 + k4)",
      "        t = t + h",
      "    return y"
    ],
    javascript: [
      "function rungeKutta4(f, y0, t0, tf, h) {",
      "    let t = t0;",
      "    let y = y0;",
      "    while (t < tf) {",
      "        // RK4 Step",
      "        const k1 = f(t, y);",
      "        const k2 = f(t + h/2, y + h*k1/2);",
      "        const k3 = f(t + h/2, y + h*k2/2);",
      "        const k4 = f(t + h, y + h*k3);",
      "        ",
      "        // Atualiza y",
      "        y = y + (h/6) * (k1 + 2*k2 + 2*k3 + k4);",
      "        t = t + h;",
      "    }",
      "    return y;",
      "}"
    ],
    c: [
      "double runge_kutta_4(double (*f)(double, double), double y0, double t0, double tf, double h) {",
      "    double t = t0;",
      "    double y = y0;",
      "    while (t < tf) {",
      "        // RK4 Step",
      "        double k1 = f(t, y);",
      "        double k2 = f(t + h/2.0, y + h*k1/2.0);",
      "        double k3 = f(t + h/2.0, y + h*k2/2.0);",
      "        double k4 = f(t + h, y + h*k3);",
      "        ",
      "        // Atualiza y",
      "        y = y + (h/6.0) * (k1 + 2*k2 + 2*k3 + k4);",
      "        t = t + h;",
      "    }",
      "    return y;",
      "}"
    ]
  };

  // Os passos da simulação (sincronizados com as linhas do código acima)
  const steps: Step[] = [
    {
      id: 0,
      activeLines: [0],
      explain: "A função é chamada com a equação f(t,y), valor inicial (y0=1), tempo inicial (t0=0), tempo final (tf=0.2) e o passo de integração (h=0.1).",
      memory: { t: '?', y: '?', h: 0.1, k1: '?', k2: '?', k3: '?', k4: '?' }
    },
    {
      id: 1,
      activeLines: [1, 2],
      explain: "Inicializamos as variáveis locais t e y com os valores iniciais passados por parâmetro.",
      memory: { t: '0.00', y: '1.000', h: 0.1, k1: '?', k2: '?', k3: '?', k4: '?' }
    },
    {
      id: 2,
      activeLines: [3],
      explain: "Iniciamos o loop que vai iterar no tempo até que 't' atinja o tempo final (tf). Como t=0 e tf=0.2, entramos no loop.",
      memory: { t: '0.00', y: '1.000', h: 0.1, k1: '?', k2: '?', k3: '?', k4: '?' }
    },
    {
      id: 3,
      activeLines: [5],
      explain: "Calculamos k1. Ele avalia a inclinação da curva (derivada) no ponto inicial do passo usando a função da EDO (f). Este é exatamente o mesmo cálculo do método de Euler.",
      memory: { t: '0.00', y: '1.000', h: 0.1, k1: '0.000', k2: '?', k3: '?', k4: '?' }
    },
    {
      id: 4,
      activeLines: [6],
      explain: "Calculamos k2. Pegamos a inclinação k1, avançamos MEIO PASSO (h/2) para frente e estimamos o 'y' lá. Então, calculamos a inclinação nesse novo ponto médio.",
      memory: { t: '0.00', y: '1.000', h: 0.1, k1: '0.000', k2: '0.050', k3: '?', k4: '?' }
    },
    {
      id: 5,
      activeLines: [7],
      explain: "Calculamos k3. Ainda no MEIO do passo, pegamos a nova inclinação k2 e fazemos outra estimativa. Isso refina nossa precisão para a derivada central.",
      memory: { t: '0.00', y: '1.000', h: 0.1, k1: '0.000', k2: '0.050', k3: '0.050', k4: '?' }
    },
    {
      id: 6,
      activeLines: [8],
      explain: "Calculamos k4. Agora pulamos para o FIM DO PASSO (t+h) usando o k3 (a inclinação mais precisa do centro). Calculamos a inclinação lá na ponta.",
      memory: { t: '0.00', y: '1.000', h: 0.1, k1: '0.000', k2: '0.050', k3: '0.050', k4: '0.100' }
    },
    {
      id: 7,
      activeLines: [11],
      explain: "O momento mágico do RK4! Atualizamos o 'y' final somando a ele uma média ponderada das 4 inclinações (k1, k2, k3, k4). k2 e k3 têm peso dobrado (2*) pois representam o centro da curva e são mais confiáveis.",
      memory: { t: '0.00', y: '1.005', h: 0.1, k1: '0.000', k2: '0.050', k3: '0.050', k4: '0.100' }
    },
    {
      id: 8,
      activeLines: [12],
      explain: "Avançamos o tempo global 't' somando o passo 'h'. O primeiro passo do loop terminou e a nova iteração vai começar.",
      memory: { t: '0.10', y: '1.005', h: 0.1, k1: '0.000', k2: '0.050', k3: '0.050', k4: '0.100' }
    },
    {
      id: 9,
      activeLines: [3],
      explain: "O loop avalia novamente: t (0.10) < tf (0.2). A condição é verdadeira, então vamos para o segundo e último passo.",
      memory: { t: '0.10', y: '1.005', h: 0.1, k1: '?', k2: '?', k3: '?', k4: '?' }
    },
    {
      id: 10,
      activeLines: [5, 6, 7, 8],
      explain: "O processo (k1, k2, k3, k4) se repete para este novo intervalo de [0.1, 0.2]. As derivadas agora usarão o novo valor de y (1.005).",
      memory: { t: '0.10', y: '1.005', h: 0.1, k1: '0.100', k2: '0.155', k3: '0.158', k4: '0.216' }
    },
    {
      id: 11,
      activeLines: [11, 12],
      explain: "Nova atualização de y usando os Ks recém-calculados. O tempo 't' é incrementado para 0.20.",
      memory: { t: '0.20', y: '1.021', h: 0.1, k1: '0.100', k2: '0.155', k3: '0.158', k4: '0.216' }
    },
    {
      id: 12,
      activeLines: [3],
      explain: "O loop verifica novamente: t (0.20) < tf (0.2) é FALSO. O loop se encerra.",
      memory: { t: '0.20', y: '1.021', h: 0.1, k1: '0.100', k2: '0.155', k3: '0.158', k4: '0.216' }
    },
    {
      id: 13,
      activeLines: (l: string) => l === 'python' ? [13] : [14],
      explain: "A função finaliza retornando o valor integrado 'y' (1.021). A execução está completa!",
      memory: { t: '0.20', y: '1.021', h: 0.1, k1: '-', k2: '-', k3: '-', k4: '-' }
    }
  ];

  const currentStep = steps[currentStepIndex];
  const lines = codeBlocks[lang];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            Simulador de Código <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-sm rounded-full">Passo a Passo</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Entenda exatamente como a memória e a lógica do Runge-Kutta funcionam por debaixo dos panos.
          </p>
        </div>

        {/* CONTROLES GERAIS */}
        <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            <button 
              onClick={() => { setLang('python'); handleReset(); }}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${lang === 'python' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Python
            </button>
            <button 
              onClick={() => { setLang('javascript'); handleReset(); }}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${lang === 'javascript' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              JavaScript
            </button>
            <button 
              onClick={() => { setLang('c'); handleReset(); }}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${lang === 'c' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Linguagem C
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-md disabled:opacity-50 hover:bg-gray-300 transition-colors"
            >
              &larr; Voltar
            </button>
            <button 
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1}
              className="px-6 py-2 bg-green-600 text-white font-bold rounded-md shadow disabled:opacity-50 hover:bg-green-700 transition-colors"
            >
              {currentStepIndex === steps.length - 1 ? 'Finalizado' : 'Próximo Passo →'}
            </button>
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-md hover:bg-red-200 transition-colors ml-2"
            >
              Reiniciar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PAINEL DO CÓDIGO (ESQUERDA) */}
          <div className="lg:col-span-8 bg-[#1e1e1e] rounded-xl shadow-xl overflow-hidden border border-gray-700">
            <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-gray-700">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-400 text-xs ml-2 font-mono">runge_kutta.{lang === 'python' ? 'py' : lang === 'javascript' ? 'js' : 'c'}</span>
            </div>
            <div className="p-4 font-mono text-sm leading-relaxed overflow-x-auto">
              {lines.map((line, idx) => {
                // Checa se a linha atual está na lista de linhas ativas deste step
                const activeArr = typeof currentStep.activeLines === 'function' ? currentStep.activeLines(lang) : currentStep.activeLines;
                const isActive = activeArr.includes(idx);
                
                return (
                  <div 
                    key={idx} 
                    className={`flex px-2 py-0.5 rounded transition-colors duration-200 ${isActive ? 'bg-blue-900 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`}
                  >
                    <span className="text-gray-500 w-8 select-none">{idx + 1}</span>
                    <span className={`${isActive ? 'text-blue-100' : 'text-gray-300'}`}>
                      {/* Preserva espaços em branco */}
                      {line.replace(/ /g, '\u00A0')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PAINEL DE EXPLICAÇÃO E MEMÓRIA (DIREITA) */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  {currentStepIndex + 1}
                </span>
                O que está acontecendo?
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {currentStep.explain}
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl shadow p-5 text-gray-100">
              <h3 className="font-bold text-gray-200 mb-4 border-b border-gray-600 pb-2">Variáveis na Memória RAM</h3>
              
              <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                <div className="bg-gray-900 p-2 rounded flex justify-between items-center border border-gray-700">
                  <span className="text-pink-400">t:</span>
                  <span className="text-white font-bold">{currentStep.memory.t}</span>
                </div>
                <div className="bg-gray-900 p-2 rounded flex justify-between items-center border border-gray-700">
                  <span className="text-green-400">y:</span>
                  <span className="text-white font-bold">{currentStep.memory.y}</span>
                </div>
                <div className="bg-gray-900 p-2 rounded flex justify-between items-center border border-gray-700">
                  <span className="text-blue-300">h:</span>
                  <span className="text-white">{currentStep.memory.h}</span>
                </div>
              </div>

              <h4 className="text-xs text-gray-400 mt-4 mb-2 uppercase tracking-wide">Inclinações (Derivadas)</h4>
              
              <div className="space-y-2 font-mono text-sm">
                <div className={`p-2 rounded flex justify-between items-center transition-colors ${currentStepIndex >= 3 && currentStepIndex <= 10 ? 'bg-blue-900 border border-blue-500' : 'bg-gray-900 border border-gray-700'}`}>
                  <span className="text-yellow-300">k1 (início):</span>
                  <span className="text-white">{currentStep.memory.k1}</span>
                </div>
                <div className={`p-2 rounded flex justify-between items-center transition-colors ${currentStepIndex >= 4 && currentStepIndex <= 10 ? 'bg-blue-900 border border-blue-500' : 'bg-gray-900 border border-gray-700'}`}>
                  <span className="text-yellow-300">k2 (meio 1):</span>
                  <span className="text-white">{currentStep.memory.k2}</span>
                </div>
                <div className={`p-2 rounded flex justify-between items-center transition-colors ${currentStepIndex >= 5 && currentStepIndex <= 10 ? 'bg-blue-900 border border-blue-500' : 'bg-gray-900 border border-gray-700'}`}>
                  <span className="text-yellow-300">k3 (meio 2):</span>
                  <span className="text-white">{currentStep.memory.k3}</span>
                </div>
                <div className={`p-2 rounded flex justify-between items-center transition-colors ${currentStepIndex >= 6 && currentStepIndex <= 10 ? 'bg-blue-900 border border-blue-500' : 'bg-gray-900 border border-gray-700'}`}>
                  <span className="text-yellow-300">k4 (fim):</span>
                  <span className="text-white">{currentStep.memory.k4}</span>
                </div>
              </div>
              
              {/* Progresso Geral */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progresso da Simulação</span>
                  <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-900 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
