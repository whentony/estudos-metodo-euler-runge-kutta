// Modelo Logístico: dy/dt = r * y * (1 - y/K)
export function modeloLogistico(t: number, y: number, r: number, K: number): number {
    return r * y * (1 - y / K);
}

// Runge-Kutta 4ª ordem para sistemas de EDOs (Predador-Presa)
export default function rungeKutta4Sistema(f1: (t: number, x1: number, x2: number) => number,
    f2: (t: number, x1: number, x2: number) => number,
    x10: number,
    x20: number,
    tf: number,
    h: number) {
    const n = Math.floor(tf / h);
    const resultados = [{ t: 0, x1: x10, x2: x20 }];

    let t = 0;
    let x1 = x10;
    let x2 = x20;

    for (let i = 0; i < n; i++) {
        const k1_1 = f1(t, x1, x2);
        const k1_2 = f2(t, x1, x2);

        const k2_1 = f1(t + h / 2, x1 + (h * k1_1) / 2, x2 + (h * k1_2) / 2);
        const k2_2 = f2(t + h / 2, x1 + (h * k1_1) / 2, x2 + (h * k1_2) / 2);

        const k3_1 = f1(t + h / 2, x1 + (h * k2_1) / 2, x2 + (h * k2_2) / 2);
        const k3_2 = f2(t + h / 2, x1 + (h * k2_1) / 2, x2 + (h * k2_2) / 2);

        const k4_1 = f1(t + h, x1 + h * k3_1, x2 + h * k3_2);
        const k4_2 = f2(t + h, x1 + h * k3_1, x2 + h * k3_2);

        x1 = x1 + (h / 6) * (k1_1 + 2 * k2_1 + 2 * k3_1 + k4_1);
        x2 = x2 + (h / 6) * (k1_2 + 2 * k2_2 + 2 * k3_2 + k4_2);
        t = t + h;

        resultados.push({ t: parseFloat(t.toFixed(6)), x1, x2 });
    }

    return resultados;
}