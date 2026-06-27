type DerivadaRK3 = (t: number, y: number) => number;

export interface PontoRK3 {
  t: number;
  y: number;
}

/**
 * Método de Runge-Kutta de 3ª Ordem (Clássico)
 * k1 = f(t, y)
 * k2 = f(t + h/2, y + h*k1/2)
 * k3 = f(t + h, y - h*k1 + 2*h*k2)
 * y(i+1) = y(i) + (h/6) * (k1 + 4*k2 + k3)
 * 
 * @param f Função que descreve dy/dt = f(t, y)
 * @param y0 Valor inicial y(0)
 * @param tf Tempo final
 * @param passo Tamanho do passo (h)
 * @returns Array de pontos {t, y}
 */
export default function rungeKutta3(
  f: DerivadaRK3,
  y0: number,
  tf: number,
  passo: number
): PontoRK3[] {
  const pontos: PontoRK3[] = [];
  let t = 0;
  let y = y0;

  pontos.push({ t, y });

  while (t < tf) {
    // Se o próximo passo passar do tempo final, ajusta o passo
    const h = Math.min(passo, tf - t);
    
    // Calcula k1, k2, k3 (RK3 clássico)
    const k1 = f(t, y);
    const k2 = f(t + h / 2, y + (h * k1) / 2);
    const k3 = f(t + h, y - h * k1 + 2 * h * k2);

    y = y + (h / 6) * (k1 + 4 * k2 + k3);
    t = t + h;
    
    // Prevenção contra flutuação de ponto flutuante
    t = Math.round(t * 1000000) / 1000000;
    
    pontos.push({ t, y });
  }

  return pontos;
}
