import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ============================================================================
// IMPLEMENTAÇÃO DOS MÉTODOS NUMÉRICOS - MODELO LOGÍSTICO
// ============================================================================

// Modelo Logístico: dy/dt = r * y * (1 - y/K)
const modeloLogistico = (t, y, r, K) => {
  return r * y * (1 - y / K);
};

// Solução Analítica (Exata)
const solucaoExata = (t, r, K, y0) => {
  return (K * y0) / (y0 + (K - y0) * Math.exp(-r * t));
};

// Método de Euler (Ordem 1)
const euler = (r, K, y0, tf, h) => {
  const n = Math.floor(tf / h);
  const resultado = [];
  let y = y0;
  let t = 0;
  resultado.push({ t, y });

  for (let i = 0; i < n; i++) {
    const dydt = modeloLogistico(t, y, r, K);
    y = y + h * dydt;
    t = t + h;
    resultado.push({ t, y });
  }
  return resultado;
};

// Método de Euler Aprimorado (Heun/RK2)
const eulerAprimorado = (r, K, y0, tf, h) => {
  const n = Math.floor(tf / h);
  const resultado = [];
  let y = y0;
  let t = 0;
  resultado.push({ t, y });

  for (let i = 0; i < n; i++) {
    const k1 = modeloLogistico(t, y, r, K);
    const k2 = modeloLogistico(t + h, y + h * k1, r, K);
    y = y + (h / 2) * (k1 + k2);
    t = t + h;
    resultado.push({ t, y });
  }
  return resultado;
};

// Método de Runge-Kutta 4ª Ordem
const rungeKutta4 = (r, K, y0, tf, h) => {
  const n = Math.floor(tf / h);
  const resultado = [];
  let y = y0;
  let t = 0;
  resultado.push({ t, y });

  for (let i = 0; i < n; i++) {
    const k1 = modeloLogistico(t, y, r, K);
    const k2 = modeloLogistico(t + h / 2, y + (h / 2) * k1, r, K);
    const k3 = modeloLogistico(t + h / 2, y + (h / 2) * k2, r, K);
    const k4 = modeloLogistico(t + h, y + h * k3, r, K);
    y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    t = t + h;
    resultado.push({ t, y });
  }
  return resultado;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ModeloLogisticoMultiplo() {
  // Parâmetros do modelo
  const [r, setR] = useState(0.05);
  const [K, setK] = useState(1.0);
  const [tf, setTf] = useState(100);
  const [h, setH] = useState(2.0);

  // Condições iniciais (múltiplas) - usando objetos para facilitar
  const [condicoes, setCondicoes] = useState([
    { y0: 0.15, ativo: true },
    { y0: 0.50, ativo: true },
    { y0: 0.90, ativo: true },
    { y0: 1.20, ativo: true },
    { y0: 1.50, ativo: true },
  ]);

  // Métodos ativos
  const [mostrarExata, setMostrarExata] = useState(true);
  const [mostrarEuler, setMostrarEuler] = useState(true);
  const [mostrarEulerApr, setMostrarEulerApr] = useState(true);
  const [mostrarRK, setMostrarRK] = useState(true);

  // Atualizar condição inicial
  const atualizarCondicao = (index, campo, valor) => {
    const novasCondicoes = [...condicoes];
    novasCondicoes[index] = { ...novasCondicoes[index], [campo]: valor };
    setCondicoes(novasCondicoes);
  };

  // Gerar dados para o gráfico
  const dados = useMemo(() => {
    const condicoesAtivas = condicoes.filter(c => c.ativo);

    // Criar pontos de tempo
    const nPontos = Math.floor(tf / h) + 1;
    const tempos = Array.from({ length: nPontos }, (_, i) => i * h);

    // Calcular soluções para cada condição inicial
    const todasSolucoes = condicoesAtivas.map((cond, idx) => {
      const exata = tempos.map(t => solucaoExata(t, r, K, cond.y0));
      const eulerSol = euler(r, K, cond.y0, tf, h);
      const eulerAprSol = eulerAprimorado(r, K, cond.y0, tf, h);
      const rk4Sol = rungeKutta4(r, K, cond.y0, tf, h);

      return {
        y0: cond.y0,
        idx,
        exata,
        euler: eulerSol.map(p => p.y),
        eulerApr: eulerAprSol.map(p => p.y),
        rk4: rk4Sol.map(p => p.y),
      };
    });

    // Formatar dados para o gráfico
    const dadosGrafico = tempos.map((t, i) => {
      const ponto = { t: t.toFixed(1) };
      todasSolucoes.forEach((sol, j) => {
        ponto[`exata_${j}`] = sol.exata[i];
        ponto[`euler_${j}`] = sol.euler[i];
        ponto[`eulerApr_${j}`] = sol.eulerApr[i];
        ponto[`rk4_${j}`] = sol.rk4[i];
      });
      return ponto;
    });

    return { dadosGrafico, todasSolucoes, tempos };
  }, [r, K, tf, h, condicoes]);

  // Slider component
  const Slider = ({ label, value, setValue, min, max, step }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-blue-600">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );

  const condicoesAtivasCount = condicoes.filter(c => c.ativo).length;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Título */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            Comparação: Euler, Euler Aprimorado e Runge-Kutta — Modelo Logístico
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            dy/dt = r · y · (1 - y/K)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Painel de Controles */}
          <div className="lg:col-span-1 space-y-4">
            {/* Parâmetros do Modelo */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b">Parâmetros</h2>
              <Slider label="Taxa r" value={r} setValue={setR} min={0.01} max={0.5} step={0.01} />
              <Slider label="Capacidade K" value={K} setValue={setK} min={0.5} max={2} step={0.1} />
              <Slider label="Tempo Final" value={tf} setValue={setTf} min={20} max={200} step={10} />
              <Slider label="Passo h" value={h} setValue={setH} min={0.5} max={10} step={0.5} />
            </div>

            {/* Condições Iniciais */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b">Condições Iniciais (y₀)</h2>
              {condicoes.map((cond, idx) => (
                <div key={idx} className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={cond.ativo}
                    onChange={(e) => atualizarCondicao(idx, 'ativo', e.target.checked)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm text-gray-600 w-8">y₀{idx + 1}:</span>
                  <input
                    type="number"
                    value={cond.y0}
                    onChange={(e) => atualizarCondicao(idx, 'y0', parseFloat(e.target.value) || 0.1)}
                    step="0.05"
                    min="0.01"
                    max="3"
                    disabled={!cond.ativo}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-white disabled:bg-gray-100 disabled:text-gray-400"
                    style={{ color: cond.ativo ? '#1f2937' : '#9ca3af' }}
                  />
                </div>
              ))}
            </div>

            {/* Métodos */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b">Métodos</h2>

              <label className="flex items-center gap-3 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mostrarExata}
                  onChange={(e) => setMostrarExata(e.target.checked)}
                  className="w-4 h-4 accent-gray-800"
                />
                <span className="w-8 h-0.5 border-t-2 border-dashed border-gray-800"></span>
                <span className="text-sm text-gray-800">Solução exata</span>
              </label>

              <label className="flex items-center gap-3 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mostrarEuler}
                  onChange={(e) => setMostrarEuler(e.target.checked)}
                  className="w-4 h-4 accent-green-600"
                />
                <span className="w-8 h-0.5 bg-green-600"></span>
                <span className="text-sm text-green-600">Euler</span>
              </label>

              <label className="flex items-center gap-3 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mostrarEulerApr}
                  onChange={(e) => setMostrarEulerApr(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="w-8 h-0.5 bg-blue-600"></span>
                <span className="text-sm text-blue-600">Euler Aprimorado</span>
              </label>

              <label className="flex items-center gap-3 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mostrarRK}
                  onChange={(e) => setMostrarRK(e.target.checked)}
                  className="w-4 h-4 accent-red-800"
                />
                <span className="w-8 h-0.5 bg-red-800"></span>
                <span className="text-sm text-red-800">Runge-Kutta</span>
              </label>
            </div>
          </div>

          {/* Gráfico */}
          <div className="lg:col-span-4 bg-white rounded-lg shadow p-4">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dados.dadosGrafico} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="t"
                    label={{ value: 't', position: 'bottom', offset: 0 }}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    label={{ value: 'y', angle: -90, position: 'insideLeft', offset: 10 }}
                    tick={{ fontSize: 11 }}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    formatter={(value) => typeof value === 'number' ? value.toFixed(4) : value}
                    labelFormatter={(label) => `t = ${label}`}
                  />
                  <Legend
                    verticalAlign="top"
                    wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
                  />

                  {/* Renderizar linhas para cada condição inicial */}
                  {dados.todasSolucoes.map((sol, idx) => (
                    <React.Fragment key={idx}>
                      {/* Euler - linha verde */}
                      {mostrarEuler && (
                        <Line
                          type="monotone"
                          dataKey={`euler_${idx}`}
                          stroke="#22c55e"
                          strokeWidth={2}
                          dot={false}
                          name={idx === 0 ? "Euler" : `_euler_${idx}`}
                          legendType={idx === 0 ? "line" : "none"}
                        />
                      )}

                      {/* Euler Aprimorado - linha azul */}
                      {mostrarEulerApr && (
                        <Line
                          type="monotone"
                          dataKey={`eulerApr_${idx}`}
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                          name={idx === 0 ? "Euler Aprimorado" : `_eulerApr_${idx}`}
                          legendType={idx === 0 ? "line" : "none"}
                        />
                      )}

                      {/* Runge-Kutta - linha vermelha/marrom */}
                      {mostrarRK && (
                        <Line
                          type="monotone"
                          dataKey={`rk4_${idx}`}
                          stroke="#991b1b"
                          strokeWidth={2}
                          dot={false}
                          name={idx === 0 ? "Runge-Kutta" : `_rk4_${idx}`}
                          legendType={idx === 0 ? "line" : "none"}
                        />
                      )}

                      {/* Solução Exata - linha preta tracejada */}
                      {mostrarExata && (
                        <Line
                          type="monotone"
                          dataKey={`exata_${idx}`}
                          stroke="#1f2937"
                          strokeWidth={2}
                          strokeDasharray="8 4"
                          dot={false}
                          name={idx === 0 ? "Solução exata" : `_exata_${idx}`}
                          legendType={idx === 0 ? "line" : "none"}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Info box */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                <div>
                  <span className="text-gray-600">Condições iniciais:</span>
                  <span className="font-bold text-blue-600 ml-1">{condicoesAtivasCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Passo h:</span>
                  <span className="font-bold text-blue-600 ml-1">{h}</span>
                </div>
                <div>
                  <span className="text-gray-600">Nº de passos:</span>
                  <span className="font-bold text-blue-600 ml-1">{Math.floor(tf / h)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Todas → K =</span>
                  <span className="font-bold text-blue-600 ml-1">{K}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fórmulas */}
        <div className="mt-4 bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-gray-800 mb-3">Fórmulas dos Métodos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="font-bold text-green-700 mb-2">Euler (Ordem 1)</div>
              <div className="font-mono text-dark text-xs  p-2 rounded" style={{ color: 'black' }}>
                y<sub>n+1</sub> = y<sub>n</sub> + h · f(t<sub>n</sub>, y<sub>n</sub>)
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="font-bold text-blue-700 mb-2">Euler Aprimorado (Ordem 2)</div>
              <div className="font-mono text-dark text-xs  p-2 rounded" style={{ color: 'black' }}>
                k₁ = f(t<sub>n</sub>, y<sub>n</sub>)<br />
                k₂ = f(t<sub>n</sub>+h, y<sub>n</sub>+h·k₁)<br />
                y<sub>n+1</sub> = y<sub>n</sub> + (h/2)(k₁+k₂)
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-800">
              <div className="font-bold text-red-800 mb-2">Runge-Kutta 4ª Ordem</div>
              <div className="font-mono text-dark text-xs  p-2 rounded" style={{ color: 'black' }}>
                k₁ = f(t<sub>n</sub>, y<sub>n</sub>)<br />
                k₂ = f(t<sub>n</sub>+h/2, y<sub>n</sub>+h·k₁/2)<br />
                k₃ = f(t<sub>n</sub>+h/2, y<sub>n</sub>+h·k₂/2)<br />
                k₄ = f(t<sub>n</sub>+h, y<sub>n</sub>+h·k₃)<br />
                y<sub>n+1</sub> = y<sub>n</sub> + (h/6)(k₁+2k₂+2k₃+k₄)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}