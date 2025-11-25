import modeloLogistico from "./modeloLogistico";

export default function euler(r, K, y0, tf, h) {
    const n = Math.floor(tf / h);
    const resultado = [];
    let y = y0;
    let t = 0;
    resultado.push({ t, y });

    for (let i = 0; i < n; i++) {
        const dydt = modeloLogistico(t, y, r, K);
        y = y + h * dydt;
        t = t + h;
        resultado.push({ t: parseFloat(t.toFixed(6)), y });
    }
    return resultado;
};