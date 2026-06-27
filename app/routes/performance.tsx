import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Info, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

// Tipos para as linguagens
type LanguageConfig = {
  id: string;
  name: string;
  color: string;
  chartColor: string;
  description: string;
  layers: { name: string; delay: number; desc: string }[];
  loopOverhead: number;
};

const languages: LanguageConfig[] = [
  {
    id: 'c',
    name: 'C / C++',
    color: 'bg-gray-800',
    chartColor: '#1f2937',
    description: 'Compilado Ahead-of-Time (AOT). Executa direto no processador.',
    loopOverhead: 10,
    layers: [
      { name: 'Código Fonte', delay: 10, desc: 'RK4 em C' },
      { name: 'Compilador (GCC/Clang)', delay: 10, desc: 'Otimização agressiva' },
      { name: 'Código de Máquina (CPU)', delay: 40, desc: 'Execução sem intermediários' }
    ]
  },
  {
    id: 'js',
    name: 'JavaScript (V8)',
    color: 'bg-yellow-500',
    chartColor: '#eab308',
    description: 'Compilado Just-In-Time (JIT). Altamente otimizado em execução.',
    loopOverhead: 50,
    layers: [
      { name: 'Código Fonte', delay: 10, desc: 'RK4 em JS' },
      { name: 'Motor V8 (Interpreter)', delay: 60, desc: 'Bytecode inicial' },
      { name: 'Compilador JIT (TurboFan)', delay: 80, desc: 'Otimiza loop numérico' },
      { name: 'CPU', delay: 45, desc: 'Execução veloz pós-warmup' }
    ]
  },
  {
    id: 'matlab',
    name: 'MATLAB',
    color: 'bg-orange-600',
    chartColor: '#ea580c',
    description: 'JIT com bibliotecas core super rápidas.',
    loopOverhead: 120, // Laços for têm overhead, mas libs são rápidas
    layers: [
      { name: 'Código Fonte', delay: 10, desc: 'RK4 em MATLAB' },
      { name: 'MATLAB JIT Compiler', delay: 120, desc: 'Tentativa de otimização' },
      { name: 'Core C/Fortran Libs', delay: 40, desc: 'Delega para C/Fortran' },
      { name: 'CPU', delay: 40, desc: 'Execução veloz do núcleo' }
    ]
  },
  {
    id: 'python-numpy',
    name: 'Python (NumPy)',
    color: 'bg-teal-600',
    chartColor: '#0d9488',
    description: 'Interpretado, mas delega arrays vetorizados para C.',
    loopOverhead: 25,
    layers: [
      { name: 'Código Fonte', delay: 10, desc: 'RK4 vetorizado em Numpy' },
      { name: 'Interpretador CPython', delay: 30, desc: 'Processa a chamada da função' },
      { name: 'NumPy C-API', delay: 20, desc: 'Contorna o GIL para arrays' },
      { name: 'Bibliotecas C (BLAS)', delay: 30, desc: 'Loop numérico bruto em C' },
      { name: 'CPU', delay: 25, desc: 'Processamento nativo rápido' }
    ]
  },
  {
    id: 'python',
    name: 'Python Puro',
    color: 'bg-blue-600',
    chartColor: '#2563eb',
    description: 'Interpretado, objetos dinâmicos. Laços "for" lentos.',
    loopOverhead: 300,
    layers: [
      { name: 'Código Fonte', delay: 10, desc: 'RK4 puro com listas' },
      { name: 'Bytecode Compiler', delay: 70, desc: 'Instruções .pyc' },
      { name: 'Virtual Machine', delay: 200, desc: 'Passo a passo' },
      { name: 'C-API / GIL', delay: 180, desc: 'Boxing/Unboxing excessivo' },
      { name: 'CPU', delay: 100, desc: 'Chega na CPU com atraso' }
    ]
  }
];

export default function PerformanceRK4() {
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);
  const [iterations, setIterations] = useState<Record<string, number>>({
    c: 0, js: 0, matlab: 0, 'python-numpy': 0, python: 0
  });
  const [activeLayer, setActiveLayer] = useState<Record<string, number>>({
    c: -1, js: -1, matlab: -1, 'python-numpy': -1, python: -1
  });
  const [finished, setFinished] = useState<Record<string, boolean>>({
    c: false, js: false, matlab: false, 'python-numpy': false, python: false
  });
  
  const [totalSteps, setTotalSteps] = useState(20);

  const startAnimation = () => {
    setIsRunning(true);
    isRunningRef.current = true;
    
    setIterations({ c: 0, js: 0, matlab: 0, 'python-numpy': 0, python: 0 });
    setActiveLayer({ c: -1, js: -1, matlab: -1, 'python-numpy': -1, python: -1 });
    setFinished({ c: false, js: false, matlab: false, 'python-numpy': false, python: false });

    languages.forEach(lang => {
      runLanguageSimulation(lang.id, lang);
    });
  };

  const runLanguageSimulation = async (id: string, lang: LanguageConfig) => {
    let currentIteration = 0;

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    while (currentIteration < totalSteps) {
      if (!isRunningRef.current) break; 
      
      if (currentIteration === 0) {
        for (let i = 0; i < lang.layers.length; i++) {
          if (!isRunningRef.current) break;
          setActiveLayer(prev => ({ ...prev, [id]: i }));
          await sleep(lang.layers[i].delay);
        }
      } else {
        const bottleneckLayer = 
          lang.id === 'python' ? 2 : 
          (lang.id === 'matlab' ? 1 : 
          (lang.id === 'python-numpy' ? 3 : lang.layers.length - 1));
          
        setActiveLayer(prev => ({ ...prev, [id]: bottleneckLayer }));
        await sleep(lang.loopOverhead / 2);
        
        if (!isRunningRef.current) break;
        
        setActiveLayer(prev => ({ ...prev, [id]: lang.layers.length - 1 })); 
        await sleep(lang.loopOverhead / 2);
      }

      if (!isRunningRef.current) break;
      currentIteration++;
      setIterations(prev => ({ ...prev, [id]: currentIteration }));
    }

    if (isRunningRef.current) {
      setFinished(prev => ({ ...prev, [id]: true }));
      setActiveLayer(prev => ({ ...prev, [id]: -1 }));
    }
  };

  useEffect(() => {
    return () => {
      setIsRunning(false);
      isRunningRef.current = false;
    };
  }, []);

  const resetAnimation = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setIterations({ c: 0, js: 0, matlab: 0, 'python-numpy': 0, python: 0 });
    setActiveLayer({ c: -1, js: -1, matlab: -1, 'python-numpy': -1, python: -1 });
    setFinished({ c: false, js: false, matlab: false, 'python-numpy': false, python: false });
  };

  const isAllFinished = Object.values(finished).every(Boolean);

  // Calcular tempo simulado total: (soma dos delays das camadas) + (passos - 1) * overhead
  const chartData = languages.map(lang => {
    const startupTime = lang.layers.reduce((sum, l) => sum + l.delay, 0);
    const loopTime = Math.max(0, totalSteps - 1) * lang.loopOverhead;
    return {
      name: lang.name,
      id: lang.id,
      color: lang.chartColor,
      'Tempo Estimado': startupTime + loopTime
    };
  }).sort((a, b) => a['Tempo Estimado'] - b['Tempo Estimado']);

  return (
    <div className="max-w-[90rem] mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Por que algumas linguagens são mais rápidas?</h1>
        <p className="mt-2 text-lg text-gray-600">
          Visualizando a execução do Método de Runge-Kutta de 4ª Ordem (RK4) através das camadas de abstração de diferentes linguagens de programação.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={startAnimation}
            disabled={isRunning && !isAllFinished}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Play className="w-5 h-5 mr-2" />
            Iniciar Execução Comparativa
          </button>
          <button
            onClick={resetAnimation}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reiniciar
          </button>
          
          <div className="flex flex-col bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 ml-2 min-w-[250px]">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="iterations-slider" className="text-sm font-medium text-gray-700">
                Nº de Iterações:
              </label>
              <input
                id="iterations"
                type="number"
                min="1"
                max="200"
                value={totalSteps}
                onChange={(e) => setTotalSteps(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
                disabled={isRunning && !isAllFinished}
                className="w-16 px-1 py-0.5 border border-gray-300 rounded text-sm text-center text-gray-900 bg-white disabled:text-gray-500 disabled:bg-gray-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <input
              id="iterations-slider"
              type="range"
              min="1"
              max="200"
              step="1"
              value={totalSteps}
              onChange={(e) => setTotalSteps(parseInt(e.target.value))}
              disabled={isRunning && !isAllFinished}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
          <Info className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
          Velocidade de animação reduzida para fins didáticos.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {languages.map((lang) => {
          const progress = (iterations[lang.id] / totalSteps) * 100;
          const isDone = finished[lang.id];
          
          return (
            <div key={lang.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex flex-col">
              <div className={`${lang.color} p-4 text-white`}>
                <h2 className="text-lg font-bold">{lang.name}</h2>
                <p className="text-xs opacity-90 mt-1 h-10">{lang.description}</p>
              </div>

              <div className="p-4 flex-1 flex flex-col space-y-3 relative bg-gray-50">
                <div className="absolute top-8 bottom-8 left-1/2 w-1 bg-gray-200 -translate-x-1/2 z-0 rounded-full"></div>
                
                {lang.layers.map((layer, index) => {
                  const isActive = activeLayer[lang.id] === index;
                  
                  return (
                    <div 
                      key={index} 
                      className={`relative z-10 p-3 rounded-lg border-2 transition-all duration-200 ${
                        isActive 
                          ? 'border-blue-500 bg-blue-50 shadow-md scale-105' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <h3 className={`font-semibold text-xs ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                        {layer.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{layer.desc}</p>
                      
                      {isActive && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-gray-700">Progresso</span>
                  <span className={isDone ? 'text-green-600 font-bold' : 'text-gray-600'}>
                    {iterations[lang.id]} / {totalSteps} {isDone && ' (Fim)'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`${lang.color} h-2.5 rounded-full transition-all duration-300 ease-out`} 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráfico Comparativo Final */}
      {isAllFinished && isRunning && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
            <BarChart2 className="w-6 h-6 mr-2 text-blue-600" />
            Resultado da Comparação (Tempo Total Simulado)
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            O gráfico abaixo representa o custo de processamento total (startup + iterações do RK4). Barras menores indicam execução mais rápida.
          </p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" label={{ value: 'Tempo Relativo Simulado (ms)', position: 'bottom', offset: -5 }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }} />
                <RechartsTooltip 
                  formatter={(value: number) => [`${value} unidades`, 'Tempo']}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar dataKey="Tempo Estimado" radius={[0, 4, 4, 0]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-800 p-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Info className="w-6 h-6 mr-2" />
            Análise Técnica: Por que isso acontece?
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-700">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-3 border-b pb-2">O Loop Numérico e Tipagem Dinâmica</h3>
            <p className="mb-4">
              <strong className="text-gray-900">Em C/C++</strong>, o compilador traduz as equações do RK4 para poucas instruções assembly super otimizadas. Tudo é processado imediatamente pela CPU com overhead quase zero.
            </p>
            <p>
              <strong className="text-gray-900">Em Python Puro</strong>, por não ter tipo definido nativamente, toda vez que se soma <code className="bg-gray-100 px-1 rounded">k1 + k2</code>, o Python roda um processo demorado de verificar tipos (Boxing/Unboxing) e alocar novos objetos em memória. A presença do <em>Global Interpreter Lock (GIL)</em> e o ciclo da Máquina Virtual tornam laços "for" um pesadelo matemático.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-3 border-b pb-2">As Cartas na Manga: JIT e NumPy</h3>
            <p className="mb-4">
              <strong className="text-gray-900">JavaScript (V8)</strong> e <strong className="text-gray-900">MATLAB</strong> são linguagens dinâmicas, mas usam o "truque" do compilador <em>Just-In-Time</em>. O motor percebe que você só está fazendo cálculos com variáveis que nunca mudam de tipo e as converte secretamente em código de máquina veloz enquanto o código já está rodando.
            </p>
            <p>
              Por fim, o <strong className="text-gray-900">Python com NumPy</strong> resolve a lentidão de uma forma brilhante: ele passa as contas (arrays vetorizados) do interpretador de Python direto para bibliotecas C ultrarrápidas escondidas por baixo dos panos. É por isso que ele ganha um ganho colossal de performance quando você usa tensores, driblando quase todas as restrições normais do Python.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
