import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import euler from '~/utils/metodoEuler';
import eulerAprimorado from '~/utils/metodoEulerAprimorado';
import rungeKutta4 from '~/utils/metodoRungeKutta4';
import rungeKutta4Sistema from '~/utils/modelos';
import solucaoExata from '~/utils/solucaoExata';

// ============================================================================
// COMPONENTE PREDADOR-PRESA
// ============================================================================
function PredadorPresa() {
  // Parâmetros do modelo predador-presa - AJUSTADOS PARA ÓRBITAS FECHADAS
  const [a, setA] = useState(1.0);    // Taxa de crescimento das presas
  const [b, setB] = useState(0.1);    // Taxa de predação
  const [c, setC] = useState(0.075);  // Taxa de crescimento dos predadores
  const [d, setD] = useState(1.5);    // Taxa de mortalidade dos predadores
  const [tf, setTf] = useState(100);  // Tempo final reduzido
  const [h, setH] = useState(0.05);   // Passo ajustado para performance

  // Múltiplas condições iniciais - próximas do ponto de equilíbrio
  const [trajetorias, setTrajetorias] = useState([
    { x10: 15, x20: 10, ativo: true, cor: '#ef4444' },
    { x10: 18, x20: 12, ativo: true, cor: '#f59e0b' },
    { x10: 22, x20: 15, ativo: true, cor: '#8b5cf6' },
    { x10: 12, x20: 8, ativo: false, cor: '#10b981' },
  ]);

  const atualizarTrajetoria = (index: number, campo: string, valor: any) => {
    const novasTrajetorias = [...trajetorias];
    novasTrajetorias[index] = { ...novasTrajetorias[index], [campo]: valor };
    setTrajetorias(novasTrajetorias);
  };

  const dados = useMemo(() => {
    const trajetoriasAtivas = trajetorias.filter(t => t.ativo);

    // Calcular todas as trajetórias
    const todasTrajetorias = trajetoriasAtivas.map(traj => {
      const f1Local = (t: number, x1: number, x2: number): number => a * x1 - b * x1 * x2;
      const f2Local = (t: number, x1: number, x2: number): number => -d * x2 + c * x1 * x2;

      const resultados = rungeKutta4Sistema(f1Local, f2Local, traj.x10, traj.x20, tf, h);

      // OTIMIZAÇÃO: Reduzir pontos para renderização (pegar 1 a cada 5 pontos)
      const resultadosReduzidos = resultados.filter((_, idx) => idx % 5 === 0);

      return {
        ...traj,
        dados: resultadosReduzidos
      };
    });

    // Para gráfico temporal, usar apenas a primeira trajetória ativa
    const dadosTemporal = todasTrajetorias[0]?.dados || [];

    return { todasTrajetorias, dadosTemporal };
  }, [a, b, c, d, trajetorias, tf, h]);

  const Slider = ({ label, value, setValue, min, max, step }: {
    label: string;
    value: number;
    setValue: (v: number) => void;
    min: number;
    max: number;
    step: number
  }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-blue-600">{value.toFixed(2)}</span>
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            Modelo Predador-Presa (Lotka-Volterra) - Runge-Kutta 4
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            dx₁/dt = ax₁ - bx₁x₂ &nbsp;&nbsp;|&nbsp;&nbsp; dx₂/dt = -dx₂ + cx₁x₂
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Controles */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b">Parâmetros</h2>
              <Slider label="a (crescimento presas)" value={a} setValue={setA} min={0.1} max={2} step={0.1} />
              <Slider label="b (taxa predação)" value={b} setValue={setB} min={0.01} max={0.5} step={0.01} />
              <Slider label="c (crescimento predadores)" value={c} setValue={setC} min={0.01} max={0.2} step={0.005} />
              <Slider label="d (mortalidade predadores)" value={d} setValue={setD} min={0.1} max={3} step={0.1} />

              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                <strong>Ponto de Equilíbrio:</strong><br />
                x₁* = {(d / c).toFixed(1)} | x₂* = {(a / b).toFixed(1)}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b">Condições Iniciais</h2>
              {trajetorias.map((traj, idx) => (
                <div key={idx} className="mb-3 p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={traj.ativo}
                      onChange={(e) => atualizarTrajetoria(idx, 'ativo', e.target.checked)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: traj.cor }}
                    ></span>
                    <span className="text-xs font-medium text-gray-700">Trajetória {idx + 1}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-12">Presas:</span>
                      <input
                        type="number"
                        value={traj.x10}
                        onChange={(e) => atualizarTrajetoria(idx, 'x10', parseFloat(e.target.value) || 1)}
                        disabled={!traj.ativo}
                        className="flex-1 px-2 py-1 text-xs border rounded disabled:bg-gray-100 text-gray-800 disabled:text-gray-500"
                        min="1"
                        max="100"
                        style={{ color: traj.ativo ? '#1f2937' : '#6b7280' }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-12">Pred.:</span>
                      <input
                        type="number"
                        value={traj.x20}
                        onChange={(e) => atualizarTrajetoria(idx, 'x20', parseFloat(e.target.value) || 1)}
                        disabled={!traj.ativo}
                        className="flex-1 px-2 py-1 text-xs border rounded disabled:bg-gray-100 text-gray-800 disabled:text-gray-500"
                        min="1"
                        max="50"
                        style={{ color: traj.ativo ? '#1f2937' : '#6b7280' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b">Simulação</h2>
              <Slider label="Tempo Final" value={tf} setValue={setTf} min={20} max={200} step={10} />
              <Slider label="Passo h" value={h} setValue={setH} min={0.01} max={0.2} step={0.01} />

              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                💡 <strong>h = 0.05</strong> oferece bom equilíbrio entre precisão e performance
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="lg:col-span-3 space-y-4">
            {/* Gráfico Temporal */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-gray-800 mb-3 text-center">Evolução Temporal (Trajetória 1)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dados.dadosTemporal} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="t"
                      label={{ value: 'Tempo (t)', position: 'bottom', offset: 0 }}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      label={{ value: 'População', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      type="monotone"
                      dataKey="x1"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      dot={false}
                      name="Presas (x₁)"
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="x2"
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      dot={false}
                      name="Predadores (x₂)"
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Diagrama de Fase com múltiplas trajetórias */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-gray-800 mb-3 text-center">Diagrama de Fase (Retrato de Fase)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      type="number"
                      dataKey="x1"
                      name="Presas"
                      label={{ value: 'Presas (x₁)', position: 'bottom', offset: 0 }}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="x2"
                      name="Predadores"
                      label={{ value: 'Predadores (x₂)', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />

                    {/* Renderizar cada trajetória */}
                    {dados.todasTrajetorias.map((traj, idx) => (
                      <Scatter
                        key={idx}
                        data={traj.dados}
                        fill={traj.cor}
                        line={{ stroke: traj.cor, strokeWidth: 2 }}
                        lineType="joint"
                        name={`X0=(${traj.x10}, ${traj.x20})`}
                        isAnimationActive={false}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Modelo */}
        <div className="mt-4 bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-gray-800 mb-3">Sobre o Modelo Predador-Presa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="font-bold text-green-700 mb-2">Equação das Presas (x₁)</div>
              <div className="font-mono text-xs text-gray-800 bg-white p-2 rounded mb-2">
                dx₁/dt = ax₁ - bx₁x₂
              </div>
              <p className="text-xs text-gray-600">
                <strong>a</strong>: taxa de crescimento natural das presas<br />
                <strong>b</strong>: taxa na qual predadores consomem presas
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
              <div className="font-bold text-red-700 mb-2">Equação dos Predadores (x₂)</div>
              <div className="font-mono text-xs text-gray-800 bg-white p-2 rounded mb-2">
                dx₂/dt = -dx₂ + cx₁x₂
              </div>
              <p className="text-xs text-gray-600">
                <strong>d</strong>: taxa de mortalidade dos predadores<br />
                <strong>c</strong>: eficiência na conversão de presas em predadores
              </p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-900">
              <strong>📊 Dinâmica:</strong> O sistema apresenta oscilações periódicas. Quando há muitas presas,
              os predadores crescem. Com muitos predadores, as presas diminuem, levando à redução dos predadores,
              permitindo que as presas cresçam novamente, formando ciclos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ModeloLogisticoCorrigido() {
  const [modeloAtivo, setModeloAtivo] = useState('logistico');

  // Parâmetros - h=5 por padrão para mostrar diferença clara entre métodos
  const [r, setR] = useState(0.05);
  const [K, setK] = useState(1.0);
  const [tf, setTf] = useState(100);
  const [h, setH] = useState(5.0); // h maior para evidenciar erros do Euler

  // Múltiplas condições iniciais
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

  const atualizarCondicao = (index, campo, valor) => {
    const novasCondicoes = [...condicoes];
    novasCondicoes[index] = { ...novasCondicoes[index], [campo]: valor };
    setCondicoes(novasCondicoes);
  };

  // Gerar dados - cada método calculado separadamente por condição inicial
  const dados = useMemo(() => {
    const condicoesAtivas = condicoes.filter(c => c.ativo);
    const nPontos = Math.floor(tf / h) + 1;
    const tempos = Array.from({ length: nPontos }, (_, i) => parseFloat((i * h).toFixed(6)));

    // Para cada condição inicial, calcular todas as soluções
    const todasSolucoes = condicoesAtivas.map((cond, idx) => {
      const exata = tempos.map(t => solucaoExata(t, r, K, cond.y0));
      const eulerRes = euler(r, K, cond.y0, tf, h);
      const eulerAprRes = eulerAprimorado(r, K, cond.y0, tf, h);
      const rk4Res = rungeKutta4(r, K, cond.y0, tf, h);

      return {
        y0: cond.y0,
        idx,
        exata,
        euler: eulerRes.map(p => p.y),
        eulerApr: eulerAprRes.map(p => p.y),
        rk4: rk4Res.map(p => p.y),
      };
    });

    // Formatar para o gráfico
    const dadosGrafico = tempos.map((t, i) => {
      const ponto = { t };
      todasSolucoes.forEach((sol, j) => {
        ponto[`exata_${j}`] = sol.exata[i];
        ponto[`euler_${j}`] = sol.euler[i];
        ponto[`eulerApr_${j}`] = sol.eulerApr[i];
        ponto[`rk4_${j}`] = sol.rk4[i];
      });
      return ponto;
    });

    // Calcular erros máximos para estatísticas
    let erroMaxEuler = 0, erroMaxEulerApr = 0, erroMaxRK4 = 0;
    todasSolucoes.forEach(sol => {
      sol.exata.forEach((ex, i) => {
        erroMaxEuler = Math.max(erroMaxEuler, Math.abs(sol.euler[i] - ex));
        erroMaxEulerApr = Math.max(erroMaxEulerApr, Math.abs(sol.eulerApr[i] - ex));
        erroMaxRK4 = Math.max(erroMaxRK4, Math.abs(sol.rk4[i] - ex));
      });
    });

    return { dadosGrafico, todasSolucoes, tempos, erroMaxEuler, erroMaxEulerApr, erroMaxRK4 };
  }, [r, K, tf, h, condicoes]);

  const Slider = ({ label, value, setValue, min, max, step }: any) => (
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

  // Se o modelo ativo for predador-presa, renderizar o componente
  if (modeloAtivo === 'predador-presa') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        {/* Seletor de Modelo */}
        <div className="max-w-7xl mx-auto mb-4">
          <div className="bg-white rounded-lg shadow p-3 flex items-center justify-center gap-4">
            <button
              onClick={() => setModeloAtivo('logistico')}
              className="px-6 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Modelo Logístico
            </button>
            <button
              onClick={() => setModeloAtivo('predador-presa')}
              className="px-6 py-2 rounded-lg font-medium transition-all bg-blue-600 text-white shadow-md"
            >
              Predador-Presa (Lotka-Volterra)
            </button>
          </div>
        </div>
        <PredadorPresa />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Seletor de Modelo */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-white rounded-lg shadow p-3 flex items-center justify-center gap-4">
          <button
            onClick={() => setModeloAtivo('logistico')}
            className="px-6 py-2 rounded-lg font-medium transition-all bg-blue-600 text-white shadow-md"
          >
            Modelo Logístico
          </button>
          <button
            onClick={() => setModeloAtivo('predador-presa')}
            className="px-6 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Predador-Presa (Lotka-Volterra)
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
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

              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                💡 Aumente <strong>h</strong> para ver maior diferença entre Euler e RK4
              </div>
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
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-white disabled:bg-gray-100 text-gray-800 disabled:text-gray-500"
                    style={{ color: cond.ativo ? '#1f2937' : '#6b7280' }}
                  />
                </div>
              ))}
            </div>

            {/* Métodos */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b">Métodos</h2>

              <label className="flex items-center gap-3 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mostrarExata}
                  onChange={(e) => setMostrarExata(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="w-8 h-0.5 border-t-2 border-dashed border-gray-800"></span>
                <span className="text-sm text-gray-800 font-medium">Solução exata</span>
              </label>

              <label className="flex items-center gap-3 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mostrarEuler}
                  onChange={(e) => setMostrarEuler(e.target.checked)}
                  className="w-4 h-4 accent-green-600"
                />
                <span className="w-8 h-1 bg-green-500"></span>
                <span className="text-sm text-green-700 font-medium">Euler (O1)</span>
              </label>

              <label className="flex items-center gap-3 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mostrarEulerApr}
                  onChange={(e) => setMostrarEulerApr(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="w-8 h-1 bg-blue-500"></span>
                <span className="text-sm text-blue-700 font-medium">Euler Aprimorado (O2)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mostrarRK}
                  onChange={(e) => setMostrarRK(e.target.checked)}
                  className="w-4 h-4 accent-red-700"
                />
                <span className="w-8 h-1 bg-red-700"></span>
                <span className="text-sm text-red-800 font-medium">Runge-Kutta 4 (O4)</span>
              </label>
            </div>
          </div>

          {/* Gráfico Principal */}
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
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    formatter={(value) => typeof value === 'number' ? value.toFixed(6) : value}
                    labelFormatter={(label) => `t = ${label}`}
                  />
                  <Legend
                    verticalAlign="top"
                    wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
                  />

                  {/* Renderizar linhas para cada condição inicial */}
                  {dados.todasSolucoes.map((sol, idx) => (
                    <React.Fragment key={idx}>
                      {/* Solução Exata - linha preta tracejada (renderizada primeiro como referência) */}
                      {mostrarExata && (
                        <Line
                          type="monotone"
                          dataKey={`exata_${idx}`}
                          stroke="#1f2937"
                          strokeWidth={2}
                          strokeDasharray="6 3"
                          dot={false}
                          name={idx === 0 ? "Solução Exata" : undefined}
                          legendType={idx === 0 ? "line" : "none"}
                        />
                      )}

                      {/* Euler - linha verde (deve mostrar desvio) */}
                      {mostrarEuler && (
                        <Line
                          type="monotone"
                          dataKey={`euler_${idx}`}
                          stroke="#22c55e"
                          strokeWidth={2.5}
                          dot={false}
                          name={idx === 0 ? "Euler" : undefined}
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
                          name={idx === 0 ? "Euler Aprimorado" : undefined}
                          legendType={idx === 0 ? "line" : "none"}
                        />
                      )}

                      {/* Runge-Kutta - linha vermelha (deve ficar próximo da exata) */}
                      {mostrarRK && (
                        <Line
                          type="monotone"
                          dataKey={`rk4_${idx}`}
                          stroke="#b91c1c"
                          strokeWidth={2}
                          dot={false}
                          name={idx === 0 ? "Runge-Kutta 4" : undefined}
                          legendType={idx === 0 ? "line" : "none"}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Estatísticas de Erro */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <span className="text-gray-600 text-xs block">Condições ativas</span>
                <span className="font-bold text-blue-600 text-lg">{condicoesAtivasCount}</span>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center border-l-4 border-green-500">
                <span className="text-gray-600 text-xs block">Erro máx. Euler</span>
                <span className="font-bold text-green-700 text-lg">{dados.erroMaxEuler.toExponential(2)}</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-center border-l-4 border-blue-500">
                <span className="text-gray-600 text-xs block">Erro máx. Euler Apr.</span>
                <span className="font-bold text-blue-700 text-lg">{dados.erroMaxEulerApr.toExponential(2)}</span>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-center border-l-4 border-red-700">
                <span className="text-gray-600 text-xs block">Erro máx. RK4</span>
                <span className="font-bold text-red-800 text-lg">{dados.erroMaxRK4.toExponential(2)}</span>
              </div>
            </div>

            {/* Comparativo */}
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>📊 Comparativo (h = {h}):</strong> O Euler tem erro{' '}
                <strong className="text-green-700">
                  {dados.erroMaxRK4 > 0 ? (dados.erroMaxEuler / dados.erroMaxRK4).toFixed(0) : '∞'}x
                </strong>{' '}
                maior que RK4. Euler Aprimorado tem erro{' '}
                <strong className="text-blue-700">
                  {dados.erroMaxRK4 > 0 ? (dados.erroMaxEulerApr / dados.erroMaxRK4).toFixed(0) : '∞'}x
                </strong>{' '}
                maior que RK4.
              </p>
            </div>
          </div>
        </div>

        {/* Fórmulas */}
        <div className="mt-4 bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-gray-800 mb-3">Fórmulas dos Métodos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="font-bold text-green-700 mb-2">Euler (Ordem 1)</div>
              <div className="font-mono text-xs text-gray-800 bg-white p-2 rounded">
                y<sub>n+1</sub> = y<sub>n</sub> + h · f(t<sub>n</sub>, y<sub>n</sub>)
              </div>
              <p className="text-xs text-green-600 mt-2">Erro local: O(h²) | Erro global: O(h)</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="font-bold text-blue-700 mb-2">Euler Aprimorado (Ordem 2)</div>
              <div className="font-mono text-xs text-gray-800 bg-white p-2 rounded">
                k₁ = f(t<sub>n</sub>, y<sub>n</sub>)<br />
                k₂ = f(t<sub>n</sub>+h, y<sub>n</sub>+h·k₁)<br />
                y<sub>n+1</sub> = y<sub>n</sub> + (h/2)(k₁+k₂)
              </div>
              <p className="text-xs text-blue-600 mt-2">Erro local: O(h³) | Erro global: O(h²)</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-700">
              <div className="font-bold text-red-800 mb-2">Runge-Kutta 4ª Ordem</div>
              <div className="font-mono text-xs text-gray-800 bg-white p-2 rounded">
                k₁ = f(t<sub>n</sub>, y<sub>n</sub>)<br />
                k₂ = f(t+h/2, y+h·k₁/2)<br />
                k₃ = f(t+h/2, y+h·k₂/2)<br />
                k₄ = f(t+h, y+h·k₃)<br />
                y<sub>n+1</sub> = y<sub>n</sub> + (h/6)(k₁+2k₂+2k₃+k₄)
              </div>
              <p className="text-xs text-red-600 mt-2">Erro local: O(h⁵) | Erro global: O(h⁴)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}