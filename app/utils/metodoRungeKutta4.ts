import modeloLogistico from "./modeloLogistico";

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
        resultado.push({ t: parseFloat(t.toFixed(6)), y });
    }
    return resultado;
};

export default rungeKutta4;